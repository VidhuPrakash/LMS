import type { Context } from "hono";
import { ZodError } from "zod";
import { createLessonSchema, updateLessonSchema } from "./validation";
import { createLessonService, updateLessonService } from "./service";

/**
 * Handles an HTTP request to create a lesson.
 *
 * The request body must contain the following properties:
 * - moduleId: The UUID of the module to which the lesson belongs.
 * - title: The lesson title.
 * - description: The lesson description.
 * - lessonType: The type of lesson (video, pdf, file, audio, text).
 * - lessonOrder: The order of the lesson in the module.
 * - fileIds: (Optional) Array of file IDs to attach to the lesson.
 *
 * The response will contain the following properties:
 * - success: A boolean indicating if the operation was successful.
 * - data: The created lesson object.
 * - message: A string indicating the result of the operation.
 *
 * If the request body is invalid, a 400 response will be returned with an error message.
 * If the module doesn't exist, a 404 response will be returned with an error message.
 * If an error occurs during the creation process, a 500 response will be returned with an error message.
 */
export const createLessonController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validatedData = createLessonSchema.parse(body);


    const lesson = await createLessonService(validatedData, validatedData.userId);

    return c.json(
      {
        success: true,
        data: lesson,
        message: "Lesson created successfully",
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

    if (error instanceof Error && error.message.startsWith("Files not found")) {
      return c.json(
        {
          success: false,
          error: error.message,
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

/**
 * Updates an existing lesson.
 *
 * The request body can contain the following optional properties:
 * - title: The lesson title.
 * - description: The lesson description.
 * - lessonType: The type of lesson (video, pdf, file, audio, text).
 * - lessonOrder: The order of the lesson in the module.
 * - fileIds: Array of file IDs to attach to the lesson (replaces existing files).
 *
 * The response will contain the following properties:
 * - success: A boolean indicating if the operation was successful.
 * - data: The updated lesson object.
 * - message: A string indicating the result of the operation.
 *
 * If the request body is invalid, a 400 response will be returned with an error message.
 * If the lesson doesn't exist, a 404 response will be returned with an error message.
 * If an error occurs during the update process, a 500 response will be returned with an error message.
 */
export const updateLessonController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const validatedData = updateLessonSchema.parse(body);

    const lesson = await updateLessonService(id, validatedData);

    return c.json(
      {
        success: true,
        data: lesson,
        message: "Lesson updated successfully",
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

    if (error instanceof Error && error.message === "Lesson not found") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        400
      );
    }

    if (error instanceof Error && error.message.startsWith("Files not found")) {
      return c.json(
        {
          success: false,
          error: error.message,
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
