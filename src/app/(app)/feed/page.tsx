"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FeedContent } from "./feed-content";
import { LoadingScreen } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api-config";
import type { FeedItem } from "@/types/database";

export default function FeedPage() {
  const router = useRouter();
  const [feedItems, setFeedItems] = useState<FeedItem[] | null>(null);
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

        // Get feed
        const feedRes = await apiFetch("/api/feed");
        if (feedRes.ok) {
          const feedData = await feedRes.json();
          setFeedItems(feedData.items || []);
        }
      } catch (error) {
        console.error("Feed fetch error:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading || feedItems === null || userId === null) {
    return <LoadingScreen />;
  }

  return <FeedContent initialItems={feedItems} userId={userId} />;
}
