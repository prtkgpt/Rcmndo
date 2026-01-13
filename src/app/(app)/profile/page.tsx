import { createClient } from "@/lib/supabase/server";
import { ProfileContent } from "./profile-content";
import type { Platform, TitleType, User } from "@/types/database";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return null;
  }

  // Get user's recommendations
  const { data: recommendations } = await supabase
    .from("recommendations")
    .select(
      `
      id,
      note,
      platform,
      created_at,
      title:titles!recommendations_title_id_fkey (
        id,
        name,
        year,
        type,
        poster_url
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Get stats
  const { count: friendCount } = await supabase
    .from("friendships")
    .select("*", { count: "exact", head: true })
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq("status", "accepted");

  const { count: watchedCount } = await supabase
    .from("watch_status")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "watched");

  // Transform recommendations to match expected type
  const transformedRecs = recommendations?.map((rec) => ({
    id: rec.id as string,
    note: rec.note as string | null,
    platform: rec.platform as Platform | null,
    created_at: rec.created_at as string,
    title: rec.title as unknown as {
      id: string;
      name: string;
      year: number | null;
      type: TitleType;
      poster_url: string | null;
    },
  })) || [];

  return (
    <ProfileContent
      profile={profile as unknown as User}
      recommendations={transformedRecs}
      stats={{
        recommendations: recommendations?.length || 0,
        friends: friendCount || 0,
        watched: watchedCount || 0,
      }}
    />
  );
}
