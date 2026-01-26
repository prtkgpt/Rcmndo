import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { upsertWatchStatus, deleteWatchStatus } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { titleId, status } = await request.json();

    if (!titleId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await upsertWatchStatus({
      userId: session.user.id,
      titleId,
      status,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Watch status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { titleId } = await request.json();

    if (!titleId) {
      return NextResponse.json({ error: "Missing titleId" }, { status: 400 });
    }

    await deleteWatchStatus(session.user.id, titleId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Watch status delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
