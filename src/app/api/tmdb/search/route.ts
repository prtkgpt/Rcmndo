import { NextRequest, NextResponse } from "next/server";
import { searchMulti, searchMovies, searchTV } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const type = searchParams.get("type");

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    let results;

    switch (type) {
      case "movie":
        results = await searchMovies(query);
        break;
      case "tv":
        results = await searchTV(query);
        break;
      default:
        results = await searchMulti(query);
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("TMDB search error:", error);
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}
