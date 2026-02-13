import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserById, getUserRecommendations, getUserStats } from "@/lib/db/queries";
import { ensureSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [profile, recommendations, stats] = await Promise.all([
      getUserById(session.user.id),
      getUserRecommendations(session.user.id),
      getUserStats(session.user.id),
    ]);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        createdAt: profile.createdAt?.toISOString(),
      },
      recommendations: recommendations
        .filter((rec) => rec.title)
        .map((rec) => ({
          id: rec.id,
          title: {
            id: rec.title!.id,
            name: rec.title!.name,
            year: rec.title!.year,
            type: rec.title!.type,
            posterUrl: rec.title!.posterUrl,
          },
        })),
      stats,
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
