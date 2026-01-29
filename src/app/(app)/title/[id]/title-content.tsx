"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  userId,
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
    <div>
      <Header title={title.type === "movie" ? "Movie" : "TV Show"} backHref="/feed" />

      <div className="px-4 py-4">
        {/* Title header */}
        <div className="flex gap-4 mb-6">
          <div className="relative w-24 sm:w-28 h-36 sm:h-[168px] flex-shrink-0 rounded-xl overflow-hidden bg-secondary">
            {title.posterUrl ? (
              <Image
                src={title.posterUrl}
                alt={title.name}
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted">
                {title.type === "movie" ? (
                  <FilmIcon className="w-10 h-10" />
                ) : (
                  <TvIcon className="w-10 h-10" />
                )}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold leading-tight">{title.name}</h1>
            <p className="text-sm text-muted mt-1">
              {title.year && `${title.year} · `}
              {title.type === "movie" ? "Movie" : "TV Show"}
            </p>

            {/* Platforms */}
            {platforms.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {platforms.map((p) => (
                  <PlatformBadge key={p} platform={p as Platform} size="md" />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Button
                variant={watchStatus === "saved" ? "primary" : "secondary"}
                size="sm"
                onClick={handleSave}
              >
                {watchStatus === "saved" ? (
                  <BookmarkIcon className="w-4 h-4 mr-1.5" />
                ) : (
                  <BookmarkOutlineIcon className="w-4 h-4 mr-1.5" />
                )}
                {watchStatus === "saved" ? "Saved" : "Save"}
              </Button>
              <Button
                variant={watchStatus === "watched" ? "primary" : "secondary"}
                size="sm"
                onClick={handleWatched}
              >
                <CheckIcon className="w-4 h-4 mr-1.5" />
                {watchStatus === "watched" ? "Watched" : "Watched?"}
              </Button>
            </div>
          </div>
        </div>

        {/* Overview */}
        {title.overview && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted uppercase mb-2">
              Overview
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {title.overview}
            </p>
          </div>
        )}

        {/* Recommend button */}
        {!hasUserRecommended && (
          <Link href={`/recommend?tmdb=${title.tmdbId}&type=${title.type}`}>
            <Button className="w-full mb-6">
              <PlusIcon className="w-4 h-4 mr-1.5" />
              Recommend This
            </Button>
          </Link>
        )}

        {/* Suggest to friend button */}
        <Button variant="secondary" className="w-full mb-6" onClick={() => setShowSuggestModal(true)}>
          <SendIcon className="w-4 h-4 mr-1.5" />
          Suggest to a Friend
        </Button>

        {showSuggestModal && (
          <SuggestModal
            titleId={title.id}
            titleName={title.name}
            isOpen={showSuggestModal}
            onClose={() => setShowSuggestModal(false)}
          />
        )}

        {/* Recommendations */}
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase mb-3">
            Recommendations ({recs.length})
          </h2>

          {recs.length === 0 ? (
            <Card className="p-4 text-center">
              <p className="text-muted">
                No friends have recommended this yet. Be the first!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {recs.map((rec) => (
                <Card key={rec.id} className="p-4">
                  {/* User header */}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar
                      src={rec.user.avatar_url}
                      name={rec.user.name}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{rec.user.name}</p>
                      <p className="text-xs text-muted">
                        @{rec.user.username} · {formatDistanceToNow(rec.createdAt)}
                      </p>
                    </div>
                    {rec.platform && <PlatformBadge platform={rec.platform} />}
                  </div>

                  {/* Note */}
                  {rec.note && (
                    <p className="text-sm text-foreground/80 mb-3">{rec.note}</p>
                  )}

                  {/* Tags */}
                  {rec.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {rec.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs rounded-full bg-secondary text-muted"
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
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-3"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Watch now
                    </a>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-2 border-t border-border -mx-1">
                    <button
                      onClick={() => handleLike(rec.id, rec.userHasLiked)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg transition-colors ${
                        rec.userHasLiked
                          ? "text-red-500"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      {rec.userHasLiked ? (
                        <HeartIcon className="w-5 h-5" />
                      ) : (
                        <HeartOutlineIcon className="w-5 h-5" />
                      )}
                      {rec.reactionCount > 0 && (
                        <span className="text-sm">{rec.reactionCount}</span>
                      )}
                    </button>

                    <button
                      onClick={() =>
                        setExpandedComments(
                          expandedComments === rec.id ? null : rec.id
                        )
                      }
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-muted hover:text-foreground transition-colors"
                    >
                      <ChatBubbleIcon className="w-5 h-5" />
                      {rec.comments.length > 0 && (
                        <span className="text-sm">{rec.comments.length}</span>
                      )}
                    </button>
                  </div>

                  {/* Comments */}
                  {expandedComments === rec.id && (
                    <div className="mt-4 pt-4 border-t border-border">
                      {rec.comments.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {rec.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2">
                              <Avatar
                                src={comment.user.avatar_url}
                                name={comment.user.name}
                                size="sm"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="bg-secondary rounded-lg px-3 py-2">
                                  <p className="text-xs font-medium">
                                    {comment.user.name}
                                  </p>
                                  <p className="text-sm mt-0.5">
                                    {comment.content}
                                  </p>
                                </div>
                                <p className="text-xs text-muted mt-1 ml-3">
                                  {formatDistanceToNow(comment.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add comment */}
                      <div className="flex gap-2">
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
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
