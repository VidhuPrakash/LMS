import { eq, and, isNull, like, count, asc } from "drizzle-orm";
import { db } from "../../db";
import { lessons, lessonFiles, userLessonCompleted } from "../../db/schema/lessons";
import { modules } from "../../db/schema/modules";
import { files } from "../../db/schema/files";
import type { createLessonSchema, updateLessonSchema, markLessonCompletedSchema } from "./validation";
import type { z } from "zod";
import { documentStorage } from "../../config/upload";

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

/**
 * Lists lessons for a module with pagination and search
 * @param moduleId - Module ID
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @param search - Search term for lesson title (optional)
 * @returns Paginated lessons with files
 * @throws Error if module doesn't exist
 */
export const listLessonsService = async (
  moduleId: string,
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const module = await db.query.modules.findFirst({
    where: and(eq(modules.id, moduleId), isNull(modules.deletedAt)),
  });

  if (!module) {
    throw new Error("Module not found");
  }

  const whereConditions = [
    eq(lessons.moduleId, moduleId),
    isNull(lessons.deletedAt),
  ];

  if (search) {
    whereConditions.push(like(lessons.title, `%${search}%`));
  }

  const [totalResult] = await db
    .select({ count: count() })
    .from(lessons)
    .where(and(...whereConditions));

  const total = totalResult?.count || 0;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;


  const lessonsData = await db.query.lessons.findMany({
    where: and(...whereConditions),
    orderBy: [asc(lessons.lessonOrder)],
    limit,
    offset,
    with: {
      lessonFiles: {
        where: (lessonFiles, { isNull }) => isNull(lessonFiles.deletedAt),
        with: {
          file: true,
        },
      },
    },
  });

  return {
    lessons: lessonsData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Gets a single lesson by ID with files
 * @param id - Lesson ID
 * @returns Lesson with files
 * @throws Error if lesson doesn't exist
 */
export const getLessonByIdService = async (id: string) => {
  const lesson = await db.query.lessons.findFirst({
    where: and(eq(lessons.id, id), isNull(lessons.deletedAt)),
    with: {
      lessonFiles:{
        where: (lessonFiles, { isNull }) => isNull(lessonFiles.deletedAt),
        with:{
          file: true,
          
        }
      }
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  return lesson;
};

/**
 * Soft deletes a lesson by ID, including associated files
 * @param id - Lesson ID
 * @throws Error if lesson doesn't exist
 */
export const deleteLessonService = async (id: string) => {
  try {
    const existingLesson = await db.query.lessons.findFirst({
      where: and(eq(lessons.id, id), isNull(lessons.deletedAt)),

    });

    if(!existingLesson){
      throw new Error("Lesson not found");
    }

    await db.update(lessons).set({ deletedAt: new Date() }).where(eq(lessons.id, id));

    const deletedFiles = await db.update(lessonFiles).set({ deletedAt: new Date() }).where(eq(lessonFiles.lessonId, id)).returning();

    for(const file of deletedFiles){
     const [f] = await db.update(files).set({ deletedAt: new Date() }).where(eq(files.id, file.fileId)).returning();

      documentStorage.deleteDocument(f.key);
    }
    return true;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Internal Server Error");
  }
}

/**
 * Marks a lesson as completed for a user
 * @param data - Lesson completion data
 * @returns Success status
 * @throws Error if lesson doesn't exist
 */
export const markLessonCompletedService = async (
  data: z.infer<typeof markLessonCompletedSchema>
) => {
  try {

    const lesson = await db.query.lessons.findFirst({
      where: and(eq(lessons.id, data.lessonId), isNull(lessons.deletedAt)),
    });

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    const existingCompletion = await db.query.userLessonCompleted.findFirst({
      where: and(
        eq(userLessonCompleted.userId, data.userId),
        eq(userLessonCompleted.lessonId, data.lessonId),
        isNull(userLessonCompleted.deletedAt)
      ),
    });

    if (existingCompletion) {
      return true; 
    }

    await db.insert(userLessonCompleted).values({
      userId: data.userId,
      lessonId: data.lessonId,
    });

    return true;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Internal Server Error");
  }
};