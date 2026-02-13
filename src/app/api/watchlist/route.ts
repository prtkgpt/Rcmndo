import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllWatchStatusesWithTitles } from "@/lib/db/queries";
import { ensureSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await getAllWatchStatusesWithTitles(session.user.id);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Watchlist API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}
