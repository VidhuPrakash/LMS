import { createRoute } from "@hono/zod-openapi";
import {
  createModuleSchema,
  createModuleResponseSchema,
  updateModuleSchema,
  updateModuleResponseSchema,
  moduleIdParamSchema,
  courseIdQuerySchema,
  listModulesResponseSchema,
  getModuleResponseSchema,
  errorResponseSchema,
} from "./validation";

export const createModuleRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Modules"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createModuleSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: createModuleResponseSchema,
        },
      },
      description: "Module created successfully",
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

export const updateModuleRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Modules"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: moduleIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateModuleSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: updateModuleResponseSchema,
        },
      },
      description: "Module updated successfully",
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


export const getModuleByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Modules"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: moduleIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: getModuleResponseSchema,
        },
      },
      description: "Module retrieved successfully with lessons",
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
