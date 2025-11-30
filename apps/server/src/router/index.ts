import { OpenAPIHono } from "@hono/zod-openapi";
import authRouter from "./auth";
import userRouter from "./user";

const router = new OpenAPIHono();

router.route("/auth", authRouter);
router.route("/user", userRouter);

export default router;
