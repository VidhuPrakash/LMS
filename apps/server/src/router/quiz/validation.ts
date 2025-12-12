import { z } from "@hono/zod-openapi";

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

// Quiz option schema (for nested creation)
export const quizOptionSchema = z.object({
  optionText: z.string().min(1).openapi({
    description: "The text of the option",
    example: "Paris",
  }),
  isCorrect: z.boolean().openapi({
    description: "Whether this option is the correct answer",
    example: true,
  }),
});

// Quiz question schema (for nested creation)
export const quizQuestionSchema = z.object({
  questionText: z.string().min(1).openapi({
    description: "The text of the question",
    example: "What is the capital of France?",
  }),
  questionOrder: z.number().int().positive().openapi({
    description: "Order of the question in the quiz",
    example: 1,
  }),
  options: z.array(quizOptionSchema).min(2).openapi({
    description: "Array of options for the question (minimum 2 required)",
  }),
});

// Create quiz request schema (without questions)
export const createQuizSchema = z.object({
  moduleId: z.string().uuid().openapi({
    description: "Module ID to which the quiz belongs",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  title: z.string().min(1).max(255).openapi({
    description: "Quiz title",
    example: "HTML Fundamentals Quiz",
  }),
  quizOrder: z.number().int().positive().openapi({
    description: "Order of the quiz in the module",
    example: 1,
  }),
  instructions: z.string().optional().openapi({
    description: "Instructions for the quiz",
    example: "Answer all questions to the best of your ability",
  }),
  unlockAfterLessonId: z.string().uuid().optional().openapi({
    description: "Lesson ID that must be completed before this quiz is accessible",
    example: "789e4567-e89b-12d3-a456-426614174999",
  }),
});

// Add question with options to quiz request schema
export const addQuestionSchema = z.object({
  quizId: z.string().uuid().openapi({
    description: "Quiz ID to which the question belongs",
    example: "abc12345-e89b-12d3-a456-426614174000",
  }),
  questionText: z.string().min(1).openapi({
    description: "The text of the question",
    example: "What is the capital of France?",
  }),
  questionOrder: z.number().int().positive().openapi({
    description: "Order of the question in the quiz",
    example: 1,
  }),
  options: z.array(quizOptionSchema).min(2).openapi({
    description: "Array of options for the question (minimum 2 required)",
  }),
});

// Update quiz request schema
export const updateQuizSchema = z.object({
  title: z.string().min(1).max(255).optional().openapi({
    description: "Quiz title",
    example: "HTML Fundamentals Quiz",
  }),
  quizOrder: z.number().int().positive().optional().openapi({
    description: "Order of the quiz in the module",
    example: 1,
  }),
  instructions: z.string().optional().openapi({
    description: "Instructions for the quiz",
    example: "Answer all questions to the best of your ability",
  }),
  unlockAfterLessonId: z.string().uuid().nullable().optional().openapi({
    description: "Lesson ID that must be completed before this quiz is accessible (null to remove requirement)",
    example: "789e4567-e89b-12d3-a456-426614174999",
  }),
});

// Update question with options request schema
export const updateQuestionSchema = z.object({
  questionText: z.string().min(1).optional().openapi({
    description: "The text of the question",
    example: "What is the capital of France?",
  }),
  questionOrder: z.number().int().positive().optional().openapi({
    description: "Order of the question in the quiz",
    example: 1,
  }),
  options: z.array(quizOptionSchema).min(2).optional().openapi({
    description: "Array of options for the question (minimum 2 required). All existing options will be replaced.",
  }),
});

// Quiz ID param schema
export const quizIdParamSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Quiz ID",
    example: "abc12345-e89b-12d3-a456-426614174000",
    param: {
      name: "id",
      in: "path",
    },
  }),
});

// Question ID param schema
export const questionIdParamSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Question ID",
    example: "qst12345-e89b-12d3-a456-426614174000",
    param: {
      name: "id",
      in: "path",
    },
  }),
});

// User ID query schema
export const userIdQuerySchema = z.object({
  userId: z.string().uuid().openapi({
    description: "User ID to check lesson completion",
    example: "user1234-e89b-12d3-a456-426614174000",
    param: {
      name: "userId",
      in: "query",
    },
  }),
});

// Module ID query schema
export const moduleIdQuerySchema = z.object({
  moduleId: z.string().uuid().openapi({
    description: "Module ID to filter quizzes",
    example: "123e4567-e89b-12d3-a456-426614174000",
    param: {
      name: "moduleId",
      in: "query",
    },
  }),
});

