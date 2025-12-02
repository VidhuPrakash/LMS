import { createRoute } from "@hono/zod-openapi";
import { 
  userPaginationQuerySchema,
  listUsersResponseSchema,
  errorResponseSchema
} from "./validation";

export const listUsersRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    query: userPaginationQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: listUsersResponseSchema,
        },
      },
      description: "Users retrieved successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - authentication required",
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
