import { NextRequest, NextResponse } from "next/server";
import { airtableWraper } from "@/lib/airtable";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { AirtableTable } from "@/db/schema";

export async function GET(request: NextRequest) {
  // Cette route est appelée depuis un bouton dans Airtable
  // elle permet d'extraire un enregistrement de Airtable

  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());

  let internalTableId = queryParams.internalTableId;
  let recordId = queryParams.recordId;
  console.log("queryParams", queryParams);
  if (!internalTableId || !recordId) {
    return NextResponse.json(
      { message: "Missing query parameters", success: false },
      { status: 400 }
    );
  }
  let airtableTable = await db.query.AirtableTable.findFirst({
    where: eq(AirtableTable.id, internalTableId),
    with: {
      base: {
        columns: {
          externalId: true,
        },
      },
    },
  });
  console.log("airtableTable", airtableTable);

  if (!airtableTable) {
    return NextResponse.json(
      { message: "airtableTable not found", success: false },
      { status: 404 }
    );
  }

  let airtable = await airtableWraper(airtableTable.workspaceId);
  let record = await airtable.getRecord({
    baseId: airtableTable.base.externalId,
    tableId: airtableTable.externalId,
    recordId: recordId,
  });

  try {
    return NextResponse.json({
      message: "Extraction endpoint is working",
      success: true,
      record,
    });
  } catch (error) {
    console.error("Error in GET /api/public/extract:", error);
    return NextResponse.json(
      { message: "An error occurred", success: false },
      { status: 500 }
    );
  }
}
