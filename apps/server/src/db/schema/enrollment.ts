import { pgTable, uuid, numeric, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { courseCertificates, courseProgress, courses } from "./course";
import { relations } from "drizzle-orm";

export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  rating: numeric("rating", { precision: 2, scale: 1 }),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  unq: unique().on(table.userId, table.courseId),
}));


export const enrollmentsRelations = relations(enrollments, ({ one, many }) => ({
  user: one(user, {
    fields: [enrollments.userId],
    references: [user.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
  progress: many(courseProgress),
  certificates: many(courseCertificates),
}));
