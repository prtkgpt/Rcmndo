import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleReaction } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recommendationId } = await request.json();

    if (!recommendationId) {
      return NextResponse.json({ error: "Missing recommendationId" }, { status: 400 });
    }

    const result = await toggleReaction(session.user.id, recommendationId);

    return NextResponse.json({
      liked: result !== null,
      reaction: result
    });
  } catch (error) {
    console.error("Reaction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
