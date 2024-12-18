"use server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { airtableWraper } from "@/lib/airtable";
import { uploadFileAndGetUrl } from "@/lib/aws";
import { revalidatePath } from "next/cache";
import type { AirtableTableWithExtractionData } from "./extract-document";
import { extractDocument } from "./extract-document";
import { MAX_NUMBER_OF_FILES } from "./constants";
import {
  getWorkspaceIfUserHasAccess,
  treatAllTableFields,
  treatAllTables,
} from "./helpers";
import { eq, and } from "drizzle-orm";
import {
  AirtableTableField,
  AirtableTable,
  User,
  AirtableBase,
  WorkspaceUser,
} from "@/db/schema";

export const switchAirtableFieldActivation = async ({
  id,
  isActivated,
}: {
  id: string;
  isActivated: boolean;
}) => {
  let session = await auth();
  if (!session || !session.user?.id) throw new Error("Not connected");
  const userId = session.user?.id;

  // check if user can access this field
  let field = await db.query.AirtableTableField.findFirst({
    where: eq(AirtableTableField.id, id),
    with: {
      workspace: {
        with: {
          workspaceUsers: {
            where: eq(WorkspaceUser.userId, userId),
          },
        },
      },
    },
  });
  console.log({ field });
  const workspaceUser = field?.workspace.workspaceUsers[0];
  console.log({ userId });
  console.log({ workspaceUser });
  if (!workspaceUser?.role || workspaceUser?.role === "EDITOR")
    throw new Error("User is not authorized");
  try {
    let [fieldActivation] = await db
      .update(AirtableTableField)
      .set({ isActivated, updatedAt: new Date() })
      .where(eq(AirtableTableField.id, id))
      .returning();
    revalidatePath(`/workspaces/${field?.workspaceId}`);
    return fieldActivation;
  } catch (error) {
    console.error(error);
    throw new Error("Error updating field activation");
  }
};

export const switchAirtableFieldDocumentTarget = async ({
  id,
  isDocumentTargetField,
}: {
  id: string;
  isDocumentTargetField: boolean;
}) => {
  let session = await auth();
  if (!session || !session.user?.id) throw new Error("Not connected");
  const userId = session.user?.id;
  // check if user can access this field
  let field = await db.query.AirtableTableField.findFirst({
    where: eq(AirtableTableField.id, id),
    with: {
      workspace: {
        with: {
          workspaceUsers: {
            where: eq(User.id, userId),
          },
        },
      },
    },
  });
  const workspaceUser = field?.workspace.workspaceUsers[0];
  if (!workspaceUser?.role || workspaceUser?.role === "EDITOR")
    throw new Error("User is not authorized");
  try {
    let [fieldActivation] = await db
      .update(AirtableTableField)
      .set({ isDocumentTargetField, updatedAt: new Date() })
      .where(eq(AirtableTableField.id, id))
      .returning();
    return fieldActivation;
  } catch (error) {
    console.error(error);
    throw new Error("Error updating field activation");
  }
};

export const refreshTableFields = async ({ tableId }: { tableId: string }) => {
  console.log("refreshTableFields");
  const session = await auth();
  if (!session || !session.user?.id) throw new Error("Not connected");
  const user = await db.query.User.findFirst({
    where: eq(User.id, session?.user?.id),
  });
  if (!user) throw new Error("User not found");
  let table = await db.query.AirtableTable.findFirst({
    where: eq(AirtableTable.id, tableId),
    with: {
      airtableTableFields: {
        columns: {
          id: true,
          externalId: true,
        },
      },
      workspace: true,
      base: true,
    },
  });
  if (!table) throw new Error("Table not found");
  const workspace = table.workspace;
  let wrapper = await airtableWraper(workspace.id);
  let baseMetadata = await wrapper.getBaseMetadata(table.base.externalId);
  console.log("baseMetadata", baseMetadata);
  let tableMetadata = baseMetadata.tables.find(
    (t) => t.id === table?.externalId
  );
  console.log("tableMetadata", tableMetadata);
  if (!tableMetadata) throw new Error("Table metadata not found");
  await treatAllTableFields({
    tablesWithMetadata: [{ tableId: table.id, table: tableMetadata }],
    workspaceId: table.workspaceId,
  });
  console.log("table", table);

  revalidatePath(`/workspaces/${workspace.id}`);

  return true;
};

export const refreshBaseFields = async ({ baseId }: { baseId: string }) => {
  console.log("refresh ever base fields", baseId);

  const base = await db.query.AirtableBase.findFirst({
    where: eq(AirtableBase.id, baseId),
  });
  if (!base) throw new Error("Base not found");

  let wrapper = await airtableWraper(base.workspaceId);
  let baseMetadata = await wrapper.getBaseMetadata(base.externalId);
  console.log("baseMetadata", baseMetadata);
  await treatAllTables({
    baseMetadata,
    baseId,
    workspaceId: base.workspaceId,
  });
  revalidatePath(`/workspaces/${base.workspaceId}/bases/${baseId}`);

  return true;
};

