import { z } from "@hono/zod-openapi";

// Create review schema
export const createReviewSchema = z.object({
  userId: z.string().uuid().openapi({
    description: "User ID creating the review",
    example: "987e6543-e21b-34d5-b678-123456789abc",
  }),
  courseId: z.string().uuid().openapi({
    description: "Course ID to review",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  rating: z.number().min(0.5).max(5).openapi({
    description: "Rating value from 0.5 to 5",
    example: 4.5,
  }),
  comment: z.string().min(1).max(1000).optional().openapi({
    description: "Review comment",
    example: "Great course! Learned a lot.",
  }),
});

// Update review schema
export const updateReviewSchema = z.object({
  rating: z.number().min(0.5).max(5).optional().openapi({
    description: "Rating value from 0.5 to 5",
    example: 4.5,
  }),
  comment: z.string().min(1).max(1000).optional().openapi({
    description: "Review comment",
    example: "Updated review comment.",
  }),
});

// Review response schema
export const reviewResponseSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Review ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  userId: z.string().uuid().openapi({
    description: "User ID who created the review",
    example: "987e6543-e21b-34d5-b678-123456789abc",
  }),
  courseId: z.string().uuid().openapi({
    description: "Course ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  rating: z.string().openapi({
    description: "Rating value",
    example: "4.5",
  }),
  comment: z.string().nullable().openapi({
    description: "Review comment",
    example: "Great course!",
  }),
  userName: z.string().optional().openapi({
    description: "Name of the user who created the review",
    example: "John Doe",
  }),
  userAvatar: z.string().nullable().optional().openapi({
    description: "Avatar URL of the user",
    example: "https://example.com/avatars/john-doe.png",
  }),
  createdAt: z.string().openapi({
    description: "Review creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  }),
  updatedAt: z.string().openapi({
    description: "Review last update timestamp",
    example: "2024-01-01T00:00:00.000Z",
  }),
});

// List reviews response schema
export const listReviewsResponseSchema = z.object({
  reviews: z.array(reviewResponseSchema).openapi({
    description: "List of reviews",
  }),
  pagination: z.object({
    page: z.number().openapi({
      description: "Current page number",
      example: 1,
    }),
    limit: z.number().openapi({
      description: "Number of items per page",
      example: 10,
    }),
    totalPages: z.number().openapi({
      description: "Total number of pages",
      example: 5,
    }),
    totalItems: z.number().openapi({
      description: "Total number of reviews",
      example: 50,
    }),
  }),
});

// Query parameters for listing reviews
export const listReviewsQuerySchema = z.object({
  courseId: z.string().uuid().optional().openapi({
    description: "Filter by course ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  page: z.string().optional().default("1").openapi({
    description: "Page number",
    example: "1",
  }),
  limit: z.string().optional().default("10").openapi({
    description: "Number of items per page (max 100)",
    example: "10",
  }),
});
