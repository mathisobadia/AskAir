import { db } from "@/db";
import { AirtableWebhook, Workspace } from "@/db/schema";
import airtable from "airtable";
import { eq } from "drizzle-orm";
import { jwtDecode } from "jwt-decode";

export interface BaseMetadata {
  tables: Array<TableMetaData>;
}
export interface TableMetaData {
  id: string;
  name: string;
  primaryFieldId: string;
  description?: string;
  fields: Array<FieldMetaData>;
}
export interface FieldMetaData {
  id: string;
  name: string;
  type: string;
  options?: {
    linkedTableId?: string;
    choices?: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  };
  description?: string;
}

export type AirtableWraper = Awaited<ReturnType<typeof airtableWraper>>;
type CreateWebhookResponse = {
  //An identifier for the webhook (WebhookId).
  id: string;
  //A MAC secret. The client should store this value to authenticate webhook pings. There is no way to retrieve this value after the initial creation of the webhook.
  macSecretBase64: string;
  //The time when the webhook expires and is disabled in the ISO format. The webhook will not expire if this is null (in the case User API keys are used)
  expirationTime?: string;
};

type ListWebhooksResponse = {
  webhooks: [
    {
      areNotificationsEnabled: boolean;
      cursorForNextPayload: number;
      expirationTime: string;
      id: string;
      isHookEnabled: boolean;
      lastNotificationResult: null;
      lastSuccessfulNotificationTime: null;
      notificationUrl: null;
      specification: {
        options: {
          filters: {
            dataTypes: ["tableData"];
            recordChangeScope: "tbltp8DGLhqbUmjK1";
          };
        };
      };
    }
  ];
};

