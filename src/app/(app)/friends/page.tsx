import { getCurrentUser } from "@/lib/auth";
import { getAllFriendshipsForUser, getActiveInviteLinks } from "@/lib/db/queries";
import { FriendsContent } from "./friends-content";

export const dynamic = "force-dynamic";

export default async function FriendsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Get all friendships data
  const { accepted, pendingReceived, pendingSent } = await getAllFriendshipsForUser(user.id);

  // Get user's active invite links - Drizzle returns InviteLink type with camelCase
  const inviteLinks = await getActiveInviteLinks(user.id);

  return (
    <FriendsContent
      userId={user.id}
      friends={accepted}
      pendingReceived={pendingReceived}
      pendingSent={pendingSent}
      inviteLinks={inviteLinks}
    />
  );
}
