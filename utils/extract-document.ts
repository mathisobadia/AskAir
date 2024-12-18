import { db } from "@/db";
import {
  AirtableTable,
  AirtableTableField,
  Extraction,
  Workspace,
  AirtableBase,
  ExtractionKeyValue,
  User,
} from "@/db/schema";
import { airtableWraper, retryWithBackoff } from "@/lib/airtable";
import { zodResponseFormat } from "openai/helpers/zod";

import resend from "@/lib/resend";
import { DocumentExtractionConfirmed } from "@/emails/documentExtractionConfirmed";
import { revalidatePath } from "next/cache";
import { type FieldSet, Record as AirtalbeRecord } from "airtable";
import {
  allowedDocumentFileContentTypes,
  allowedImageFileContentTypes,
  type FieldType,
} from "./constants";
import openai from "@/lib/openai";
import { z } from "zod";
import type { ChatCompletionContentPart } from "openai/resources/chat/completions.mjs";
import { pdfToScreenshots } from "@/lib/screenshot";
import { and, eq } from "drizzle-orm";
export type AirtableTableWithExtractionData = AirtableTable & {
  workspace: Workspace;
  base: AirtableBase;
  airtableTableFields: AirtableTableField[];
};
export const extractDocument = async ({
  fileBlob,
  fileName,
  fileUrl,
  table,
  user,
  userInstruction,
}: {
  fileName: string;
  fileBlob: Blob;
  fileUrl: string;
  table: AirtableTableWithExtractionData;
  userInstruction: string;
  user:
    | {
        type: "user";
        userId: string;
      }
    | {
        type: "email";
        email: string;
      };
}) => {
  // create extractions
  const [extraction] = await db
    .insert(Extraction)
    .values({
      documentFileName: fileName,
      documentFileUrl: fileUrl,
      tableId: table.id,
      workspaceId: table.workspaceId,
      emailSender: user.type === "email" ? user.email : null,
      userId: user.type === "user" ? user.userId : null,
      updatedAt: new Date(),
    })
    .returning();
  if (!extraction) throw new Error("No extraction created");
  // handle documents through llama index but images through gpt4 vision
  const zodSchema = generateZodSchemaFromTable({ table });
  let wrapper = await airtableWraper(table.workspaceId);
  let { result, inputTokenCount, outputTokenCount } = await extractAllType({
    fileBlob,
    fileUrl,
    table,
    userInstruction,
    zodSchema,
  });
  if (!result) throw new Error("No result found");
  try {
    // TODO: fix this type
    let dataPayloadFromOpenAi = result as Record<string, unknown>;
    const parsedPayload = await parseJsonAccordingToTableSchema(
      dataPayloadFromOpenAi,
      table
    );
    // Transfort multipleRecordLinks fields from string to array of ids
    const multipleRecordLinksActivatedFields = table.airtableTableFields.filter(
      (field) => field.isActivated && field.fieldType === "multipleRecordLinks"
    );
    if (multipleRecordLinksActivatedFields.length > 0) {
      for (let activatedField of multipleRecordLinksActivatedFields) {
        const { fieldName, linkedTableId } = activatedField;
        if (!linkedTableId) throw new Error("No linkedTableId");
        console.log("Ok, on field", fieldName);
        const mostProbableValue = parsedPayload[fieldName];
        if (!mostProbableValue) {
          console.log("No mostProbableValue found for field", fieldName);
          continue;
        }
        console.log("mostProbableValue", mostProbableValue);
        try {
          if (typeof mostProbableValue !== "string") {
            console.log("mostProbableValue is not a string");
            continue;
          }
          let {
            result: mostProbableRecord,
            inputTokenCount: additionalInputTokenCount,
            outputTokenCount: additionalOutputTokenCount,
          } = await findMostProbableRecordByName({
            mostProbableValue,
            tableId: activatedField.tableId,
            airtableDestinationTableId: linkedTableId,
            workspaceId: table.workspaceId,
          });
          inputTokenCount = inputTokenCount + additionalInputTokenCount;
          outputTokenCount = outputTokenCount + additionalOutputTokenCount;
          console.log("So, most probable record is", mostProbableRecord?.id);
          if (mostProbableRecord)
            parsedPayload[fieldName] = [mostProbableRecord.id];
        } catch (error) {
          console.error("Error finding most probable record", error);
          parsedPayload[fieldName] = undefined;
        }
      }
    }
    console.log("last version of parsedPayload", parsedPayload);

    const documentTarget = table.airtableTableFields.find(
      (f) => f.isDocumentTargetField
    );
    if (documentTarget) {
      parsedPayload[documentTarget.fieldName] = [
        {
          url: fileUrl,
          filename: fileName,
        },
      ];
    }

    let record = (await wrapper
      .getBase(table.base.externalId)
      .table(table.externalId)
      .create(parsedPayload as any)) as any;

    await db
      .update(Extraction)
      .set({
        airtableRecordId: record.id,
        status: "SUCCESS",
        inputTokenCount,
        outputTokenCount,
        updatedAt: new Date(),
      })
      .where(eq(Extraction.id, extraction.id));

    let activatedFields = await db
      .select({
        fieldName: AirtableTableField.fieldName,
        id: AirtableTableField.id,
      })
      .from(AirtableTableField)
      .where(
        and(
          eq(AirtableTableField.tableId, table.id),
          eq(AirtableTableField.isActivated, true)
        )
      );

    for (let field of activatedFields) {
      await db.insert(ExtractionKeyValue).values({
        workspaceId: table.workspaceId,
        extractionId: extraction.id,
        airtableTableFieldId: field.id,
        key: field.fieldName,
        value: JSON.stringify(parsedPayload[field.fieldName]),
        updatedAt: new Date(),
      });
    }

    revalidatePath(`/workspaces/${table.workspace.id}/extractions`);

    const emails: string[] = [];
    if (user.type === "email") {
      emails.push(user.email);
    }
    if (user.type === "user") {
      const userInDb = await db
        .select({
          email: User.email,
          name: User.name,
        })
        .from(User)
        .where(eq(User.id, user.userId))
        .limit(1);

      if (userInDb[0]?.email) {
        emails.push(userInDb[0].email);
      }
    }
    if (emails.length > 0) {
      const airtableRecordUrl = `https://airtable.com/${table.base.externalId}/${table.externalId}/${record.id}`;
      await resend.emails.send({
        from:
          process.env.RESEND_FROM_SEND || "Acme <no_reply@updates.askair.ai>",
        to: emails,
        subject: "AskAir - Document processed",
        react: DocumentExtractionConfirmed({
          parsedPayload,
          airtableRecordUrl,
          extractionTableUrl: `${process.env.SERVER_URL}/workspaces/${table.workspace.id}/extractions`,
        }),
      });
    }
    return parsedPayload;
  } catch (error) {
    console.error(error);
    await db
      .update(Extraction)
      .set({
        status: "FAILED",
        updatedAt: new Date(),
      })
      .where(eq(Extraction.id, extraction.id));
    throw new Error("Error extracting document");
  }
};

