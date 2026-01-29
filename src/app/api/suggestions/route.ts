import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, eq, and, or, desc } from "@/lib/db";
import { suggestions, users, titles, friendships } from "@/lib/db/schema";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get suggestions received by the current user, joined with sender and title info
    const results = await db
      .select({
        id: suggestions.id,
        note: suggestions.note,
        seenAt: suggestions.seenAt,
        createdAt: suggestions.createdAt,
        sender: {
          id: users.id,
          name: users.name,
          username: users.username,
          avatarUrl: users.avatarUrl,
        },
        title: {
          id: titles.id,
          tmdbId: titles.tmdbId,
          type: titles.type,
          name: titles.name,
          year: titles.year,
          posterUrl: titles.posterUrl,
        },
      })
      .from(suggestions)
      .innerJoin(users, eq(suggestions.senderId, users.id))
      .innerJoin(titles, eq(suggestions.titleId, titles.id))
      .where(eq(suggestions.recipientId, userId))
      .orderBy(desc(suggestions.createdAt));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Suggestions GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { recipientId, titleId, note } = await request.json();

    if (!recipientId || !titleId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate that the recipient is a friend (accepted friendship)
    const friendship = await db
      .select()
      .from(friendships)
      .where(
        and(
          or(
            and(
              eq(friendships.requesterId, userId),
              eq(friendships.addresseeId, recipientId)
            ),
            and(
              eq(friendships.requesterId, recipientId),
              eq(friendships.addresseeId, userId)
            )
          ),
          eq(friendships.status, "accepted")
        )
      )
      .limit(1);

    if (friendship.length === 0) {
      return NextResponse.json({ error: "Recipient is not a friend" }, { status: 403 });
    }

    // Insert the suggestion
    const result = await db
      .insert(suggestions)
      .values({
        senderId: userId,
        recipientId,
        titleId,
        note: note || null,
      })
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Suggestions POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
