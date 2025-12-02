import { ZodError } from "zod";
import { uploadFileService } from "./service";
import { uploadFileSchema } from "./validation";
import type { Context } from "hono";

/**
 * Handles an HTTP request to upload a file to the storage service.
 *
 * The request body must contain the following properties:
 * - file: The file to upload.
 * - userId: The user ID associated with the file.
 * - documentType: The type of document being uploaded.
 *
 * The response will contain the following properties:
 * - success: A boolean indicating if the operation was successful.
 * - data: An object containing the uploaded file's metadata.
 * - message: A string indicating the result of the operation.
 *
 * If the request body is invalid, a 400 response will be returned with an error message.
 * If an error occurs during the upload process, a 500 response will be returned with an error message.
 */
export const uploadFileController = async (c: Context) => {
  try {
    const body = await c.req.parseBody();
    
    // Validate that file exists and is a File object
    if (!body.file || !(body.file instanceof File)) {
      return c.json(
        {
          success: false,
          error: "File is required and must be a valid file",
        },
        400
      );
    }

    // Validate other fields using Zod schema (excluding file validation)
    const validatedData = uploadFileSchema.parse({
      file: body.file,
      userId: body.userId,
      documentType: body.documentType,
    });

    const fileRecord = await uploadFileService({
      file: validatedData.file,
      userId: validatedData.userId,
      documentType: validatedData.documentType,
    });

    return c.json(
      {
        success: true,
        data: {
          id: fileRecord.id,
          key: fileRecord.key,
          originalFilename: fileRecord.originalFilename,
          storedFilename: fileRecord.storedFilename,
          filePath: fileRecord.filePath,
          fileSize: fileRecord.fileSize,
          mimeType: fileRecord.mimeType,
          checksum: fileRecord.checksum,
          uploadedAt: fileRecord.uploadedAt.toISOString(),
        },
        message: "File uploaded successfully",
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
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};
