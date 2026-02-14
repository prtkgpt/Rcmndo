import { NextRequest, NextResponse } from "next/server";
import { getTitlesByTmdbIds } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json([]);
    }

    const tmdbIds = idsParam.split(",").map((id) => parseInt(id, 10)).filter(Boolean);

    if (tmdbIds.length === 0) {
      return NextResponse.json([]);
    }

    const titles = await getTitlesByTmdbIds(tmdbIds);

    return NextResponse.json(titles);
  } catch (error) {
    console.error("Get titles by TMDB error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
