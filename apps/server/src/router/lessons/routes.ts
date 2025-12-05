import { createRoute } from "@hono/zod-openapi";
import {
  createLessonSchema,
  createLessonResponseSchema,
  updateLessonSchema,
  updateLessonResponseSchema,
  lessonIdParamSchema,
  errorResponseSchema,
} from "./validation";

export const createLessonRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Lessons"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createLessonSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: createLessonResponseSchema,
        },
      },
      description: "Lesson created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Bad request - invalid input or files not found",
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
      description: "Module not found",
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

export const updateLessonRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Lessons"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: lessonIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateLessonSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: updateLessonResponseSchema,
        },
      },
      description: "Lesson updated successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Bad request - invalid input or files not found",
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
      description: "Lesson not found",
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
