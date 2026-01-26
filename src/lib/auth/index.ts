import { getServerSession } from "next-auth";
import { authConfig } from "./config";

// Get the current session (for API routes and server components)
export async function auth() {
  return getServerSession(authConfig);
}

// Helper to get current user on server side
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

// Helper to require authentication
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

// Re-export authConfig for use in API routes
export { authConfig };
