import { z } from "@hono/zod-openapi";

export const getUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// Pagination query schema for users
export const userPaginationQuerySchema = z.object({
  page: z.string().optional().default("1").transform(Number).openapi({
    description: "Page number",
    example: "1",
    param: {
      name: "page",
      in: "query",
    },
  }),
  limit: z.string().optional().default("10").transform(Number).openapi({
    description: "Items per page",
    example: "10",
    param: {
      name: "limit",
      in: "query",
    },
  }),
  search: z.string().optional().openapi({
    description: "Search term for filtering users by name or email",
    example: "john",
    param: {
      name: "search",
      in: "query",
    },
  }),
  role: z.string().optional().openapi({
    description: "Filter by user role",
    example: "user",
    param: {
      name: "role",
      in: "query",
    },
  }),
  banned: z.string().optional().transform((val) => val === "true" ? true : val === "false" ? false : undefined).openapi({
    description: "Filter by banned status",
    example: "false",
    param: {
      name: "banned",
      in: "query",
    },
  }),
});

// List users response schema (returns all fields)
export const listUsersResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.object({
    users: z.array(z.object({
      id: z.string().uuid().openapi({
        description: "User ID",
        example: "123e4567-e89b-12d3-a456-426614174000",
      }),
      name: z.string().openapi({
        description: "User name",
        example: "John Doe",
      }),
      email: z.string().email().openapi({
        description: "User email",
        example: "john@example.com",
      }),
      emailVerified: z.boolean().openapi({
        description: "Whether email is verified",
        example: true,
      }),
      avatar: z.string().nullable().openapi({
        description: "User avatar URL",
        example: "https://example.com/avatars/john.png",
      }),
      role: z.string().nullable().openapi({
        description: "User role",
        example: "user",
      }),
      banned: z.boolean().openapi({
        description: "Whether user is banned",
        example: false,
      }),
      banReason: z.string().nullable().openapi({
        description: "Reason for ban",
        example: null,
      }),
      banExpires: z.string().nullable().openapi({
        description: "Ban expiration date",
        example: null,
      }),
      phoneNumber: z.string().nullable().openapi({
        description: "User phone number",
        example: "+1234567890",
      }),
      createdAt: z.string().datetime().openapi({
        description: "Creation timestamp",
        example: "2024-12-02T12:00:00Z",
      }),
      updatedAt: z.string().datetime().openapi({
        description: "Last update timestamp",
        example: "2024-12-02T12:00:00Z",
      }),
    })),
    pagination: z.object({
      page: z.number().openapi({
        description: "Current page number",
        example: 1,
      }),
      limit: z.number().openapi({
        description: "Items per page",
        example: 10,
      }),
      total: z.number().openapi({
        description: "Total number of users",
        example: 50,
      }),
      totalPages: z.number().openapi({
        description: "Total number of pages",
        example: 5,
      }),
    }),
  }),
});

// Error response schema
export const errorResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: false,
  }),
  error: z.string().openapi({
    description: "Error message",
    example: "Invalid input data",
  }),
});
