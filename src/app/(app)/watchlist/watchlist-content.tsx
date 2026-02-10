"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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

const STATUS_CONFIG = {
  saved: { bg: "bg-primary/10", text: "text-primary", label: "Saved" },
  watching: { bg: "bg-amber-50", text: "text-amber-600", label: "Watching" },
  watched: { bg: "bg-green-50", text: "text-green-600", label: "Watched" },
};

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

  // Count by status
  const counts = items.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">My Watchlist</h1>

          {/* Status filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all btn-press ${
                  statusFilter === filter.value
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {filter.label}
                {filter.value !== "all" && counts[filter.value] ? (
                  <span className="ml-1.5 opacity-70">{counts[filter.value]}</span>
                ) : null}
              </button>
            ))}
          </div>

          {/* Type filters */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                typeFilter === "all"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All types
            </button>
            <button
              onClick={() => setTypeFilter("movie")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                typeFilter === "movie"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FilmIcon className="w-4 h-4" />
              Movies
            </button>
            <button
              onClick={() => setTypeFilter("tv")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                typeFilter === "tv"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <TvIcon className="w-4 h-4" />
              TV Shows
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {filteredItems.length === 0 ? (
          <div className="pt-8">
            <EmptyState
              icon={<BookmarkIcon className="w-10 h-10" />}
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
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const statusConfig = STATUS_CONFIG[item.status];
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4 p-4">
                    <Link
                      href={`/title/${item.title.id}`}
                      className="relative w-20 h-[120px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-sm"
                    >
                      {item.title.poster_url ? (
                        <Image
                          src={item.title.poster_url}
                          alt={item.title.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {item.title.type === "movie" ? (
                            <FilmIcon className="w-8 h-8 text-gray-300" />
                          ) : (
                            <TvIcon className="w-8 h-8 text-gray-300" />
                          )}
                        </div>
                      )}
                      {/* Type badge */}
                      <div className="absolute bottom-1 left-1 right-1">
                        <span className="block text-center px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-black/70 text-white rounded backdrop-blur-sm">
                          {item.title.type === "movie" ? "Film" : "Series"}
                        </span>
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link href={`/title/${item.title.id}`}>
                        <h3 className="font-bold text-gray-900 line-clamp-2 hover:text-primary transition-colors">
                          {item.title.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {item.title.year || "—"}
                        </p>
                      </Link>

                      {/* Status badge */}
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* Platforms */}
                      {item.platforms.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {item.platforms.slice(0, 3).map((p) => (
                            <PlatformBadge key={p} platform={p as Platform} />
                          ))}
                          {item.platforms.length > 3 && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">
                              +{item.platforms.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 px-4 py-3 bg-gray-50/80 border-t border-gray-100">
                    <button
                      onClick={() =>
                        handleStatusChange(
                          item.id,
                          item.title.id,
                          item.status === "watching" ? "saved" : "watching"
                        )
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all btn-press ${
                        item.status === "watching"
                          ? "bg-amber-100 text-amber-600"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                      title={
                        item.status === "watching"
                          ? "Currently watching"
                          : "Mark as watching"
                      }
                    >
                      <ClockIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Watching</span>
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(
                          item.id,
                          item.title.id,
                          item.status === "watched" ? "saved" : "watched"
                        )
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all btn-press ${
                        item.status === "watched"
                          ? "bg-green-100 text-green-600"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                      title={
                        item.status === "watched" ? "Watched" : "Mark as watched"
                      }
                    >
                      <CheckIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Watched</span>
                    </button>
                    <button
                      onClick={() => setSuggestItem({ id: item.title.id, name: item.title.name })}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100 transition-all btn-press"
                      title="Suggest to a friend"
                    >
                      <SendIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Suggest</span>
                    </button>
                    <button
                      onClick={() => handleRemove(item.id, item.title.id)}
                      className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all btn-press ml-auto"
                      title="Remove from watchlist"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
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
