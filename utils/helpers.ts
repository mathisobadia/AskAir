import type {
  BaseMetadata,
  FieldMetaData,
  TableMetaData,
} from "@/lib/airtable";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  User,
  WorkspaceUser,
  AirtableTable,
  AirtableTableField,
} from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { acceptedFieldTypesForDocumentExtraction } from "./constants";
import { createId } from "@paralleldrive/cuid2";

export const getWorkspaceIfUserHasAccess = async (workspaceId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }
  const user = await db.query.User.findFirst({
    where: eq(User.id, session?.user?.id),
    with: {
      workspaceUsers: {
        where: eq(WorkspaceUser.workspaceId, workspaceId),
        with: {
          workspace: true,
        },
      },
    },
  });
  const workspaceUser = user?.workspaceUsers[0];
  if (!workspaceUser || !user?.workspaceUsers[0]) {
    redirect("/");
  }
  return user?.workspaceUsers[0].workspace;
};

export const treatAllTables = async ({
  baseId,
  baseMetadata,
  workspaceId,
}: {
  baseId: string;
  baseMetadata: BaseMetadata;
  workspaceId: string;
}) => {
  console.log("treatAllTables", baseId, workspaceId);
  const tablesToUpsert = baseMetadata.tables.map((table) => ({
    id: createId(),
    baseId: baseId,
    workspaceId: workspaceId,
    externalId: table.id,
    name: table.name,
    updatedAt: new Date(),
  }));

  if (!tablesToUpsert?.length) {
    console.error("No tables to upsert", baseId);
    return;
  }
  const tables = await db
    .insert(AirtableTable)
    .values(tablesToUpsert)
    .onConflictDoUpdate({
      target: [AirtableTable.workspaceId, AirtableTable.externalId],
      set: {
        name: sql.raw(`"excluded"."name"`),
        updatedAt: sql.raw(`"excluded"."updatedAt"`),
        // email key needs to stay the same
      },
    })
    .returning();

  const tablesWithMetadata = tables.map((table) => ({
    tableId: table.id,
    table: baseMetadata.tables.find(
      (t) => t.id === table.externalId
    ) as TableMetaData,
  }));
  await treatAllTableFields({ tablesWithMetadata, workspaceId });

  // remove tables that we don't have access to anymore
  const dbTables = await db
    .select({ id: AirtableTable.id, externalId: AirtableTable.externalId })
    .from(AirtableTable)
    .where(eq(AirtableTable.baseId, baseId));

  const createdTables = baseMetadata.tables.map((table) => table.id);
  if (!dbTables || dbTables.length === 0) {
    return;
  }
  const toDelete = dbTables.filter(
    (dbTables) => !createdTables.includes(dbTables.externalId)
  );
  await db.delete(AirtableTable).where(
    inArray(
      AirtableTable.id,
      toDelete.map((table) => table.id)
    )
  );
};

export const treatAllTableFields = async ({
  tablesWithMetadata,
  workspaceId,
}: {
  tablesWithMetadata: { tableId: string; table: TableMetaData }[];
  workspaceId: string;
}) => {
  const allFields = tablesWithMetadata.flatMap(({ table, tableId }) =>
    table.fields.map((field) => ({
      tableId,
      field,
      primaryFieldId: table.primaryFieldId,
    }))
  );
  const allTableIds = tablesWithMetadata.map(({ tableId }) => tableId);

  // Upsert fields in a single query
  const fieldsToUpsert = allFields.map(
    ({ field, tableId, primaryFieldId }) => ({
      id: createId(),
      tableId,
      externalId: field.id,
      workspaceId: workspaceId,
      fieldName: field.name,
      fieldType: field.type,
      description: field.description || "",
      linkedTableId: field.options?.linkedTableId || "",
      possibleValues:
        field.options?.choices?.map((choice) => choice.name) || [],
      isPrimaryField: field.id === primaryFieldId,
      isActivated: false,
      updatedAt: new Date(),
    })
  );

  const createdFields = await db
    .insert(AirtableTableField)
    .values(fieldsToUpsert)
    .onConflictDoUpdate({
      target: [AirtableTableField.workspaceId, AirtableTableField.externalId],
      set: {
        fieldName: sql.raw(`"excluded"."fieldName"`),
        fieldType: sql.raw(`"excluded"."fieldType"`),
        description: sql.raw(`"excluded"."description"`),
        linkedTableId: sql.raw(`"excluded"."linkedTableId"`),
        possibleValues: sql.raw(`"excluded"."possibleValues"`),
        isPrimaryField: sql.raw(`"excluded"."isPrimaryField"`),
        isActivated: sql.raw(
          `CASE WHEN "AirtableTableField"."isActivated" AND "excluded"."fieldType" IN ('checkbox', 'number', 'currency', 'duration', 'percent', 'rating', 'date', 'dateTime', 'singleSelect', 'multipleSelects', 'singleLineText', 'multilineText', 'email', 'phoneNumber', 'url', 'richText', 'multipleRecordLinks') AND "excluded"."description" IS NOT NULL AND LENGTH("excluded"."description") > 0 THEN true ELSE false END`
        ),
      },
    })
    .returning();

  // remove fields that we don't have access to anymore
  const currentFields = await db
    .select({ id: AirtableTableField.id })
    .from(AirtableTableField)
    .where(inArray(AirtableTableField.tableId, allTableIds));

  const currentFieldIds = currentFields.map((field) => field.id);
  const createdFieldIds = createdFields.map((field) => field.id);
  if (!currentFieldIds || currentFieldIds.length === 0) {
    return;
  }
  const toDeleteIds = currentFieldIds.filter(
    (id) => !createdFieldIds.includes(id)
  );
  await db
    .delete(AirtableTableField)
    .where(inArray(AirtableTableField.id, toDeleteIds));
};
