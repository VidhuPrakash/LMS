import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { logger } from "./logger";
import { env } from "../config/env";
import { db } from "../db/index";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  session: {
    enabled: true,
    updateAge: 60 * 60 * 24,
    maxAge: 5 * 60,
  },
  user: {
    additionalFields: {},
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {},
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  logger: {
    level: env.NODE_ENV === "development" ? "debug" : "info",
    logger: {
      error: (message: string, data: Record<string, unknown>) =>
        logger.error({ ...data }, message),
      warn: (message: string, data: Record<string, unknown>) =>
        logger.warn({ ...data }, message),
      info: (message: string, data: Record<string, unknown>) =>
        logger.info({ ...data }, message),
      debug: (message: string, data: Record<string, unknown>) =>
        logger.debug({ ...data }, message),
    },
  },
  advanced: {
    cookiePrefix: "app",
    useSecureCookies: env.NODE_ENV === "production",
    database: {
      generateId: false,
    },
  },
  basePath: "/api/auth",
  plugins: [admin()],
});

export type Auth = typeof auth;