export const postDocuments = async (
  prevState: {
    message: string;
  },
  formData: FormData
) => {
  const session = await auth();
  if (!session) throw new Error("Not connected");
  const userId = session.user?.id;
  if (!userId) throw new Error("User not found");
  // Get information from the form
  let tableId = formData.get("tableId") as string;
  const files = formData.getAll("files") as File[];
  const userInstruction = formData.get("userInstruction") as string;
  if (!files) throw new Error("File not found");
  if (files.length === 0) throw new Error("No file found");
  if (files.length > MAX_NUMBER_OF_FILES) throw new Error("Too many files");
  const promises: unknown[] = [];
  const table = await db.query.AirtableTable.findFirst({
    where: eq(AirtableTable.id, tableId),
    with: {
      workspace: true,
      airtableTableFields: true,
      base: true,
    },
  });
  if (!table) throw new Error("Table not found");
  for (let file of files) {
    promises.push(
      handleFile({
        file,
        table,
        userId,
        userInstruction,
        workspaceId: table.workspaceId,
      })
    );
  }
  const res = await Promise.allSettled(promises);
  const errors = res
    .filter((p) => p.status === "rejected")
    .map((e) => e.status === "rejected" && e.reason);
  if (errors.length > 0) {
    return {
      message: `there was an error processing one of the files: ${errors.join(
        ", "
      )}`,
    };
  }
  return { message: "success" };
};

const handleFile = async ({
  file,
  table,
  userId,
  userInstruction,
  workspaceId,
}: {
  userInstruction: string;
  userId: string;
  file: File;
  table: AirtableTableWithExtractionData;
  workspaceId: string;
}) => {
  const fileBlob = new Blob([file], { type: file.type });
  const arrbuf = await file.arrayBuffer();
  const random = Math.random().toString(36).substring(2);
  const key = `${workspaceId}/${random}-${file.name}`;
  const fileUrl = await uploadFileAndGetUrl({
    buffer: Buffer.from(arrbuf),
    key,
  });
  await extractDocument({
    fileBlob,
    fileUrl,
    table,
    fileName: file.name,
    user: {
      type: "user",
      userId: userId,
    },
    userInstruction,
  });
};

export type ActionState = {
  message?: string;
  error?: string;
};

export const updateEmailSettings = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const workspaceId = formData.get("workspaceId") as string;
  const tableId = formData.get("tableId") as string;
  const emailKey = formData.get("emailKey") as string;
  const baseId = formData.get("baseId") as string;
  if (!workspaceId || !tableId || !emailKey)
    throw new Error("Missing data in form");
  // check that user has the right to update this table
  const workspace = await getWorkspaceIfUserHasAccess(workspaceId);
  try {
    const [res] = await db
      .update(AirtableTable)
      .set({ emailKey, updatedAt: new Date() })
      .where(
        and(
          eq(AirtableTable.id, tableId),
          eq(AirtableTable.workspaceId, workspace.id)
        )
      )
      .returning();
    await revalidatePath(`/workspaces/${workspaceId}/bases/${baseId}`);
    return { message: "success" };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("unique constraint")) {
        console.log(
          "There is a unique constraint violation, a new user cannot be created with this email"
        );
        return { error: "This email is already used please choose another" };
      }
    }
    return { error: String(error) };
  }
};

export const updateFieldDescription = async (
  prevState: ActionState,
  formData: FormData
) => {
  console.log("updateFieldDescription");
  let session = await auth();
  if (!session || !session.user?.id) throw new Error("Not connected");
  const userId = session.user?.id;
  // get field
  const fieldId = formData.get("fieldId") as string;
  const field = await db.query.AirtableTableField.findFirst({
    where: eq(AirtableTableField.id, fieldId),
    with: {
      table: {
        with: {
          base: {
            columns: {
              externalId: true,
            },
          },
        },
      },
      workspace: {
        with: {
          workspaceUsers: {
            where: eq(WorkspaceUser.userId, userId),
          },
        },
      },
    },
  });
  if (!field) throw new Error("Field not found");
  const workspaceUser = field?.workspace.workspaceUsers[0];
  if (!workspaceUser?.role || workspaceUser?.role === "EDITOR")
    return { error: "User is not authorized" };

  const description = formData.get("description") as string;
  if (!fieldId || !description) return { error: "Missing data in form" };

  try {
    await db
      .update(AirtableTableField)
      .set({
        description,
        updatedAt: new Date(),
      })
      .where(eq(AirtableTableField.id, fieldId));
    const wrapper = await airtableWraper(field.workspaceId);
    console.log("params", {
      baseId: field.table.base.externalId,
      tableId: field.table.externalId,
      fieldId: field.externalId,
      description,
    });
    await wrapper.updateFieldDescription({
      baseId: field.table.base.externalId,
      tableId: field.table.externalId,
      fieldId: field.externalId,
      description,
    });
  } catch (error) {
    console.error(error);
    return {
      error:
        "You do not have the required permissions to edit this field description, please reconnect your workspace to airtable",
    };
  }
  console.log("success");
  return { message: "Field description updated" };
};
