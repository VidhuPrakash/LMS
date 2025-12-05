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

// Create lesson request schema
export const createLessonSchema = z.object({
  moduleId: z.string().uuid().openapi({
    description: "Module ID to which the lesson belongs",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  userId: z.string().uuid().openapi({
    description: "ID of the user creating the lesson",
    example: "user123-e89b-12d3-a456-426614174000",
  }),
  title: z.string().min(1).max(255).openapi({
    description: "Lesson title",
    example: "Introduction to Variables",
  }),
  description: z.string().min(1).openapi({
    description: "Lesson description",
    example: "Learn about variables and data types in programming",
  }),
  lessonType: z.enum(["video", "pdf", "file", "audio", "text"]).openapi({
    description: "Type of lesson content",
    example: "video",
  }),
  lessonOrder: z.number().int().positive().openapi({
    description: "Order of the lesson in the module",
    example: 1,
  }),
  fileIds: z.array(z.string().uuid()).optional().openapi({
    description: "Array of file IDs to attach to the lesson",
    example: ["456e7890-e89b-12d3-a456-426614174001"],
  }),
});

// Update lesson request schema
export const updateLessonSchema = z.object({
  title: z.string().min(1).max(255).optional().openapi({
    description: "Lesson title",
    example: "Introduction to Variables",
  }),
  description: z.string().min(1).optional().openapi({
    description: "Lesson description",
    example: "Learn about variables and data types in programming",
  }),
  lessonType: z.enum(["video", "pdf", "file", "audio", "text"]).optional().openapi({
    description: "Type of lesson content",
    example: "video",
  }),
  lessonOrder: z.number().int().positive().optional().openapi({
    description: "Order of the lesson in the module",
    example: 1,
  }),
  fileIds: z.array(z.string().uuid()).optional().openapi({
    description: "Array of file IDs to attach to the lesson (replaces existing files)",
    example: ["456e7890-e89b-12d3-a456-426614174001"],
  }),
});

// Lesson ID param schema
export const lessonIdParamSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Lesson ID",
    example: "abc12345-e89b-12d3-a456-426614174000",
    param: {
      name: "id",
      in: "path",
    },
  }),
});

// Lesson file response schema
export const lessonFileResponseSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Lesson file ID",
    example: "def45678-e89b-12d3-a456-426614174000",
  }),
  lessonId: z.string().uuid().openapi({
    description: "Lesson ID",
    example: "abc12345-e89b-12d3-a456-426614174000",
  }),
  fileId: z.string().uuid().openapi({
    description: "File ID",
    example: "456e7890-e89b-12d3-a456-426614174001",
  }),
  createdAt: z.string().datetime().openapi({
    description: "Creation timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
});

// Lesson response schema
export const lessonResponseSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Lesson ID",
    example: "abc12345-e89b-12d3-a456-426614174000",
  }),
  moduleId: z.string().uuid().openapi({
    description: "Module ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  title: z.string().openapi({
    description: "Lesson title",
    example: "Introduction to Variables",
  }),
  description: z.string().openapi({
    description: "Lesson description",
    example: "Learn about variables and data types in programming",
  }),
  lessonType: z.enum(["video", "pdf", "file", "audio", "text"]).openapi({
    description: "Type of lesson content",
    example: "video",
  }),
  uploadedBy: z.string().uuid().openapi({
    description: "ID of the user who uploaded the lesson",
    example: "user123-e89b-12d3-a456-426614174000",
  }),
  lessonOrder: z.number().openapi({
    description: "Order of the lesson in the module",
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

// Create lesson response schema
export const createLessonResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: lessonResponseSchema,
  message: z.string().openapi({
    description: "Success message",
    example: "Lesson created successfully",
  }),
});

// Update lesson response schema
export const updateLessonResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: lessonResponseSchema,
  message: z.string().openapi({
    description: "Success message",
    example: "Lesson updated successfully",
  }),
});
