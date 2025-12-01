import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { logger } from "./logger";
import { env } from "../config/env";
import { db } from "../db/index";
import { admin, phoneNumber } from "better-auth/plugins";
import { sendVerificationEmail } from "./email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  session: {
    enabled: true,
    updateAge: 60 * 60 * 24,
    maxAge: 5 * 60,
    cookieCache:{
       enabled: true,
        maxAge: 60 * 60
    }
  },
  user: {
    additionalFields: {
      phoneNumber:{
        type:"string",
        required: false
      },
      role:{
        type:"string",
        required: false,
        defaultValue:"user"
      }
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
   emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
  
      
      await sendVerificationEmail(user.email, url, user.name)
    },
  },
  socialProviders: {},
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: env.ALLOWED_ORIGINS.split(","),
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
