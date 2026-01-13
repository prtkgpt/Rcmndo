import { createClient } from "@/lib/supabase/server";
import { TitleContent } from "./title-content";
import { notFound } from "next/navigation";
import type { Title, Platform, WatchStatusType } from "@/types/database";

interface TitlePageProps {
  params: Promise<{ id: string }>;
}

export default async function TitlePage({ params }: TitlePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get title
  const { data: title } = await supabase
    .from("titles")
    .select("*")
    .eq("id", id)
    .single();

  if (!title) {
    notFound();
  }

  // Get friend IDs
  const { data: friendIds } = await (supabase.rpc as Function)("get_friend_ids", {
    p_user_id: user.id,
  }) as { data: { friend_id: string }[] | null };

  const friendIdList = friendIds?.map((f: { friend_id: string }) => f.friend_id) || [];
  const visibleUserIds = [user.id, ...friendIdList];

  // Get recommendations for this title (from friends and self)
  const { data: recommendations } = await supabase
    .from("recommendations")
    .select(
      `
      id,
      user_id,
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
      )
    `
    )
    .eq("title_id", id)
    .in("user_id", visibleUserIds)
    .order("created_at", { ascending: false });

  // Get reactions and comments for these recommendations
  const recIds = (recommendations as { id: string }[] | null)?.map((r) => r.id) || [];

  const { data: reactions } = await supabase
    .from("reactions")
    .select("id, recommendation_id, user_id")
    .in("recommendation_id", recIds);

  const { data: comments } = await supabase
    .from("comments")
    .select(
      `
      id,
      recommendation_id,
      user_id,
      content,
      created_at,
      user:users!comments_user_id_fkey (
        id,
        name,
        username,
        avatar_url
      )
    `
    )
    .in("recommendation_id", recIds)
    .order("created_at", { ascending: true });

  // Get user's watch status for this title
  const { data: watchStatus } = await supabase
    .from("watch_status")
    .select("*")
    .eq("user_id", user.id)
    .eq("title_id", id)
    .single();

  // Check if user has already recommended this title
  const userRecommendation = (recommendations as { user_id: string }[] | null)?.find(
    (r) => r.user_id === user.id
  );

  type UserProfile = {
    id: string;
    name: string;
    username: string;
    avatar_url: string | null;
  };

  type RecData = {
    id: string;
    user_id: string;
    note: string | null;
    tags: string[];
    platform: string | null;
    watch_url: string | null;
    created_at: string;
    user: UserProfile;
  };

  type CommentData = {
    id: string;
    recommendation_id: string;
    user_id: string;
    content: string;
    created_at: string;
    user: UserProfile;
  };

  type ReactionData = {
    id: string;
    recommendation_id: string;
    user_id: string;
  };

  // Transform recommendations with reaction/comment data
  const transformedRecs =
    (recommendations as unknown as RecData[] | null)?.map((rec) => {
      const recReactions = (reactions as unknown as ReactionData[] | null)?.filter(
        (r) => r.recommendation_id === rec.id
      );
      const recComments = (comments as unknown as CommentData[] | null)?.filter(
        (c) => c.recommendation_id === rec.id
      );
      const userHasLiked = recReactions?.some((r) => r.user_id === user.id);

      return {
        id: rec.id,
        userId: rec.user_id,
        note: rec.note,
        tags: rec.tags || [],
        platform: rec.platform as Platform | null,
        watchUrl: rec.watch_url,
        createdAt: rec.created_at,
        user: rec.user as unknown as UserProfile,
        reactionCount: recReactions?.length || 0,
        userHasLiked: !!userHasLiked,
        comments:
          recComments?.map((c) => ({
            id: c.id,
            content: c.content,
            createdAt: c.created_at,
            user: c.user as unknown as UserProfile,
          })) || [],
      };
    }) || [];

  // Get all platforms where this is available
  const platforms = [
    ...new Set(
      (recommendations as unknown as RecData[] | null)
        ?.map((r) => r.platform)
        .filter(Boolean) as string[]
    ),
  ];

  return (
    <TitleContent
      title={title as unknown as Title}
      recommendations={transformedRecs}
      platforms={platforms}
      watchStatus={(watchStatus?.status as WatchStatusType) || null}
      userId={user.id}
      hasUserRecommended={!!userRecommendation}
    />
  );
}
