import { NextResponse } from "next/server";
import { sendAdminActivityReportEmail } from "@/utils/admin/activity-report";

export async function GET() {
  try {
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
