"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PlatformBadge } from "@/components/ui/platform-badge";
import {
  BookmarkIcon,
  FilmIcon,
  TvIcon,
  CheckIcon,
  ClockIcon,
  XMarkIcon,
  SendIcon,
} from "@/components/ui/icons";
import { SuggestModal } from "@/components/ui/suggest-modal";
import type { Platform, WatchStatusType, TitleType } from "@/types/database";

interface WatchlistItem {
  id: string;
  status: WatchStatusType;
  createdAt: string;
  title: {
    id: string;
    tmdb_id: number;
    type: TitleType;
    name: string;
    year: number | null;
    poster_url: string | null;
  };
  platforms: string[];
}

interface WatchlistContentProps {
  initialItems: WatchlistItem[];
  userId: string;
}

type FilterType = "all" | "saved" | "watching" | "watched";
type TypeFilter = "all" | "movie" | "tv";

export function WatchlistContent({
  initialItems,
}: WatchlistContentProps) {
  const [items, setItems] = useState(initialItems);
  const [statusFilter, setStatusFilter] = useState<FilterType>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [suggestItem, setSuggestItem] = useState<{ id: string; name: string } | null>(null);

  const filteredItems = items.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (typeFilter !== "all" && item.title.type !== typeFilter) return false;
    return true;
  });

  const handleStatusChange = async (
    itemId: string,
    titleId: string,
    newStatus: WatchStatusType
  ) => {
    await fetch("/api/watch-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titleId, status: newStatus }),
    });

    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );
  };

  const handleRemove = async (itemId: string, titleId: string) => {
    await fetch("/api/watch-status", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titleId }),
    });
    setItems(items.filter((item) => item.id !== itemId));
  };

  const statusFilters: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "saved", label: "Saved" },
    { value: "watching", label: "Watching" },
    { value: "watched", label: "Watched" },
  ];

  return (
    <div>
      <Header title="Watchlist" />

      <div className="px-4 py-4">
        {/* Status filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === filter.value
                  ? "bg-primary text-white"
                  : "bg-secondary text-muted hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Type filters */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              typeFilter === "all"
                ? "bg-secondary text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTypeFilter("movie")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5 ${
              typeFilter === "movie"
                ? "bg-secondary text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            <FilmIcon className="w-4 h-4" />
            Movies
          </button>
          <button
            onClick={() => setTypeFilter("tv")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5 ${
              typeFilter === "tv"
                ? "bg-secondary text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            <TvIcon className="w-4 h-4" />
            TV Shows
          </button>
        </div>

        {/* List */}
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={<BookmarkIcon className="w-8 h-8" />}
            title={
              items.length === 0
                ? "Your watchlist is empty"
                : "No items match your filters"
            }
            description={
              items.length === 0
                ? "Save recommendations from your feed to build your watchlist"
                : "Try adjusting your filters"
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="flex gap-3 p-3">
                <Link
                  href={`/title/${item.title.id}`}
                  className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-secondary"
                >
                  {item.title.poster_url ? (
                    <Image
                      src={item.title.poster_url}
                      alt={item.title.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted">
                      {item.title.type === "movie" ? (
                        <FilmIcon className="w-6 h-6" />
                      ) : (
                        <TvIcon className="w-6 h-6" />
                      )}
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0 py-1">
                  <Link href={`/title/${item.title.id}`}>
                    <h3 className="font-medium line-clamp-2">
                      {item.title.name}
                    </h3>
                    <p className="text-sm text-muted mt-0.5">
                      {item.title.year && `${item.title.year} · `}
                      {item.title.type === "movie" ? "Movie" : "TV Show"}
                    </p>
                  </Link>

                  {/* Platforms */}
                  {item.platforms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.platforms.map((p) => (
                        <PlatformBadge key={p} platform={p as Platform} />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        handleStatusChange(
                          item.id,
                          item.title.id,
                          item.status === "saved" ? "watching" : "saved"
                        )
                      }
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.status === "watching"
                          ? "bg-warning/20 text-warning"
                          : "text-muted hover:text-foreground hover:bg-secondary"
                      }`}
                      title={
                        item.status === "watching"
                          ? "Currently watching"
                          : "Mark as watching"
                      }
                    >
                      <ClockIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(
                          item.id,
                          item.title.id,
                          item.status === "watched" ? "saved" : "watched"
                        )
                      }
                      className={`p-1.5 rounded-lg transition-colors ${
                        item.status === "watched"
                          ? "bg-success/20 text-success"
                          : "text-muted hover:text-foreground hover:bg-secondary"
                      }`}
                      title={
                        item.status === "watched" ? "Watched" : "Mark as watched"
                      }
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSuggestItem({ id: item.title.id, name: item.title.name })}
                      className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Suggest to a friend"
                    >
                      <SendIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(item.id, item.title.id)}
                      className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors ml-auto"
                      title="Remove from watchlist"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {suggestItem && (
        <SuggestModal
          titleId={suggestItem.id}
          titleName={suggestItem.name}
          isOpen={!!suggestItem}
          onClose={() => setSuggestItem(null)}
        />
      )}
    </div>
  );
}
