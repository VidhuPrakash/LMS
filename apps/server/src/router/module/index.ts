import { OpenAPIHono } from "@hono/zod-openapi";
import { createModuleRoute, updateModuleRoute, getModuleByIdRoute } from "./route";
import { createModuleController, updateModuleController, getModuleByIdController } from "./controller";
import { authMiddleware, adminMiddleware } from "../../middleware/auth.middleware";

const moduleRouter = new OpenAPIHono();

// Apply authentication to all routes
moduleRouter.use("*", authMiddleware);

// Get module by ID (authenticated users)
moduleRouter.openapi(getModuleByIdRoute, getModuleByIdController);

// Admin-only routes (require admin role)
moduleRouter.use("/", adminMiddleware);
moduleRouter.openapi(createModuleRoute, createModuleController);
moduleRouter.use("/:id", adminMiddleware);
moduleRouter.openapi(updateModuleRoute, updateModuleController);

export default moduleRouter;
