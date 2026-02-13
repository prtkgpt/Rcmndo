"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileContent } from "./profile-content";
import { LoadingScreen } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api-config";
import type { User, Platform, TitleType } from "@/types/database";

interface ProfileData {
  user: User;
  recommendations: {
    id: string;
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

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch("/api/profile");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const profileData = await res.json();
        setData(profileData);
      } catch (error) {
        console.error("Profile fetch error:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading || !data) {
    return <LoadingScreen />;
  }

  return (
    <ProfileContent
      profile={data.user}
      recommendations={data.recommendations.map((rec) => ({
        id: rec.id,
        note: null,
        platform: null as Platform | null,
        createdAt: new Date().toISOString(),
        title: rec.title,
      }))}
      stats={data.stats}
    />
  );
}
