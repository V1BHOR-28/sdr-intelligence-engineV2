import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAnalysesByUser, deleteAnalysis, deleteAllAnalyses } from "@/lib/analysis-db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const analyses = await getAnalysesByUser(session.user.id);
    return NextResponse.json({ success: true, analyses });
  } catch (err) {
    console.error("GET /api/analyses error:", err);
    return NextResponse.json({ error: "Failed to fetch analyses." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const all = url.searchParams.get("all");

    if (all === "1") {
      const count = await deleteAllAnalyses(session.user.id);
      return NextResponse.json({ success: true, count });
    }

    if (!id) {
      return NextResponse.json({ error: "id query param required" }, { status: 400 });
    }

    const deletedId = await deleteAnalysis(id, session.user.id);
    if (!deletedId) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, id: deletedId });
  } catch (err) {
    console.error("DELETE /api/analyses error:", err);
    return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  }
}
