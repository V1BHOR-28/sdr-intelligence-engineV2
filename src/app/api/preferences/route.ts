import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPreferences, upsertPreferences } from "@/lib/analysis-db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const prefs = await getPreferences(session.user.id);
    return NextResponse.json({ success: true, preferences: prefs });
  } catch (err) {
    console.error("GET /api/preferences error:", err);
    return NextResponse.json({ error: "Failed to fetch preferences." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Partial<{
      theme: string;
      autoSaveAnalyses: boolean;
      preferredIndustry: string;
    }>;

    await upsertPreferences(session.user.id, body);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/preferences error:", err);
    return NextResponse.json({ error: "Failed to update preferences." }, { status: 500 });
  }
}
