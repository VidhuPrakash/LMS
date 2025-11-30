import { Context } from "hono";
import { ZodError } from "zod";

export const getUserController = (c: Context) => {
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
