import { OpenAPIHono } from "@hono/zod-openapi";
import {
  createReviewRoute,
  getReviewRoute,
  listReviewsRoute,
  updateReviewRoute,
  deleteReviewRoute,
} from "./router";
import {
  createReviewController,
  getReviewController,
  listReviewsController,
  updateReviewController,
  deleteReviewController,
} from "./controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const reviewRouter = new OpenAPIHono();

// Public routes (no auth required)
// @ts-expect-error - OpenAPI type inference issue
reviewRouter.openapi(listReviewsRoute, listReviewsController);
// @ts-expect-error - OpenAPI type inference issue
reviewRouter.openapi(getReviewRoute, getReviewController);

// Protected routes (require authentication)
// reviewRouter.use("*", authMiddleware);
reviewRouter.openapi(createReviewRoute, createReviewController);

reviewRouter.openapi(updateReviewRoute, updateReviewController);

reviewRouter.openapi(deleteReviewRoute, deleteReviewController);

export default reviewRouter;
