import { db } from "@/db";
import { User, Workspace, WorkspaceUser } from "@/db/schema";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { Metadata } from "next";
import LandingPage from "@/components/landing-page";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://askair.ai",
  },
  title: "AskAir - Extract Documents into Airtable with AI",
  description:
    "Import document data into Airtable entries instantly with AI-powered automation. Save time and eliminate manual data entry.",
  keywords: [
    "AskAir",
    "Airtable",
    "AI",
    "document extraction",
    "data entry automation",
    "document processing",
    "OCR",
    "data management",
  ],
  authors: [{ name: "AskAir Team" }],
  openGraph: {
    title: "AskAir - Extract Documents into Airtable with AI",
    description:
      "Import document data into Airtable entries instantly with AI-powered automation. Save time and eliminate manual data entry.",
    url: "https://askair.ai",
    siteName: "AskAir",
    images: [
      {
        url: "https://askair.ai/api/og-image",
        width: 1200,
        height: 630,
        alt: "AskAir - AI-powered Document Extraction for Airtable",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AskAir - Extract Documents into Airtable with AI",
    description:
      "Import document data into Airtable entries instantly with AI-powered automation. Save time and eliminate manual data entry.",
    images: ["https://askair.ai/api/og-image"],
    creator: "@AskAirAI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function Home() {
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return <LandingPage></LandingPage>;

  const user = await db.query.User.findFirst({
    where: eq(User.id, session?.user?.id),
    with: {
      workspaceUsers: true,
    },
  });

  if (!user) return <div>User not found</div>;
  const workspaceUsers = user.workspaceUsers;

  const defaultWorkspaceName = user.name
    ? `${user.name}'s Workspace`
    : "Default Workspace";
  if (!workspaceUsers || workspaceUsers.length === 0) {
    // create workspace if it does not exists
    const [workspace] = await db
      .insert(Workspace)
      .values({
        name: defaultWorkspaceName,
        updatedAt: new Date(),
      })
      .returning();
    if (!workspace) throw new Error("Failed to create workspace");

    await db.insert(WorkspaceUser).values({
      userId: user.id,
      workspaceId: workspace.id,
      role: "OWNER",
      updatedAt: new Date(),
    });

    redirect(`/workspaces/${workspace.id}`);
  }

  const firstWorkspaceId = user.workspaceUsers[0]?.workspaceId;
  if (firstWorkspaceId) {
    redirect(`/workspaces/${firstWorkspaceId}`);
  }
  return <div>Redirecting...</div>;
}
