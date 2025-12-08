import type { Context } from "hono";
import { ZodError } from "zod";
import {
  createReviewService,
  getReviewService,
  listReviewsService,
  updateReviewService,
  deleteReviewService,
} from "./service";
import { createReviewSchema, updateReviewSchema, listReviewsQuerySchema } from "./validation";

/**
 * Controller to create a new review
 * Requires authentication
 */
export const createReviewController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validatedData = createReviewSchema.parse(body);

    const review = await createReviewService(validatedData.userId, validatedData);

    return c.json(
      {
        success: true,
        message: "Review created successfully",
        data: review,
      },
      201
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          message: "Validation error",
          errors: error.issues,
        },
        400
      );
    }
    if (error instanceof Error) {
      return c.json(
        {
          success: false,
          message: error.message,
        },
        error.message.includes("already reviewed") ? 409 : error.message.includes("not found") ? 404 : 400
      );
    }
    return c.json(
      {
        success: false,
        message: "Failed to create review",
      },
      500
    );
  }
};

/**
 * Controller to get a single review by ID
 */
export const getReviewController = async (c: Context) => {
  try {
    const { id: reviewId } = c.req.param();
    const review = await getReviewService(reviewId);

    return c.json({
      success: true,
      data: review,
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json(
        {
          success: false,
          message: error.message,
        },
        error.message.includes("not found") ? 404 : 400
      );
    }
    return c.json(
      {
        success: false,
        message: "Failed to fetch review",
      },
      500
    );
  }
};

/**
 * Controller to list reviews with pagination and filtering
 */
export const listReviewsController = async (c: Context) => {
  try {
    const query = c.req.query();
    const validatedQuery = listReviewsQuerySchema.parse(query);
    
    const page = Number.parseInt(validatedQuery.page, 10);
    const limit = Math.min(Number.parseInt(validatedQuery.limit, 10), 100);
    const courseId = validatedQuery.courseId;

    const result = await listReviewsService({
      courseId,
      page,
      limit,
    });

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          message: "Validation error",
          errors: error.issues,
        },
        400
      );
    }
    return c.json(
      {
        success: false,
        message: "Failed to fetch reviews",
      },
      500
    );
  }
};

/**
 * Controller to update a review
 * Requires authentication and ownership
 */
export const updateReviewController = async (c: Context) => {
  try {
    const { id: reviewId } = c.req.param();
    const body = await c.req.json();
    const validatedData = updateReviewSchema.parse(body);

    const review = await updateReviewService(
      reviewId,
      body.userId,
      validatedData
    );

    return c.json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          message: "Validation error",
          errors: error.issues,
        },
        400
      );
    }
    if (error instanceof Error) {
      return c.json(
        {
          success: false,
          message: error.message,
        },
        error.message.includes("not found") || error.message.includes("permission") ? 404 : 400
      );
    }
    return c.json(
      {
        success: false,
        message: "Failed to update review",
      },
      500
    );
  }
};

/**
 * Controller to delete a review (soft delete)
 * Requires authentication and ownership
 */
export const deleteReviewController = async (c: Context) => {
  try {
    const { id: reviewId } = c.req.param();
    const body = await c.req.json();

    const result = await deleteReviewService(reviewId, body.userId);

    return c.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json(
        {
          success: false,
          message: error.message,
        },
        error.message.includes("not found") || error.message.includes("permission") ? 404 : 400
      );
    }
    return c.json(
      {
        success: false,
        message: "Failed to delete review",
      },
      500
    );
  }
};
