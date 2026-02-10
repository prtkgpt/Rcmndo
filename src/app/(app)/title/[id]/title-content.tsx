"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlatformBadge } from "@/components/ui/platform-badge";
import {
  BookmarkIcon,
  BookmarkOutlineIcon,
  CheckIcon,
  HeartIcon,
  HeartOutlineIcon,
  ChatBubbleIcon,
  FilmIcon,
  TvIcon,
  LinkIcon,
  PlusIcon,
  SendIcon,
  ChevronLeftIcon,
} from "@/components/ui/icons";
import { SuggestModal } from "@/components/ui/suggest-modal";
import { formatDistanceToNow } from "@/lib/utils";
import type { Title, Platform, WatchStatusType } from "@/types/database";

interface RecommendationItem {
  id: string;
  userId: string;
  note: string | null;
  tags: string[];
  platform: Platform | null;
  platforms: string[];
  watchUrl: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string | null;
    avatar_url: string | null;
  };
  reactionCount: number;
  userHasLiked: boolean;
  comments: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      username: string | null;
      avatar_url: string | null;
    };
  }[];
}

interface TitleContentProps {
  title: Title;
  recommendations: RecommendationItem[];
  platforms: string[];
  watchStatus: WatchStatusType | null;
  userId: string;
  hasUserRecommended: boolean;
}

