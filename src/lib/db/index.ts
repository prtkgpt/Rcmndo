import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
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

// Export schema for use in queries
export * from "./schema";

// Export drizzle operators
export { eq, and, or, desc, asc, sql, inArray, isNull, isNotNull } from "drizzle-orm";
