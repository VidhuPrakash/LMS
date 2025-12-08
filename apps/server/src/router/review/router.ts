import { createRoute, z } from "@hono/zod-openapi";
import {
  createReviewSchema,
  updateReviewSchema,
  reviewResponseSchema,
  listReviewsResponseSchema,
  listReviewsQuerySchema,
} from "./validation";

// Error response schema
const errorResponseSchema = z.object({
  success: z.boolean().openapi({
    example: false,
  }),
  message: z.string().openapi({
    example: "Error message",
  }),
});

// Success response schema
const successResponseSchema = z.object({
  success: z.boolean().openapi({
    example: true,
  }),
  message: z.string().openapi({
    example: "Operation successful",
  }),
  data: reviewResponseSchema.optional(),
});

// Review ID param schema
const reviewIdParamSchema = z.object({
  id: z.string().uuid().openapi({
    param: {
      name: "id",
      in: "path",
    },
    description: "Review ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
});

// Create Review Route
export const createReviewRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Reviews"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createReviewSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: successResponseSchema,
        },
      },
      description: "Review created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Bad request - invalid input",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - authentication required",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Course not found",
    },
    409: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Already reviewed this course",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Get Review Route
export const getReviewRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Reviews"],
  request: {
    params: reviewIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: reviewResponseSchema,
          }),
        },
      },
      description: "Review retrieved successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Review not found",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

// List Reviews Route
export const listReviewsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Reviews"],
  request: {
    query: listReviewsQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: listReviewsResponseSchema,
          }),
        },
      },
      description: "Reviews retrieved successfully",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Update Review Route
export const updateReviewRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Reviews"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: reviewIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateReviewSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: successResponseSchema,
        },
      },
      description: "Review updated successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Bad request - invalid input",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - authentication required",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Review not found or permission denied",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Delete Review Route
export const deleteReviewRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Reviews"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: reviewIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            message: z.string().openapi({ example: "Review deleted successfully" }),
          }),
        },
      },
      description: "Review deleted successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - authentication required",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Review not found or permission denied",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});
