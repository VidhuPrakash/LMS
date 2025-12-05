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

// Create module request schema
export const createModuleSchema = z.object({
  courseId: z.string().uuid().openapi({
    description: "Course ID to which the module belongs",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  title: z.string().min(1).max(255).openapi({
    description: "Module title",
    example: "Introduction to HTML",
  }),
  moduleOrder: z.number().int().positive().openapi({
    description: "Order of the module in the course",
    example: 1,
  }),
});

// Update module request schema
export const updateModuleSchema = z.object({
  title: z.string().min(1).max(255).optional().openapi({
    description: "Module title",
    example: "Introduction to HTML",
  }),
  moduleOrder: z.number().int().positive().optional().openapi({
    description: "Order of the module in the course",
    example: 1,
  }),
});

// Module ID param schema
export const moduleIdParamSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Module ID",
    example: "abc12345-e89b-12d3-a456-426614174000",
    param: {
      name: "id",
      in: "path",
    },
  }),
});

// Module response schema
export const moduleResponseSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Module ID",
    example: "abc12345-e89b-12d3-a456-426614174000",
  }),
  courseId: z.string().uuid().openapi({
    description: "Course ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  title: z.string().openapi({
    description: "Module title",
    example: "Introduction to HTML",
  }),
  slug: z.string().openapi({
    description: "Module slug (URL-friendly version of title)",
    example: "introduction-to-html",
  }),
  moduleOrder: z.number().openapi({
    description: "Order of the module in the course",
    example: 1,
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

// Create module response schema
export const createModuleResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: moduleResponseSchema,
  message: z.string().openapi({
    description: "Success message",
    example: "Module created successfully",
  }),
});

// Update module response schema
export const updateModuleResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: moduleResponseSchema,
  message: z.string().openapi({
    description: "Success message",
    example: "Module updated successfully",
  }),
});

// Lesson file schema
const lessonFileSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Lesson file record ID",
    example: "file1234-e89b-12d3-a456-426614174000",
  }),
  fileId: z.string().uuid().openapi({
    description: "File ID",
    example: "abc12345-e89b-12d3-a456-426614174000",
  }),
  file: z.object({
    id: z.string().uuid().openapi({
      description: "File ID",
      example: "abc12345-e89b-12d3-a456-426614174000",
    }),
    key: z.string().openapi({
      description: "File storage key",
      example: "userId-123/lessons/video.mp4",
    }),
    originalFilename: z.string().openapi({
      description: "Original filename",
      example: "intro-video.mp4",
    }),
    fileSize: z.number().openapi({
      description: "File size in bytes",
      example: 5242880,
    }),
    mimeType: z.string().openapi({
      description: "MIME type",
      example: "video/mp4",
    }),
  }),
});

// Quiz option schema
const quizOptionSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Option ID",
    example: "opt12345-e89b-12d3-a456-426614174000",
  }),
  optionText: z.string().openapi({
    description: "Option text",
    example: "HyperText Markup Language",
  }),
  isCorrect: z.boolean().openapi({
    description: "Whether this option is correct",
    example: true,
  }),
});

// Quiz question schema
const quizQuestionSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Question ID",
    example: "q1234567-e89b-12d3-a456-426614174000",
  }),
  questionText: z.string().openapi({
    description: "Question text",
    example: "What does HTML stand for?",
  }),
  questionOrder: z.number().openapi({
    description: "Question order in the quiz",
    example: 1,
  }),
  options: z.array(quizOptionSchema).openapi({
    description: "Answer options",
  }),
});

// Quiz schema
const quizSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Quiz ID",
    example: "quiz5678-e89b-12d3-a456-426614174000",
  }),
  title: z.string().openapi({
    description: "Quiz title",
    example: "HTML Basics Quiz",
  }),
  instructions: z.string().nullable().openapi({
    description: "Quiz instructions",
    example: "Answer all questions to complete this module",
  }),
  quizOrder: z.number().openapi({
    description: "Quiz order in the module",
    example: 1,
  }),
  questions: z.array(quizQuestionSchema).openapi({
    description: "Quiz questions",
  }),
});

// Lesson schema
const lessonSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Lesson ID",
    example: "def67890-e89b-12d3-a456-426614174000",
  }),
  title: z.string().openapi({
    description: "Lesson title",
    example: "Introduction to HTML Tags",
  }),
  lessonType: z.enum(["video", "pdf", "file", "audio", "text", "quiz"]).openapi({
    description: "Type of lesson",
    example: "video",
  }),
  lessonOrder: z.number().openapi({
    description: "Lesson order in the module",
    example: 1,
  }),
  createdAt: z.string().datetime().openapi({
    description: "Creation timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
  files: z.array(lessonFileSchema).openapi({
    description: "Files associated with the lesson",
  }),
});

// Module with lessons response schema
const moduleWithLessonsSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Module ID",
    example: "abc12345-e89b-12d3-a456-426614174000",
  }),
  courseId: z.string().uuid().openapi({
    description: "Course ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  title: z.string().openapi({
    description: "Module title",
    example: "Introduction to HTML",
  }),
  slug: z.string().openapi({
    description: "Module slug (URL-friendly version of title)",
    example: "introduction-to-html",
  }),
  moduleOrder: z.number().openapi({
    description: "Order of the module in the course",
    example: 1,
  }),
  createdAt: z.string().datetime().openapi({
    description: "Creation timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
  updatedAt: z.string().datetime().openapi({
    description: "Last update timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
  lessons: z.array(lessonSchema).openapi({
    description: "Lessons in the module",
  }),
  quizzes: z.array(quizSchema).openapi({
    description: "Quizzes in the module",
  }),
});

// Course ID query param schema with pagination and search
export const courseIdQuerySchema = z.object({
  courseId: z.string().uuid().openapi({
    description: "Course ID to filter modules",
    example: "123e4567-e89b-12d3-a456-426614174000",
    param: {
      name: "courseId",
      in: "query",
    },
  }),
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
    description: "Search term for filtering modules by title",
    example: "HTML",
    param: {
      name: "search",
      in: "query",
    },
  }),
});

// List modules response schema
export const listModulesResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.object({
    modules: z.array(moduleWithLessonsSchema),
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
        description: "Total number of modules",
        example: 25,
      }),
      totalPages: z.number().openapi({
        description: "Total number of pages",
        example: 3,
      }),
    }),
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Modules retrieved successfully",
  }),
});

// Get module by ID response schema
export const getModuleResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: moduleWithLessonsSchema,
  message: z.string().openapi({
    description: "Success message",
    example: "Module retrieved successfully",
  }),
});

// Delete module response schema
export const deleteModuleResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Module and associated lessons deleted successfully",
  }),
});
