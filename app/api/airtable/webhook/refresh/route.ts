import { airtableWraper } from "@/lib/airtable";
import { db } from "@/db";
import { AirtableWebhook, AirtableBase, Workspace } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // defaults to auto

export const maxDuration = 300; // it is 5 minutes

export async function GET(request: NextRequest) {
  try {
    // list every webhooks
    const webhooks = await db.query.AirtableWebhook.findMany({
      with: {
        airtableBase: {
          with: {
            workspace: true,
          },
        },
      },
    });
    for (const webhook of webhooks) {
      // refresh each webhook
      await refreshWebhook(webhook);
    }
    return NextResponse.json("");
  } catch (err) {
    console.error(err);
    return NextResponse.json("");
  }
}

const refreshWebhook = async (
  webhook: AirtableWebhook & {
    airtableBase: AirtableBase & {
      workspace: Workspace;
    };
  }
) => {
  if (!webhook.airtableBase) {
    return;
  }
  const workspace = webhook.airtableBase.workspace;
  if (!workspace) {
    throw new Error("Workspace not found");
  }
  const wrapper = await airtableWraper(workspace.id);
  await wrapper.refreshWebhook({ webhook });
};
