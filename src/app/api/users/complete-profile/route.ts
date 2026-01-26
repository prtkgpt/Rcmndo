import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateUser, getUserByUsername, getInviteLinkByCode, markInviteLinkUsed, createFriendship, getUserById } from "@/lib/db/queries";
import { getDb, eq, or, and } from "@/lib/db";
import { friendships } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, username, inviteCode } = await request.json();

    if (!name?.trim() || !username?.trim()) {
      return NextResponse.json({ error: "Name and username are required" }, { status: 400 });
    }

    // Check if username is available
    const existingUser = await getUserByUsername(username);
    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
    }

    // Update user profile
    const user = await updateUser(session.user.id, {
      name: name.trim(),
      username: username.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    // Handle invite code if provided
    if (inviteCode) {
      const invite = await getInviteLinkByCode(inviteCode);

      if (invite && new Date(invite.expiresAt) > new Date() && !invite.usedBy && invite.userId !== session.user.id) {
        const db = getDb();

        // Check if already friends
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

        if (existing.length === 0) {
          // Create friendship
          await createFriendship(invite.userId, session.user.id, "accepted");
          // Mark invite as used
          await markInviteLinkUsed(invite.id, session.user.id);
        }
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Complete profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
