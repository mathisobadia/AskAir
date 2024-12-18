import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { Workspace } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getWorkspaceIfUserHasAccess } from "@/utils/helpers";
import { z } from "zod";
export const dynamic = "force-dynamic"; // defaults to auto

export const maxDuration = 300; // it is 5 minutes

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.redirect("/");

  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const workspaceId = searchParams.get("state");
  const code_challenge = searchParams.get("code_challenge");
  const code_challenge_method = searchParams.get("code_challenge_method");

  if (!code || !workspaceId || !code_challenge || !code_challenge_method)
    return NextResponse.redirect("/");

  // check that user has access to workspace
  let workspace = await getWorkspaceIfUserHasAccess(workspaceId);

  // if success, get access token
  let params = {
    code: code,
    client_id: process.env.AIRTABLE_CLIENT_ID,
    redirect_uri: process.env.AIRTABLE_REDIRECT_URI,
    grant_type: "authorization_code",
    code_verifier: process.env.AIRTABLE_CODE_VERIFIER,
  };
  let response = await fetch("https://airtable.com/oauth2/v1/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });
  let data = await response.json();
  // validate data with zod
  const schema = z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    scope: z.string(),
  });
  const parsedData = schema.passthrough().parse(data);

  // save tokens workspace in db
  await db
    .update(Workspace)
    .set({
      airtableAccessToken: parsedData.access_token,
      airtableScopes: parsedData.scope,
      airtableRefreshToken: parsedData.refresh_token,
      updatedAt: new Date(),
    })
    .where(eq(Workspace.id, workspace.id));

  return NextResponse.redirect(
    `${process.env.SERVER_URL}/workspaces/${workspaceId}/loading`
  );
}
