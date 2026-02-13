"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WatchlistContent } from "./watchlist-content";
import { LoadingScreen } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api-config";
import type { WatchStatusType, TitleType } from "@/types/database";

interface WatchlistItem {
  id: string;
  status: WatchStatusType;
  createdAt: string;
  title: {
    id: string;
    tmdb_id: number;
    type: TitleType;
    name: string;
    year: number | null;
    poster_url: string | null;
  };
  platforms: string[];
}

export default function WatchlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WatchlistItem[] | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

        // Get watchlist
        const res = await apiFetch("/api/watchlist");
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch (error) {
        console.error("Watchlist fetch error:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading || items === null || userId === null) {
    return <LoadingScreen />;
  }

  return <WatchlistContent initialItems={items} userId={userId} />;
}
