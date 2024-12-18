import { db } from "@/db";
import { eq } from "drizzle-orm";
import WorkspaceContentLayout, {
  type PageInfoProps,
} from "../workspace-content-layout";
import { AirtableBase } from "@/db/schema";

import { Suspense } from "react";
import LoadingState from "@/components/client/LoadingState";
import { BaseCard } from "../_components/base-card";

export default function Page(props: {
  params: Promise<{ workspaceId: string; baseId: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState />}>
      <BasesLayout params={props.params} />
    </Suspense>
  );
}

async function BasesLayout(props: {
  params: Promise<{ workspaceId: string }>;
}) {
  const params = await props.params;
  const pageInfo: PageInfoProps = {
    title: "Bases",
    subtitle:
      "Manage your synced bases here. Adjust settings, view data, and more.",
    breadcrumb: [
      {
        title: "Dashboard",
        href: `/workspaces/${params.workspaceId}`,
      },
    ],
  };
  const bases = await db.query.AirtableBase.findMany({
    where: eq(AirtableBase.workspaceId, params.workspaceId),
    columns: {
      id: true,
      name: true,
      workspaceId: true,
      updatedAt: true,
    },
  });
  return (
    <WorkspaceContentLayout pageInfo={pageInfo}>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {bases.map((base) => (
          <BaseCard key={base.id} base={base} />
        ))}
      </div>
    </WorkspaceContentLayout>
  );
}
