import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.string().default("3001").transform(Number),

    DATABASE_URL: z.string().url({
      message: "DATABASE_URL must be a valid URL",
    }),

    BETTER_AUTH_SECRET: z
      .string()
      .min(32, "BETTER_AUTH_SECRET must be at least 32 characters long"),

    BETTER_AUTH_URL: z.string().url().default("http://localhost:3001"),

    ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),

    // Optional OAuth support
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
  },

  runtimeEnv: process.env,
});
