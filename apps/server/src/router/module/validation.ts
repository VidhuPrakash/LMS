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
});

// Course ID query param schema
export const courseIdQuerySchema = z.object({
  courseId: z.string().uuid().openapi({
    description: "Course ID to filter modules",
    example: "123e4567-e89b-12d3-a456-426614174000",
    param: {
      name: "courseId",
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
    total: z.number().openapi({
      description: "Total number of modules",
      example: 5,
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