// Module ID and User ID query schema (for user endpoints)
export const moduleIdUserQuerySchema = z.object({
  moduleId: z.string().uuid().openapi({
    description: "Module ID to filter quizzes",
    example: "123e4567-e89b-12d3-a456-426614174000",
    param: {
      name: "moduleId",
      in: "query",
    },
  }),
  userId: z.string().uuid().openapi({
    description: "User ID to check lesson completion",
    example: "user1234-e89b-12d3-a456-426614174000",
    param: {
      name: "userId",
      in: "query",
    },
  }),
});

// Quiz option response schema (Admin - includes isCorrect)
export const quizOptionResponseSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Option ID",
    example: "opt12345-e89b-12d3-a456-426614174000",
  }),
  questionId: z.string().uuid().openapi({
    description: "Question ID",
    example: "qst12345-e89b-12d3-a456-426614174000",
  }),
  optionText: z.string().openapi({
    description: "The text of the option",
    example: "Paris",
  }),
  isCorrect: z.boolean().openapi({
    description: "Whether this option is the correct answer",
    example: true,
  }),
  createdAt: z.string().datetime().openapi({
    description: "Creation timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
  updatedAt: z.string().datetime().openapi({
    description: "Last update timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
});

// Quiz option response schema (User - excludes isCorrect)
export const quizOptionUserResponseSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Option ID",
    example: "opt12345-e89b-12d3-a456-426614174000",
  }),
  questionId: z.string().uuid().openapi({
    description: "Question ID",
    example: "qst12345-e89b-12d3-a456-426614174000",
  }),
  optionText: z.string().openapi({
    description: "The text of the option",
    example: "Paris",
  }),
  createdAt: z.string().datetime().openapi({
    description: "Creation timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
  updatedAt: z.string().datetime().openapi({
    description: "Last update timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
});

// Quiz question response schema (Admin)
export const quizQuestionResponseSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Question ID",
    example: "qst12345-e89b-12d3-a456-426614174000",
  }),
  quizId: z.string().uuid().openapi({
    description: "Quiz ID",
    example: "abc12345-e89b-12d3-a456-426614174000",
  }),
  questionText: z.string().openapi({
    description: "The text of the question",
    example: "What is the capital of France?",
  }),
  questionOrder: z.number().openapi({
    description: "Order of the question in the quiz",
    example: 1,
  }),
  options: z.array(quizOptionResponseSchema).openapi({
    description: "Array of options for the question",
  }),
  createdAt: z.string().datetime().openapi({
    description: "Creation timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
  updatedAt: z.string().datetime().openapi({
    description: "Last update timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
});

// Quiz question response schema (User)
export const quizQuestionUserResponseSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Question ID",
    example: "qst12345-e89b-12d3-a456-426614174000",
  }),
  quizId: z.string().uuid().openapi({
    description: "Quiz ID",
    example: "abc12345-e89b-12d3-a456-426614174000",
  }),
  questionText: z.string().openapi({
    description: "The text of the question",
    example: "What is the capital of France?",
  }),
  questionOrder: z.number().openapi({
    description: "Order of the question in the quiz",
    example: 1,
  }),
  options: z.array(quizOptionUserResponseSchema).openapi({
    description: "Array of options for the question (without correct answers)",
  }),
  createdAt: z.string().datetime().openapi({
    description: "Creation timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
  updatedAt: z.string().datetime().openapi({
    description: "Last update timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
});

// Quiz response schema (Admin)
export const quizResponseSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Quiz ID",
    example: "abc12345-e89b-12d3-a456-426614174000",
  }),
  moduleId: z.string().uuid().openapi({
    description: "Module ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  title: z.string().openapi({
    description: "Quiz title",
    example: "HTML Fundamentals Quiz",
  }),
  quizOrder: z.number().openapi({
    description: "Order of the quiz in the module",
    example: 1,
  }),
  instructions: z.string().nullable().openapi({
    description: "Instructions for the quiz",
    example: "Answer all questions to the best of your ability",
  }),
  questions: z.array(quizQuestionResponseSchema).openapi({
    description: "Array of questions with their options",
  }),
  createdAt: z.string().datetime().openapi({
    description: "Creation timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
  updatedAt: z.string().datetime().openapi({
    description: "Last update timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
});

// Quiz response schema (User)
export const quizUserResponseSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Quiz ID",
    example: "abc12345-e89b-12d3-a456-426614174000",
  }),
  moduleId: z.string().uuid().openapi({
    description: "Module ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  title: z.string().openapi({
    description: "Quiz title",
    example: "HTML Fundamentals Quiz",
  }),
  quizOrder: z.number().openapi({
    description: "Order of the quiz in the module",
    example: 1,
  }),
  instructions: z.string().nullable().openapi({
    description: "Instructions for the quiz",
    example: "Answer all questions to the best of your ability",
  }),
  questions: z.array(quizQuestionUserResponseSchema).openapi({
    description: "Array of questions with their options (without correct answers)",
  }),
  createdAt: z.string().datetime().openapi({
    description: "Creation timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
  updatedAt: z.string().datetime().openapi({
    description: "Last update timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
});

// Create quiz response schema
export const createQuizResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: quizResponseSchema,
  message: z.string().openapi({
    description: "Success message",
    example: "Quiz created successfully",
  }),
});

