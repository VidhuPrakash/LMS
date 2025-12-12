import { OpenAPIHono } from "@hono/zod-openapi";
import { uploadFileRoute } from "./api";
import { uploadFileController } from "./controller";


const appRouter = new OpenAPIHono();

//upload route
appRouter.openapi(uploadFileRoute, uploadFileController);

export default appRouter;
