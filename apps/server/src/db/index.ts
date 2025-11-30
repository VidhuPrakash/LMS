import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import {
  user,
  account,
  accountRelations,
  session,
  sessionRelations,
  userRelations,
  verification,
} from "./schema/auth";
const schema = {
  user,
  account,
  accountRelations,
  session,
  sessionRelations,
  userRelations,
  verification,
};

neonConfig.webSocketConstructor = ws;

neonConfig.poolQueryViaFetch = true;
const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, {
  schema,
  logger: env.NODE_ENV === "development",
});
export async function testDatabaseConnection() {
  try {
    await sql`SELECT 1`;
    logger.info("Database connected successfully");
    return true;
  } catch (error) {
    logger.error({ error }, "Database connection failed");
    throw error;
  }
}
