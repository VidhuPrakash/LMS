import { OpenAPIHono } from "@hono/zod-openapi";
import authRouter from "./auth";
import userRouter from "./user";
import courseRouter from "./course";
import moduleRouter from "./module";
import lessonRouter from "./lessons";
import appRouter from "./app";

const router = new OpenAPIHono();

router.route("/auth", authRouter);
// version 1 routes
router.route("/v1/user", userRouter);
router.route("/v1/app",appRouter)
router.route("/v1/course",courseRouter)
router.route("/v1/module",moduleRouter)
router.route("/v1/lesson",lessonRouter)


export default router;
