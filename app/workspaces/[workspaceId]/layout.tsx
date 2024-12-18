import Header from "./header";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import LeftPanelContent from "./left-panel-content";
import { Home, DatabaseZap, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { eq, and } from "drizzle-orm";
import { WorkspaceUser, Workspace, AirtableBase } from "@/db/schema";

export type MenuItem = {
  name: string;
  href: string;
  subItems?: MenuItem[];
  icon?: LucideIcon;
};
export type Menu = MenuItem[];

const Footer = () => {
  return <footer></footer>;
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const params = await props.params;

  const { children } = props;

  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return <div>You are not connected</div>;

  const [workspaceUsers, bases] = await Promise.all([
    db.query.WorkspaceUser.findMany({
      where: eq(WorkspaceUser.userId, session.user.id),
      with: {
        workspace: {
          with: {
            subscription: true,
          },
        },
      },
    }),
    db.query.AirtableBase.findMany({
      where: eq(AirtableBase.workspaceId, params.workspaceId),
    }),
  ]);

  const workspaceUser = workspaceUsers.find(
    (workspaceUser) => workspaceUser.workspace.id === params.workspaceId
  );

  if (!workspaceUser)
    return <div>You do not have access to this workspace</div>;

  const { workspace } = workspaceUser;

  const workspaces = workspaceUsers.map(
    (workspaceUser) => workspaceUser.workspace
  );

  // GENERATE MENU

  const menu: Menu = [
    {
      name: "Dashboard",
      href: `/workspaces/${workspace.id}`,
      icon: Home,
    },
    {
      name: "Bases",
      href: `/workspaces/${workspace.id}/bases`,
      subItems: bases.map((base) => ({
        name: base.name,
        href: `/workspaces/${workspace.id}/bases/${base.id}`,
      })),
      icon: DatabaseZap,
    },
    {
      name: "Settings",
      href: `/workspaces/${workspace.id}/settings`,
      icon: Settings,
    },
  ];

  return (
    <div className="flex flex-col">
      <Header
        user={session.user}
        workspaceId={params.workspaceId}
        workspaces={workspaces}
        menu={menu}
        className={`h-16 fixed top-0 left-0  w-full border border-muted px-2 z-2 bg-background z-20`}
      />

      <div className="z-10 transition-all w-64 pt-16 fixed h-screen top-0 left-0 px-2 border border-muted bg-background  -translate-x-full md:translate-x-0">
        <LeftPanelContent
          workspace={workspace}
          userId={session?.user?.id}
          menu={menu}
          workspaces={workspaces}
        />
      </div>
      <div className="md:pl-64 py-16 bg-background">
        <div className="px-2 md:px-4 pt-4">{children}</div>
        <Footer />
      </div>
    </div>
  );
}
