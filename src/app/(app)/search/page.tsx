"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchIcon, FilmIcon, TvIcon, StarIcon } from "@/components/ui/icons";
import type { NormalizedTitle } from "@/lib/tmdb";

type FilterType = "all" | "movie" | "tv";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NormalizedTitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [titleIds, setTitleIds] = useState<Record<string, string>>({});

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `/api/tmdb/search?q=${encodeURIComponent(query)}${
            filter !== "all" ? `&type=${filter}` : ""
          }`
        );
        const data = await response.json();
        setResults(data.results || []);

        // Check which titles already exist in our database
        if (data.results?.length > 0) {
          const tmdbIds = data.results.map((r: NormalizedTitle) => r.tmdb_id);
          const titlesResponse = await fetch(
            `/api/titles/by-tmdb?ids=${tmdbIds.join(",")}`
          );
          const titlesData = await titlesResponse.json();

          const idMap: Record<string, string> = {};
          titlesData?.forEach((t: { id: string; tmdbId: number; type: string }) => {
            idMap[`${t.tmdbId}-${t.type}`] = t.id;
          });
          setTitleIds(idMap);
        }
      } catch (error) {
        console.error("Search error:", error);
      }

      setLoading(false);
    };

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [query, filter]);

  const getTitleLink = (title: NormalizedTitle) => {
    const existingId = titleIds[`${title.tmdb_id}-${title.type}`];
    if (existingId) {
      return `/title/${existingId}`;
    }
    return `/recommend?tmdb=${title.tmdb_id}&type=${title.type}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Search header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Discover</h1>

          {/* Search input */}
          <div className="relative mb-4">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search movies & TV shows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
              autoFocus
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {(["all", "movie", "tv"] as FilterType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all btn-press ${
                  filter === type
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {type === "all" ? "All" : type === "movie" ? "Movies" : "TV Shows"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {results.map((title) => (
              <Link
                key={`${title.tmdb_id}-${title.type}`}
                href={getTitleLink(title)}
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-200 shadow-sm group-hover:shadow-lg transition-all duration-200">
                  {title.poster_url ? (
                    <Image
                      src={title.poster_url}
                      alt={title.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      {title.type === "movie" ? (
                        <FilmIcon className="w-12 h-12 text-gray-300" />
                      ) : (
                        <TvIcon className="w-12 h-12 text-gray-300" />
                      )}
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Rating badge */}
                  {title.vote_average != null && title.vote_average > 0 && (
                    <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rating-badge rounded-md text-xs">
                      <StarIcon className="w-3 h-3" />
                      <span>{title.vote_average.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Type badge */}
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex px-2 py-1 text-[10px] font-semibold uppercase tracking-wide bg-black/60 text-white rounded-md backdrop-blur-sm">
                      {title.type === "movie" ? "Film" : "Series"}
                    </span>
                  </div>

                  {/* Hover info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-white text-sm font-medium line-clamp-2">{title.name}</p>
                    <p className="text-white/70 text-xs mt-1">{title.year || "—"}</p>
                  </div>
                </div>

                {/* Title info below poster */}
                <div className="mt-2 px-1">
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                    {title.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {title.year || "—"} · {title.type === "movie" ? "Movie" : "TV"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : query ? (
          <div className="pt-12">
            <EmptyState
              icon={<SearchIcon className="w-10 h-10" />}
              title="No results found"
              description="Try searching with different keywords"
            />
          </div>
        ) : (
          <div className="pt-12">
            <EmptyState
              icon={<SearchIcon className="w-10 h-10" />}
              title="Search for movies & shows"
              description="Find something to recommend to your friends"
            />
          </div>
        )}
      </div>
    </div>
  );
}
