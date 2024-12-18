import { relations, type InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// Account table
export const Account = pgTable(
  "Account",
  {
    id: varchar("id")
      .primaryKey()
      .notNull()
      .$default(() => createId()),
    userId: varchar("userId")
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    type: varchar("type").notNull(),
    provider: varchar("provider").notNull(),
    providerAccountId: varchar("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type"),
    scope: varchar("scope"),
    id_token: text("id_token"),
    session_state: varchar("session_state"),
  },
  (table) => ({
    providerProviderAccountIdIndex: uniqueIndex(
      "provider_providerAccountId_idx"
    ).on(table.provider, table.providerAccountId),
  })
);

export type Account = InferSelectModel<typeof Account>;

export const accountRelations = relations(Account, ({ one }) => ({
  user: one(User, {
    fields: [Account.userId],
    references: [User.id],
  }),
}));

// Session table
export const Session = pgTable("Session", {
  sessionToken: varchar("sessionToken").notNull().primaryKey(),
  userId: varchar("userId")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
  id: varchar("id")
    .primaryKey()
    .notNull()
    .$default(() => createId()),
});

export type Session = InferSelectModel<typeof Session>;

export const sessionRelations = relations(Session, ({ one }) => ({
  user: one(User, {
    fields: [Session.userId],
    references: [User.id],
  }),
}));

// User table
export const User = pgTable("User", {
  id: varchar("id")
    .primaryKey()
    .notNull()
    .$default(() => createId()),
  name: varchar("name"),
  email: varchar("email").unique(),
  emailVerified: timestamp("emailVerified"),
  image: varchar("image"),
});

export type User = InferSelectModel<typeof User>;

export const userRelations = relations(User, ({ many, one }) => ({
  workspaceUsers: many(WorkspaceUser),
  accounts: many(Account),
  sessions: many(Session),
  extractions: many(Extraction),
}));

// WorkspaceUser table
export const workspaceUserRoleEnum = pgEnum("WorkspaceUserRole", [
  "OWNER",
  "EDITOR",
  "VIEWER",
]);
export const WorkspaceUser = pgTable(
  "WorkspaceUser",
  {
    id: varchar("id")
      .primaryKey()
      .notNull()
      .$default(() => createId()),
    role: workspaceUserRoleEnum("role").notNull().default("VIEWER"),
    userId: varchar("userId")
      .notNull()
      .references(() => User.id),
    workspaceId: varchar("workspaceId")
      .notNull()
      .references(() => Workspace.id),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => ({
    workspaceUserIndex: uniqueIndex("workspace_user_idx").on(
      table.workspaceId,
      table.userId
    ),
  })
);

export type WorkspaceUser = InferSelectModel<typeof WorkspaceUser>;

export const workspaceUserRelations = relations(WorkspaceUser, ({ one }) => ({
  user: one(User, {
    fields: [WorkspaceUser.userId],
    references: [User.id],
  }),
  workspace: one(Workspace, {
    fields: [WorkspaceUser.workspaceId],
    references: [Workspace.id],
  }),
}));

// Workspace table
export const Workspace = pgTable("Workspace", {
  id: varchar("id")
    .primaryKey()
    .notNull()
    .$default(() => createId()),
  name: varchar("name").notNull(),
  airtableAccessToken: varchar("airtableAccessToken"),
  airtableScopes: varchar("airtableScopes"),
  airtableRefreshToken: varchar("airtableRefreshToken"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export type Workspace = InferSelectModel<typeof Workspace>;

export const workspaceRelations = relations(Workspace, ({ many, one }) => ({
  workspaceUsers: many(WorkspaceUser),
  airtableBases: many(AirtableBase),
  airtableTables: many(AirtableTable),
  airtableTableFields: many(AirtableTableField),
  extractions: many(Extraction),
}));

// AirtableWebhook table
export const AirtableWebhook = pgTable("AirtableWebhook", {
  id: varchar("id")
    .primaryKey()
    .notNull()
    .$default(() => createId()),
  externalId: varchar("externalId").notNull().unique(),
  externalBaseId: varchar("externalBaseId").notNull().unique(),
  macSecret: varchar("macSecret").notNull(),
  expirationTime: timestamp("expirationTime"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export type AirtableWebhook = InferSelectModel<typeof AirtableWebhook>;

export const airtableWebhookRelations = relations(
  AirtableWebhook,
  ({ one }) => ({
    airtableBase: one(AirtableBase, {
      fields: [AirtableWebhook.externalBaseId],
      references: [AirtableBase.externalId],
    }),
  })
);

// Subscription table
export const subscriptionStatusEnum = pgEnum("SubscriptionStatus", [
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "paused",
  "trialing",
  "unpaid",
]);

// VerificationToken table
export const VerificationToken = pgTable(
  "VerificationToken",
  {
    identifier: varchar("identifier").notNull(),
    token: varchar("token").notNull().unique(),
    expires: timestamp("expires").notNull(),
  },
  (table) => ({
    identifierTokenIndex: uniqueIndex("identifier_token_idx").on(
      table.identifier,
      table.token
    ),
  })
);

export type VerificationToken = InferSelectModel<typeof VerificationToken>;

// AirtableBase table
export const AirtableBase = pgTable(
  "AirtableBase",
  {
    id: varchar("id")
      .primaryKey()
      .notNull()
      .$default(() => createId()),
    externalId: varchar("externalId").notNull(),
    name: varchar("name").notNull(),
    workspaceId: varchar("workspaceId")
      .notNull()
      .references(() => Workspace.id),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull(),
    webhookId: varchar("webhookId")
      .notNull()
      .references(() => AirtableWebhook.id),
  },
  (table) => ({
    workspaceExternalIdIndex: uniqueIndex(
      "airtable_base_workspace_externalId_idx"
    ).on(table.workspaceId, table.externalId),
  })
);

export type AirtableBase = InferSelectModel<typeof AirtableBase>;

export const airtableBaseRelations = relations(
  AirtableBase,
  ({ one, many }) => ({
    workspace: one(Workspace, {
      fields: [AirtableBase.workspaceId],
      references: [Workspace.id],
    }),
    airtableWebhook: one(AirtableWebhook, {
      fields: [AirtableBase.webhookId],
      references: [AirtableWebhook.id],
    }),
    airtableTables: many(AirtableTable),
  })
);

// AirtableTable table
export const AirtableTable = pgTable(
  "AirtableTable",
  {
    id: varchar("id")
      .primaryKey()
      .notNull()
      .$default(() => createId()),
    emailKey: varchar("emailKey")
      .notNull()
      .unique()
      .$default(() => generateUniqueString(16)),
    externalId: varchar("externalId").notNull(),
    baseId: varchar("baseId")
      .notNull()
      .references(() => AirtableBase.id),
    workspaceId: varchar("workspaceId")
      .notNull()
      .references(() => Workspace.id),
    name: varchar("name").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => ({
    workspaceExternalIdIndex: uniqueIndex(
      "airtable_table_workspace_externalId_idx"
    ).on(table.workspaceId, table.externalId),
  })
);

export type AirtableTable = InferSelectModel<typeof AirtableTable>;

export const airtableTableRelations = relations(
  AirtableTable,
  ({ one, many }) => ({
    base: one(AirtableBase, {
      fields: [AirtableTable.baseId],
      references: [AirtableBase.id],
    }),
    workspace: one(Workspace, {
      fields: [AirtableTable.workspaceId],
      references: [Workspace.id],
    }),
    airtableTableFields: many(AirtableTableField),
    extractions: many(Extraction),
  })
);

// AirtableTableField table
export const AirtableTableField = pgTable(
  "AirtableTableField",
  {
    id: varchar("id")
      .primaryKey()
      .notNull()
      .$default(() => createId()),
    isActivated: boolean("isActivated").notNull().default(false),
    isDocumentTargetField: boolean("isDocumentTargetField")
      .notNull()
      .default(false),
    externalId: varchar("externalId").notNull(),
    tableId: varchar("tableId")
      .notNull()
      .references(() => AirtableTable.id),
    workspaceId: varchar("workspaceId")
      .notNull()
      .references(() => Workspace.id),
    fieldName: varchar("fieldName").notNull(),
    fieldType: varchar("fieldType").notNull(),
    description: varchar("description"),
    linkedTableId: varchar("linkedTableId"),
    possibleValues: text("possibleValues").array(),
    isPrimaryField: boolean("isPrimaryField").notNull().default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => ({
    workspaceExternalIdIndex: uniqueIndex(
      "airtable_table_field_workspace_externalId_idx"
    ).on(table.workspaceId, table.externalId),
  })
);

export type AirtableTableField = InferSelectModel<typeof AirtableTableField>;

export const airtableTableFieldRelations = relations(
  AirtableTableField,
  ({ one, many }) => ({
    table: one(AirtableTable, {
      fields: [AirtableTableField.tableId],
      references: [AirtableTable.id],
    }),
    workspace: one(Workspace, {
      fields: [AirtableTableField.workspaceId],
      references: [Workspace.id],
    }),
    extractionKeyValues: many(ExtractionKeyValue),
  })
);

// Extraction table
export const extractionStatusEnum = pgEnum("ExtractionStatus", [
  "PENDING",
  "SUCCESS",
  "FAILED",
]);

export const Extraction = pgTable("Extraction", {
  id: varchar("id")
    .primaryKey()
    .notNull()
    .$default(() => createId()),
  tableId: varchar("tableId")
    .notNull()
    .references(() => AirtableTable.id),
  workspaceId: varchar("workspaceId")
    .notNull()
    .references(() => Workspace.id),
  userId: varchar("userId").references(() => User.id),
  emailSender: varchar("emailSender"),
  destinationRecordId: varchar("destinationRecordId"),
  documentFileName: varchar("documentFileName"),
  documentFileUrl: varchar("documentFileUrl"),
  airtableRecordId: varchar("airtableRecordId"),
  inputTokenCount: integer("inputTokenCount"),
  outputTokenCount: integer("outputTokenCount"),
  pageCount: integer("pageCount"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull(),
  status: extractionStatusEnum("status").notNull().default("PENDING"),
});

export type Extraction = InferSelectModel<typeof Extraction>;

export const extractionRelations = relations(Extraction, ({ one, many }) => ({
  table: one(AirtableTable, {
    fields: [Extraction.tableId],
    references: [AirtableTable.id],
  }),
  workspace: one(Workspace, {
    fields: [Extraction.workspaceId],
    references: [Workspace.id],
  }),
  user: one(User, {
    fields: [Extraction.userId],
    references: [User.id],
  }),
  extractionKeyValues: many(ExtractionKeyValue),
}));

// ExtractionKeyValue table
export const ExtractionKeyValue = pgTable("ExtractionKeyValue", {
  id: varchar("id")
    .primaryKey()
    .notNull()
    .$default(() => createId()),
  workspaceId: varchar("workspaceId")
    .notNull()
    .references(() => Workspace.id),
  extractionId: varchar("extractionId")
    .notNull()
    .references(() => Extraction.id),
  airtableTableFieldId: varchar("airtableTableFieldId").references(
    () => AirtableTableField.id
  ),
  key: varchar("key").notNull(),
  value: varchar("value"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export type ExtractionKeyValue = InferSelectModel<typeof ExtractionKeyValue>;

export const extractionKeyValueRelations = relations(
  ExtractionKeyValue,
  ({ one }) => ({
    workspace: one(Workspace, {
      fields: [ExtractionKeyValue.workspaceId],
      references: [Workspace.id],
    }),
    extraction: one(Extraction, {
      fields: [ExtractionKeyValue.extractionId],
      references: [Extraction.id],
    }),
    airtableTableField: one(AirtableTableField, {
      fields: [ExtractionKeyValue.airtableTableFieldId],
      references: [AirtableTableField.id],
    }),
  })
);

function generateUniqueString(length: number = 12): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let uniqueString = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueString += characters[randomIndex];
  }
  return uniqueString;
}
