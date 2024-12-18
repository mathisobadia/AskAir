import { db } from "@/db";
import { eq, desc, count } from "drizzle-orm";
import WorkspaceContentLayout, {
  type PageInfoProps,
} from "./workspace-content-layout";
import { AirtableConnectButton } from "@/components/client/AirtableConnectButton";
import ExtractionTable from "@/components/tables/extractions-table";
import { Extraction, AirtableBase } from "@/db/schema";
import { Suspense } from "react";
import LoadingState from "@/components/client/LoadingState";
import Link from "next/link";
import { BaseCard } from "./_components/base-card";

export default function Page(props: {
  params: Promise<{ workspaceId: string; baseId: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState />}>
      <PageComponent params={props.params} />
    </Suspense>
  );
}

async function PageComponent(props: {
  params: Promise<{ workspaceId: string }>;
}) {
  const params = await props.params;
  const workspaceId = params.workspaceId;

  const extractions = await db.query.Extraction.findMany({
    where: eq(Extraction.workspaceId, workspaceId),
    with: {
      user: {
        columns: {
          name: true,
        },
      },
      table: {
        columns: {
          name: true,
          externalId: true,
        },
        with: {
          base: {
            columns: {
              externalId: true,
            },
          },
        },
      },
      extractionKeyValues: {
        columns: {
          key: true,
          value: true,
        },
      },
    },
    orderBy: desc(Extraction.createdAt),
    limit: 100,
  });

  const pageInfo: PageInfoProps = {
    title: "Dashboard",
    subtitle: "Overview of your workspace, its bases and extractions",
  };

  if (extractions.length !== 0) {
    return (
      <WorkspaceContentLayout pageInfo={pageInfo}>
        <div className="mt-10">
          <div>
            <ExtractionTable extractions={extractions} />
          </div>
        </div>
      </WorkspaceContentLayout>
    );
  }

  const extractionNumber = await db
    .select({ count: count() })
    .from(AirtableBase)
    .where(eq(AirtableBase.workspaceId, workspaceId))
    .then((result) => Number(result[0]?.count));

  return (
    <WorkspaceContentLayout pageInfo={pageInfo}>
      <div className="">
        {!extractionNumber ? (
          <div className="min-w-fit max-w-fit mt-10">
            <AirtableConnectButton
              workspaceId={workspaceId}
              callToAction="Connect your first bases"
            />
          </div>
        ) : (
          <div>
            <p>
              No extractions yet ! Activate a table and send your first document
              to start extracting data.
            </p>
            <BasesAndTablesOverview workspaceId={workspaceId} />
          </div>
        )}
      </div>
    </WorkspaceContentLayout>
  );
}

async function BasesAndTablesOverview({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const bases = await db.query.AirtableBase.findMany({
    where: eq(AirtableBase.workspaceId, workspaceId),
    with: {
      airtableTables: true,
    },
  });

  if (!bases.length) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-lg font-semibold">Connected Bases</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bases.map((base) => (
          <BaseCard key={base.id} base={base} />
        ))}
      </div>
    </div>
  );
}
