"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { RecommendationCard } from "@/components/recommendation/recommendation-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { UsersIcon, FilmIcon, TvIcon, PlusIcon } from "@/components/ui/icons";
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
  platforms: string[];
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
  crunchyroll: "Crunchyroll",
  starz: "Starz",
  tubi: "Tubi",
  youtube: "YouTube",
  mubi: "MUBI",
  other: "Other",
};

export function FeedContent({ initialItems }: FeedContentProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  // Get unique platforms from feed for filter chips
  const availablePlatforms = useMemo(() => {
    const platformSet = new Set<string>();
    initialItems.forEach((item) => {
      if (item.platforms && item.platforms.length > 0) {
        item.platforms.forEach((p) => platformSet.add(p));
      } else if (item.platform) {
        platformSet.add(item.platform);
      }
    });
    return Array.from(platformSet).sort();
  }, [initialItems]);

  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      if (typeFilter !== "all" && item.titleType !== typeFilter) return false;
      if (platformFilter !== "all") {
        const itemPlatforms = (item.platforms && item.platforms.length > 0)
          ? item.platforms
          : (item.platform ? [item.platform] : []);
        if (!itemPlatforms.includes(platformFilter)) return false;
      }
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
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-rose-400 bg-clip-text text-transparent">
              rcmndo
            </h1>
            <Link
              href="/recommend"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-hover transition-colors shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Recommend</span>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all btn-press ${
                typeFilter === "all"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter("movie")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all inline-flex items-center gap-1.5 btn-press ${
                typeFilter === "movie"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <FilmIcon className="w-4 h-4" />
              Movies
            </button>
            <button
              onClick={() => setTypeFilter("tv")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all inline-flex items-center gap-1.5 btn-press ${
                typeFilter === "tv"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <TvIcon className="w-4 h-4" />
              TV Shows
            </button>

            {/* Platform filters */}
            {availablePlatforms.length > 0 && (
              <>
                <div className="w-px bg-gray-200 flex-shrink-0 my-1" />
                {availablePlatforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatformFilter(platformFilter === p ? "all" : p)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all btn-press ${
                      platformFilter === p
                        ? "bg-gray-900 text-white shadow-sm"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {PLATFORM_LABELS[p] || p}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="pt-12">
              <EmptyState
                icon={<UsersIcon className="w-10 h-10" />}
                title={hasFilters ? "No matches" : "Your feed is empty"}
                description={
                  hasFilters
                    ? "Try adjusting your filters to see more recommendations"
                    : "Follow friends to see their movie and TV recommendations here"
                }
                action={
                  hasFilters ? (
                    <Button
                      variant="secondary"
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
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 font-medium">
                {filteredItems.length} recommendation{filteredItems.length !== 1 ? "s" : ""} from friends
              </p>
              {filteredItems.map((item) => (
                <RecommendationCard
                  key={item.id}
                  {...item}
                  onLike={() => handleLike(item.id)}
                  onSave={() => handleSave(item.titleId, item.userHasSaved)}
                  onWatched={() => handleWatched(item.titleId, item.userHasWatched)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