// Add question response schema
export const addQuestionResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: quizQuestionResponseSchema,
  message: z.string().openapi({
    description: "Success message",
    example: "Question added successfully with options",
  }),
});

// Update quiz response schema
export const updateQuizResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: quizResponseSchema,
  message: z.string().openapi({
    description: "Success message",
    example: "Quiz updated successfully",
  }),
});

// Update question response schema
export const updateQuestionResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: quizQuestionResponseSchema,
  message: z.string().openapi({
    description: "Success message",
    example: "Question updated successfully with options",
  }),
});

// Delete question response schema
export const deleteQuestionResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Question and associated options soft deleted successfully",
  }),
});

// List quizzes response schema (Admin)
export const listQuizzesResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.array(quizResponseSchema).openapi({
    description: "Array of quizzes with questions and options (includes correct answers)",
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Quizzes retrieved successfully",
  }),
});

// List quizzes response schema (User)
export const listQuizzesUserResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.array(quizUserResponseSchema).openapi({
    description: "Array of quizzes with questions and options (without correct answers)",
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Quizzes retrieved successfully",
  }),
});

// Get quiz response schema (Admin)
export const getQuizResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: quizResponseSchema,
  message: z.string().openapi({
    description: "Success message",
    example: "Quiz retrieved successfully",
  }),
});

// Get quiz response schema (User)
export const getQuizUserResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: quizUserResponseSchema,
  message: z.string().openapi({
    description: "Success message",
    example: "Quiz retrieved successfully",
  }),
});

// Delete quiz response schema
export const deleteQuizResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Quiz and associated questions soft deleted successfully",
  }),
});

// Submit quiz answer schema
export const submitQuizAnswerSchema = z.object({
  quizId: z.string().uuid().openapi({
    description: "Quiz ID",
    example: "abc12345-e89b-12d3-a456-426614174000",
  }),
  userId: z.string().uuid().openapi({
    description: "User ID submitting the answers",
    example: "user1234-e89b-12d3-a456-426614174000",
  }),
  answers: z.array(z.object({
    questionId: z.string().uuid().openapi({
      description: "Question ID",
      example: "qst12345-e89b-12d3-a456-426614174000",
    }),
    selectedOptionId: z.string().uuid().openapi({
      description: "Selected option ID",
      example: "opt12345-e89b-12d3-a456-426614174000",
    }),
  })).min(1).openapi({
    description: "Array of answers for each question",
  }),
});

// Quiz result response schema
export const quizResultResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.object({
    attemptId: z.string().uuid().openapi({
      description: "Quiz attempt ID",
      example: "att12345-e89b-12d3-a456-426614174000",
    }),
    score: z.number().openapi({
      description: "Score percentage (0-100)",
      example: 85.5,
    }),
    totalQuestions: z.number().int().openapi({
      description: "Total number of questions",
      example: 10,
    }),
    correctAnswers: z.number().int().openapi({
      description: "Number of correct answers",
      example: 8,
    }),
    attemptNumber: z.number().int().openapi({
      description: "Attempt number for this quiz",
      example: 1,
    }),
    completedAt: z.string().openapi({
      description: "Completion timestamp",
      example: "2025-12-07T10:30:00Z",
    }),
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Quiz submitted successfully",
  }),
});