export function TitleContent({
  title,
  recommendations,
  platforms,
  watchStatus: initialWatchStatus,
  hasUserRecommended,
}: TitleContentProps) {
  const [watchStatus, setWatchStatus] = useState<WatchStatusType | null>(
    initialWatchStatus
  );
  const [recs, setRecs] = useState(recommendations);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  const handleSave = async () => {
    if (watchStatus === "saved") {
      await fetch("/api/watch-status", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleId: title.id }),
      });
      setWatchStatus(null);
    } else {
      await fetch("/api/watch-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleId: title.id, status: "saved" }),
      });
      setWatchStatus("saved");
    }
  };

  const handleWatched = async () => {
    if (watchStatus === "watched") {
      await fetch("/api/watch-status", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleId: title.id }),
      });
      setWatchStatus(null);
    } else {
      await fetch("/api/watch-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleId: title.id, status: "watched" }),
      });
      setWatchStatus("watched");
    }
  };

  const handleLike = async (recId: string, isLiked: boolean) => {
    await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recommendationId: recId }),
    });

    setRecs(
      recs.map((rec) =>
        rec.id === recId
          ? {
              ...rec,
              userHasLiked: !isLiked,
              reactionCount: isLiked
                ? rec.reactionCount - 1
                : rec.reactionCount + 1,
            }
          : rec
      )
    );
  };

  const handleAddComment = async (recId: string) => {
    if (!commentText.trim()) return;

    setSubmittingComment(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendationId: recId,
          content: commentText.trim(),
        }),
      });

      const newComment = await response.json();

      if (!response.ok) {
        setSubmittingComment(false);
        return;
      }

      setRecs(
        recs.map((rec) =>
          rec.id === recId
            ? {
                ...rec,
                comments: [
                  ...rec.comments,
                  {
                    id: newComment.id,
                    content: newComment.content,
                    createdAt: newComment.createdAt,
                    user: newComment.user,
                  },
                ],
              }
            : rec
        )
      );

      setCommentText("");
    } catch {
      // Handle error silently
    }

    setSubmittingComment(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero section with backdrop */}
      <div className="relative">
        {/* Backdrop image */}
        <div className="relative h-56 sm:h-72 bg-gradient-to-br from-gray-800 to-gray-900">
          {title.backdropUrl ? (
            <>
              <Image
                src={title.backdropUrl}
                alt=""
                fill
                className="object-cover opacity-60"
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
          )}

          {/* Back button */}
          <Link
            href="/feed"
            className="absolute top-4 left-4 z-10 p-2.5 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
        </div>

        {/* Title info overlay */}
        <div className="relative px-4 pb-6 -mt-24">
          <div className="flex gap-4">
            {/* Poster */}
            <div className="relative w-28 sm:w-36 h-[168px] sm:h-[216px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-200 shadow-xl ring-4 ring-white">
              {title.posterUrl ? (
                <Image
                  src={title.posterUrl}
                  alt={title.name}
                  fill
                  className="object-cover"
                  sizes="144px"
                  priority
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
            </div>

            {/* Title details */}
            <div className="flex-1 min-w-0 pt-20 sm:pt-24">
              <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wide bg-gray-100 text-gray-600 rounded-full mb-2">
                {title.type === "movie" ? "Film" : "TV Series"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {title.name}
              </h1>
              <p className="text-gray-500 mt-1">{title.year || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 pb-8">
        {/* Platforms */}
        {platforms.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Where to watch
            </h2>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <PlatformBadge key={p} platform={p as Platform} size="md" />
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleSave}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold transition-all btn-press ${
              watchStatus === "saved"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {watchStatus === "saved" ? (
              <BookmarkIcon className="w-5 h-5" />
            ) : (
              <BookmarkOutlineIcon className="w-5 h-5" />
            )}
            {watchStatus === "saved" ? "Saved" : "Watchlist"}
          </button>
          <button
            onClick={handleWatched}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold transition-all btn-press ${
              watchStatus === "watched"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <CheckIcon className="w-5 h-5" />
            {watchStatus === "watched" ? "Watched" : "Watched?"}
          </button>
        </div>

        {/* Overview */}
        {title.overview && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Overview
            </h2>
            <p className="text-gray-600 leading-relaxed">{title.overview}</p>
          </div>
        )}

        {/* Recommend/Suggest buttons */}
        <div className="flex gap-3 mb-8">
          {!hasUserRecommended && (
            <Link href={`/recommend?tmdb=${title.tmdbId}&type=${title.type}`} className="flex-1">
              <Button className="w-full" size="lg">
                <PlusIcon className="w-5 h-5 mr-2" />
                Recommend
              </Button>
            </Link>
          )}
          <Button
            variant="secondary"
            size="lg"
            className={hasUserRecommended ? "w-full" : "flex-1"}
            onClick={() => setShowSuggestModal(true)}
          >
            <SendIcon className="w-5 h-5 mr-2" />
            Suggest to Friend
          </Button>
        </div>

        {showSuggestModal && (
          <SuggestModal
            titleId={title.id}
            titleName={title.name}
            isOpen={showSuggestModal}
            onClose={() => setShowSuggestModal(false)}
          />
        )}

        {/* Recommendations section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Friend Recommendations
            </h2>
            <span className="text-sm text-gray-400 font-medium">{recs.length}</span>
          </div>

          {recs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <ChatBubbleIcon className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No recommendations yet</p>
              <p className="text-sm text-gray-400 mt-1">Be the first to recommend this!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recs.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                >
                  {/* User header */}
                  <div className="flex items-center gap-3 p-4 border-b border-gray-50">
                    <Avatar
                      src={rec.user.avatar_url}
                      name={rec.user.name}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{rec.user.name}</p>
                      <p className="text-sm text-gray-400">
                        @{rec.user.username} · {formatDistanceToNow(rec.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Platforms */}
                    {(rec.platforms?.length > 0 || rec.platform) && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {rec.platforms && rec.platforms.length > 0
                          ? rec.platforms.map((p) => (
                              <PlatformBadge key={p} platform={p as Platform} />
                            ))
                          : rec.platform && <PlatformBadge platform={rec.platform} />}
                      </div>
                    )}

                    {/* Note */}
                    {rec.note && (
                      <div className="p-4 bg-gray-50 rounded-xl mb-3">
                        <p className="text-gray-700 leading-relaxed italic">
                          &ldquo;{rec.note}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {rec.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {rec.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Watch link */}
                    {rec.watchUrl && (
                      <a
                        href={rec.watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium text-sm hover:bg-primary/20 transition-colors mb-3"
                      >
                        <LinkIcon className="w-4 h-4" />
                        Watch now
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50/80 border-t border-gray-100">
                    <button
                      onClick={() => handleLike(rec.id, rec.userHasLiked)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all btn-press ${
                        rec.userHasLiked
                          ? "bg-red-50 text-red-500"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {rec.userHasLiked ? (
                        <HeartIcon className="w-5 h-5" />
                      ) : (
                        <HeartOutlineIcon className="w-5 h-5" />
                      )}
                      {rec.reactionCount > 0 && <span>{rec.reactionCount}</span>}
                    </button>

                    <button
                      onClick={() =>
                        setExpandedComments(expandedComments === rec.id ? null : rec.id)
                      }
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all btn-press ${
                        expandedComments === rec.id
                          ? "bg-gray-200 text-gray-700"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <ChatBubbleIcon className="w-5 h-5" />
                      {rec.comments.length > 0 && <span>{rec.comments.length}</span>}
                    </button>
                  </div>

                  {/* Comments */}
                  {expandedComments === rec.id && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                      {rec.comments.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {rec.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <Avatar
                                src={comment.user.avatar_url}
                                name={comment.user.name}
                                size="sm"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {comment.user.name}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {comment.content}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 ml-4">
                                  {formatDistanceToNow(comment.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add comment */}
                      <div className="flex gap-3">
                        <Textarea
                          placeholder="Add a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          rows={2}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(rec.id)}
                          loading={submittingComment}
                          disabled={!commentText.trim()}
                        >
                          Post
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
