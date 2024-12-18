import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import type { Subscription } from "@/db/schema";
import { CustomerPortal } from "@/components/client/CustomerPortal";
import WorkspaceContentLayout from "../workspace-content-layout";
import type { PageInfoProps } from "../workspace-content-layout";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { Workspace, WorkspaceUser, User } from "@/db/schema";
import { type WorkspaceUserRow, columns } from "./columns";
import { DataTable } from "./data-table";
import RenameWorkspaceForm from "@/components/forms/workspace/workspace-rename";
import AddUserToWorkspaceForm from "@/components/forms/workspace/workspace-add-user";
import { Suspense } from "react";
import LoadingState from "@/components/client/LoadingState";

export default function Page(props: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense fallback={<LoadingState />}>
      <SettingsPage {...props} />
    </Suspense>
  );
}

async function SettingsPage(props: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const workspaceId = params.workspaceId;
  const workspace = await db.query.Workspace.findFirst({
    where: eq(Workspace.id, workspaceId),
    with: {
      subscription: true,
    },
  });
  if (!workspace) return null;
  const subscription = workspace.subscription;
  const pageInfo: PageInfoProps = {
    title: "Settings",
    subtitle: "Manage your workspace",
    breadcrumb: [
      {
        title: "Dashboard",
        href: `/workspaces/${workspaceId}`,
      },
    ],
  };

  const workspaceUsers = await db.query.WorkspaceUser.findMany({
    where: eq(WorkspaceUser.workspaceId, workspaceId),
    with: {
      user: {
        columns: {
          email: true,
          id: true,
        },
      },
    },
  });
  const workspaceUserRows: WorkspaceUserRow[] = workspaceUsers.map((wu) => ({
    email: wu.user.email || "",
    role: wu.role,
    createdAt: wu.createdAt,
    id: wu.id,
    workspaceId: workspaceId,
  }));

  return (
    <WorkspaceContentLayout pageInfo={pageInfo}>
      <div className="grid gap-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Rename workspace</CardTitle>
            <CardDescription>Enter a new name</CardDescription>
          </CardHeader>
          <CardContent>
            <RenameWorkspaceForm
              workspaceId={workspaceId}
              name={workspace.name}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace users</CardTitle>
            <CardDescription>
              Add or remove users access to this workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={workspaceUserRows} />
          </CardContent>
          <CardFooter className="border-t pt-4">
            <AddUserToWorkspaceForm workspaceId={workspaceId} />
          </CardFooter>
        </Card>
      </div>

      {/* 
      <section>
        {subscription ? (
          <SubscriptionCard subscription={subscription}></SubscriptionCard>
        ) : (
          <>
            <Card className="mt-5">
              <CardHeader>
                <CardTitle>Free Plan</CardTitle>
                <CardDescription>
                  Your are using the free version of AskAir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>limmited to 50 free extractions</li>
                </ul>
              </CardContent>{" "}
              <CardFooter>
                <Link
                  className={buttonVariants({ variant: "default" })}
                  href={`/workspaces/${workspaceId}/subscribe`}
                >
                  See Plans
                </Link>
              </CardFooter>
            </Card>
          </>
        )}
      </section> */}
    </WorkspaceContentLayout>
  );
}

const SubscriptionCard = ({ subscription }: { subscription: Subscription }) => {
  const workspaceId = subscription.workspaceId;
  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>Pro Plan</CardTitle>
        <CardDescription>$10/month</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {subscription.status}
          <li>Started on : {subscription.createdAt.toLocaleDateString()}</li>
          <li>
            current period start:{" "}
            {subscription.currentPeriodStart.toLocaleDateString()}
          </li>
          <li>
            current period end:{" "}
            {subscription.currentPeriodEnd.toLocaleDateString()}
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <CustomerPortal workspaceId={workspaceId} />
      </CardFooter>
    </Card>
  );
};
