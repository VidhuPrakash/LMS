import { OpenAPIHono } from "@hono/zod-openapi";
import authRouter from "./auth";
import userRouter from "./user";
import courseRouter from "./course";
import appRouter from "./app";

const router = new OpenAPIHono();

router.route("/auth", authRouter);
// version 1 routes
router.route("/v1/user", userRouter);
router.route("/v1/app",appRouter)
router.route("/v1/course",courseRouter)


export default router;
