import { OpenAPIHono } from "@hono/zod-openapi";
import { createLessonRoute, updateLessonRoute } from "./routes";
import { createLessonController, updateLessonController } from "./controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const lessonRouter = new OpenAPIHono();

// Apply authentication to all routes
// lessonRouter.use("*", authMiddleware);

// Create lesson route (authenticated users)
lessonRouter.openapi(createLessonRoute, createLessonController);

// Update lesson route (authenticated users)
lessonRouter.openapi(updateLessonRoute, updateLessonController);

export default lessonRouter;
