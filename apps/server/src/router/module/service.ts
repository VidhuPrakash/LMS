import { eq, and, isNull, asc } from "drizzle-orm";
import { db } from "../../db";
import { modules } from "../../db/schema/modules";
import { courses } from "../../db/schema/course";
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
  };
};
