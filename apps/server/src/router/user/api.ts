import { createRoute } from "@hono/zod-openapi";
import { getUserSchema } from "./validation";

export const getUsersRoute = createRoute({
  method: "get",
  path: "/api/users",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    params: getUserSchema,
  },
  responses: {
    "200": {
      description: "Returns a list of users",
    },
  },
});
