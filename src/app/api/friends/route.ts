import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { ilike, and, ne, not, inArray } from "drizzle-orm";
import { getFriendIds } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");

    if (search && search.trim().length >= 2) {
      // Get existing friend IDs to exclude from search results
      const friendIds = await getFriendIds(session.user.id);
      const excludeIds = [session.user.id, ...friendIds];

      const results = await db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(
          and(
            ilike(users.username, `%${search}%`),
            not(inArray(users.id, excludeIds))
          )
        )
        .limit(10);

      return NextResponse.json({ searchResults: results });
    }

    return NextResponse.json({ searchResults: [] });
  } catch (error) {
    console.error("Friends search API error:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
