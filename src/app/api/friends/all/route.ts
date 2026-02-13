import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllFriendshipsForUser, getActiveInviteLinks } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [friendships, inviteLinks] = await Promise.all([
      getAllFriendshipsForUser(session.user.id),
      getActiveInviteLinks(session.user.id),
    ]);

    return NextResponse.json({
      userId: session.user.id,
      friends: friendships.accepted,
      pendingReceived: friendships.pendingReceived,
      pendingSent: friendships.pendingSent,
      inviteLinks,
    });
  } catch (error) {
    console.error("Friends API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch friends" },
      { status: 500 }
    );
  }
}
