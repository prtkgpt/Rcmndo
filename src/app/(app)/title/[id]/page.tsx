import { getCurrentUser } from "@/lib/auth";
import { getTitleById, getFriendIds, getTitlePageData, getWatchStatus } from "@/lib/db/queries";
import { TitleContent } from "./title-content";
import { notFound } from "next/navigation";
import type { Platform, WatchStatusType } from "@/types/database";

export const dynamic = "force-dynamic";

interface TitlePageProps {
  params: Promise<{ id: string }>;
}

export default async function TitlePage({ params }: TitlePageProps) {
  const { id } = await params;

  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Get title
  const title = await getTitleById(id);

  if (!title) {
    notFound();
  }

  // Get friend IDs
  const friendIds = await getFriendIds(user.id);

  // Get title page data (recommendations, platforms)
  const { recommendations, platforms, hasUserRecommended } = await getTitlePageData(id, user.id, friendIds);

  // Get user's watch status for this title
  const watchStatusData = await getWatchStatus(user.id, id);

  // Transform recommendations
  const transformedRecs = recommendations.map((rec) => ({
    ...rec,
    platform: rec.platform as Platform | null,
    user: rec.user!,
    comments: rec.comments.map((c) => ({
      ...c,
      user: c.user!,
    })),
  }));

  return (
    <TitleContent
      title={title}
      recommendations={transformedRecs}
      platforms={platforms}
      watchStatus={(watchStatusData?.status as WatchStatusType) || null}
      userId={user.id}
      hasUserRecommended={hasUserRecommended || false}
    />
  );
}
