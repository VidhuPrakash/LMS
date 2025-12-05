import { eq, and, isNull, asc, like, count, sql } from "drizzle-orm";
import { db } from "../../db";
import { modules } from "../../db/schema/modules";
import { courses } from "../../db/schema/course";
import { lessons } from "../../db/schema/lessons";
import { lessonFiles } from "../../db/schema/lessons";
import { quizzes, quizQuestions, quizOptions, quizAnswers, quizAttempts } from "../../db/schema/quiz";
import type { createModuleSchema, updateModuleSchema } from "./validation";
import type { z } from "zod";
import { generateSlug, generateUniqueSlug } from "../../utils/slug";

/**
 * Creates a new module in the database
 * @param data - Module creation data
 * @returns The created module
 * @throws Error if course doesn't exist
 */
export const createModuleService = async (data: z.infer<typeof createModuleSchema>) => {
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, data.courseId), isNull(courses.deletedAt)),
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const baseSlug = generateSlug(data.title);
  
  const existingModules = await db.query.modules.findMany({
    where: and(eq(modules.courseId, data.courseId), isNull(modules.deletedAt)),
    columns: { slug: true },
  });
  
  const existingSlugs = existingModules.map(m => m.slug);
  const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

  const [newModule] = await db
    .insert(modules)
    .values({
      courseId: data.courseId,
      title: data.title,
      slug: uniqueSlug,
      moduleOrder: data.moduleOrder,
    })
    .returning();

  return newModule;
};

/**
 * Updates an existing module in the database
 * @param id - Module ID
 * @param data - Module update data
 * @returns The updated module
 * @throws Error if module doesn't exist
 */
export const updateModuleService = async (
  id: string,
  data: z.infer<typeof updateModuleSchema>
) => {
  const existingModule = await db.query.modules.findFirst({
    where: and(eq(modules.id, id), isNull(modules.deletedAt)),
  });

  console.log("Existing Module:", existingModule);
  if (!existingModule) {
    throw new Error("Module not found");
  }

  let updateData: z.infer<typeof updateModuleSchema> & { slug?: string; updatedAt: Date } = {
    ...data,
    updatedAt: new Date(),
  };

  if (data.title) {
    const baseSlug = generateSlug(data.title);
    
    const existingModules = await db.query.modules.findMany({
      where: and(
        eq(modules.courseId, existingModule.courseId),
        isNull(modules.deletedAt)
      ),
      columns: { id: true, slug: true },
    });
    
    const existingSlugs = existingModules
      .filter(m => m.id !== id)
      .map(m => m.slug);
    
    updateData.slug = generateUniqueSlug(baseSlug, existingSlugs);
  }

  const [updatedModule] = await db
    .update(modules)
    .set(updateData)
    .where(eq(modules.id, id))
    .returning();

  return updatedModule;
};

/**
 * Lists all modules for a specific course with lessons, files, pagination, and search
 * @param courseId - Course ID to filter modules
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @param search - Search term for module title
 * @returns Paginated modules with lessons
 * @throws Error if course doesn't exist
 */
