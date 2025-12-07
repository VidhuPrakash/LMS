import type { Context } from "hono";
import { ZodError } from "zod";
import { createQuizSchema, addQuestionSchema, updateQuizSchema, updateQuestionSchema, quizIdParamSchema, questionIdParamSchema, moduleIdQuerySchema, moduleIdUserQuerySchema, userIdQuerySchema, submitQuizAnswerSchema } from "./validation";
import { createQuizService, addQuestionToQuizService, updateQuizService, updateQuestionService, listQuizzesService, listQuizzesUserService, getQuizByIdService, getQuizByIdUserService, deleteQuizService, deleteQuestionService, submitQuizAnswerService } from "./service";

/**
 * Handles an HTTP request to create a quiz without questions.
 *
 * The request body must contain the following properties:
 * - moduleId: The UUID of the module to which the quiz belongs.
 * - title: The quiz title.
 * - quizOrder: The order of the quiz in the module.
 * - instructions: Optional instructions for the quiz.
 *
 * The response will contain the created quiz (without questions).
 *
 * If the request body is invalid, a 400 response will be returned with an error message.
 * If the module doesn't exist, a 404 response will be returned with an error message.
 * If an error occurs during the creation process, a 500 response will be returned with an error message.
 */
export const createQuizController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validatedData = createQuizSchema.parse(body);

    const quiz = await createQuizService(validatedData);

    return c.json(
      {
        success: true,
        data: quiz,
        message: "Quiz created successfully",
      },
      201
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Validation Error",
        },
        400
      );
    }

    if (error instanceof Error && error.message === "Module not found") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
      );
    }

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Lists all quizzes for a module with their questions and options (Admin - includes correct answers).
 *
 * The request query must contain:
 * - moduleId: The UUID of the module to list quizzes for.
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - data: Array of quizzes with their questions and options (includes isCorrect).
 * - message: A string indicating the result of the operation.
 *
 * If the module doesn't exist, a 404 response will be returned with an error message.
 * If an error occurs, a 500 response will be returned with an error message.
 */
export const listQuizzesAdminController = async (c: Context) => {
  try {
    const { moduleId } = c.req.query();
    const validatedQuery = moduleIdQuerySchema.parse({ moduleId });

    const quizzes = await listQuizzesService(validatedQuery.moduleId);

    return c.json(
      {
        success: true,
        data: quizzes,
        message: "Quizzes retrieved successfully",
      },
      200
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Validation Error",
        },
        400
      );
    }

    if (error instanceof Error && error.message === "Module not found") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
      );
    }

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Lists all quizzes for a module with their questions and options (User - excludes correct answers).
 *
 * The request query must contain:
 * - moduleId: The UUID of the module to list quizzes for.
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - data: Array of quizzes with their questions and options (without isCorrect).
 * - message: A string indicating the result of the operation.
 *
 * If the module doesn't exist, a 404 response will be returned with an error message.
 * If an error occurs, a 500 response will be returned with an error message.
 */
export const listQuizzesUserController = async (c: Context) => {
  try {
    const { moduleId, userId } = c.req.query();
    const validatedQuery = moduleIdUserQuerySchema.parse({ moduleId, userId });

    const quizzes = await listQuizzesUserService(validatedQuery.moduleId, validatedQuery.userId);

    return c.json(
      {
        success: true,
        data: quizzes,
        message: "Quizzes retrieved successfully",
      },
      200
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Validation Error",
        },
        400
      );
    }

    if (error instanceof Error && error.message === "Module not found") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
      );
    }

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Gets a single quiz by ID with all questions and options (Admin - includes correct answers).
 *
 * The request params must contain:
 * - id: The UUID of the quiz to retrieve.
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - data: The quiz object with questions and options (includes isCorrect).
 * - message: A string indicating the result of the operation.
 *
 * If the quiz doesn't exist, a 404 response will be returned with an error message.
 * If an error occurs, a 500 response will be returned with an error message.
 */
export const getQuizByIdAdminController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const validatedParams = quizIdParamSchema.parse({ id });

    const quiz = await getQuizByIdService(validatedParams.id);

    return c.json(
      {
        success: true,
        data: quiz,
        message: "Quiz retrieved successfully",
      },
      200
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Validation Error",
        },
        400
      );
    }

    if (error instanceof Error && error.message === "Quiz not found") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
      );
    }

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Gets a single quiz by ID with all questions and options (User - excludes correct answers).
 *
 * The request params must contain:
 * - id: The UUID of the quiz to retrieve.
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - data: The quiz object with questions and options (without isCorrect).
 * - message: A string indicating the result of the operation.
 *
 * If the quiz doesn't exist, a 404 response will be returned with an error message.
 * If an error occurs, a 500 response will be returned with an error message.
 */
export const getQuizByIdUserController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const { userId } = c.req.query();
    const validatedParams = quizIdParamSchema.parse({ id });
    const validatedQuery = userIdQuerySchema.parse({ userId });

    const quiz = await getQuizByIdUserService(validatedParams.id, validatedQuery.userId);

    return c.json(
      {
        success: true,
        data: quiz,
        message: "Quiz retrieved successfully",
      },
      200
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Validation Error",
        },
        400
      );
    }

    if (error instanceof Error && (error.message === "Quiz not found" || error.message === "Required lesson not completed")) {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        error.message === "Quiz not found" ? 404 : 403
      );
    }

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Soft deletes a quiz and all associated questions and options.
 *
 * The request params must contain:
 * - id: The UUID of the quiz to delete.
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - message: A string indicating the result of the operation.
 *
 * If the quiz doesn't exist, a 404 response will be returned with an error message.
 * If an error occurs, a 500 response will be returned with an error message.
 */
