"use client";

import Link from "next/link";
import { RecommendationCard } from "@/components/recommendation/recommendation-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { UsersIcon } from "@/components/ui/icons";
import { createClient } from "@/lib/supabase/client";
import type { Platform, TitleType } from "@/types/database";

interface FeedItem {
  id: string;
  titleId: string;
  posterUrl: string | null;
  titleName: string;
  titleYear: number | null;
  titleType: TitleType;
  userName: string;
  userAvatar: string | null;
  username: string;
  note: string | null;
  platform: Platform | null;
  tags: string[];
  createdAt: string;
  reactionCount: number;
  commentCount: number;
  userHasLiked: boolean;
  userHasSaved: boolean;
  userHasWatched: boolean;
}

interface FeedContentProps {
  initialItems: FeedItem[];
  userId: string;
}

export function FeedContent({ initialItems, userId }: FeedContentProps) {
  const supabase = createClient();

  const handleLike = async (recommendationId: string, isLiked: boolean) => {
    if (isLiked) {
      await supabase
        .from("reactions")
        .delete()
        .eq("user_id", userId)
        .eq("recommendation_id", recommendationId);
    } else {
      await supabase.from("reactions").insert({
        user_id: userId,
        recommendation_id: recommendationId,
      });
    }
  };

  const handleSave = async (titleId: string, isSaved: boolean) => {
    if (isSaved) {
      await supabase
        .from("watch_status")
        .delete()
        .eq("user_id", userId)
        .eq("title_id", titleId);
    } else {
      await supabase.from("watch_status").upsert({
        user_id: userId,
        title_id: titleId,
        status: "saved",
      });
    }
  };

  const handleWatched = async (titleId: string, isWatched: boolean) => {
    if (isWatched) {
      await supabase
        .from("watch_status")
        .delete()
        .eq("user_id", userId)
        .eq("title_id", titleId);
    } else {
      await supabase.from("watch_status").upsert({
        user_id: userId,
        title_id: titleId,
        status: "watched",
      });
    }
  };

  if (initialItems.length === 0) {
    return (
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">rcmndo</h1>
        </div>
        <EmptyState
          icon={<UsersIcon className="w-8 h-8" />}
          title="No recommendations yet"
          description="Add some friends to see their recommendations in your feed"
          action={
            <Link href="/friends">
              <Button>Find Friends</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">rcmndo</h1>
      </div>

      <div className="space-y-4">
        {initialItems.map((item) => (
          <RecommendationCard
            key={item.id}
            {...item}
            onLike={() => handleLike(item.id, item.userHasLiked)}
            onSave={() => handleSave(item.titleId, item.userHasSaved)}
            onWatched={() => handleWatched(item.titleId, item.userHasWatched)}
          />
        ))}
      </div>
    </div>
  );
}
