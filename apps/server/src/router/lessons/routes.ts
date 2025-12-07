import { createRoute } from "@hono/zod-openapi";
import {
  createLessonSchema,
  createLessonResponseSchema,
  updateLessonSchema,
  updateLessonResponseSchema,
  lessonIdParamSchema,
  errorResponseSchema,
  lessonPaginationQuerySchema,
  listLessonsResponseSchema,
  getLessonResponseSchema,
  deleteLessonResponseSchema,
  markLessonCompletedSchema,
  markLessonCompletedResponseSchema,
} from "./validation";

export const createLessonRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Lessons - Admin"],
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
  tags: ["Lessons - Admin"],
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

export const listLessonsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Lessons"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    query: lessonPaginationQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: listLessonsResponseSchema,
        },
      },
      description: "Lessons retrieved successfully with pagination",
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

export const getLessonByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Lessons"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: lessonIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: getLessonResponseSchema,
        },
      },
      description: "Lesson retrieved successfully with files",
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

export const deleteLessonRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Lessons - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: lessonIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: deleteLessonResponseSchema,
        },
      },
      description: "Lesson and associated files soft deleted successfully",
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

export const markLessonCompletedRoute = createRoute({
  method: "post",
  path: "/completed",
  tags: ["Lessons"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: markLessonCompletedSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: markLessonCompletedResponseSchema,
        },
      },
      description: "Lesson marked as completed successfully",
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