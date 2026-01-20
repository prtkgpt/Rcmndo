import { getCurrentUser } from "@/lib/auth";
import { getFriendIds, getFeedItems } from "@/lib/db/queries";
import { FeedContent } from "./feed-content";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Get friend IDs
  const friendIds = await getFriendIds(user.id);

  // Get feed items from friends
  const feedItems = await getFeedItems(user.id, friendIds);

  return <FeedContent initialItems={feedItems} userId={user.id} />;
}
