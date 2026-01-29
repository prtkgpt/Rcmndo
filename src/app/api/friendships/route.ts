import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { acceptFriendship, deleteFriendship, createFriendship, getInviteLinkByCode, markInviteLinkUsed, getAllFriendshipsForUser } from "@/lib/db/queries";
import { db, eq, or, and } from "@/lib/db";
import { friendships } from "@/lib/db/schema";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await getAllFriendshipsForUser(session.user.id);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Friendship get error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { friendshipId, action } = await request.json();

    if (!friendshipId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (action === "accept") {
      const result = await acceptFriendship(friendshipId);
      return NextResponse.json(result[0]);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Friendship patch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { friendshipId } = await request.json();

    if (!friendshipId) {
      return NextResponse.json({ error: "Missing friendshipId" }, { status: 400 });
    }

    await deleteFriendship(friendshipId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Friendship delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Join with invite code
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    // Find the invite
    const invite = await getInviteLinkByCode(code);

    if (!invite) {
      return NextResponse.json({ error: "Invalid or expired invite code" }, { status: 400 });
    }

    if (new Date(invite.expiresAt) < new Date() || invite.usedBy) {
      return NextResponse.json({ error: "Invalid or expired invite code" }, { status: 400 });
    }

    if (invite.userId === session.user.id) {
      return NextResponse.json({ error: "You can't use your own invite code" }, { status: 400 });
    }

    // Check if already friends or pending
    const existing = await db
      .select()
      .from(friendships)
      .where(
        or(
          and(
            eq(friendships.requesterId, session.user.id),
            eq(friendships.addresseeId, invite.userId)
          ),
          and(
            eq(friendships.requesterId, invite.userId),
            eq(friendships.addresseeId, session.user.id)
          )
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "You're already connected with this user" }, { status: 400 });
    }

    // Create friendship
    await createFriendship(invite.userId, session.user.id, "accepted");

    // Mark invite as used
    await markInviteLinkUsed(invite.id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Friendship create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
