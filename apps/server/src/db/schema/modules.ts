import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { courses, courseWatchedLessons } from "./course";
import { relations } from "drizzle-orm";
import { lessons } from "./lessons";
import { quizzes } from "./quiz";

export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  moduleOrder: integer("module_order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
  quizzes: many(quizzes),
  watchedLessons: many(courseWatchedLessons),
}));