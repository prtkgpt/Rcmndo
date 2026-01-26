"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Header } from "@/components/layout/header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlatformBadge } from "@/components/ui/platform-badge";
import { UsersIcon, FilmIcon, TvIcon, ChevronRightIcon } from "@/components/ui/icons";
import type { User, Platform, TitleType } from "@/types/database";

interface ProfileContentProps {
  profile: User;
  recommendations: {
    id: string;
    note: string | null;
    platform: Platform | null;
    createdAt: string;
    title: {
      id: string;
      name: string;
      year: number | null;
      type: TitleType;
      posterUrl: string | null;
    };
  }[];
  stats: {
    recommendations: number;
    friends: number;
    watched: number;
  };
}

export function ProfileContent({
  profile,
  recommendations,
  stats,
}: ProfileContentProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div>
      <Header
        title="Profile"
        rightAction={
          <Link href="/profile/edit" className="text-primary text-sm font-medium">
            Edit
          </Link>
        }
      />

      <div className="px-4 py-4">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar src={profile.avatarUrl} name={profile.name} size="xl" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-muted">@{profile.username}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.recommendations}</p>
            <p className="text-sm text-muted">Recs</p>
          </div>
          <Link href="/friends" className="text-center hover:opacity-80">
            <p className="text-2xl font-bold">{stats.friends}</p>
            <p className="text-sm text-muted">Friends</p>
          </Link>
          <Link href="/watchlist?status=watched" className="text-center hover:opacity-80">
            <p className="text-2xl font-bold">{stats.watched}</p>
            <p className="text-sm text-muted">Watched</p>
          </Link>
        </div>

        {/* Quick actions */}
        <div className="space-y-2 mb-6">
          <Link href="/friends">
            <Card variant="interactive" className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <UsersIcon className="w-5 h-5 text-muted" />
                <span className="font-medium">Friends</span>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-muted" />
            </Card>
          </Link>
        </div>

        {/* User's recommendations */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Your Recommendations</h3>
          {recommendations.length === 0 ? (
            <Card className="p-4 text-center">
              <p className="text-muted">You haven&apos;t recommended anything yet</p>
              <Link href="/recommend">
                <Button className="mt-3" size="sm">
                  Add Recommendation
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {recommendations.slice(0, 5).map((rec) => (
                <Link key={rec.id} href={`/title/${rec.title.id}`}>
                  <Card variant="interactive" className="flex gap-3 p-3">
                    <div className="relative w-12 h-18 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
                      {rec.title.posterUrl ? (
                        <Image
                          src={rec.title.posterUrl}
                          alt={rec.title.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">
                          {rec.title.type === "movie" ? (
                            <FilmIcon className="w-4 h-4" />
                          ) : (
                            <TvIcon className="w-4 h-4" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-1">{rec.title.name}</h4>
                      <p className="text-xs text-muted">
                        {rec.title.year && `${rec.title.year} · `}
                        {rec.title.type === "movie" ? "Movie" : "TV Show"}
                      </p>
                      {rec.platform && (
                        <div className="mt-1">
                          <PlatformBadge platform={rec.platform} />
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
              {recommendations.length > 5 && (
                <p className="text-sm text-muted text-center py-2">
                  And {recommendations.length - 5} more...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Logout */}
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleLogout}
          loading={loggingOut}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
