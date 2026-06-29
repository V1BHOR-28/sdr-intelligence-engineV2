import { db } from "@/lib/db";
import type { AnalysisResult, Sentiment, DealStage } from "@/lib/types";

// ---- Mappers (DB row <-> app type) ----

interface AnalysisRow {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  transcript: string;
  title: string;
  sentiment: string;
  dealStage: string;
  summary: string;
  estimatedValue: string | null;
  objections: string;
  competitors: string;
  crmSummary: string;
  actionPlan: string;
  keyInsights: string;
  nextSteps: string;
  followUpEmail: string;
}

function parseJsonArray(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function parseFollowUp(s: string): { subject: string; body: string } {
  try {
    const v = JSON.parse(s);
    return {
      subject: typeof v?.subject === "string" ? v.subject : "Following up on our call",
      body: typeof v?.body === "string" ? v.body : "",
    };
  } catch {
    return { subject: "Following up on our call", body: "" };
  }
}

function rowToResult(row: AnalysisRow) {
  const result: AnalysisResult = {
    title: row.title,
    sentiment: row.sentiment as Sentiment,
    dealStage: row.dealStage as DealStage,
    summary: row.summary,
    estimatedValue: row.estimatedValue ?? undefined,
    objections: parseJsonArray(row.objections),
    competitors: parseJsonArray(row.competitors),
    crmSummary: parseJsonArray(row.crmSummary),
    actionPlan: parseJsonArray(row.actionPlan),
    keyInsights: parseJsonArray(row.keyInsights),
    nextSteps: parseJsonArray(row.nextSteps),
    followUpEmail: parseFollowUp(row.followUpEmail),
  };
  return {
    id: row.id,
    userId: row.userId,
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
    transcript: row.transcript,
    result,
  };
}

// ---- Public API ----

export async function createAnalysis(
  userId: string,
  transcript: string,
  result: AnalysisResult
) {
  const row = await db.analysis.create({
    data: {
      userId,
      transcript,
      title: result.title,
      sentiment: result.sentiment,
      dealStage: result.dealStage,
      summary: result.summary,
      estimatedValue: result.estimatedValue ?? null,
      objections: JSON.stringify(result.objections),
      competitors: JSON.stringify(result.competitors),
      crmSummary: JSON.stringify(result.crmSummary),
      actionPlan: JSON.stringify(result.actionPlan),
      keyInsights: JSON.stringify(result.keyInsights),
      nextSteps: JSON.stringify(result.nextSteps),
      followUpEmail: JSON.stringify(result.followUpEmail),
    },
  });
  return rowToResult(row);
}

export async function getAnalysesByUser(userId: string, limit = 100) {
  const rows = await db.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(rowToResult);
}

export async function getAnalysisById(id: string, userId: string) {
  const row = await db.analysis.findFirst({
    where: { id, userId },
  });
  if (!row) return null;
  return rowToResult(row);
}

export async function deleteAnalysis(id: string, userId: string) {
  // findFirst to ensure ownership before delete
  const existing = await db.analysis.findFirst({ where: { id, userId } });
  if (!existing) return null;
  await db.analysis.delete({ where: { id: existing.id } });
  return existing.id;
}

export async function deleteAllAnalyses(userId: string) {
  const result = await db.analysis.deleteMany({ where: { userId } });
  return result.count;
}

export async function bulkCreateAnalyses(
  userId: string,
  items: { transcript: string; result: AnalysisResult; createdAt: number }[]
) {
  // Create one by one (SQLite is fast enough for typical history sizes)
  const created = [];
  for (const item of items) {
    const row = await db.analysis.create({
      data: {
        userId,
        transcript: item.transcript,
        title: item.result.title,
        sentiment: item.result.sentiment,
        dealStage: item.result.dealStage,
        summary: item.result.summary,
        estimatedValue: item.result.estimatedValue ?? null,
        objections: JSON.stringify(item.result.objections),
        competitors: JSON.stringify(item.result.competitors),
        crmSummary: JSON.stringify(item.result.crmSummary),
        actionPlan: JSON.stringify(item.result.actionPlan),
        keyInsights: JSON.stringify(item.result.keyInsights),
        nextSteps: JSON.stringify(item.result.nextSteps),
        followUpEmail: JSON.stringify(item.result.followUpEmail),
        createdAt: new Date(item.createdAt),
      },
    });
    created.push(rowToResult(row));
  }
  return created;
}

// ---- Preferences ----

export async function getPreferences(userId: string) {
  const row = await db.userPreference.findUnique({ where: { userId } });
  return {
    theme: (row?.theme as "dark" | "light") ?? "dark",
    autoSaveAnalyses: row?.autoSaveAnalyses ?? true,
    preferredIndustry: row?.preferredIndustry ?? "Any",
  };
}

export async function upsertPreferences(
  userId: string,
  prefs: Partial<{ theme: string; autoSaveAnalyses: boolean; preferredIndustry: string }>
) {
  const existing = await db.userPreference.findUnique({ where: { userId } });
  if (existing) {
    return db.userPreference.update({
      where: { userId },
      data: prefs,
    });
  }
  return db.userPreference.create({
    data: {
      userId,
      theme: prefs.theme ?? "dark",
      autoSaveAnalyses: prefs.autoSaveAnalyses ?? true,
      preferredIndustry: prefs.preferredIndustry ?? "Any",
    },
  });
}
