"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TitleContent } from "./title-content";
import { LoadingScreen } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { apiFetch } from "@/lib/api-config";
import type { Title, Platform, WatchStatusType } from "@/types/database";

interface TitlePageData {
  title: Title;
  recommendations: Array<{
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
    comments: Array<{
      id: string;
      content: string;
      createdAt: string;
      user: {
        id: string;
        name: string;
        username: string | null;
        avatar_url: string | null;
      };
    }>;
  }>;
  platforms: string[];
  watchStatus: WatchStatusType | null;
  hasUserRecommended: boolean;
}

export default function TitlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<TitlePageData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const userRes = await apiFetch("/api/users/me");
        if (!userRes.ok) {
          router.push("/login");
          return;
        }
        const userData = await userRes.json();
        setUserId(userData.id);

        // Get title data
        const res = await apiFetch(`/api/titles/${id}`);
        if (!res.ok) {
          setError(true);
        } else {
          const titleData = await res.json();
          setData(titleData);
        }
      } catch (err) {
        console.error("Title fetch error:", err);
        setError(true);
      }
      setLoading(false);
    };

    if (id) {
      fetchData();
    }
  }, [id, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !data || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <EmptyState
          icon={<span className="text-4xl">🎬</span>}
          title="Title not found"
          description="This title doesn't exist or you don't have access to it."
        />
      </div>
    );
  }

  return (
    <TitleContent
      title={data.title}
      recommendations={data.recommendations}
      platforms={data.platforms}
      watchStatus={data.watchStatus}
      userId={userId}
      hasUserRecommended={data.hasUserRecommended}
    />
  );
}
