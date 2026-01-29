import { NextRequest, NextResponse } from "next/server";
import { getMovieDetails, getTVDetails } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  if (!id || !type) {
    return NextResponse.json(
      { error: "id and type are required" },
      { status: 400 }
    );
  }

  try {
    const tmdbId = parseInt(id);
    const result =
      type === "movie"
        ? await getMovieDetails(tmdbId)
        : await getTVDetails(tmdbId);

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("TMDB details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch details" },
      { status: 500 }
    );
  }
}
