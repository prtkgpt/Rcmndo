import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createComment, getUserById } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recommendationId, content } = await request.json();

    if (!recommendationId || !content?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const comment = await createComment(session.user.id, recommendationId, content.trim());
    const user = await getUserById(session.user.id);

    return NextResponse.json({
      ...comment,
      user: user ? {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar_url: user.avatarUrl,
      } : null,
    });
  } catch (error) {
    console.error("Comment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
