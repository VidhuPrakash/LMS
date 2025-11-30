import { OpenAPIHono } from "@hono/zod-openapi";
import { auth } from "../../lib/auth";
const authRouter = new OpenAPIHono();

authRouter.on(["POST", "GET"], "/*", (c) => auth.handler(c.req.raw));

export default authRouter;
