import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { bulkCreateAnalyses } from "@/lib/analysis-db";
import type { AnalysisResult } from "@/lib/types";

interface SyncItem {
  transcript: string;
  result: AnalysisResult;
  createdAt: number;
}

interface SyncRequest {
  items: SyncItem[];
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as SyncRequest;
    if (!Array.isArray(body?.items)) {
      return NextResponse.json({ error: "items array required" }, { status: 400 });
    }

    // Validate + cap to 500 items
    const items = body.items
      .filter(
        (x) =>
          x &&
          typeof x.transcript === "string" &&
          x.result &&
          typeof x.result.title === "string" &&
          typeof x.createdAt === "number"
      )
      .slice(0, 500);

    if (items.length === 0) {
      return NextResponse.json({ success: true, created: 0 });
    }

    const created = await bulkCreateAnalyses(session.user.id, items);
    return NextResponse.json({ success: true, created: created.length, items: created });
  } catch (err) {
    console.error("POST /api/sync error:", err);
    return NextResponse.json({ error: "Sync failed." }, { status: 500 });
  }
}
