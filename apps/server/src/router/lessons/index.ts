import { OpenAPIHono } from "@hono/zod-openapi";
import { createLessonRoute, updateLessonRoute, listLessonsRoute, getLessonByIdRoute, deleteLessonRoute, markLessonCompletedRoute, createLessonCommentRoute, listLessonCommentsRoute, getLessonCommentRoute, updateLessonCommentRoute, deleteLessonCommentRoute } from "./routes";
import { createLessonController, updateLessonController, listLessonsController, getLessonByIdController, deleteLessonController, markLessonCompletedController, createLessonCommentController, listLessonCommentsController, getLessonCommentController, updateLessonCommentController, deleteLessonCommentController } from "./controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const lessonRouter = new OpenAPIHono();

// Apply authentication to all routes
// lessonRouter.use("*", authMiddleware);

// Create lesson route (authenticated users)
lessonRouter.openapi(createLessonRoute, createLessonController);

// Update lesson route (authenticated users)
lessonRouter.openapi(updateLessonRoute, updateLessonController);

// List lessons route (authenticated users)
lessonRouter.openapi(listLessonsRoute, listLessonsController);

// Get lesson by ID route (authenticated users)
lessonRouter.openapi(getLessonByIdRoute, getLessonByIdController);

// Delete lesson route (authenticated users)
lessonRouter.openapi(deleteLessonRoute, deleteLessonController);

// Mark lesson as completed route (authenticated users)
lessonRouter.openapi(markLessonCompletedRoute, markLessonCompletedController);

// ===================== LESSON COMMENT ROUTES =====================

// Create lesson comment route (authenticated users)
lessonRouter.openapi(createLessonCommentRoute, createLessonCommentController);

// List lesson comments route (authenticated users)
lessonRouter.openapi(listLessonCommentsRoute, listLessonCommentsController);

// Get lesson comment by ID route (authenticated users)
lessonRouter.openapi(getLessonCommentRoute, getLessonCommentController);

// Update lesson comment route (authenticated users)
lessonRouter.openapi(updateLessonCommentRoute, updateLessonCommentController);

// Delete lesson comment route (authenticated users)
lessonRouter.openapi(deleteLessonCommentRoute, deleteLessonCommentController);

export default lessonRouter;
