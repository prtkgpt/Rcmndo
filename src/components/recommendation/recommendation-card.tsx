"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { PlatformBadge } from "@/components/ui/platform-badge";
import {
  HeartIcon,
  HeartOutlineIcon,
  ChatBubbleIcon,
  BookmarkIcon,
  BookmarkOutlineIcon,
  CheckIcon,
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

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    onLike();
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave();
  };

  const handleWatched = () => {
    setIsWatched(!isWatched);
    onWatched();
  };

  return (
    <Card className="overflow-hidden">
      {/* User header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <Avatar src={userAvatar} name={userName} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{userName}</p>
          <p className="text-xs text-muted">
            @{username} · {formatDistanceToNow(createdAt)}
          </p>
        </div>
      </div>

      {/* Content */}
      <Link href={`/title/${titleId}`} className="block">
        <div className="flex gap-3 px-4">
          {/* Poster */}
          <div className="relative w-20 h-[120px] flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={titleName}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                No poster
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 py-1">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base leading-tight line-clamp-2">
                  {titleName}
                </h3>
                <p className="text-sm text-muted mt-0.5">
                  {titleYear && `${titleYear} · `}
                  {titleType === "movie" ? "Movie" : "TV Show"}
                </p>
              </div>
            </div>

            {/* Platform & Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {platforms && platforms.length > 0
                ? platforms.map((p) => (
                    <PlatformBadge key={p} platform={p as Platform} />
                  ))
                : platform && <PlatformBadge platform={platform} />}
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-full bg-secondary text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Note */}
            {note && (
              <p className="text-sm text-foreground/80 mt-2 line-clamp-2">
                {note}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center justify-between px-2 py-1 mt-2 border-t border-border">
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg transition-colors ${
              isLiked ? "text-red-500" : "text-muted hover:text-foreground"
            }`}
          >
            {isLiked ? (
              <HeartIcon className="w-5 h-5" />
            ) : (
              <HeartOutlineIcon className="w-5 h-5" />
            )}
            {likeCount > 0 && <span className="text-sm">{likeCount}</span>}
          </button>

          <Link
            href={`/title/${titleId}?comments=true`}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-muted hover:text-foreground transition-colors"
          >
            <ChatBubbleIcon className="w-5 h-5" />
            {commentCount > 0 && (
              <span className="text-sm">{commentCount}</span>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleWatched}
            className={`p-2.5 rounded-lg transition-colors ${
              isWatched ? "text-success" : "text-muted hover:text-foreground"
            }`}
            title={isWatched ? "Marked as watched" : "Mark as watched"}
          >
            <CheckIcon className="w-5 h-5" />
          </button>

          <button
            onClick={handleSave}
            className={`p-2.5 rounded-lg transition-colors ${
              isSaved ? "text-primary" : "text-muted hover:text-foreground"
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
    </Card>
  );
}
