import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { type AirtableWraper, airtableWraper } from "@/lib/airtable";
import { treatAllTables } from "@/utils/helpers";
import resend from "@/lib/resend";
export const dynamic = "force-dynamic"; // defaults to auto
import WorkspaceIsReadyEmail from "@/emails/workspaceReady";
import { User, Workspace, AirtableBase, AirtableWebhook } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export const maxDuration = 300; // it is 5 minutes

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session || !session.user?.id)
      return NextResponse.json({ message: "Not logged in", success: false });

    const user = await db.query.User.findFirst({
      where: eq(User.id, session?.user?.id),
    });
    if (!user)
      return NextResponse.json({
        message: "User does not exist",
        success: false,
      });

    const { workspaceId } = params;
    const workspace = await db.query.Workspace.findFirst({
      where: eq(Workspace.id, workspaceId),
    });
    if (!workspace)
      return NextResponse.json({
        message: "Workspace not found",
        success: false,
      });

    // AIRTABLE SAVE META DATA IN OUR SYSTEM
    const wrapper = await airtableWraper(workspaceId);
    const bases = await wrapper.listBases();
    console.log("bases", bases);
    if (!bases || bases.length === 0)
      return NextResponse.json({
        message: "No bases found",
        success: false,
      });
    const basesWithWritePermissions = bases.filter(
      (base) => base.permissionLevel === "create"
    );
    // TODO: if there are bases with read only levels show an error ? we probably don't need a write level for some bases maybe
    for (let base of basesWithWritePermissions) {
      await treatBase({ base, wrapper, workspaceId });
    }
    // remove bases that we don't have access to anymore
    const drizzleBases = await db
      .select({
        externalId: AirtableBase.externalId,
        id: AirtableBase.id,
      })
      .from(AirtableBase)
      .where(eq(AirtableBase.workspaceId, workspace.id));
    const createdBases = bases.map((base) => base.id);
    if (!drizzleBases || drizzleBases.length === 0) {
      return NextResponse.json({
        message: "No bases found",
        success: false,
      });
    }
    const toDelete = drizzleBases.filter(
      (drizzleBase) => !createdBases.includes(drizzleBase.externalId)
    );
    await db.delete(AirtableBase).where(
      inArray(
        AirtableBase.id,
        toDelete.map((base) => base.id)
      )
    );

    if (user.email) {
      await resend.emails.send({
        from:
          process.env.RESEND_FROM_SEND || "Acme <no_reply@updates.askair.ai>",
        to: [user.email],
        subject: "AskAir - Workspace is ready",
        text: `You can now configure your AI Assistant`,
        react: WorkspaceIsReadyEmail({
          workspaceId: workspaceId,
        }),
      });
    }
    return NextResponse.json({ message: "Workspace refreshed", success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      message: "Failed to refresh workspace",
      success: false,
    });
  }
}

const treatBase = async ({
  base,
  wrapper,
  workspaceId,
}: {
  base: { id: string; name: string };
  wrapper: AirtableWraper;
  workspaceId: string;
}) => {
  console.log("treatBase", base.id);
  // Upsert airtble base in db
  // check if webhook already exists for base
  let webhook = await db.query.AirtableWebhook.findFirst({
    where: eq(AirtableWebhook.externalBaseId, base.id),
  });
  if (!webhook) {
    try {
      webhook = await wrapper.createWebhook({ externalBaseId: base.id });
    } catch (err) {
      console.error(err);
    }
  }
  if (!webhook) {
    // we failed to create the webhook, there was an error but we should log it and keep doing the rest of the work
    console.error("cannot find webhook for base", base.id);
    // we skip this base
    return;
  }
  const [baseInDb] = await db
    .insert(AirtableBase)
    .values({
      workspaceId: workspaceId,
      externalId: base.id,
      name: base.name,
      webhookId: webhook.id,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [AirtableBase.workspaceId, AirtableBase.externalId],
      set: {
        name: base.name,
        updatedAt: new Date(),
      },
    })
    .returning();
  let baseMetadata = await wrapper.getBaseMetadata(base.id);
  if (
    baseInDb &&
    baseMetadata &&
    baseMetadata.tables &&
    baseMetadata.tables.length > 0
  ) {
    await treatAllTables({
      baseId: baseInDb.id,
      workspaceId,
      baseMetadata,
    });
  } else {
    console.error("No tables to treat", baseInDb, baseMetadata);
  }
};
