import { db } from "@/db";
import { AirtableWebhook, AirtableBase } from "@/db/schema";
import { refreshBaseFields } from "@/utils/serverActions";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createHmac } from "crypto";

export const dynamic = "force-dynamic"; // defaults to auto

type AirtableWebhookData = {
  base: {
    id: string;
  };
  webhook: {
    id: string;
  };
  timestamp: string;
};

export const maxDuration = 300; // it is 5 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    // Note: Use the decoded macSecret here, not the Base64-encoded
    // version that was returned from the webhook create API action.
    const webhookData = JSON.parse(body) as AirtableWebhookData;
    // many workspaces can connect to the same webhook
    const [airtableWebhook] = await db
      .select()
      .from(AirtableWebhook)
      .where(eq(AirtableWebhook.externalId, webhookData.webhook.id))
      .leftJoin(AirtableBase, eq(AirtableBase.webhookId, AirtableWebhook.id));

    if (!airtableWebhook) {
      throw new Error("Webhook not found");
    }
    const macSecretBase64 = airtableWebhook.AirtableWebhook.macSecret;
    const macSecret = Buffer.from(macSecretBase64, "base64");
    // verify the event by computing the signature and comparing it to the signature provided in the `X-Airtable-Content-MAC` header
    const hmac = createHmac("sha256", macSecret);

    hmac.update(body.toString(), "ascii");
    const expectedContentHmac = "hmac-sha256=" + hmac.digest("hex");
    const signature =
      request.headers.get("X-Airtable-Content-MAC") ||
      request.headers.get("x-airtable-content-mac");
    if (signature !== expectedContentHmac) {
      throw new Error("Invalid signature");
    }
    const bases = await db
      .select()
      .from(AirtableBase)
      .where(eq(AirtableBase.webhookId, airtableWebhook.AirtableWebhook.id));

    for (const base of bases) {
      await refreshBaseFields({ baseId: base.id });
    }
    // TODO update base fields by looking at the webhook payload instead https://airtable.com/developers/web/api/list-webhook-payloads
    return NextResponse.json("");
  } catch (err) {
    console.error(err);
    return NextResponse.json("");
  }
}
