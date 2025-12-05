import { eq, and, isNull } from "drizzle-orm";
import { db } from "../../db";
import { lessons, lessonFiles } from "../../db/schema/lessons";
import { modules } from "../../db/schema/modules";
import { files } from "../../db/schema/files";
import type { createLessonSchema, updateLessonSchema } from "./validation";
import type { z } from "zod";

/**
 * Creates a new lesson in the database
 * @param data - Lesson creation data
 * @param userId - ID of the user creating the lesson
 * @returns The created lesson
 * @throws Error if module doesn't exist or files are invalid
 */
export const createLessonService = async (
  data: z.infer<typeof createLessonSchema>,
  userId: string
) => {

  const module = await db.query.modules.findFirst({
    where: and(eq(modules.id, data.moduleId), isNull(modules.deletedAt)),
  });

  if (!module) {
    throw new Error("Module not found");
  }

  if (data.fileIds && data.fileIds.length > 0) {
    const existingFiles = await db.query.files.findMany({
      where: and(
        isNull(files.deletedAt)
      ),
      columns: { id: true },
    });

    const existingFileIds = new Set(existingFiles.map(f => f.id));
    const invalidFileIds = data.fileIds.filter(fileId => !existingFileIds.has(fileId));

    if (invalidFileIds.length > 0) {
      throw new Error(`Files not found: ${invalidFileIds.join(", ")}`);
    }
  }

  const [newLesson] = await db
    .insert(lessons)
    .values({
      moduleId: data.moduleId,
      title: data.title,
      description: data.description,
      lessonType: data.lessonType,
      uploadedBy: userId,
      lessonOrder: data.lessonOrder,
    })
    .returning();

  if (data.fileIds && data.fileIds.length > 0) {
    const lessonFileValues = data.fileIds.map(fileId => ({
      lessonId: newLesson.id,
      fileId: fileId,
    }));

    await db.insert(lessonFiles).values(lessonFileValues);
  }

  return newLesson;
};

/**
 * Updates an existing lesson in the database
 * @param id - Lesson ID
 * @param data - Lesson update data
 * @returns The updated lesson
 * @throws Error if lesson doesn't exist or files are invalid
 */
export const updateLessonService = async (
  id: string,
  data: z.infer<typeof updateLessonSchema>
) => {
  const existingLesson = await db.query.lessons.findFirst({
    where: and(eq(lessons.id, id), isNull(lessons.deletedAt)),
  });

  if (!existingLesson) {
    throw new Error("Lesson not found");
  }

  if (data.fileIds && data.fileIds.length > 0) {
    const existingFiles = await db.query.files.findMany({
      where: and(
        isNull(files.deletedAt)
      ),
      columns: { id: true },
    });

    const existingFileIds = new Set(existingFiles.map(f => f.id));
    const invalidFileIds = data.fileIds.filter(fileId => !existingFileIds.has(fileId));

    if (invalidFileIds.length > 0) {
      throw new Error(`Files not found: ${invalidFileIds.join(", ")}`);
    }
  }
  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  const [updatedLesson] = await db
    .update(lessons)
    .set(updateData)
    .where(eq(lessons.id, id))
    .returning();

  if (data.fileIds !== undefined) {
    await db
      .delete(lessonFiles)
      .where(eq(lessonFiles.lessonId, id));

    if (data.fileIds.length > 0) {
      const lessonFileValues = data.fileIds.map(fileId => ({
        lessonId: id,
        fileId: fileId,
      }));

      await db.insert(lessonFiles).values(lessonFileValues);
    }
  }

  return updatedLesson;
};
