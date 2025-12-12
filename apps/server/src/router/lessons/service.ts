import { and, asc, count, desc, eq, isNull, like, sql } from "drizzle-orm";
import type { z } from "zod";
import { documentStorage } from "../../config/upload";
import { db } from "../../db";
import { courseWatchedLessons } from "../../db/schema/course";
import { files } from "../../db/schema/files";
import { lessonComments, lessonFiles, lessons } from "../../db/schema/lessons";
import { modules } from "../../db/schema/modules";
import { user } from "../../db/schema/auth";
import type { createLessonSchema, markLessonCompletedSchema, updateLessonSchema, createLessonCommentSchema, updateLessonCommentSchema } from "./validation";

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
  page = 1,
  limit = 10,
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

    const existingCompletion = await db.query.courseWatchedLessons.findFirst({
      where: and(
        eq(courseWatchedLessons.userId, data.userId),
        eq(courseWatchedLessons.lessonId, data.lessonId),
        isNull(courseWatchedLessons.deletedAt)
      ),
    });

    if (existingCompletion) {
      return true; 
    }
    

    await db.insert(courseWatchedLessons).values({
      userId: data.userId,
      lessonId: data.lessonId,
      courseId: data.courseId,
      moduleId: data.moduleId,
      lastWatchedSeconds: data.lastWatchedSeconds,
      watchedAt: new Date(),
      updatedAt: new Date(),
    });

    return true;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Internal Server Error");
  }
};

// ===================== LESSON COMMENTS SERVICES =====================

/**
 * Creates a new comment on a lesson
 * @param data - Comment creation data
 * @returns The created comment
 * @throws Error if lesson doesn't exist
 */
export const createLessonCommentService = async (
  data: z.infer<typeof createLessonCommentSchema>
) => {
  const lesson = await db.query.lessons.findFirst({
    where: and(eq(lessons.id, data.lessonId), isNull(lessons.deletedAt)),
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  const [newComment] = await db
    .insert(lessonComments)
    .values({
      lessonId: data.lessonId,
      userId: data.userId,
      commentText: data.commentText,
    })
    .returning();

  return newComment;
};

/**
 * Gets a single lesson comment by ID with user details
 * @param commentId - Comment ID
 * @returns The comment with user details
 * @throws Error if comment doesn't exist
 */
export const getLessonCommentService = async (commentId: string) => {
  const result = await db
    .select({
      id: lessonComments.id,
      lessonId: lessonComments.lessonId,
      userId: lessonComments.userId,
      commentText: lessonComments.commentText,
      createdAt: lessonComments.createdAt,
      updatedAt: lessonComments.updatedAt,
      userName: user.name,
      userAvatar: user.image,
    })
    .from(lessonComments)
    .leftJoin(user, eq(lessonComments.userId, user.id))
    .where(and(eq(lessonComments.id, commentId), isNull(lessonComments.deletedAt)))
    .limit(1);

  if (result.length === 0) {
    throw new Error("Comment not found");
  }

  return result[0];
};

/**
 * Lists lesson comments with pagination
 * Filtered by lessonId
 * Includes user details for each comment
 * @param params - Query parameters (lessonId, page, limit)
 * @returns Comments list with pagination
 */
export const listLessonCommentsService = async (params: {
  lessonId: string;
  page: number;
  limit: number;
}) => {
  const { lessonId, page, limit } = params;
  const offset = (page - 1) * limit;

  const lesson = await db.query.lessons.findFirst({
    where: and(eq(lessons.id, lessonId), isNull(lessons.deletedAt)),
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  const [{ count: totalCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(lessonComments)
    .where(and(eq(lessonComments.lessonId, lessonId), isNull(lessonComments.deletedAt)));

  const commentsList = await db
    .select({
      id: lessonComments.id,
      lessonId: lessonComments.lessonId,
      userId: lessonComments.userId,
      commentText: lessonComments.commentText,
      createdAt: lessonComments.createdAt,
      updatedAt: lessonComments.updatedAt,
      userName: user.name,
      userAvatar: user.image,
    })
    .from(lessonComments)
    .leftJoin(user, eq(lessonComments.userId, user.id))
    .where(and(eq(lessonComments.lessonId, lessonId), isNull(lessonComments.deletedAt)))
    .orderBy(desc(lessonComments.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    comments: commentsList,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    },
  };
};

/**
 * Updates a lesson comment
 * Users can only update their own comments
 * @param commentId - Comment ID
 * @param userId - User ID attempting to update
 * @param data - Update data
 * @returns The updated comment
 * @throws Error if comment doesn't exist or user doesn't have permission
 */
export const updateLessonCommentService = async (
  commentId: string,
  userId: string,
  data: z.infer<typeof updateLessonCommentSchema>
) => {
  const [existingComment] = await db
    .select()
    .from(lessonComments)
    .where(and(
      eq(lessonComments.id, commentId), 
      eq(lessonComments.userId, userId), 
      isNull(lessonComments.deletedAt)
    ))
    .limit(1);

  if (!existingComment) {
    throw new Error("Comment not found or you don't have permission to update it");
  }

  const [updatedComment] = await db
    .update(lessonComments)
    .set({
      commentText: data.commentText,
      updatedAt: new Date(),
    })
    .where(eq(lessonComments.id, commentId))
    .returning();

  return updatedComment;
};

/**
 * Deletes a lesson comment (soft delete)
 * Users can only delete their own comments
 * @param commentId - Comment ID
 * @param userId - User ID attempting to delete
 * @returns Success status
 * @throws Error if comment doesn't exist or user doesn't have permission
 */
export const deleteLessonCommentService = async (
  commentId: string,
  userId: string
) => {
  const [existingComment] = await db
    .select()
    .from(lessonComments)
    .where(and(
      eq(lessonComments.id, commentId), 
      eq(lessonComments.userId, userId), 
      isNull(lessonComments.deletedAt)
    ))
    .limit(1);

  if (!existingComment) {
    throw new Error("Comment not found or you don't have permission to delete it");
  }

  await db
    .update(lessonComments)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(lessonComments.id, commentId));

  return true;
};