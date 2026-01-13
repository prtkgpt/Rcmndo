import { createClient } from "@/lib/supabase/server";
import { FeedContent } from "./feed-content";
import type { Platform } from "@/types/database";

export default async function FeedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get friend IDs
  const { data: friendIds } = await (supabase.rpc as Function)("get_friend_ids", {
    p_user_id: user.id,
  }) as { data: { friend_id: string }[] | null };

  const friendIdList = friendIds?.map((f) => f.friend_id) || [];

  // Get recommendations from friends
  const { data: recommendations } = await supabase
    .from("recommendations")
    .select(
      `
      id,
      note,
      tags,
      platform,
      watch_url,
      created_at,
      user:users!recommendations_user_id_fkey (
        id,
        name,
        username,
        avatar_url
      ),
      title:titles!recommendations_title_id_fkey (
        id,
        tmdb_id,
        type,
        name,
        year,
        poster_url
      )
    `
    )
    .in("user_id", friendIdList)
    .order("created_at", { ascending: false })
    .limit(50) as unknown as { data: Array<{
      id: string;
      note: string | null;
      tags: string[];
      platform: string | null;
      watch_url: string | null;
      created_at: string;
      user: { id: string; name: string; username: string; avatar_url: string | null };
      title: { id: string; tmdb_id: number; type: "movie" | "tv"; name: string; year: number | null; poster_url: string | null };
    }> | null };

  // Get reaction counts and user reactions
  const recommendationIds = recommendations?.map((r) => r.id) || [];

  const { data: reactions } = await supabase
    .from("reactions")
    .select("recommendation_id, user_id")
    .in("recommendation_id", recommendationIds) as unknown as { data: Array<{ recommendation_id: string; user_id: string }> | null };

  const { data: comments } = await supabase
    .from("comments")
    .select("recommendation_id")
    .in("recommendation_id", recommendationIds) as unknown as { data: Array<{ recommendation_id: string }> | null };

  // Get user's watch statuses
  const { data: watchStatuses } = await supabase
    .from("watch_status")
    .select("title_id, status")
    .eq("user_id", user.id) as unknown as { data: Array<{ title_id: string; status: string }> | null };

  // Transform data
  const feedItems = recommendations?.map((rec) => {
    const recReactions = reactions?.filter(
      (r) => r.recommendation_id === rec.id
    );
    const recComments = comments?.filter((c) => c.recommendation_id === rec.id);
    const userReaction = recReactions?.find((r) => r.user_id === user.id);
    const titleStatus = watchStatuses?.find(
      (ws) => ws.title_id === rec.title.id
    );

    return {
      id: rec.id,
      titleId: rec.title.id,
      posterUrl: rec.title.poster_url,
      titleName: rec.title.name,
      titleYear: rec.title.year,
      titleType: rec.title.type,
      userName: rec.user.name,
      userAvatar: rec.user.avatar_url,
      username: rec.user.username,
      note: rec.note,
      platform: rec.platform as Platform | null,
      tags: rec.tags || [],
      createdAt: rec.created_at,
      reactionCount: recReactions?.length || 0,
      commentCount: recComments?.length || 0,
      userHasLiked: !!userReaction,
      userHasSaved: titleStatus?.status === "saved",
      userHasWatched: titleStatus?.status === "watched",
    };
  }) || [];

  return <FeedContent initialItems={feedItems} userId={user.id} />;
}
