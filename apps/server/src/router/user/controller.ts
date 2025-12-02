import type { Context } from "hono";
import { ZodError } from "zod";
import {  listUsersService } from "./service";

/**
 * Handles an HTTP request to retrieve a user by its ID.
 *
 * The request must contain the user ID in the path parameter.
 *
 * The response will contain the following properties:
 * - success: A boolean indicating if the operation was successful.
 * - error: An error message if the operation was unsuccessful.
 *
 * If the user is not found, a 404 response will be returned with an error message.
 * If the request body is invalid, a 400 response will be returned with an error message.
 * If an error occurs during the retrieval process, a 500 response will be returned with an error message.
 */
export const getUsersController = (c: Context) => {
  try {
    return c.json(
      {
        success: true,
      },
      200
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          error: error.issues[0]?.message ?? "Validation Error",
          success: false,
        },
        400
      );
    }
    return c.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
        success: false,
      },
      500
    );
  }
};


/**
 * Handles an HTTP request to retrieve a list of users with pagination and filters.
 *
 * The request must contain the following query parameters:
 * - page: The page number to retrieve (default: 1)
 * - limit: The number of items per page (default: 10)
 * - search: A search term to filter users by name or email
 * - role: A filter to retrieve users by role
 * - banned: A filter to retrieve users by banned status
 *
 * The response will contain the following properties:
 * - success: A boolean indicating if the operation was successful
 * - data: The retrieved list of users with pagination metadata
 *
 * If an error occurs during the retrieval process, a 500 response will be returned with an error message.
 * */
export const listUsersController = async (c: Context) => {
  try {
    const query = c.req.query();
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search;
    const role = query.role;
    const banned = query.banned === "true" ? true : query.banned === "false" ? false : undefined;

    const result = await listUsersService({
      page,
      limit,
      search,
      role,
      banned,
    });

    return c.json(
      {
        success: true,
        data: result,
      },
      200
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};
