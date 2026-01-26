import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Create a singleton for the database connection
let dbInstance: ReturnType<typeof createDb> | null = null;

function createDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    // During build time, return a placeholder
    // This won't be used for actual queries during build
    console.warn("DATABASE_URL not set, using placeholder for build");
    const placeholderSql = neon("postgresql://placeholder:placeholder@placeholder.neon.tech/placeholder");
    return drizzle(placeholderSql, { schema });
  }

  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

export function getDb() {
  if (!dbInstance) {
    dbInstance = createDb();
  }
  return dbInstance;
}

// Export a db instance for libraries that expect direct db export (like DrizzleAdapter)
export const db = createDb();

// Export schema for use in queries
export * from "./schema";

// Export drizzle operators
export { eq, and, or, desc, asc, sql, inArray, isNull, isNotNull } from "drizzle-orm";
