import { db } from "@/db";
import { AirtableTable } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import {
  type AirtableTableWithExtractionData,
  extractDocument,
} from "@/utils/extract-document";
import {
  MAX_NUMBER_OF_FILES,
  allowedDocumentFileContentTypes,
  allowedImageFileContentTypes,
} from "@/utils/constants";
import resend from "@/lib/resend";
import { DocumentExtractionFailed } from "@/emails/documentExtractionFailed";
import { z } from "zod";
import { airtableWraper } from "@/lib/airtable";
import { eq } from "drizzle-orm";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const res = await request.json();
    // validate data with zod
    const schema = z.object({
      envelope: z.object({
        to: z.string(),
        from: z.string(),
      }),
      headers: z.object({
        subject: z.string().optional(),
      }),
      plain: z.string().optional(),
      attachments: z.array(
        z.object({
          url: z.string(),
          file_name: z.string(),
          content_type: z.string(),
        })
      ),
    });
    const parsedData = schema.passthrough().parse(res);

    const assistantEmail = parsedData.envelope.to.split("@")[0] as string;
    const emailText = parsedData.plain;
    const emailSubject = parsedData.headers.subject;
    if (!assistantEmail) throw new Error("No assistant email found");

    const table = await db.query.AirtableTable.findFirst({
      where: eq(AirtableTable.emailKey, assistantEmail),
      with: {
        workspace: true,
        base: true,
        airtableTableFields: true,
      },
    });

    if (!table) {
      console.error("No table found for email", assistantEmail);
      await resend.emails.send({
        from:
          process.env.RESEND_FROM_SEND || "Acme <no_reply@updates.askair.ai>",
        to: [parsedData.envelope.from],
        subject: "AskAir - Error while processing document",
        text: `We were not able to process your document. Error: ${assistantEmail}@extractor.askair.ai is not a valid assistant email`,
        react: DocumentExtractionFailed({
          error: `${assistantEmail}@extractor.askair.ai is not a valid assistant email, please make sure you are sending the email to the right address`,
        }),
      });
      return NextResponse.json({ message: "ok" });
    }

    // test refresh token if needed
    await airtableWraper(table.workspaceId);

    const promises: unknown[] = [];
    // limit to 20 attachments
    if (
      parsedData.attachments &&
      parsedData.attachments.length > MAX_NUMBER_OF_FILES
    ) {
      parsedData.attachments = parsedData.attachments.slice(
        0,
        MAX_NUMBER_OF_FILES
      );
    }
    for (let attachement of parsedData.attachments) {
      let { url, file_name: fileName, content_type: contentType } = attachement;
      if (
        !(
          allowedDocumentFileContentTypes.includes(contentType) ||
          allowedImageFileContentTypes.includes(contentType)
        )
      ) {
        promises.push(
          new Promise((resolve, reject) => {
            reject(
              `We only accept pdf and image files but the file "${fileName}" file of type ${contentType}`
            );
          })
        );
        continue;
      }
      console.log("We received a pdf or image file");
      promises.push(
        treatFile({
          url,
          fileName,
          table,
          emailSender: parsedData.envelope.from,
          userInstruction: createUserInstructions({ emailSubject, emailText }),
        })
      );
    }
    let payloads = await Promise.allSettled(promises);

    const rejectedPayloads = payloads
      .map((payload) => payload.status === "rejected" && payload.reason)
      .filter(Boolean);

    for (let payload of rejectedPayloads) {
      const payloadText = JSON.stringify(payload);
      await resend.emails.send({
        from:
          process.env.RESEND_FROM_SEND || "Acme <no_reply@updates.askair.ai>",
        to: [parsedData.envelope.from],
        subject: "AskAir - Error while processing document",
        text: `We were not able to process your document. Error: ${payloadText}`,
        react: DocumentExtractionFailed({
          error: payloadText,
        }),
      });
    }

    return NextResponse.json({ message: "ok" });
  } catch (e) {
    console.error("error", e);
    return NextResponse.json({ message: "error" });
  }
}

const treatFile = async ({
  url,
  fileName,
  table,
  emailSender,
  userInstruction,
}: {
  url: string;
  fileName: string;
  table: AirtableTableWithExtractionData;
  emailSender: string;
  userInstruction: string;
}) => {
  const res = await fetch(url);
  const blob = await res.blob();

  let parsedPayload = await extractDocument({
    fileBlob: blob,
    fileName,
    fileUrl: url,
    table,
    user: {
      type: "email",
      email: emailSender,
    },
    userInstruction,
  });

  return parsedPayload;
};

const createUserInstructions = ({
  emailText,
  emailSubject,
}: {
  emailText?: string;
  emailSubject?: string;
}) => {
  if (emailText && emailSubject) return `${emailSubject}\n\n${emailText}`;
  if (emailText) return emailText;
  if (emailSubject) return emailSubject;
  return "";
};
