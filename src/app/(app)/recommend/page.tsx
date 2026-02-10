"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner, LoadingScreen } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchIcon, FilmIcon, TvIcon, StarIcon, ChevronLeftIcon, CheckIcon } from "@/components/ui/icons";
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
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
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
          const response = await fetch(
            `/api/tmdb/details?id=${tmdbId}&type=${titleType}`
          );
          if (response.ok) {
            const data = await response.json();
            setSelectedTitle(data);
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
          platforms: selectedPlatforms,
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
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-4">
          <Link
            href={step === "form" && !tmdbId ? "#" : "/feed"}
            onClick={(e) => {
              if (step === "form" && !tmdbId) {
                e.preventDefault();
                setSelectedTitle(null);
                setStep("search");
              }
            }}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            {step === "search" ? "Add Recommendation" : "Share with Friends"}
          </h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-xl mx-auto">
        {step === "search" ? (
          <>
            {/* Search input */}
            <div className="relative mb-6">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search movies & TV shows..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
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
                  <button
                    key={`${title.tmdb_id}-${title.type}`}
                    onClick={() => handleSelectTitle(title)}
                    className="w-full flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all text-left"
                  >
                    <div className="relative w-16 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      {title.poster_url ? (
                        <Image
                          src={title.poster_url}
                          alt={title.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {title.type === "movie" ? (
                            <FilmIcon className="w-6 h-6 text-gray-300" />
                          ) : (
                            <TvIcon className="w-6 h-6 text-gray-300" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{title.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {title.year && `${title.year} · `}
                        {title.type === "movie" ? "Movie" : "TV Show"}
                      </p>
                      {title.vote_average != null && title.vote_average > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rating-badge rounded text-xs">
                            <StarIcon className="w-3 h-3" />
                            <span>{title.vote_average.toFixed(1)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : query ? (
              <EmptyState
                icon={<SearchIcon className="w-10 h-10" />}
                title="No results found"
                description="Try searching with different keywords"
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <SearchIcon className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Find something great</h2>
                <p className="text-gray-500">Search for a movie or TV show you want to recommend to friends</p>
              </div>
            )}
          </>
        ) : selectedTitle ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selected title preview */}
            <div className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="relative w-20 h-30 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                {selectedTitle.poster_url ? (
                  <Image
                    src={selectedTitle.poster_url}
                    alt={selectedTitle.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {selectedTitle.type === "movie" ? (
                      <FilmIcon className="w-8 h-8 text-gray-300" />
                    ) : (
                      <TvIcon className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{selectedTitle.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedTitle.year && `${selectedTitle.year} · `}
                  {selectedTitle.type === "movie" ? "Movie" : "TV Show"}
                </p>
                {!tmdbId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTitle(null);
                      setStep("search");
                    }}
                    className="text-sm font-medium text-primary mt-3 hover:underline"
                  >
                    Change selection
                  </button>
                )}
              </div>
            </div>

            {/* Note */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <Textarea
                label="Why do you recommend it?"
                placeholder="This show had me hooked from episode 1..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={240}
                showCount
                rows={3}
              />
            </div>

            {/* Platforms */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Where to watch
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORM_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all btn-press ${
                      selectedPlatforms.includes(opt.value)
                        ? "bg-primary/10 border-2 border-primary text-gray-900"
                        : "bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(opt.value)}
                      onChange={() => {
                        setSelectedPlatforms((prev) =>
                          prev.includes(opt.value)
                            ? prev.filter((p) => p !== opt.value)
                            : [...prev, opt.value]
                        );
                      }}
                      className="sr-only"
                    />
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedPlatforms.includes(opt.value)
                          ? "bg-primary text-white"
                          : "bg-white border-2 border-gray-300"
                      }`}
                    >
                      {selectedPlatforms.includes(opt.value) && (
                        <CheckIcon className="w-3 h-3" />
                      )}
                    </span>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Watch URL */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <Input
                label="Direct link to watch"
                type="url"
                placeholder="https://netflix.com/title/..."
                value={watchUrl}
                onChange={(e) => setWatchUrl(e.target.value)}
              />
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Tags <span className="font-normal text-gray-400">(optional, up to 5)</span>
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="e.g., thriller, binge-worthy"
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-gray-100 text-gray-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={submitting}>
              Share Recommendation
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
