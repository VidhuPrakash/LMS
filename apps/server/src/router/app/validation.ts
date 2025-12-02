import { z } from "@hono/zod-openapi";

// File upload validation schema
export const uploadFileSchema = z.object({
  file: z.instanceof(File).openapi({
    type: "string",
    format: "binary",
    description: "File to upload",
  }),
  userId: z.string().uuid().openapi({
    description: "User ID associated with the file",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  documentType: z.string().openapi({
    description: "Type of document being uploaded",
    example: "profile-picture",
  }),
});

// File upload response schema
export const uploadFileResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the upload was successful",
    example: true,
  }),
  data: z.object({
    id: z.string().uuid().openapi({
      description: "Unique identifier for the uploaded file",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    key: z.string().openapi({
      description: "Storage key for the file",
      example: "userId-123/profile-picture/1733155200000_v1_avatar.png",
    }),
    originalFilename: z.string().openapi({
      description: "Original name of the uploaded file",
      example: "avatar.png",
    }),
    storedFilename: z.string().openapi({
      description: "Name of the file in storage",
      example: "1733155200000_v1_avatar.png",
    }),
    filePath: z.string().openapi({
      description: "Path where the file is stored",
      example: "userId-123/profile-picture",
    }),
    fileSize: z.number().openapi({
      description: "Size of the file in bytes",
      example: 102400,
    }),
    mimeType: z.string().openapi({
      description: "MIME type of the file",
      example: "image/png",
    }),
    checksum: z.string().openapi({
      description: "SHA-256 checksum of the file",
      example: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    }),
    uploadedAt: z.string().datetime().openapi({
      description: "Timestamp when the file was uploaded",
      example: "2024-12-02T12:00:00Z",
    }),
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "File uploaded successfully",
  }),
});

// Error response schema
export const errorResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: false,
  }),
  error: z.string().openapi({
    description: "Error message",
    example: "Invalid file type",
  }),
});
