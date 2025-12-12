import { boolean, integer, numeric, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { files } from "./files";

export const webinarStatusEnum = pgEnum("webinar_status", ["upcoming", "live", "completed"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "success", "failed"]);

export const webinars = pgTable("webinars", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isFree: boolean("is_free").notNull().default(false),
  price: numeric("price", { precision: 10, scale: 2 }),
  thumbnailFileId: uuid("thumbnail_file_id").references(() => files.id, { onDelete: "set null" }),
  liveLink: text("live_link"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  duration: integer("duration").notNull(), // duration in minutes
  status: webinarStatusEnum("status").notNull().default("upcoming"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const webinarInstructors = pgTable("webinar_instructors", {
  id: uuid("id").primaryKey().defaultRandom(),
  webinarId: uuid("webinar_id").notNull().references(() => webinars.id, { onDelete: "cascade" }),
  instructorId: uuid("instructor_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const webinarRegistrations = pgTable("webinar_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  webinarId: uuid("webinar_id").notNull().references(() => webinars.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  registeredAt: timestamp("registered_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});


// Relations
export const webinarsRelations = relations(webinars, ({ one, many }) => ({
  instructors: many(webinarInstructors),
  thumbnailFile: one(files, {
    fields: [webinars.thumbnailFileId],
    references: [files.id],
    relationName: "webinar_thumbnail",
  }),
  registrations: many(webinarRegistrations),
}));

export const webinarInstructorsRelations = relations(webinarInstructors, ({ one }) => ({
  webinar: one(webinars, {
    fields: [webinarInstructors.webinarId],
    references: [webinars.id],
  }),
  instructor: one(user, {
    fields: [webinarInstructors.instructorId],
    references: [user.id],
  }),
}));

export const webinarRegistrationsRelations = relations(webinarRegistrations, ({ one }) => ({
  webinar: one(webinars, {
    fields: [webinarRegistrations.webinarId],
    references: [webinars.id],
  }),
  user: one(user, {
    fields: [webinarRegistrations.userId],
    references: [user.id],
  }),
}));
