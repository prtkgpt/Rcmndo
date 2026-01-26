import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrCreateTitle, createRecommendation } from "@/lib/db/queries";
import { getDb, eq, and } from "@/lib/db";
import { recommendations } from "@/lib/db/schema";
import type { TitleType } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, note, platform, watchUrl, tags } = await request.json();

    if (!title?.tmdb_id || !title?.type || !title?.name) {
      return NextResponse.json({ error: "Missing title data" }, { status: 400 });
    }

    // Get or create the title
    const dbTitle = await getOrCreateTitle({
      tmdbId: title.tmdb_id,
      type: title.type as TitleType,
      name: title.name,
      year: title.year || null,
      posterUrl: title.poster_url || null,
      backdropUrl: title.backdrop_url || null,
      overview: title.overview || null,
    });

    const db = getDb();

    // Check if user already recommended this title
    const existingRec = await db
      .select()
      .from(recommendations)
      .where(
        and(
          eq(recommendations.userId, session.user.id),
          eq(recommendations.titleId, dbTitle.id)
        )
      )
      .limit(1);

    if (existingRec.length > 0) {
      // Update existing recommendation
      const result = await db
        .update(recommendations)
        .set({
          note: note || null,
          tags: tags || [],
          platform: platform || null,
          watchUrl: watchUrl || null,
        })
        .where(eq(recommendations.id, existingRec[0].id))
        .returning();

      return NextResponse.json({ recommendation: result[0], title: dbTitle });
    }

    // Create new recommendation
    const newRec = await createRecommendation({
      userId: session.user.id,
      titleId: dbTitle.id,
      note: note || null,
      tags: tags || [],
      platform: platform || null,
      watchUrl: watchUrl || null,
    });

    return NextResponse.json({ recommendation: newRec, title: dbTitle });
  } catch (error) {
    console.error("Recommendation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
