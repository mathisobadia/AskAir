import StatusBadge from "@/components/extraction-status-badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import type { Extraction } from "@/db/schema";

export type ExtractionWithTable = Extraction & {
  user: {
    name: string | null;
  } | null;
  table: {
    name: string;
    externalId: string;
    base: {
      externalId: string;
    };
  };
  extractionKeyValues: {
    key: string;
    value: string | null;
  }[];
};

export default function ExtractionTable({
  extractions,
}: {
  extractions: ExtractionWithTable[];
}) {
  return (
    <Table>
      <TableCaption>The list of your extractions</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Table</TableHead>
          <TableHead>File</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Extraction</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Result</TableHead>
          <TableHead>Airtable</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {extractions.map((extraction) => (
          <TableRow key={extraction.id}>
            <TableCell className="font-medium">
              {extraction.table.name}
            </TableCell>
            <TableCell>{extraction.documentFileName}</TableCell>
            <TableCell>
              {extraction.emailSender || extraction.user?.name}
            </TableCell>
            <TableCell>{extraction.createdAt.toLocaleString()}</TableCell>
            <TableCell>
              {
                extraction.extractionKeyValues.filter(
                  (keyValue) => keyValue.value != null
                ).length
              }
              /{extraction.extractionKeyValues.length}
            </TableCell>
            <TableCell>
              <StatusBadge
                status={extraction.status}
                createdAt={extraction.createdAt}
              ></StatusBadge>
            </TableCell>
            <TableCell>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant={"outline"}>Details</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Extraction result</SheetTitle>
                    <SheetDescription>
                      This pannel shows the result of the extraction.
                      <br />
                      Extraction performed on{" "}
                      {extraction.updatedAt.toLocaleString()}
                    </SheetDescription>
                    <div className="grid divide-y ">
                      {extraction.extractionKeyValues.map((keyValue) => {
                        return (
                          <div key={keyValue.key} className="text-xs py-2">
                            <div className={`font-medium`}>{keyValue.key}</div>
                            <div>
                              {keyValue.value ? (
                                keyValue.value
                              ) : (
                                <span className="italic text-red-400 ">
                                  Not found
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-2">
                      <Link
                        href={`https://airtable.com/${extraction.table.base.externalId}/${extraction.table.externalId}/${extraction.airtableRecordId}`}
                        target="_blank"
                      >
                        <Button className="w-full">
                          Open in Airtable{" "}
                          <ExternalLinkIcon className="w-5 h-5" />
                        </Button>
                      </Link>
                    </div>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </TableCell>
            <TableCell>
              {extraction.status === "SUCCESS" && (
                <Link
                  href={`https://airtable.com/${extraction.table.base.externalId}/${extraction.table.externalId}/${extraction.airtableRecordId}`}
                  target="_blank"
                >
                  <Button variant={"outline"}>
                    Open <ExternalLinkIcon className="w-5 h-5" />
                  </Button>
                </Link>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={7}>Number of extractions</TableCell>
          <TableCell className="text-right">{extractions.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
