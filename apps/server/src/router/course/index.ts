import { OpenAPIHono } from "@hono/zod-openapi";
import {
  createCourseRoute,
  updateCourseRoute,
  deleteCourseRoute,
  getCourseAdminRoute,
  getCourseUserRoute,
  listCoursesAdminRoute,
  listCoursesUserRoute,
} from "./openapi";
import { createCourseController, deleteCourseController, getCourseAdminController, getCourseUserController, listCoursesAdminController, listCoursesUserController, updateCourseController } from "./controller";


const courseRouter = new OpenAPIHono();

// Create course
courseRouter.openapi(createCourseRoute, createCourseController);

// Update course
courseRouter.openapi(updateCourseRoute, updateCourseController);

// Delete course
courseRouter.openapi(deleteCourseRoute, deleteCourseController);

// List courses - Admin (must come before /{id} routes)
courseRouter.openapi(listCoursesAdminRoute, listCoursesAdminController);

// List courses - User (must come before /{id} routes)
courseRouter.openapi(listCoursesUserRoute, listCoursesUserController);

// Get single course - Admin
courseRouter.openapi(getCourseAdminRoute, getCourseAdminController);

// Get single course - User
courseRouter.openapi(getCourseUserRoute, getCourseUserController);

export default courseRouter;