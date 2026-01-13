"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchIcon, FilmIcon, TvIcon } from "@/components/ui/icons";
import { createClient } from "@/lib/supabase/client";
import type { NormalizedTitle } from "@/lib/tmdb";

type FilterType = "all" | "movie" | "tv";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NormalizedTitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [titleIds, setTitleIds] = useState<Record<string, string>>({});

  const supabase = createClient();

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
          const { data: existingTitles } = await supabase
            .from("titles")
            .select("id, tmdb_id, type")
            .in("tmdb_id", tmdbIds);

          const idMap: Record<string, string> = {};
          existingTitles?.forEach((t) => {
            idMap[`${t.tmdb_id}-${t.type}`] = t.id;
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
  }, [query, filter, supabase]);

  const getTitleLink = (title: NormalizedTitle) => {
    const existingId = titleIds[`${title.tmdb_id}-${title.type}`];
    if (existingId) {
      return `/title/${existingId}`;
    }
    return `/recommend?tmdb=${title.tmdb_id}&type=${title.type}`;
  };

  return (
    <div>
      <Header title="Search" />

      <div className="px-4 py-4">
        {/* Search input */}
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Search movies & TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(["all", "movie", "tv"] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === type
                  ? "bg-primary text-white"
                  : "bg-secondary text-muted hover:text-foreground"
              }`}
            >
              {type === "all" ? "All" : type === "movie" ? "Movies" : "TV Shows"}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            {results.map((title) => (
              <Link key={`${title.tmdb_id}-${title.type}`} href={getTitleLink(title)}>
                <Card variant="interactive" className="flex gap-3 p-3">
                  <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
                    {title.poster_url ? (
                      <Image
                        src={title.poster_url}
                        alt={title.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted">
                        {title.type === "movie" ? (
                          <FilmIcon className="w-6 h-6" />
                        ) : (
                          <TvIcon className="w-6 h-6" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <h3 className="font-medium line-clamp-2">{title.name}</h3>
                    <p className="text-sm text-muted mt-1">
                      {title.year && `${title.year} · `}
                      {title.type === "movie" ? "Movie" : "TV Show"}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : query ? (
          <EmptyState
            icon={<SearchIcon className="w-8 h-8" />}
            title="No results found"
            description="Try searching with different keywords"
          />
        ) : (
          <EmptyState
            icon={<SearchIcon className="w-8 h-8" />}
            title="Search for movies & shows"
            description="Find something to recommend to your friends"
          />
        )}
      </div>
    </div>
  );
}
