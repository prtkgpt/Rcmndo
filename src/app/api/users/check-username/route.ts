import { NextRequest, NextResponse } from "next/server";
import { getUserByUsername } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }

    const existingUser = await getUserByUsername(username);

    return NextResponse.json({
      available: !existingUser,
      username: username.toLowerCase()
    });
  } catch (error) {
    console.error("Check username error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