const extractAllType = async ({
  fileBlob,
  fileUrl,
  table,
  userInstruction,
  zodSchema,
}: {
  zodSchema: z.ZodType;
  fileUrl: string;
  fileBlob: Blob;
  table: AirtableTableWithExtractionData;
  userInstruction: string;
}) => {
  try {
    const systemPrompt = `You are a data extractor assistant. Every time a user sends you a message, you MUST extract informations from the message. 
    For each field the description is provided in the format "fieldName | fieldFormat | description" `;
    const type = fileBlob.type;
    const content: ChatCompletionContentPart[] = [];
    if (allowedDocumentFileContentTypes.includes(type)) {
      const pdfScreenshots = await pdfToScreenshots(fileBlob);
      const imageContent: ChatCompletionContentPart[] = pdfScreenshots.map(
        (screenshot) => ({
          type: "image_url" as const,
          image_url: {
            url: screenshot,
          },
        })
      );
      content.push(...imageContent);
    } else if (allowedImageFileContentTypes.includes(type)) {
      // handle images through gpt4 vision
      const imageContent: ChatCompletionContentPart[] = [
        {
          type: "image_url" as const,
          image_url: {
            url: fileUrl,
          },
        },
      ];
      content.push(...imageContent);
    } else {
      throw new Error("File type not supported");
    }
    if (userInstruction) {
      content.push({
        type: "text",
        text: userInstruction,
      });
    }
    console.log(zodResponseFormat(zodSchema, "table").json_schema.schema);
    const openAiChatCompletion = await openai.beta.chat.completions.parse({
      messages: [
        {
          role: "system" as const,
          content: systemPrompt,
        },
        {
          role: "user",
          content: content,
        },
      ],
      response_format: zodResponseFormat(zodSchema, "table"),
      user: table.workspaceId,
      model: "gpt-4o",
    });
    const lastMessage = openAiChatCompletion.choices[0]?.message.parsed;
    if (!lastMessage) throw new Error("No last message found");
    return {
      result: lastMessage,
      inputTokenCount: openAiChatCompletion.usage?.prompt_tokens || 0,
      outputTokenCount: openAiChatCompletion.usage?.completion_tokens || 0,
    };
  } catch (err) {
    console.error(err);
    throw new Error("Error extracting document");
  }
};

