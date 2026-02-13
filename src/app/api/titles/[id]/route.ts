import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTitleById, getFriendIds, getTitlePageData, getWatchStatus } from "@/lib/db/queries";
import { ensureSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const title = await getTitleById(id);
    if (!title) {
      return NextResponse.json({ error: "Title not found" }, { status: 404 });
    }

    const friendIds = await getFriendIds(session.user.id);

    const [pageData, watchStatus] = await Promise.all([
      getTitlePageData(id, session.user.id, friendIds),
      getWatchStatus(session.user.id, id),
    ]);

    const hasUserRecommended = pageData.recommendations.some(
      (rec) => rec.userId === session.user.id
    );

    return NextResponse.json({
      title,
      recommendations: pageData.recommendations,
      platforms: pageData.platforms,
      watchStatus: watchStatus?.status || null,
      hasUserRecommended,
    });
  } catch (error) {
    console.error("Title API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch title" },
      { status: 500 }
    );
  }
}
