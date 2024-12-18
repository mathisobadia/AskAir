import {
  AirtableTableField,
  type AirtableBase,
  type AirtableTable,
} from "@/db/schema";

import { PostDocumentForm } from "@/components/client/PostDocumentForm";
import { acceptedFieldTypesForDocumentExtraction } from "@/utils/constants";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ScrollArea } from "@/components/ui/scroll-area";

import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { EmailSettings } from "./email-settings";
import Gradient from "@/components/gradient";
import { ActionButton } from "@/components/client/ActionButton";
import { refreshTableFields } from "@/utils/serverActions";
import { DocumentFieldSelect } from "@/components/client/DocumentFieldSelect";
import { CheckIcon, Cross1Icon, Pencil1Icon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FieldRow } from "./_components/field-row";

export type AirtableTableWithFields = typeof AirtableTable.$inferSelect & {
  airtableTableFields: (typeof AirtableTableField.$inferSelect)[];
};
export default async function TableCard({
  table,
  base,
}: {
  table: AirtableTableWithFields;
  base: typeof AirtableBase.$inferSelect;
}) {
  let activatedFieldsCount = table.airtableTableFields.filter(
    (field) => field.isActivated
  ).length;

  const totalFieldsCount = table.airtableTableFields.length;

  const possibleFields = table.airtableTableFields.filter((field) =>
    acceptedFieldTypesForDocumentExtraction.includes(field.fieldType)
  );

  return (
    <Card key={table.id}>
      <CardHeader>
        <CardTitle>{table.name}</CardTitle>
        <CardDescription>
          {" "}
          You have activated {activatedFieldsCount} fields out of{" "}
          {totalFieldsCount}{" "}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid  divide-y md:divide-y-0 gap-4">
          {activatedFieldsCount ? (
            <>
              <div>
                <EmailSettings table={table} />
              </div>
              <div>
                <PostDocumentForm tableId={table.id} />
              </div>
            </>
          ) : (
            <div className="text-xs italic">
              Give <Gradient>AskAir</Gradient> some work by activating fields !
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Sheet>
          <SheetTrigger
            className={buttonVariants({
              variant: activatedFieldsCount ? "secondary" : "default",
              size: "sm",
            })}
          >
            {activatedFieldsCount ? "Fields settings" : "Activate"}
          </SheetTrigger>
          <SheetContent className="sm:max-w-[750px]">
            <ScrollArea className="h-full w-full">
              <SheetHeader>
                <SheetTitle>Fields settings</SheetTitle>
                <SheetDescription>
                  Select fields to extract from your documents.
                </SheetDescription>
              </SheetHeader>
              <div>
                <div className="flex gap-1 justify-end">
                  <ActionButton
                    label="Refresh fields"
                    successMessage="Fields refreshed"
                    size="sm"
                    variant="secondary"
                    clickAction={async () => {
                      "use server";
                      await refreshTableFields({
                        tableId: table.id,
                      });
                    }}
                  />
                  <Link
                    className={buttonVariants({
                      size: "sm",
                      variant: "secondary",
                    })}
                    href={`https://airtable.com/${base.externalId}/${table.externalId}`}
                    target="_blank"
                  >
                    View in airtable
                  </Link>
                </div>

                <div className="border-b border-t my-4 py-2">
                  <div className="flex gap-2 justify-between items-center">
                    <div>
                      <div className="tracking-tight text-md font-normal">
                        Document field
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Where AIR will drop the file
                      </div>
                    </div>
                    <DocumentFieldSelect
                      fields={table.airtableTableFields.filter(
                        (field) => field.fieldType === "multipleAttachments"
                      )}
                    />
                  </div>
                </div>

                <div>
                  <div>
                    <div className="tracking-tight text-md font-normal">
                      Field settings
                    </div>
                    <div className="mb-4 text-xs text-muted-foreground">
                      Your fields <strong>must</strong> contain a description in
                      airtable, for you AirAssistant to be able to understand
                      the context of the extraction.
                    </div>
                    <Table className="text-xs">
                      {/* <TableCaption>Compatible fields.</TableCaption> */}
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Field</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Instruction</TableHead>
                          <TableHead className="text-right">
                            Activated
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {possibleFields.map((field) => (
                          <FieldRow
                            key={field.id}
                            field={field}
                            baseId={base.id}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </CardFooter>
    </Card>
  );
}
