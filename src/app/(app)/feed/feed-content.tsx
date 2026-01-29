"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { RecommendationCard } from "@/components/recommendation/recommendation-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { UsersIcon, FilmIcon, TvIcon } from "@/components/ui/icons";
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

type TypeFilter = "all" | "movie" | "tv";

const PLATFORM_LABELS: Record<string, string> = {
  netflix: "Netflix",
  prime: "Prime",
  disney: "Disney+",
  hulu: "Hulu",
  hbo: "Max",
  apple: "Apple TV+",
  peacock: "Peacock",
  paramount: "Paramount+",
  other: "Other",
};

export function FeedContent({ initialItems }: FeedContentProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  // Get unique platforms from feed for filter chips
  const availablePlatforms = useMemo(() => {
    const platforms = new Set<string>();
    initialItems.forEach((item) => {
      if (item.platform) platforms.add(item.platform);
    });
    return Array.from(platforms).sort();
  }, [initialItems]);

  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      if (typeFilter !== "all" && item.titleType !== typeFilter) return false;
      if (platformFilter !== "all" && item.platform !== platformFilter) return false;
      return true;
    });
  }, [initialItems, typeFilter, platformFilter]);

  const handleLike = async (recommendationId: string) => {
    await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recommendationId }),
    });
  };

  const handleSave = async (titleId: string, isSaved: boolean) => {
    if (isSaved) {
      await fetch("/api/watch-status", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleId }),
      });
    } else {
      await fetch("/api/watch-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleId, status: "saved" }),
      });
    }
  };

  const handleWatched = async (titleId: string, isWatched: boolean) => {
    if (isWatched) {
      await fetch("/api/watch-status", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleId }),
      });
    } else {
      await fetch("/api/watch-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleId, status: "watched" }),
      });
    }
  };

  const hasFilters = typeFilter !== "all" || platformFilter !== "all";

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-primary">rcmndo</h1>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-2">
        {/* Type filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              typeFilter === "all"
                ? "bg-foreground text-background"
                : "bg-secondary text-muted hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTypeFilter("movie")}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors inline-flex items-center gap-1.5 ${
              typeFilter === "movie"
                ? "bg-foreground text-background"
                : "bg-secondary text-muted hover:text-foreground"
            }`}
          >
            <FilmIcon className="w-3.5 h-3.5" />
            Movies
          </button>
          <button
            onClick={() => setTypeFilter("tv")}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors inline-flex items-center gap-1.5 ${
              typeFilter === "tv"
                ? "bg-foreground text-background"
                : "bg-secondary text-muted hover:text-foreground"
            }`}
          >
            <TvIcon className="w-3.5 h-3.5" />
            TV Shows
          </button>

          {/* Platform filters - only show if there are platforms in feed */}
          {availablePlatforms.length > 0 && (
            <>
              <div className="w-px bg-border flex-shrink-0 my-1" />
              {availablePlatforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(platformFilter === p ? "all" : p)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    platformFilter === p
                      ? "bg-foreground text-background"
                      : "bg-secondary text-muted hover:text-foreground"
                  }`}
                >
                  {PLATFORM_LABELS[p] || p}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={<UsersIcon className="w-8 h-8" />}
            title={hasFilters ? "No matches" : "No recommendations yet"}
            description={
              hasFilters
                ? "Try adjusting your filters"
                : "Add some friends to see their recommendations in your feed"
            }
            action={
              hasFilters ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setTypeFilter("all");
                    setPlatformFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Link href="/friends">
                  <Button>Find Friends</Button>
                </Link>
              )
            }
          />
        ) : (
          filteredItems.map((item) => (
            <RecommendationCard
              key={item.id}
              {...item}
              onLike={() => handleLike(item.id)}
              onSave={() => handleSave(item.titleId, item.userHasSaved)}
              onWatched={() => handleWatched(item.titleId, item.userHasWatched)}
            />
          ))
        )}
      </div>
    </div>
  );
}