export const listModulesService = async (
  courseId: string,
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, courseId), isNull(courses.deletedAt)),
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const whereConditions = [
    eq(modules.courseId, courseId),
    isNull(modules.deletedAt),
  ];

  if (search) {
    whereConditions.push(like(modules.title, `%${search}%`));
  }

  const [totalResult] = await db
    .select({ count: count() })
    .from(modules)
    .where(and(...whereConditions));

  const total = totalResult?.count || 0;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  const modulesData = await db.query.modules.findMany({
    where: and(...whereConditions),
    orderBy: [asc(modules.moduleOrder)],
    limit,
    offset,
    with: {
      lessons: {
        where: (lessons, { isNull }) => isNull(lessons.deletedAt),
        orderBy: (lessons, { asc }) => [asc(lessons.lessonOrder)],
        with: {
          lessonFiles: {
            where: (lessonFiles, { isNull }) => isNull(lessonFiles.deletedAt),
            with: {
              file: true,
            },
          },
        },
      },
      quizzes: {
        where: (quizzes, { isNull }) => isNull(quizzes.deletedAt),
        orderBy: (quizzes, { asc }) => [asc(quizzes.quizOrder)],
        with: {
          questions: {
            where: (quizQuestions, { isNull }) => isNull(quizQuestions.deletedAt),
            orderBy: (quizQuestions, { asc }) => [asc(quizQuestions.questionOrder)],
            with: {
              options: {
                where: (quizOptions, { isNull }) => isNull(quizOptions.deletedAt),
              },
            },
          },
        },
      },
    },
  });


  const transformedModules = modulesData.map((module) => ({
    id: module.id,
    courseId: module.courseId,
    title: module.title,
    slug: module.slug,
    moduleOrder: module.moduleOrder,
    createdAt: module.createdAt.toISOString(),
    updatedAt: module.updatedAt.toISOString(),
    lessons: module.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      lessonType: lesson.lessonType,
      lessonOrder: lesson.lessonOrder,
      createdAt: lesson.createdAt.toISOString(),
      files: lesson.lessonFiles.map((lf) => ({
        id: lf.id,
        fileId: lf.fileId,
        file: {
          id: lf.file.id,
          key: lf.file.key,
          originalFilename: lf.file.originalFilename,
          fileSize: lf.file.fileSize,
          mimeType: lf.file.mimeType,
        },
      })),
    })),
    quizzes: module.quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      instructions: quiz.instructions,
      quizOrder: quiz.quizOrder,
      questions: quiz.questions.map((question) => ({
        id: question.id,
        questionText: question.questionText,
        questionOrder: question.questionOrder,
        options: question.options.map((option) => ({
          id: option.id,
          optionText: option.optionText,
          isCorrect: option.isCorrect,
        })),
      })),
    })),
  }));

  return {
    modules: transformedModules,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Gets a single module by ID with lessons and files
 * @param id - Module ID
 * @returns Module with lessons
 * @throws Error if module doesn't exist
 */
export const getModuleByIdService = async (id: string) => {
  const module = await db.query.modules.findFirst({
    where: and(eq(modules.id, id), isNull(modules.deletedAt)),
    with: {
      lessons: {
        where: (lessons, { isNull }) => isNull(lessons.deletedAt),
        orderBy: (lessons, { asc }) => [asc(lessons.lessonOrder)],
        with: {
          lessonFiles: {
            where: (lessonFiles, { isNull }) => isNull(lessonFiles.deletedAt),
            with: {
              file: true,
            },
          },
        },
      },
      quizzes: {
        where: (quizzes, { isNull }) => isNull(quizzes.deletedAt),
        orderBy: (quizzes, { asc }) => [asc(quizzes.quizOrder)],
        with: {
          questions: {
            where: (quizQuestions, { isNull }) => isNull(quizQuestions.deletedAt),
            orderBy: (quizQuestions, { asc }) => [asc(quizQuestions.questionOrder)],
            with: {
              options: {
                where: (quizOptions, { isNull }) => isNull(quizOptions.deletedAt),
              },
            },
          },
        },
      },
    },
  });

  if (!module) {
    throw new Error("Module not found");
  }

  return {
    id: module.id,
    courseId: module.courseId,
    title: module.title,
    slug: module.slug,
    moduleOrder: module.moduleOrder,
    createdAt: module.createdAt.toISOString(),
    updatedAt: module.updatedAt.toISOString(),
    lessons: module.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      lessonType: lesson.lessonType,
      lessonOrder: lesson.lessonOrder,
      createdAt: lesson.createdAt.toISOString(),
      files: lesson.lessonFiles.map((lf) => ({
        id: lf.id,
        fileId: lf.fileId,
        file: {
          id: lf.file.id,
          key: lf.file.key,
          originalFilename: lf.file.originalFilename,
          fileSize: lf.file.fileSize,
          mimeType: lf.file.mimeType,
        },
      })),
    })),
    quizzes: module.quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      instructions: quiz.instructions,
      quizOrder: quiz.quizOrder,
      questions: quiz.questions.map((question) => ({
        id: question.id,
        questionText: question.questionText,
        questionOrder: question.questionOrder,
        options: question.options.map((option) => ({
          id: option.id,
          optionText: option.optionText,
          isCorrect: option.isCorrect,
        })),
      })),
    })),
  };
};

/**
 * Soft deletes a module and all associated lessons and lesson files
 * @param id - Module ID
 * @throws Error if module doesn't exist
 */
export const deleteModuleService = async (id: string) => {
  const existingModule = await db.query.modules.findFirst({
    where: and(eq(modules.id, id), isNull(modules.deletedAt)),
    with: {
      lessons: {
        where: (lessons, { isNull }) => isNull(lessons.deletedAt),
        columns: { id: true },
      },
      quizzes: {
        where: (quizzes, { isNull }) => isNull(quizzes.deletedAt),
        columns: { id: true },
        with: {
          questions: {
            where: (quizQuestions, { isNull }) => isNull(quizQuestions.deletedAt),
            columns: { id: true },
          },
        },
      },
    },
  });

  if (!existingModule) {
    throw new Error("Module not found");
  }

  const now = new Date();

  const lessonIds = existingModule.lessons.map(l => l.id);
  
  if (lessonIds.length > 0) {
    await db
      .update(lessonFiles)
      .set({ deletedAt: now })
      .where(
        and(
          sql`${lessonFiles.lessonId} IN ${lessonIds}`,
          isNull(lessonFiles.deletedAt)
        )
      );

    await db
      .update(lessons)
      .set({ deletedAt: now, updatedAt: now })
      .where(
        and(
          eq(lessons.moduleId, id),
          isNull(lessons.deletedAt)
        )
      );
  }

  const quizIds = existingModule.quizzes.map(q => q.id);
  const questionIds = existingModule.quizzes.flatMap(q => q.questions.map(question => question.id));

  if (quizIds.length > 0) {
    await db
      .delete(quizAttempts)
      .where(sql`${quizAttempts.quizId} IN ${quizIds}`);

    if (questionIds.length > 0) {
      await db
        .delete(quizAnswers)
        .where(sql`${quizAnswers.questionId} IN ${questionIds}`);

      await db
        .update(quizOptions)
        .set({ deletedAt: now, updatedAt: now })
        .where(
          and(
            sql`${quizOptions.questionId} IN ${questionIds}`,
            isNull(quizOptions.deletedAt)
          )
        );

      await db
        .update(quizQuestions)
        .set({ deletedAt: now, updatedAt: now })
        .where(
          and(
            sql`${quizQuestions.id} IN ${questionIds}`,
            isNull(quizQuestions.deletedAt)
          )
        );
    }

    await db
      .update(quizzes)
      .set({ deletedAt: now, updatedAt: now })
      .where(
        and(
          eq(quizzes.moduleId, id),
          isNull(quizzes.deletedAt)
        )
      );
  }

  await db
    .update(modules)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(modules.id, id));
};
