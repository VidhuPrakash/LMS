import { type Context, type Next } from "hono";
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
    // Clear session cookie
    c.header("Set-Cookie", "better-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax");
    
    // Redirect to signin
    return c.redirect("/signin");
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

/**
 * Admin role check middleware.
 *
 * Checks if the authenticated user has admin role.
 * Must be used after authMiddleware.
 *
 * @param {Context} c - The Hono context object.
 * @param {Next} next - The next function in the middleware stack.
 * @returns {Promise<void>} - A promise that resolves when the middleware has finished executing.
 */
export async function adminMiddleware(c: Context, next: Next) {
  const user = c.get("user");

  if (!user) {
    // Clear session cookie
    c.header("Set-Cookie", "better-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax");
    
    // Redirect to signin
    return c.redirect("/signin");
  }

  if (user.role !== "admin") {
    // Clear session cookie for non-admin users trying to access admin routes
    c.header("Set-Cookie", "better-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax");
    
    // Redirect to signin
    return c.redirect("/signin");
  }

  await next();
}
