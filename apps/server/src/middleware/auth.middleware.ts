import { Context, Next } from "hono";
import { auth } from "../lib/auth";

/**
 * Authentication middleware.
 *
 * Retrieves the user session from the Authorization header and stores it on the context.
 * If no session is found, returns a 401 Unauthorized response.
 *
 * @param {Context} c - The Hono context object.
 * @param {Next} next - The next function in the middleware stack.
 * @returns {Promise<void>} - A promise that resolves when the middleware has finished executing.
 */
export async function authMiddleware(c: Context, next: Next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
}


export async function optionalAuthMiddleware(c: Context, next: Next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (session) {
    c.set("user", session.user);
    c.set("session", session.session);
  }

  await next();
}
