import { OpenAPIHono } from "@hono/zod-openapi";
import { getUsersRoute } from "./api";
import { getUserController } from "./controller";

const userRouter = new OpenAPIHono();

userRouter.openapi(getUsersRoute, getUserController);

export default userRouter;