const generateZodSchemaFromTable = ({
  table,
}: {
  table: AirtableTableWithExtractionData;
}) => {
  let fieldsToExtract = getActivatedFieldsForTable({
    table,
  });

  const schemaFields = fieldsToExtract.reduce((acc, field) => {
    let zodType;
    const zodDescription = JSON.stringify(
      `${field.fieldName} | ${getFieldType(field.fieldType as FieldType)} | ${
        field.description
      }`
    );
    const fieldType = field.fieldType as FieldType;
    switch (fieldType) {
      case "singleLineText":
      case "multilineText":
      case "phoneNumber":
      case "richText":
      case "multipleRecordLinks":
        zodType = z.string();
        break;
      case "email":
        // cannot use z.string().email() because format is not supported by gpt-4o
        zodType = z.string();
        break;
      case "url":
        // cannot use z.string().url() because format is not supported by gpt-4o
        zodType = z.string();
        break;
      case "number":
      case "currency":
      case "percent":
        zodType = z.number();
        break;
      case "rating":
        // TODO: get the max value from the field options https://airtable.com/developers/web/api/field-model#rating
        zodType = z.number().int();
        break;
      case "checkbox":
        zodType = z.boolean();
        break;
      case "singleSelect":
        //@ts-expect-error
        zodType = z.enum(field.possibleValues || []);
        break;
      case "multipleSelects":
        //@ts-expect-error
        zodType = z.array(z.enum(field.possibleValues || []));
        break;
      case "date":
        // cannot use z.string().date() because format is not supported by gpt-4o
        zodType = z.string();
        break;
      case "dateTime":
        // cannot use z.string().datetime() because format is not supported by gpt-4o
        zodType = z.string();
        break;
      default:
        zodType = z.any();
    }

    acc[field.fieldName] = zodType.nullable().describe(zodDescription);
    return acc;
  }, {} as Record<string, z.ZodType>);

  return z.object(schemaFields);
};

const getFieldType = (fieldType: FieldType) => {
  switch (fieldType) {
    case "singleLineText":
    case "singleSelect":
    case "multipleRecordLinks":
      return "String";
    case "checkbox":
      return "Boolean";
    case "multipleSelects":
      return "String []";
    case "dateTime":
      return "DateTime";
    case "date":
      return "Date";
    default:
      return fieldType;
  }
};

