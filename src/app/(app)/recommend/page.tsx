"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Spinner, LoadingScreen } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchIcon, FilmIcon, TvIcon } from "@/components/ui/icons";
import { PLATFORM_OPTIONS } from "@/components/ui/platform-badge";
import type { NormalizedTitle } from "@/lib/tmdb";

function RecommendPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tmdbId = searchParams.get("tmdb");
  const titleType = searchParams.get("type") as "movie" | "tv" | null;

  const [step, setStep] = useState<"search" | "form">(
    tmdbId && titleType ? "form" : "search"
  );
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NormalizedTitle[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<NormalizedTitle | null>(
    null
  );
  const [loadingTitle, setLoadingTitle] = useState(false);

  // Form fields
  const [note, setNote] = useState("");
  const [platform, setPlatform] = useState("");
  const [watchUrl, setWatchUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load title from TMDB if provided in URL
  useEffect(() => {
    const loadTitle = async () => {
      if (tmdbId && titleType && !selectedTitle) {
        setLoadingTitle(true);
        try {
          // Fetch from our API route which has the API key
          const response = await fetch(
            `/api/tmdb/search?q=id:${tmdbId}&type=${titleType}`
          );
          const data = await response.json();

          if (data.results?.[0]) {
            setSelectedTitle(data.results[0]);
          }
        } catch {
          setError("Failed to load title");
        }
        setLoadingTitle(false);
      }
    };

    loadTitle();
  }, [tmdbId, titleType, selectedTitle]);

  // Search TMDB
  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setSearching(true);

      try {
        const response = await fetch(
          `/api/tmdb/search?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (err) {
        console.error("Search error:", err);
      }

      setSearching(false);
    };

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectTitle = (title: NormalizedTitle) => {
    setSelectedTitle(title);
    setStep("form");
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedTitle) {
      setError("Please select a title");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedTitle,
          note: note || null,
          platform: platform || null,
          watchUrl: watchUrl || null,
          tags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create recommendation");
        setSubmitting(false);
        return;
      }

      router.push(`/title/${data.title.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (loadingTitle) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <Header
        title={step === "search" ? "Add Recommendation" : "Recommend"}
        backHref={step === "form" ? undefined : "/feed"}
      />

      <div className="px-4 py-4">
        {step === "search" ? (
          <>
            {/* Search input */}
            <div className="relative mb-4">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Search for a movie or TV show..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                autoFocus
              />
            </div>

            {/* Results */}
            {searching ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((title) => (
                  <Card
                    key={`${title.tmdb_id}-${title.type}`}
                    variant="interactive"
                    className="flex gap-3 p-3"
                    onClick={() => handleSelectTitle(title)}
                  >
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
                title="Find something to recommend"
                description="Search for a movie or TV show you want to share with friends"
              />
            )}
          </>
        ) : selectedTitle ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selected title preview */}
            <Card className="flex gap-3 p-3">
              <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
                {selectedTitle.poster_url ? (
                  <Image
                    src={selectedTitle.poster_url}
                    alt={selectedTitle.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted">
                    {selectedTitle.type === "movie" ? (
                      <FilmIcon className="w-6 h-6" />
                    ) : (
                      <TvIcon className="w-6 h-6" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 py-1">
                <h3 className="font-medium line-clamp-2">{selectedTitle.name}</h3>
                <p className="text-sm text-muted mt-1">
                  {selectedTitle.year && `${selectedTitle.year} · `}
                  {selectedTitle.type === "movie" ? "Movie" : "TV Show"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTitle(null);
                    setStep("search");
                  }}
                  className="text-sm text-primary mt-2"
                >
                  Change
                </button>
              </div>
            </Card>

            {/* Note */}
            <Textarea
              label="Why do you recommend it? (optional)"
              placeholder="This show had me hooked from episode 1..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={240}
              showCount
              rows={3}
            />

            {/* Platform */}
            <Select
              label="Where to watch"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              options={PLATFORM_OPTIONS}
              placeholder="Select platform"
            />

            {/* Watch URL */}
            <Input
              label="Watch link (optional)"
              type="url"
              placeholder="https://netflix.com/title/..."
              value={watchUrl}
              onChange={(e) => setWatchUrl(e.target.value)}
            />

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Tags (optional)
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddTag}
                  disabled={tags.length >= 5}
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-full bg-secondary"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-muted hover:text-foreground"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <Button type="submit" className="w-full" loading={submitting}>
              Post Recommendation
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

export default function RecommendPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RecommendPageContent />
    </Suspense>
  );
}
