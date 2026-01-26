import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createInviteLink } from "@/lib/db/queries";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invite = await createInviteLink(session.user.id);

    return NextResponse.json(invite);
  } catch (error) {
    console.error("Invite link error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
