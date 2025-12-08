import { boolean, integer, numeric, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { enrollments } from "./enrollment";
import { lessons } from "./lessons";
import { modules } from "./modules";
import { relations } from "drizzle-orm";
import { files } from "./files";

export const courseStatusEnum = pgEnum("course_status", ["published", "on_hold", "draft"]);
export const courseLevelEnum = pgEnum("course_level", ["beginner", "intermediate", "advanced"]);

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isFree: boolean("is_free").notNull().default(false),
  price: numeric("price", { precision: 10, scale: 2 }),
   thumbnailFileId: uuid("thumbnail_file_id").references(() => files.id, { onDelete: "set null" }),
  level: courseLevelEnum("level").notNull(),
  totalRating: numeric("total_rating", { precision: 2, scale: 1 }).notNull().default("0"),
  language: text("language").notNull().default("en"),
  status: courseStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const courseMentors = pgTable("course_mentors", {
  id: uuid("id").primaryKey().defaultRandom(),
  mentorId: uuid("mentor_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const courseProgress = pgTable("course_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  enrollmentId: uuid("enrollment_id").notNull().references(() => enrollments.id, { onDelete: "cascade" }),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  progressPercent: integer("progress_percent").notNull().default(0),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const courseWatchedLessons = pgTable("course_watched_lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  userId:uuid("user_id").notNull().references(() => user.id,{onDelete: "cascade"}),
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  moduleId: uuid("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
  lastWatchedSeconds: integer("last_watched_seconds").default(0),
  watchedAt: timestamp("watched_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});


export const courseCertificates = pgTable("course_certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  enrollmentId: uuid("enrollment_id").notNull().references(() => enrollments.id, { onDelete: "cascade" }),
  certificateNumber: text("certificate_number").notNull().unique(),
  certificateFileId: uuid("certificate_file_id").notNull().references(() => files.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by").notNull().references(() => user.id),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const coursesRelations = relations(courses, ({ one,many }) => ({
  mentors: many(courseMentors),
  modules: many(modules),
  enrollments: many(enrollments),
  progress: many(courseProgress),
  watchedLessons: many(courseWatchedLessons),
  reviews: many(reviews),
   thumbnail: one(files, {
    fields: [courses.thumbnailFileId],
    references: [files.id],
  }),
}));

// Course Mentor Relations
export const courseMentorsRelations = relations(courseMentors, ({ one }) => ({
  mentor: one(user, {
    fields: [courseMentors.mentorId],
    references: [user.id],
  }),
  course: one(courses, {
    fields: [courseMentors.courseId],
    references: [courses.id],
  }),
}));

export const courseProgressRelations = relations(courseProgress, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [courseProgress.enrollmentId],
    references: [enrollments.id],
  }),
  course: one(courses, {
    fields: [courseProgress.courseId],
    references: [courses.id],
  }),
}));

export const courseWatchedLessonsRelations = relations(courseWatchedLessons, ({ one }) => ({
  course: one(courses, {
    fields: [courseWatchedLessons.courseId],
    references: [courses.id],
  }),
  lesson: one(lessons, {
    fields: [courseWatchedLessons.lessonId],
    references: [lessons.id],
  }),
  module: one(modules, {
    fields: [courseWatchedLessons.moduleId],
    references: [modules.id],
  }),
}));

export const courseCertificatesRelations = relations(courseCertificates, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [courseCertificates.enrollmentId],
    references: [enrollments.id],
  }),
  creator: one(user, {
    fields: [courseCertificates.createdBy],
    references: [user.id],
  }),
  certificateFile: one(files, {
    fields: [courseCertificates.certificateFileId],
    references: [files.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(user, {
    fields: [reviews.userId],
    references: [user.id],
  }),
  course: one(courses, {
    fields: [reviews.courseId],
    references: [courses.id],
  }),
}));