import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFriendIds, getFeedItems } from "@/lib/db/queries";
import { ensureSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const friendIds = await getFriendIds(session.user.id);
    const feedItems = await getFeedItems(session.user.id, friendIds);

    return NextResponse.json({ items: feedItems });
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}
