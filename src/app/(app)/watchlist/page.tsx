import { getCurrentUser } from "@/lib/auth";
import { getAllWatchStatusesWithTitles } from "@/lib/db/queries";
import { WatchlistContent } from "./watchlist-content";
import type { WatchStatusType } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Get user's watch statuses with title info
  const watchData = await getAllWatchStatusesWithTitles(user.id);

  const items = watchData.map((ws) => ({
    id: ws.id,
    status: ws.status as WatchStatusType,
    createdAt: ws.createdAt,
    title: ws.title!,
    platforms: ws.platforms,
  }));

  return <WatchlistContent initialItems={items} userId={user.id} />;
}
