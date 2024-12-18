import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { eq, asc } from "drizzle-orm";
import { AirtableBase, AirtableTable, AirtableTableField } from "@/db/schema";
import TableCard from "./tableCard";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import RefreshBaseFieldsButton from "./refresh-base-button";
import Link from "next/link";

import WorkspaceContentLayout from "../../workspace-content-layout";
import type { PageInfoProps } from "../../workspace-content-layout";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";
import LoadingState from "@/components/client/LoadingState";

export const maxDuration = 300; // it is 5 minutes

export default function Page(props: {
  params: Promise<{ workspaceId: string; baseId: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState />}>
      <BasePageContent params={props.params} />
    </Suspense>
  );
}

async function BasePageContent(props: {
  params: Promise<{ workspaceId: string; baseId: string }>;
}) {
  const params = await props.params;
  const base = await db.query.AirtableBase.findFirst({
    where: eq(AirtableBase.id, params.baseId),
    with: {
      airtableTables: {
        with: {
          airtableTableFields: {
            orderBy: asc(AirtableTableField.fieldName),
          },
        },
        orderBy: asc(AirtableTable.name),
      },
    },
  });
  if (!base) return <div>Base not found</div>;

  const pageActions = [
    <>
      <Link href={`https://airtable.com/${base.externalId}`} target="_blank">
        <Button variant={"outline"}>
          <div className="flex gap-2">
            Open base in Airtable
            <ExternalLinkIcon className="w-5 h-5" />
          </div>
        </Button>
      </Link>
    </>,
    <>
      <RefreshBaseFieldsButton baseId={base.id} />
    </>,
  ];

  let activeTables = base.airtableTables.filter((table) =>
    table.airtableTableFields.some((field) => field.isActivated)
  );
  const pageInfo: PageInfoProps = {
    title: base.name,
    subtitle: "Configure AI Assistant for each tables",
    breadcrumb: [
      {
        title: "Dashboard",
        href: `/workspaces/${params.workspaceId}`,
      },
      {
        title: "Bases",
        href: `/workspaces/${params.workspaceId}/bases`,
      },
    ],
    actions: pageActions,
  };
  return (
    <WorkspaceContentLayout pageInfo={pageInfo}>
      <div>
        <Tabs
          defaultValue={activeTables.length ? "activeOnly" : "all"}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="activeOnly">Active tables</TabsTrigger>
            <TabsTrigger value="all">Every tables</TabsTrigger>
          </TabsList>
          <TabsContent value="activeOnly">
            <div className="grid gap-4 ">
              {activeTables.map((table) => (
                <TableCard table={table} key={table.id} base={base} />
              ))}
              {!activeTables.length && (
                <div className="text-center text-muted-foreground min-h-24">
                  No active tables
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="all">
            <div className="grid gap-4 ">
              {base.airtableTables.map((table) => (
                <TableCard table={table} key={table.id} base={base} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </WorkspaceContentLayout>
  );
}
