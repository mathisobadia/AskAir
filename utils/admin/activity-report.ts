import { db } from "@/db";
import {
  Extraction,
  Workspace,
  User,
  WorkspaceUser,
  ExtractionKeyValue,
} from "@/db/schema";
import { count, sql, eq, and } from "drizzle-orm";
import resend from "@/lib/resend";
import { AdminActivityReport } from "@/emails/adminActivityReport";
export const sendAdminActivityReportEmail = async () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const extractions = await db
    .select({
      extraction: Extraction,
      workspaceName: Workspace.name,
      totalKeyValues: sql<number>`count(${ExtractionKeyValue.id})`,
      nonEmptyKeyValues: sql<number>`count(case when ${ExtractionKeyValue.value} is not null and ${ExtractionKeyValue.value} != '' then 1 end)`,
    })
    .from(Extraction)
    .leftJoin(Workspace, eq(Extraction.workspaceId, Workspace.id))
    .leftJoin(
      ExtractionKeyValue,
      eq(ExtractionKeyValue.extractionId, Extraction.id)
    )
    .where(sql`${Extraction.createdAt} >= ${oneDayAgo}`)
    .groupBy(Extraction.id, Workspace.name);

  const uniqueWorkspaceNames = [
    ...new Set(
      extractions.map((extraction) => extraction.workspaceName).filter(Boolean)
    ),
  ];
  let tokenCount = {
    input: extractions.reduce(
      (acc, extraction) => acc + (extraction.extraction.inputTokenCount || 0),
      0
    ),
    output: extractions.reduce(
      (acc, extraction) => acc + (extraction.extraction.outputTokenCount || 0),
      0
    ),
  };

  await resend.emails.send({
    from: "AskAir <no-reply@updates.askair.ai>",
    to: ["connect@askair.ai", "mathis.obadia@gmail.com"],
    subject: "Daily Activity Report",
    react: AdminActivityReport({
      totalExtractions: extractions.length,
      uniqueWorkspaceNames,
      extractions,
      tokenCount,
    }),
  });

  return {
    totalExtractions: extractions.length,
    uniqueWorkspaceNames,
    extractions,
  };
};
