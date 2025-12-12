import { OpenAPIHono } from "@hono/zod-openapi";
import { createWebinarRoute, updateWebinarRoute, deleteWebinarRoute, getWebinarRoute } from "./router";
import { createWebinarController, updateWebinarController, deleteWebinarController, getWebinarController } from "./controller";
import { authMiddleware, adminMiddleware } from "../../middleware/auth.middleware";

const webinarRouter = new OpenAPIHono();

// Apply authentication to all routes
// webinarRouter.use("*", authMiddleware);

// Admin-only routes (require admin role)
// webinarRouter.use("/", adminMiddleware);
webinarRouter.openapi(createWebinarRoute, createWebinarController);
webinarRouter.openapi(updateWebinarRoute, updateWebinarController);
webinarRouter.openapi(deleteWebinarRoute, deleteWebinarController);
webinarRouter.openapi(getWebinarRoute, getWebinarController);

export default webinarRouter;
