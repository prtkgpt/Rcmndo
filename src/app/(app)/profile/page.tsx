import { getCurrentUser } from "@/lib/auth";
import { getUserById, getUserRecommendations, getUserStats } from "@/lib/db/queries";
import { ensureSchema } from "@/lib/db";
import { ProfileContent } from "./profile-content";
import type { Platform, TitleType } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  await ensureSchema();
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Get user profile
  const profile = await getUserById(user.id);

  if (!profile) {
    return null;
  }

  // Get user's recommendations with titles
  const recommendationsData = await getUserRecommendations(user.id);

  // Get stats
  const stats = await getUserStats(user.id);

  // Transform recommendations to match expected type
  const transformedRecs = recommendationsData.map((rec) => ({
    id: rec.id,
    note: rec.note,
    platform: rec.platform as Platform | null,
    createdAt: rec.createdAt.toISOString(),
    title: rec.title ? {
      id: rec.title.id,
      name: rec.title.name,
      year: rec.title.year,
      type: rec.title.type as TitleType,
      posterUrl: rec.title.posterUrl,
    } : null,
  })).filter((rec) => rec.title !== null);

  return (
    <ProfileContent
      profile={profile}
      recommendations={transformedRecs as Array<{
        id: string;
        note: string | null;
        platform: Platform | null;
        createdAt: string;
        title: {
          id: string;
          name: string;
          year: number | null;
          type: TitleType;
          posterUrl: string | null;
        };
      }>}
      stats={stats}
    />
  );
}
