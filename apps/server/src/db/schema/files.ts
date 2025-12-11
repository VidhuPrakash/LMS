import { integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";
import { courses } from "./course";
import { lessonFiles } from "./lessons";
import { webinars } from "./webinar";

export const files = pgTable('files', {
  id: uuid('id')
    .primaryKey()
    .defaultRandom(),
  key: text('key').notNull().unique(),
  originalFilename: varchar('original_filename', { length: 255 }).notNull(),
  storedFilename: varchar('stored_filename', { length: 255 }).notNull(),
  filePath: text('file_path').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  checksum: varchar('checksum', { length: 64 }).notNull(),
  documentType: varchar('document_type', { length: 50 }).notNull(),
  userId: text('user_id').notNull(),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }), 
});

export const filesRelations = relations(files, ({ one, many }) => ({
  uploader: one(user, {
    fields: [files.userId],
    references: [user.id],
  }),
  courseThumbnails: many(courses),
  userAvatars: many(user),
  lessonFiles: many(lessonFiles),
  webinarThumbnails: many(webinars, { relationName: "webinar_thumbnail" }),
}));
