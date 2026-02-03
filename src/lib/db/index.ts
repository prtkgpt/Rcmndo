import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

function createDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn("DATABASE_URL not set, using placeholder for build");
    const pool = new Pool({ connectionString: "postgresql://placeholder:placeholder@placeholder.neon.tech/placeholder" });
    return drizzle(pool, { schema });
  }

  const pool = new Pool({ connectionString: databaseUrl });
  return drizzle(pool, { schema });
}

// Export a db instance
export const db = createDb();

// Auto-migration: ensure new columns exist in production
let migrationDone = false;
export async function ensureSchema() {
  if (migrationDone) return;
  migrationDone = true;
  try {
    await db.execute(sql`
      ALTER TABLE recommendations
      ADD COLUMN IF NOT EXISTS platforms text[] DEFAULT '{}'::text[]
    `);
  } catch {
    // Column may already exist or DB not available during build
  }
}

// Export schema for use in queries
export * from "./schema";

// Export drizzle operators
export { eq, and, or, desc, asc, sql, inArray, isNull, isNotNull } from "drizzle-orm";
