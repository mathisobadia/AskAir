"use server";

import InviteToWorkspaceEmail from "@/emails/inviteToWorkspace";
import resend from "@/lib/resend";
import { db } from "@/db";
import { User, Workspace, WorkspaceUser } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2";

export const inviteEmailToWorkspace = async ({
  email,
  workspaceId,
  role = "VIEWER",
}: {
  email: string;
  workspaceId: string;
  role?: "OWNER" | "EDITOR" | "VIEWER";
}) => {
  // Check if there's a user with this email
  let user = await db.query.User.findFirst({
    where: eq(User.email, email),
  });

  if (!user) {
    // Create a user with this email
    const [newUser] = await db
      .insert(User)
      .values({
        id: createId(),
        email,
      })
      .returning();
    if (!newUser) throw new Error("User not created");
    user = newUser;
  }

  // Check if this user is already in the workspace
  const workspaceUser = await db.query.WorkspaceUser.findFirst({
    where: and(
      eq(WorkspaceUser.userId, user.id),
      eq(WorkspaceUser.workspaceId, workspaceId)
    ),
  });

  if (workspaceUser) {
    throw new Error("User is already in the workspace");
  }

  // Add the user to the workspace
  await db.insert(WorkspaceUser).values({
    id: createId(),
    userId: user.id,
    workspaceId,
    role,
    updatedAt: new Date(),
  });

  const workspace = await db.query.Workspace.findFirst({
    where: eq(Workspace.id, workspaceId),
  });

  await resend.emails.send({
    from: process.env.RESEND_FROM_SEND || "Acme <no_reply@updates.askair.ai>",
    to: [email],
    bcc: ["connect@askair.ai"],
    subject: `AskAir - Workspace invitation to ${workspace?.name}`,
    react: InviteToWorkspaceEmail({
      workspaceId,
      workspaceName: workspace?.name || "",
    }),
  });

  revalidatePath(`/workspaces/${workspaceId}/settings`);

  return workspaceUser;
};

export const removeUserFromWorkspace = async ({
  workspaceUserId,
  workspaceId,
}: {
  workspaceUserId: string;
  workspaceId: string;
}) => {
  const workspaceUser = await db.query.WorkspaceUser.findFirst({
    where: eq(WorkspaceUser.id, workspaceUserId),
  });

  if (!workspaceUser) {
    throw new Error("Workspace user not found");
  }

  if (workspaceUser.role === "OWNER") {
    throw new Error("Cannot remove owner from workspace");
  }

  await db.delete(WorkspaceUser).where(eq(WorkspaceUser.id, workspaceUserId));

  revalidatePath(`/workspaces/${workspaceId}`, "layout");
  return true;
};

export const renameWorkspace = async ({
  workspaceId,
  name,
}: {
  workspaceId: string;
  name: string;
}) => {
  const [updatedWorkspace] = await db
    .update(Workspace)
    .set({ name, updatedAt: new Date() })
    .where(eq(Workspace.id, workspaceId))
    .returning();

  revalidatePath(`/workspaces/${workspaceId}`, "layout");
  return updatedWorkspace;
};

export const createNewWorkspace = async ({
  name,
  userId,
}: {
  name: string;
  userId: string;
}) => {
  const workspaceId = createId();
  const [workspace] = await db
    .insert(Workspace)
    .values({
      id: workspaceId,
      name,
      updatedAt: new Date(),
    })
    .returning();

  await db.insert(WorkspaceUser).values({
    id: createId(),
    userId,
    workspaceId,
    role: "OWNER",
    updatedAt: new Date(),
  });

  if (!workspace) throw new Error("Workspace not created");
  // TODO: send email notification
  return workspace;
};
