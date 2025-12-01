import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { pinoLogger } from "hono-pino";
import { swaggerUI } from "@hono/swagger-ui";
import { testDatabaseConnection } from "./db/index";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import router from "./router";
import { testEmailConnection } from "./lib/email";
import { seedWithBetterAuth } from "./db/seed-super-admin";

const app = new OpenAPIHono();

// Enable CORS for Next.js app
app.use("/*", pinoLogger({ pino: logger }));
app.use(
  "/*",
  cors({
    origin: env.ALLOWED_ORIGINS.split(","),
    credentials: true,
  })
);


testDatabaseConnection().then(() => {
  logger.info("Database connection established");
});

app.get("/", (c) => {
  return c.json({
    message: "Server is ready!!!",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    docs: "/docs",
  });
});

app.route("/api", router);

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Hono API",
    description: "API documentation for Hono server with Better Auth",
  },
  servers: [
    {
      url: env.BETTER_AUTH_URL,
      description: "Development server",
    },
  ],
});

app.get("/docs", swaggerUI({ url: "/openapi.json" }));

app.onError((err, c) => {
  logger.error(err, "Application error");
  return c.json(
    {
      error: err.message || "Internal Server Error",
      ...(env.NODE_ENV === "development" && { stack: err.stack }),
    },
    500
  );
});


serve({
  fetch: app.fetch,
  port: env.PORT,
}, async (info) => {

  logger.info(`🚀 Server running on http://localhost:${info.port}`);
  logger.info(
    `📚 API Documentation available at http://localhost:${info.port}/docs`
  );

  await testEmailConnection();
  await seedWithBetterAuth();


});
