"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FriendsContent } from "./friends-content";
import { apiFetch } from "@/lib/api-config";
import type { InviteLink } from "@/types/database";

interface FriendItem {
  friendshipId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar_url: string | null;
  };
}

interface FriendsData {
  userId: string;
  friends: FriendItem[];
  pendingReceived: FriendItem[];
  pendingSent: FriendItem[];
  inviteLinks: InviteLink[];
}

export default function FriendsPage() {
  const router = useRouter();
  const [data, setData] = useState<FriendsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await apiFetch("/api/friends/all");
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch friends data");
        }
        const friendsData = await response.json();
        setData(friendsData);
      } catch (error) {
        console.error("Error fetching friends data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <FriendsContent
      userId={data.userId}
      friends={data.friends}
      pendingReceived={data.pendingReceived}
      pendingSent={data.pendingSent}
      inviteLinks={data.inviteLinks}
    />
  );
}
