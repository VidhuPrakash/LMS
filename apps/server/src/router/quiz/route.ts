import { createRoute } from "@hono/zod-openapi";
import {
  createQuizSchema,
  createQuizResponseSchema,
  addQuestionSchema,
  addQuestionResponseSchema,
  updateQuizSchema,
  updateQuizResponseSchema,
  updateQuestionSchema,
  updateQuestionResponseSchema,
  quizIdParamSchema,
  questionIdParamSchema,
  moduleIdQuerySchema,
  moduleIdUserQuerySchema,
  userIdQuerySchema,
  listQuizzesResponseSchema,
  listQuizzesUserResponseSchema,
  getQuizResponseSchema,
  getQuizUserResponseSchema,
  deleteQuizResponseSchema,
  deleteQuestionResponseSchema,
  submitQuizAnswerSchema,
  quizResultResponseSchema,
  errorResponseSchema,
} from "./validation";

export const createQuizRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Quizzes - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createQuizSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: createQuizResponseSchema,
        },
      },
      description: "Quiz created successfully",
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

export const addQuestionToQuizRoute = createRoute({
  method: "post",
  path: "/question",
  tags: ["Quizzes - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: addQuestionSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: addQuestionResponseSchema,
        },
      },
      description: "Question added successfully with options",
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
      description: "Quiz not found",
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

export const listQuizzesAdminRoute = createRoute({
  method: "get",
  path: "/admin",
  tags: ["Quizzes - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    query: moduleIdQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: listQuizzesResponseSchema,
        },
      },
      description: "Quizzes retrieved successfully with questions and options (includes correct answers)",
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

export const listQuizzesUserRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Quizzes"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    query: moduleIdUserQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: listQuizzesUserResponseSchema,
        },
      },
      description: "Quizzes retrieved successfully with questions and options (without correct answers)",
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

export const getQuizByIdAdminRoute = createRoute({
  method: "get",
  path: "/admin/{id}",
  tags: ["Quizzes - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: quizIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: getQuizResponseSchema,
        },
      },
      description: "Quiz retrieved successfully with questions and options (includes correct answers)",
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
      description: "Quiz not found",
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

export const getQuizByIdUserRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Quizzes"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: quizIdParamSchema,
    query: userIdQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: getQuizUserResponseSchema,
        },
      },
      description: "Quiz retrieved successfully with questions and options (without correct answers)",
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
      description: "Quiz not found",
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

export const deleteQuizRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Quizzes - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: quizIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: deleteQuizResponseSchema,
        },
      },
      description: "Quiz and associated questions soft deleted successfully",
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
      description: "Quiz not found",
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

export const deleteQuestionRoute = createRoute({
  method: "delete",
  path: "/question/{id}",
  tags: ["Quizzes - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: questionIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: deleteQuestionResponseSchema,
        },
      },
      description: "Question and associated options soft deleted successfully",
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
      description: "Question not found",
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

export const updateQuizRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Quizzes - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: quizIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateQuizSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: updateQuizResponseSchema,
        },
      },
      description: "Quiz updated successfully",
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
      description: "Quiz not found",
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

export const updateQuestionRoute = createRoute({
  method: "put",
  path: "/question/{id}",
  tags: ["Quizzes - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: questionIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateQuestionSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: updateQuestionResponseSchema,
        },
      },
      description: "Question and options updated successfully",
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
      description: "Question not found",
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

export const submitQuizAnswerRoute = createRoute({
  method: "post",
  path: "/submit",
  tags: ["Quizzes"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: submitQuizAnswerSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: quizResultResponseSchema,
        },
      },
      description: "Quiz submitted successfully with results",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Bad request - invalid input or not all questions answered",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - authentication required",
    },
    403: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Forbidden - required lesson not completed",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Quiz or question not found",
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