export const deleteQuizController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const validatedParams = quizIdParamSchema.parse({ id });

    await deleteQuizService(validatedParams.id);

    return c.json(
      {
        success: true,
        message: "Quiz and associated questions soft deleted successfully",
      },
      200
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Validation Error",
        },
        400
      );
    }

    if (error instanceof Error && error.message === "Quiz not found") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
      );
    }

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Adds a question with options to an existing quiz.
 *
 * The request body must contain:
 * - quizId: The UUID of the quiz to add the question to.
 * - questionText: The text of the question.
 * - questionOrder: The order of the question in the quiz.
 * - options: Array of options (minimum 2), each with:
 *   - optionText: The option text.
 *   - isCorrect: Boolean indicating if this is the correct answer.
 *
 * The response will contain the created question with options.
 *
 * If the request body is invalid, a 400 response will be returned with an error message.
 * If the quiz doesn't exist, a 404 response will be returned with an error message.
 * If an error occurs, a 500 response will be returned with an error message.
 */
export const addQuestionToQuizController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validatedData = addQuestionSchema.parse(body);

    const question = await addQuestionToQuizService(validatedData);

    return c.json(
      {
        success: true,
        data: question,
        message: "Question added successfully with options",
      },
      201
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Validation Error",
        },
        400
      );
    }

    if (error instanceof Error && error.message === "Quiz not found") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
      );
    }

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Soft deletes a question and all associated options.
 *
 * The request params must contain:
 * - id: The UUID of the question to delete.
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - message: A string indicating the result of the operation.
 *
 * If the question doesn't exist, a 404 response will be returned with an error message.
 * If an error occurs, a 500 response will be returned with an error message.
 */
export const deleteQuestionController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const validatedParams = questionIdParamSchema.parse({ id });

    await deleteQuestionService(validatedParams.id);

    return c.json(
      {
        success: true,
        message: "Question and associated options soft deleted successfully",
      },
      200
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Validation Error",
        },
        400
      );
    }

    if (error instanceof Error && error.message === "Question not found") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
      );
    }

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Updates a quiz.
 *
 * The request params must contain:
 * - id: The UUID of the quiz to update.
 *
 * The request body can contain:
 * - title: The quiz title (optional).
 * - quizOrder: The order of the quiz (optional).
 * - instructions: Instructions for the quiz (optional).
 *
 * The response will contain the updated quiz with questions and options.
 *
 * If the quiz doesn't exist, a 404 response will be returned with an error message.
 * If an error occurs, a 500 response will be returned with an error message.
 */
export const updateQuizController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const validatedParams = quizIdParamSchema.parse({ id });
    const validatedData = updateQuizSchema.parse(body);

    const quiz = await updateQuizService(validatedParams.id, validatedData);

    return c.json(
      {
        success: true,
        data: quiz,
        message: "Quiz updated successfully",
      },
      200
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Validation Error",
        },
        400
      );
    }

    if (error instanceof Error && error.message === "Quiz not found") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
      );
    }

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Updates a question and its options.
 *
 * The request params must contain:
 * - id: The UUID of the question to update.
 *
 * The request body can contain:
 * - questionText: The question text (optional).
 * - questionOrder: The order of the question (optional).
 * - options: Array of options to replace existing ones (optional). All existing options will be replaced.
 *
 * The response will contain the updated question with options.
 *
 * If the question doesn't exist, a 404 response will be returned with an error message.
 * If an error occurs, a 500 response will be returned with an error message.
 */
export const updateQuestionController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const validatedParams = questionIdParamSchema.parse({ id });
    const validatedData = updateQuestionSchema.parse(body);

    const question = await updateQuestionService(validatedParams.id, validatedData);

    return c.json(
      {
        success: true,
        data: question,
        message: "Question updated successfully with options",
      },
      200
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Validation Error",
        },
        400
      );
    }

    if (error instanceof Error && error.message === "Question not found") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
      );
    }

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Submits quiz answers and calculates the score.
 *
 * The request body must contain:
 * - quizId: The UUID of the quiz being answered.
 * - userId: The UUID of the user submitting answers.
 * - answers: Array of objects with questionId and selectedOptionId.
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - data: Object with attemptId, score, totalQuestions, correctAnswers, attemptNumber, completedAt.
 * - message: A success message.
 *
 * If the request body is invalid, a 400 response will be returned.
 * If the quiz doesn't exist, a 404 response will be returned.
 * If the required lesson is not completed, a 403 response will be returned.
 * If an error occurs, a 500 response will be returned.
 */
export const submitQuizAnswerController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validatedData = submitQuizAnswerSchema.parse(body);

    const result = await submitQuizAnswerService(validatedData);

    return c.json(
      {
        success: true,
        data: result,
        message: "Quiz submitted successfully",
      },
      200
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Validation Error",
        },
        400
      );
    }

    if (error instanceof Error && (error.message === "Quiz not found" || error.message.includes("not found"))) {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
      );
    }

    if (error instanceof Error && (error.message === "Required lesson not completed" || error.message.includes("must be answered"))) {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        403
      );
    }

    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};
