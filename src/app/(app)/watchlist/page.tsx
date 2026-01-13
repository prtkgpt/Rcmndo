import { createClient } from "@/lib/supabase/server";
import { WatchlistContent } from "./watchlist-content";
import type { WatchStatusType } from "@/types/database";

export default async function WatchlistPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user's watch statuses with title info
  const { data: watchStatuses } = await supabase
    .from("watch_status")
    .select(
      `
      id,
      status,
      created_at,
      title:titles!watch_status_title_id_fkey (
        id,
        tmdb_id,
        type,
        name,
        year,
        poster_url
      )
    `
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  type TitleData = {
    id: string;
    tmdb_id: number;
    type: "movie" | "tv";
    name: string;
    year: number | null;
    poster_url: string | null;
  };

  type WatchStatusData = {
    id: string;
    status: string;
    created_at: string;
    title: TitleData;
  };

  // Get platform info from recommendations for these titles
  const titleIds = (watchStatuses as unknown as WatchStatusData[] | null)?.map((ws) => ws.title.id) || [];

  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("title_id, platform")
    .in("title_id", titleIds)
    .not("platform", "is", null);

  // Create a map of title_id to platforms
  const platformMap: Record<string, string[]> = {};
  (recommendations as { title_id: string; platform: string }[] | null)?.forEach((rec) => {
    if (rec.platform) {
      if (!platformMap[rec.title_id]) {
        platformMap[rec.title_id] = [];
      }
      if (!platformMap[rec.title_id].includes(rec.platform)) {
        platformMap[rec.title_id].push(rec.platform);
      }
    }
  });

  const items =
    (watchStatuses as unknown as WatchStatusData[] | null)?.map((ws) => ({
      id: ws.id,
      status: ws.status as WatchStatusType,
      createdAt: ws.created_at,
      title: ws.title,
      platforms: platformMap[ws.title.id] || [],
    })) || [];

  return <WatchlistContent initialItems={items} userId={user.id} />;
}
