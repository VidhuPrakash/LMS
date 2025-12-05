import type { Context } from "hono";
import { ZodError } from "zod";
import { createModuleSchema, updateModuleSchema, moduleIdParamSchema, courseIdQuerySchema } from "./validation";
import { createModuleService, updateModuleService, listModulesService, getModuleByIdService, deleteModuleService } from "./service";

/**
 * Handles an HTTP request to create a module.
 *
 * The request body must contain the following properties:
 * - courseId: The UUID of the course to which the module belongs.
 * - title: The module title.
 * - moduleOrder: The order of the module in the course.
 *
 * The response will contain the following properties:
 * - success: A boolean indicating if the operation was successful.
 * - data: The created module object.
 * - message: A string indicating the result of the operation.
 *
 * If the request body is invalid, a 400 response will be returned with an error message.
 * If the course doesn't exist, a 404 response will be returned with an error message.
 * If an error occurs during the creation process, a 500 response will be returned with an error message.
 */
export const createModuleController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validatedData = createModuleSchema.parse(body);

    const module = await createModuleService(validatedData);

    return c.json(
      {
        success: true,
        data: module,
        message: "Module created successfully",
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

    if (error instanceof Error && error.message === "Course not found") {
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
 * Updates a module with the given ID.
 *
 * The request body must contain the module fields to be updated.
 * The request body will be validated against the updateModuleSchema.
 *
 * If the module is not found, a 404 response will be returned with an error message.
 * If the request body is invalid, a 400 response will be returned with an error message.
 * If an error occurs during the update process, a 500 response will be returned with an error message.
 *
 * @returns A JSON response with the following format:
 * {
 *   success: boolean,
 *   data: Module,
 *   message: string
 * }
 */
export const updateModuleController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const validatedData = updateModuleSchema.parse(body);

    const module = await updateModuleService(id, validatedData);

    return c.json(
      {
        success: true,
        data: module,
        message: "Module updated successfully",
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
 * Lists all modules for a course with lessons, files, pagination, and search.
 *
 * The request query must contain:
 * - courseId: The UUID of the course to list modules for.
 * - page (optional): Page number (default: 1)
 * - limit (optional): Items per page (default: 10)
 * - search (optional): Search term for module title
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - data: Object containing modules array and pagination info.
 * - message: A string indicating the result of the operation.
 *
 * If the course doesn't exist, a 404 response will be returned with an error message.
 * If an error occurs, a 500 response will be returned with an error message.
 */
export const listModulesController = async (c: Context) => {
  try {
    const query = c.req.query();
    const { courseId, page, limit, search } = courseIdQuerySchema.parse(query);

    const result = await listModulesService(courseId, page, limit, search);

    return c.json(
      {
        success: true,
        data: result,
        message: "Modules retrieved successfully",
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

    if (error instanceof Error && error.message === "Course not found") {
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
 * Gets a single module by ID with lessons and files.
 *
 * The request params must contain:
 * - id: The module ID.
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - data: The module object with lessons.
 * - message: A string indicating the result of the operation.
 *
 * If the module is not found, a 404 response will be returned with an error message.
 * If an error occurs, a 500 response will be returned with an error message.
 */
export const getModuleByIdController = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const validatedData = moduleIdParamSchema.parse({ id });
    const module = await getModuleByIdService(validatedData.id);

    return c.json(
      {
        success: true,
        data: module,
        message: "Module retrieved successfully",
      },
      200
    );
  } catch (error) {
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
 * Soft deletes a module and all its associated lessons and lesson files.
 *
 * The request params must contain:
 * - id: The module ID.
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - message: A string indicating the result of the operation.
 *
 * If the module is not found, a 404 response will be returned with an error message.
 * If an error occurs, a 500 response will be returned with an error message.
 */
export const deleteModuleController = async (c: Context) => {
  try {
    const { id } = c.req.param();

    await deleteModuleService(id);

    return c.json(
      {
        success: true,
        message: "Module and associated lessons deleted successfully",
      },
      200
    );
  } catch (error) {
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
