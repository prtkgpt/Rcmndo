"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { PlatformBadge } from "@/components/ui/platform-badge";
import {
  HeartIcon,
  HeartOutlineIcon,
  ChatBubbleIcon,
  BookmarkIcon,
  BookmarkOutlineIcon,
  CheckIcon,
  FilmIcon,
  TvIcon,
} from "@/components/ui/icons";
import type { Platform, TitleType } from "@/types/database";
import { formatDistanceToNow } from "@/lib/utils";

interface RecommendationCardProps {
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
  onLike: () => void;
  onSave: () => void;
  onWatched: () => void;
}

export function RecommendationCard({
  titleId,
  posterUrl,
  titleName,
  titleYear,
  titleType,
  userName,
  userAvatar,
  username,
  note,
  platform,
  platforms,
  tags,
  createdAt,
  reactionCount,
  commentCount,
  userHasLiked,
  userHasSaved,
  userHasWatched,
  onLike,
  onSave,
  onWatched,
}: RecommendationCardProps) {
  const [isLiked, setIsLiked] = useState(userHasLiked);
  const [isSaved, setIsSaved] = useState(userHasSaved);
  const [isWatched, setIsWatched] = useState(userHasWatched);
  const [likeCount, setLikeCount] = useState(reactionCount);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    onLike();
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave();
  };

  const handleWatched = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWatched(!isWatched);
    onWatched();
  };

  const displayPlatforms = platforms && platforms.length > 0
    ? platforms
    : platform ? [platform] : [];

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-200">
      {/* User header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <Avatar src={userAvatar} name={userName} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-gray-900 truncate">{userName}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">@{username}</span>
          </div>
          <p className="text-xs text-gray-400">{formatDistanceToNow(createdAt)}</p>
        </div>
      </div>

      {/* Main content - clickable area */}
      <Link href={`/title/${titleId}`} className="block">
        <div className="flex gap-4 px-4 pb-4">
          {/* Poster with overlay */}
          <div className="relative w-24 sm:w-28 h-36 sm:h-[168px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={titleName}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 96px, 112px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                {titleType === "movie" ? (
                  <FilmIcon className="w-8 h-8 text-gray-300" />
                ) : (
                  <TvIcon className="w-8 h-8 text-gray-300" />
                )}
              </div>
            )}
            {/* Type badge */}
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide bg-black/70 text-white rounded-md backdrop-blur-sm">
                {titleType === "movie" ? "Film" : "Series"}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {titleName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {titleYear || "—"}
              </p>

              {/* Platforms */}
              {displayPlatforms.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {displayPlatforms.slice(0, 3).map((p) => (
                    <PlatformBadge key={p} platform={p as Platform} />
                  ))}
                  {displayPlatforms.length > 3 && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">
                      +{displayPlatforms.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Note */}
              {note && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl border-l-2 border-primary/30">
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 italic">
                    &ldquo;{note}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Actions bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all btn-press ${
              isLiked
                ? "bg-red-50 text-red-500"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            {isLiked ? (
              <HeartIcon className="w-5 h-5" />
            ) : (
              <HeartOutlineIcon className="w-5 h-5" />
            )}
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>

          <Link
            href={`/title/${titleId}?comments=true`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all btn-press"
          >
            <ChatBubbleIcon className="w-5 h-5" />
            {commentCount > 0 && <span>{commentCount}</span>}
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleWatched}
            className={`p-2.5 rounded-full transition-all btn-press ${
              isWatched
                ? "bg-green-50 text-green-600"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
            title={isWatched ? "Marked as watched" : "Mark as watched"}
          >
            <CheckIcon className="w-5 h-5" />
          </button>

          <button
            onClick={handleSave}
            className={`p-2.5 rounded-full transition-all btn-press ${
              isSaved
                ? "bg-primary/10 text-primary"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
            title={isSaved ? "Saved to watchlist" : "Save to watchlist"}
          >
            {isSaved ? (
              <BookmarkIcon className="w-5 h-5" />
            ) : (
              <BookmarkOutlineIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
