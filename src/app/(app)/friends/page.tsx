import { createClient } from "@/lib/supabase/server";
import { FriendsContent } from "./friends-content";

export default async function FriendsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get all friendships
  const { data: friendships } = await supabase
    .from("friendships")
    .select(
      `
      id,
      status,
      requester_id,
      addressee_id,
      created_at,
      requester:users!friendships_requester_id_fkey (
        id,
        name,
        username,
        avatar_url
      ),
      addressee:users!friendships_addressee_id_fkey (
        id,
        name,
        username,
        avatar_url
      )
    `
    )
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  // Get user's invite links
  const { data: inviteLinks } = await supabase
    .from("invite_links")
    .select("*")
    .eq("user_id", user.id)
    .gt("expires_at", new Date().toISOString())
    .is("used_by", null)
    .order("created_at", { ascending: false });

  type UserProfile = {
    id: string;
    name: string;
    username: string;
    avatar_url: string | null;
  };

  const friends =
    friendships
      ?.filter((f) => f.status === "accepted")
      .map((f) => {
        const friend =
          f.requester_id === user.id ? f.addressee : f.requester;
        return {
          friendshipId: f.id,
          user: friend as unknown as UserProfile,
        };
      }) || [];

  const pendingReceived =
    friendships
      ?.filter((f) => f.status === "pending" && f.addressee_id === user.id)
      .map((f) => ({
        friendshipId: f.id,
        user: f.requester as unknown as UserProfile,
      })) || [];

  const pendingSent =
    friendships
      ?.filter((f) => f.status === "pending" && f.requester_id === user.id)
      .map((f) => ({
        friendshipId: f.id,
        user: f.addressee as unknown as UserProfile,
      })) || [];

  return (
    <FriendsContent
      userId={user.id}
      friends={friends}
      pendingReceived={pendingReceived}
      pendingSent={pendingSent}
      inviteLinks={inviteLinks || []}
    />
  );
}