const findMostProbableRecordByName = async ({
  mostProbableValue,
  tableId,
  airtableDestinationTableId,
  workspaceId,
}: {
  tableId: string;
  mostProbableValue: string;
  airtableDestinationTableId: string;
  workspaceId: string;
}): Promise<{
  result: AirtalbeRecord<FieldSet> | undefined;
  inputTokenCount: number;
  outputTokenCount: number;
}> => {
  console.log("findMostProbableRecordByName stuff", {
    mostProbableValue,
    tableId,
    airtableDestinationTableId,
  });
  let table = await db.query.AirtableTable.findFirst({
    where: (table) =>
      and(
        eq(table.externalId, airtableDestinationTableId),
        eq(table.workspaceId, workspaceId)
      ),
    with: {
      workspace: true,
      base: true,
      airtableTableFields: {
        where: (field) => eq(field.isPrimaryField, true),
      },
    },
  });
  if (!table) throw new Error("Table not found");
  let wrapper = await airtableWraper(table.workspaceId);
  let base = wrapper.getBase(table.base.externalId);
  const words = mostProbableValue.split(" ");
  let primaryFieldName =
    table.airtableTableFields.find((field) => field.isPrimaryField)
      ?.fieldName || "Name";

  const searchFormula = words.map(
    (w) => `SEARCH(LOWER("${w}"), LOWER({${primaryFieldName}}), 0)`
  );

  // use each word as a OR filter to be contained in the Name
  let records = await base(airtableDestinationTableId) // il faut l'id de la table derrière le link record
    .select({
      fields: [primaryFieldName],
      filterByFormula: `OR(
        ${searchFormula.join(",")}
      )`,
    })
    .all();
  console.log("found", records.length, "records");
  // if no records found, we return undefined
  if (records.length === 0) {
    console.log("No records found, searching again with no filter");
    // we perform a new search to get all the records
    records = await base(airtableDestinationTableId)
      .select({
        fields: [primaryFieldName],
      })
      .all();
  }
  if (records.length === 0) {
    console.log("No records found, returning undefined");
    return { result: undefined, inputTokenCount: 0, outputTokenCount: 0 };
  }
  // LIMITE SI Y'A QU'UN SEUL RESULTAT, ON LE RENVOIE DIRECT
  if (records.length === 1) {
    console.log("we only have one record, returning it");
    return { result: records[0], inputTokenCount: 0, outputTokenCount: 0 };
  }

  const systemPrompt = `User is looking for a value in a table, but the provided value might not exactly match the Name.
You must return the position probable value in the array.
Only return a Number, the position of the most probable value in the array.`;
  const zodSchema = z.object({
    position: z.number().int(),
  });
  const userPrompt = `I am looking for "${mostProbableValue}" in the following table, maybe the name is not exactly the same. 

|position|Name|
|-----|-----|
${records.map((r, i: number) => `|${i}|${r.fields.Name}|`).join("\n")}  
  `;

  const openAiChatCompletion = await openai.beta.chat.completions.parse({
    messages: [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    response_format: zodResponseFormat(zodSchema, "table"),
    user: workspaceId,
    model: "gpt-4o",
  });
  const lastMessage = openAiChatCompletion.choices[0]?.message.parsed;
  if (!lastMessage) throw new Error("No last message found");

  const inputTokenCount = openAiChatCompletion.usage?.prompt_tokens || 0;
  const outputTokenCount = openAiChatCompletion.usage?.completion_tokens || 0;

  let position = lastMessage.position;
  if (isNaN(position)) throw new Error("Position is not a number");

  console.log("position", position);
  console.log("record", records[position]?.id);
  console.log("record", records[position]?.get("Name"));

  return { result: records[position], inputTokenCount, outputTokenCount };
};

const parseJsonAccordingToTableSchema = async (
  json: Record<string, unknown>,
  table: AirtableTableWithExtractionData
) => {
  const fieldsToExtract = getActivatedFieldsForTable({
    table,
  });
  if (!fieldsToExtract) throw new Error("No fields to extract");
  console.log({ json });
  const returnedJson: Record<
    string,
    | undefined
    | string
    | number
    | boolean
    | string[]
    | [
        {
          url: string;
          filename: string;
        }
      ]
  > = {};
  for (const field of fieldsToExtract) {
    if (json[field.fieldName] !== undefined) {
      const fieldType = field.fieldType;
      const fieldValue = json[field.fieldName];
      returnedJson[field.fieldName] = parseValueAccordingToFieldType(
        fieldType as FieldType,
        // we could probably add some runtime checks to avoid casting as any
        fieldValue as any
      );
    } else {
      console.log(
        `Field ${field.fieldName} not found in the JSON, it will be excluded.`
      );
    }
  }
  console.log("returnedJson", returnedJson);
  return returnedJson;
};

const getActivatedFieldsForTable = ({
  table,
}: {
  table: AirtableTableWithExtractionData;
}) => {
  return table.airtableTableFields.filter((field) => field.isActivated);
};

/**
 * This function parses a value according to the fieldType. and tries to be as lenient as possible
 * anything that makes sense will be casted if the value can be (e.g. numbers will be transformed to strings if the required value is a number)
 *
 */
function parseValueAccordingToFieldType(
  fieldType: FieldType,
  fieldValue: string | number | boolean | null | undefined | string[]
) {
  if (fieldValue === undefined) {
    return undefined;
  }
  if (fieldValue === null) {
    return undefined;
  }
  // we need to take care of the formatting required by the fieldType but not supported by the gpt-4o json schema
  if (fieldType === "date") {
    try {
      // we know fieldValue is a string because of the zod schema
      const date = new Date(fieldValue as string);
      return date.toISOString().split("T")[0];
    } catch (err) {
      return undefined;
    }
  }
  if (fieldType === "dateTime") {
    try {
      // we know fieldValue is a string because of the zod schema
      const date = new Date(fieldValue as string);
      return date.toISOString();
    } catch (err) {
      return undefined;
    }
  }
  if (fieldType === "percent") {
    // we know fieldValue is a number because of the zod schema
    const number = fieldValue as number;
    if (number > 0 && number < 1) {
      return number;
    }
    if (number > 1 && number < 100) {
      return number / 100;
    }
    return undefined;
  }
  if (fieldType === "email") {
    // we know fieldValue is a string because of the zod schema, check that it is a valid email
    const email = fieldValue as string;
    // check that it is a valid email with a simple regex
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/g.test(email)) {
      return undefined;
    }
    return email;
  }
  if (fieldType === "url") {
    // we know fieldValue is a string because of the zod schema, check that it is a valid url
    const url = fieldValue as string;
    if (
      !/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g.test(
        url
      )
    ) {
      return undefined;
    }
    return url;
  }
  if (fieldType === "phoneNumber") {
    // we know fieldValue is a string because of the zod schema
    const phoneNumber = fieldValue as string;
    // remove () and spaces
    const cleanedPhoneNumber = phoneNumber.replace(/[()\s-]/g, "");
    if (!/^\+?\d{10,15}$/.test(cleanedPhoneNumber)) {
      return undefined;
    }
    return phoneNumber;
  }
  return fieldValue;
}
