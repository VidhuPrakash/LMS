import { createRoute } from "@hono/zod-openapi";
import {
  uploadFileSchema,
  uploadFileResponseSchema,
  errorResponseSchema,
} from "./validation";

export const uploadFileRoute = createRoute({
  method: "post",
  path: "/upload",
  tags: ["App"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: uploadFileSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: uploadFileResponseSchema,
        },
      },
      description: "File uploaded successfully",
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
    413: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Payload too large - file size exceeds limit",
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
