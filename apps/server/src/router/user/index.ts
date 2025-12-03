import { OpenAPIHono } from "@hono/zod-openapi";
import { listUsersRoute } from "./route";
import { listUsersController } from "./controller";

const userRouter = new OpenAPIHono();

// List users
userRouter.openapi(listUsersRoute, listUsersController);

export default userRouter;