export async function retryWithBackoff<T>(
  fn: () => Promise<Response>,
  maxRetries = 5,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fn();
      const result = await response.json();

      // Check if response is an error object from Airtable
      if (result && typeof result === "object" && "errors" in result) {
        // @ts-expect-error
        throw new Error(result.errors[0].error);
      }
      if (result && typeof result === "object" && "error" in result) {
        throw new Error(JSON.stringify(result.error));
      }
      return result as T;
    } catch (error: any) {
      console.log("Error", error);
      if (
        (error?.message?.toLowerCase().includes("rate limit") ||
          error?.message === "RATE_LIMIT_REACHED") &&
        attempt < maxRetries - 1
      ) {
        console.log(
          "Rate limit reached, retrying in",
          baseDelay * Math.pow(2, attempt),
          "ms"
        );
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries reached");
}

export const airtableWraper = async (worksapceId: string) => {
  let workspace = await db.query.Workspace.findFirst({
    where: eq(Workspace.id, worksapceId),
  });
  if (!workspace) throw new Error("Workspace not found");

  let accessToken = workspace?.airtableAccessToken;
  if (!accessToken) {
    throw new Error("No airtable access token");
  }
  // the access token is not standard JWT, so we need to remove the .v1 in the middle
  const decoded = jwtDecode(accessToken.replace(".v1", "")) as {
    expiresAt: string;
  };
  console.log({ decoded });
  if (!decoded.expiresAt) {
    throw new Error("Exp not found in access token");
  }
  const isExpired =
    new Date(decoded.expiresAt).getTime() < new Date().getTime();
  if (isExpired) {
    // use refresh token  to get new access token
    workspace = await refreshAccessToken(workspace);
  }
  accessToken = workspace?.airtableAccessToken || null;
  if (!accessToken) {
    throw new Error("No airtable access token 2");
  }
  airtable.configure({
    apiKey: accessToken,
  });
  return {
    createWebhook: async ({ externalBaseId }: { externalBaseId: string }) => {
      // check if there are already webhooks for this base
      const webhooks = await retryWithBackoff<ListWebhooksResponse>(() =>
        fetch(`https://api.airtable.com/v0/bases/${externalBaseId}/webhooks`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      );
      if (webhooks.webhooks.length > 0) {
        console.log("Webhook already exists");
        // delete existings webhooks
        await Promise.all(
          webhooks.webhooks.map(async (webhook) => {
            await retryWithBackoff(() =>
              fetch(
                `https://api.airtable.com/v0/bases/${externalBaseId}/webhooks/${webhook.id}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              )
            );
          })
        );
        // also delete the webhook from db
        await db
          .delete(AirtableWebhook)
          .where(eq(AirtableWebhook.externalBaseId, externalBaseId));
      }

      const webhook = await retryWithBackoff<CreateWebhookResponse>(() =>
        fetch(`https://api.airtable.com/v0/bases/${externalBaseId}/webhooks`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notificationUrl: "https://askair.ai/api/airtable/webhook",
            specification: {
              options: {
                filters: {
                  dataTypes: ["tableMetadata", "tableFields"],
                },
              },
            },
          }),
        })
      );
      if (!webhook.id || !webhook.macSecretBase64) {
        console.error(
          JSON.stringify({
            notificationUrl: "https://askair.ai/api/airtable/webhook",
            specification: {
              options: {
                filters: {
                  dataTypes: ["tableMetadata", "tableFields"],
                },
              },
            },
          })
        );
        console.error(webhook);
        throw new Error("failed to create webhook");
      }
      console.log({ webhook });
      const [createdWebhook] = await db
        .insert(AirtableWebhook)
        .values({
          externalId: webhook.id,
          macSecret: webhook.macSecretBase64,
          expirationTime: new Date(webhook.expirationTime || 0),
          externalBaseId,
          updatedAt: new Date(),
        })
        .returning();
      if (!createdWebhook) throw new Error("Failed to create webhook");
      return createdWebhook;
    },
    refreshWebhook: async ({ webhook }: { webhook: AirtableWebhook }) => {
      if (!webhook) {
        throw new Error("Webhook not found");
      }
      // check if webhook is expired or about to expire in less than 2 days
      if (webhook.expirationTime) {
        const expirationTime = new Date(webhook.expirationTime).getTime();
        const now = new Date().getTime();
        if (expirationTime - now > 2 * 24 * 60 * 60 * 1000) {
          return;
        }
      }
      // they should all share the same external Id
      const baseId = webhook.externalBaseId;
      const data = await retryWithBackoff<{ expirationTime: string }>(() =>
        fetch(
          `https://api.airtable.com/v0/bases/${baseId}/webhooks/${webhook.externalId}/refresh`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        )
      );

      await db
        .update(AirtableWebhook)
        .set({
          expirationTime: new Date(data.expirationTime),
          updatedAt: new Date(),
        })
        .where(eq(AirtableWebhook.id, webhook.id));
    },

    updateFieldDescription: async ({
      baseId,
      tableId,
      fieldId,
      description,
    }: {
      baseId: string;
      tableId: string;
      fieldId: string;
      description: string;
    }) => {
      return await retryWithBackoff(() =>
        fetch(
          `https://api.airtable.com/v0/meta/bases/${baseId}/tables/${tableId}/fields/${fieldId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ description }),
          }
        )
      );
    },
    listBases: async () => {
      const { bases } = await retryWithBackoff<{
        bases: Array<{
          id: string;
          name: string;
          permissionLevel: "create" | "read";
        }>;
      }>(() =>
        fetch("https://api.airtable.com/v0/meta/bases", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      );
      return bases;
    },
    getBaseMetadata: async (baseId: string) => {
      return await retryWithBackoff<BaseMetadata>(() =>
        fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        })
      );
    },
    getBase: (baseId: string) => airtable.base(baseId),
    getRecord: async ({
      baseId,
      tableId,
      recordId,
    }: {
      baseId: string;
      tableId: string;
      recordId: string;
    }) => {
      let base = airtable.base(baseId);
      let table = base.table(tableId);
      // TODO: handle errors
      return await table.find(recordId);
    },
  };
};

const refreshAccessToken = async (workspace: Workspace) => {
  const refreshToken = workspace?.airtableRefreshToken;
  if (!refreshToken) {
    throw new Error("No airtable refresh token");
  }
  console.log("Refreshing access token");

  let params = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: process.env.AIRTABLE_CLIENT_ID,
  };

  const data = await retryWithBackoff<{
    access_token: string;
    scope: string;
    refresh_token: string;
  }>(() =>
    fetch("https://airtable.com/oauth2/v1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(params),
    })
  );

  const [updatedWorkspace] = await db
    .update(Workspace)
    .set({
      airtableAccessToken: data.access_token,
      airtableScopes: data.scope,
      airtableRefreshToken: data.refresh_token,
      updatedAt: new Date(),
    })
    .where(eq(Workspace.id, workspace.id))
    .returning();
  return updatedWorkspace;
};
