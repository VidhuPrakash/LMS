import { db } from "../../db";
import { courses, courseMentors, courseProgress, courseWatchedLessons, courseCertificates, reviews } from "../../db/schema/course";
import { enrollments } from "../../db/schema/enrollment";
import { modules } from "../../db/schema/modules";
import { lessons, lessonComments, lessonFiles } from "../../db/schema/lessons";
import { quizzes, quizQuestions, quizOptions, quizAnswers, quizAttempts } from "../../db/schema/quiz";
import { files } from "../../db/schema/files";
import { user } from "../../db/schema/auth";
import { eq, count, and, like, isNull, sql } from "drizzle-orm";
import { generateSlug, generateUniqueSlug } from "../../utils/slug";
import { documentStorage } from "../../config/upload";
import type { ListCoursesParams } from "../../types/courses";
import type z from "zod";
import type { createCourseSchema, updateCourseSchema } from "./validation";


/**
 * Creates a course with the given data.
 *
 * The function generates a unique slug from the title and checks for existing slugs.
 * If a slug already exists, it generates a new unique slug.
 *
 * It then inserts the course data into the database and returns the created course object.
 *
 * The function also inserts the mentor IDs into the courseMentors table and returns the created mentor objects.
 *
 * @param {z.infer<typeof createCourseSchema>} data - The course data to be created.
 * @returns {Promise<Course>} - The created course object.
 */
export const createCourseService = async (data: z.infer<typeof createCourseSchema>) => {
  const {
    title,
    description,
    isFree,
    price,
    thumbnailFileId,
    level,
    language,
    status,
    mentorIds,
  } = data;

  // Generate slug from title
  const baseSlug = generateSlug(title);
  
  // Check for existing slugs
  const existingCourses = await db
    .select({ slug: courses.slug })
    .from(courses)
    .where(eq(courses.slug, baseSlug));
  
  const existingSlugs = existingCourses.map((c) => c.slug);
  const slug = generateUniqueSlug(baseSlug, existingSlugs);

  const [course] = await db
    .insert(courses)
    .values({
      title,
      slug,
      description: description || null,
      isFree,
      price: price || null,
      thumbnailFileId: thumbnailFileId || null,
      level,
      language,
      status,
    })
    .returning();

  const mentorsData = mentorIds.map((mentorId) => ({
    courseId: course.id,
    mentorId,
  }));

  const insertedMentors = await db
    .insert(courseMentors)
    .values(mentorsData)
    .returning();

  let thumbnailUrl: string | null = null;
  if (course.thumbnailFileId) {
    const [thumbnailFile] = await db
      .select()
      .from(files)
      .where(eq(files.id, course.thumbnailFileId))
      .limit(1);

    if (thumbnailFile && !thumbnailFile.deletedAt) {
      thumbnailUrl = await documentStorage.getSignedUrl(thumbnailFile.key);
    }
  }

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    isFree: course.isFree,
    price: course.price,
    thumbnail: thumbnailUrl,
    level: course.level,
    language: course.language,
    status: course.status,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
    enrolledCount:0,
    mentors: insertedMentors.map((mentor) => ({
      id: mentor.id,
      mentorId: mentor.mentorId,
      courseId: mentor.courseId,
    })),
  };
};

/**
 * Updates a course with the given data.
 *
 * The function checks if the course exists, and if the title is being updated,
 * it generates a new unique slug. It then updates the course data in the database.
 *
 * If mentorIds are provided, it deletes existing course-mentor relationships
 * and inserts new ones.
 *
 * @param {string} id - The ID of the course to update.
 * @param {z.infer<typeof updateCourseSchema>} data - The course data to update.
 * @returns {Promise<Course | null>} - The updated course object or null if not found.
 */
export const updateCourseService = async (id: string, data: z.infer<typeof updateCourseSchema>) => {
  const [existingCourse] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);

  if (!existingCourse) {
    return null;
  }

  const updateData: Partial<typeof courses.$inferInsert> = {};

  if (data.title && data.title !== existingCourse.title) {
    const baseSlug = generateSlug(data.title);
    

    const existingCourses = await db
      .select({ slug: courses.slug })
      .from(courses);
    
    const existingSlugs = existingCourses
      .filter((c) => c.slug !== existingCourse.slug)
      .map((c) => c.slug);
    
    const slug = generateUniqueSlug(baseSlug, existingSlugs);
    
    updateData.title = data.title;
    updateData.slug = slug;
  }


  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.isFree !== undefined) updateData.isFree = data.isFree;
  if (data.price !== undefined) updateData.price = data.price || null;
  if (data.thumbnailFileId !== undefined) updateData.thumbnailFileId = data.thumbnailFileId || null;
  if (data.level !== undefined) updateData.level = data.level;
  if (data.language !== undefined) updateData.language = data.language;
  if (data.status !== undefined) updateData.status = data.status;

  const [updatedCourse] = await db
    .update(courses)
    .set(updateData)
    .where(eq(courses.id, id))
    .returning();

  let updatedMentors: typeof courseMentors.$inferSelect[] = [];
  if (data.mentorIds) {
    await db.delete(courseMentors).where(eq(courseMentors.courseId, id));

    if (data.mentorIds.length > 0) {
      const mentorsData = data.mentorIds.map((mentorId) => ({
        courseId: id,
        mentorId,
      }));

      updatedMentors = await db
        .insert(courseMentors)
        .values(mentorsData)
        .returning();
    }
  } else {
    updatedMentors = await db
      .select()
      .from(courseMentors)
      .where(eq(courseMentors.courseId, id));
  }

  const [enrollmentCount] = await db
    .select({ count: count() })
    .from(enrollments)
    .where(eq(enrollments.courseId, id));
  
  const enrolledCount = enrollmentCount?.count || 0;

  let thumbnailUrl: string | null = null;
  if (updatedCourse.thumbnailFileId) {
    const [thumbnailFile] = await db
      .select()
      .from(files)
      .where(eq(files.id, updatedCourse.thumbnailFileId))
      .limit(1);

    if (thumbnailFile && !thumbnailFile.deletedAt) {
      thumbnailUrl = await documentStorage.getSignedUrl(thumbnailFile.key);
    }
  }

  return {
    id: updatedCourse.id,
    title: updatedCourse.title,
    slug: updatedCourse.slug,
    description: updatedCourse.description,
    isFree: updatedCourse.isFree,
    price: updatedCourse.price,
    thumbnail: thumbnailUrl,
    level: updatedCourse.level,
    language: updatedCourse.language,
    status: updatedCourse.status,
    createdAt: updatedCourse.createdAt.toISOString(),
    updatedAt: updatedCourse.updatedAt.toISOString(),
    enrolledCount,
    mentors: updatedMentors.map((mentor) => ({
      id: mentor.id,
      mentorId: mentor.mentorId,
      courseId: mentor.courseId,
    })),
  };
};

/**
 * Soft deletes a course and all its related data by setting the deletedAt timestamp.
 * Also deletes the thumbnail file from cloud storage if it exists.
 *
 * @param {string} id - The ID of the course to delete.
 * @returns {Promise<boolean>} - Returns true if the course was deleted, false if not found.
 */
export const deleteCourseService = async (id: string) => {
  const [existingCourse] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);

  if (!existingCourse) {
    return false;
  }

  const deletedAt = new Date();


  const courseModules = await db
    .select()
    .from(modules)
    .where(eq(modules.courseId, id));


  for (const module of courseModules) {
   
    const moduleLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.moduleId, module.id));

    for (const lesson of moduleLessons) {
    
      const lessonFilesData = await db
        .select()
        .from(lessonFiles)
        .where(eq(lessonFiles.lessonId, lesson.id));


      for (const lessonFile of lessonFilesData) {
        const [fileRecord] = await db
          .select()
          .from(files)
          .where(eq(files.id, lessonFile.fileId))
          .limit(1);

        if (fileRecord) {
          try {
            await documentStorage.deleteDocument(fileRecord.key);
           
            await db
              .update(files)
              .set({ deletedAt })
              .where(eq(files.id, fileRecord.id));
          } catch (error) {
            throw new Error(`Failed to delete lesson file from cloud storage:` + error);

          }
        }
      }

      
      await db
        .update(lessonFiles)
        .set({ deletedAt })
        .where(eq(lessonFiles.lessonId, lesson.id));

   
      await db
        .update(lessonComments)
        .set({ deletedAt })
        .where(eq(lessonComments.lessonId, lesson.id));
    }

   
    await db
      .update(lessons)
      .set({ deletedAt })
      .where(eq(lessons.moduleId, module.id));

 
    const moduleQuizzes = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.moduleId, module.id));

    for (const quiz of moduleQuizzes) {
     
      const quizQuestionsData = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quiz.id));

      for (const question of quizQuestionsData) {
      
        await db
          .update(quizOptions)
          .set({ deletedAt })
          .where(eq(quizOptions.questionId, question.id));
      }

    
      await db
        .update(quizQuestions)
        .set({ deletedAt })
        .where(eq(quizQuestions.quizId, quiz.id));
    }


    await db
      .update(quizzes)
      .set({ deletedAt })
      .where(eq(quizzes.moduleId, module.id));

    await db
      .update(modules)
      .set({ deletedAt })
      .where(eq(modules.courseId, id));
  }


  await db
    .update(courseWatchedLessons)
    .set({ deletedAt })
    .where(eq(courseWatchedLessons.courseId, id));

  await db
    .update(courseCertificates)
    .set({ deletedAt })
    .where(eq(courseCertificates.enrollmentId, id));

  await db
    .update(reviews)
    .set({ deletedAt })
    .where(eq(reviews.courseId, id));

  if (existingCourse.thumbnailFileId) {
    const [thumbnailFile] = await db
      .select()
      .from(files)
      .where(eq(files.id, existingCourse.thumbnailFileId))
      .limit(1);

    if (thumbnailFile) {
      try {
        await documentStorage.deleteDocument(thumbnailFile.key);
        await db
          .update(files)
          .set({ deletedAt })
          .where(eq(files.id, existingCourse.thumbnailFileId));
      } catch (error) {
        throw new Error("Failed to delete thumbnail from cloud storage:" + error);
      }
    }
  }

  await db
    .update(courses)
    .set({ deletedAt })
    .where(eq(courses.id, id));

  return true;
};

/**
 * Gets full course details for admin view including all modules, lessons, files, and quizzes.
 * 
 * @param {string} id - The ID of the course to retrieve.
 * @returns {Promise<Course | null>} - The course object with all nested data or null if not found.
 */
export const getCourseAdminService = async (id: string) => {
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);

  if (!course || course.deletedAt) {
    return null;
  }

  const [enrollmentCount] = await db
    .select({ count: count() })
    .from(enrollments)
    .where(eq(enrollments.courseId, id));

  const enrolledCount = enrollmentCount?.count || 0;

  // Fetch mentors with details
  const mentorsList = await db
    .select({
      id: courseMentors.id,
      mentorId: courseMentors.mentorId,
      mentorName: user.name,
      mentorAvatar: user.image,
      avatarFileId: user.avatarFileId,
    })
    .from(courseMentors)
    .innerJoin(user, eq(courseMentors.mentorId, user.id))
    .where(eq(courseMentors.courseId, id));

  const mentorsWithAvatars = await Promise.all(
    mentorsList.map(async (mentor) => {
      let avatarUrl: string | null = mentor.mentorAvatar;
      if (mentor.avatarFileId) {
        const [avatarFile] = await db
          .select()
          .from(files)
          .where(eq(files.id, mentor.avatarFileId))
          .limit(1);

        if (avatarFile && !avatarFile.deletedAt) {
          avatarUrl = await documentStorage.getSignedUrl(avatarFile.key);
        }
      }

      return {
        id: mentor.id,
        mentorId: mentor.mentorId,
        name: mentor.mentorName,
        avatar: avatarUrl,
      };
    })
  );

  let thumbnailUrl: string | null = null;
  if (course.thumbnailFileId) {
    const [thumbnailFile] = await db
      .select()
      .from(files)
      .where(eq(files.id, course.thumbnailFileId))
      .limit(1);

    if (thumbnailFile && !thumbnailFile.deletedAt) {
      thumbnailUrl = await documentStorage.getSignedUrl(thumbnailFile.key);
    }
  }

  const courseModules = await db
    .select()
    .from(modules)
    .where(eq(modules.courseId, id));

  const modulesData = await Promise.all(
    courseModules
      .filter(module => !module.deletedAt)
      .map(async (module) => {
        const moduleLessons = await db
          .select()
          .from(lessons)
          .where(eq(lessons.moduleId, module.id));

        const lessonsData = await Promise.all(
          moduleLessons
            .filter(lesson => !lesson.deletedAt)
            .map(async (lesson) => {
              const lessonFilesData = await db
                .select()
                .from(lessonFiles)
                .where(eq(lessonFiles.lessonId, lesson.id));

              const filesData = await Promise.all(
                lessonFilesData
                  .filter(lf => !lf.deletedAt)
                  .map(async (lessonFile) => {
                    const [fileRecord] = await db
                      .select()
                      .from(files)
                      .where(eq(files.id, lessonFile.fileId))
                      .limit(1);

                    if (fileRecord && !fileRecord.deletedAt) {
                      const fileUrl = await documentStorage.getSignedUrl(fileRecord.key);
                      return {
                        id: fileRecord.id,
                        url: fileUrl,
                        key: fileRecord.key,
                        originalFilename: fileRecord.originalFilename,
                        fileSize: fileRecord.fileSize,
                        mimeType: fileRecord.mimeType,
                      };
                    }
                    return null;
                  })
              );

              return {
                id: lesson.id,
                title: lesson.title,
                lessonType: lesson.lessonType,
                lessonOrder: lesson.lessonOrder,
                files: filesData.filter(f => f !== null),
              };
            })
        );
        const moduleQuizzes = await db
          .select()
          .from(quizzes)
          .where(eq(quizzes.moduleId, module.id));

        const quizzesData = await Promise.all(
          moduleQuizzes
            .filter(quiz => !quiz.deletedAt)
            .map(async (quiz) => {
              const quizQuestionsData = await db
                .select()
                .from(quizQuestions)
                .where(eq(quizQuestions.quizId, quiz.id));

              const questionsData = await Promise.all(
                quizQuestionsData
                  .filter(q => !q.deletedAt)
                  .map(async (question) => {
                    const questionOptions = await db
                      .select()
                      .from(quizOptions)
                      .where(eq(quizOptions.questionId, question.id));

                    const optionsData = questionOptions
                      .filter(opt => !opt.deletedAt)
                      .map((option) => ({
                        id: option.id,
                        optionText: option.optionText,
                        isCorrect: option.isCorrect,
                      }));

                    return {
                      id: question.id,
                      questionText: question.questionText,
                      questionOrder: question.questionOrder,
                      options: optionsData,
                    };
                  })
              );

              return {
                id: quiz.id,
                title: quiz.title,
                instructions: quiz.instructions,
                questions: questionsData,
              };
            })
        );

        return {
          id: module.id,
          title: module.title,
          moduleOrder: module.moduleOrder,
          lessons: lessonsData,
          quizzes: quizzesData,
        };
      })
  );

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    isFree: course.isFree,
    price: course.price,
    thumbnail: thumbnailUrl,
    level: course.level,
    language: course.language,
    status: course.status,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
    enrolledCount,
    mentors: mentorsWithAvatars,
    modules: modulesData,
  };
};

/**
 * Gets course details for user view including enrollment and progress information.
 * 
 * @param {string} id - The ID of the course to retrieve.
 * @param {string} userId - The ID of the user viewing the course (optional).
 * @returns {Promise<Course | null>} - The course object with enrollment data or null if not found.
 */
export const getCourseUserService = async (id: string, userId?: string) => {
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);

  if (!course || course.deletedAt) {
    return null;
  }

  // Fetch mentors with details
  const mentorsList = await db
    .select({
      id: courseMentors.id,
      mentorId: courseMentors.mentorId,
      mentorName: user.name,
      mentorAvatar: user.image,
      avatarFileId: user.avatarFileId,
    })
    .from(courseMentors)
    .innerJoin(user, eq(courseMentors.mentorId, user.id))
    .where(eq(courseMentors.courseId, id));

  const mentorsWithAvatars = await Promise.all(
    mentorsList.map(async (mentor) => {
      let avatarUrl: string | null = mentor.mentorAvatar;
      if (mentor.avatarFileId) {
        const [avatarFile] = await db
          .select()
          .from(files)
          .where(eq(files.id, mentor.avatarFileId))
          .limit(1);

        if (avatarFile && !avatarFile.deletedAt) {
          avatarUrl = await documentStorage.getSignedUrl(avatarFile.key);
        }
      }

      return {
        id: mentor.id,
        mentorId: mentor.mentorId,
        name: mentor.mentorName,
        avatar: avatarUrl,
      };
    })
  );

  let thumbnailUrl: string | null = null;
  if (course.thumbnailFileId) {
    const [thumbnailFile] = await db
      .select()
      .from(files)
      .where(eq(files.id, course.thumbnailFileId))
      .limit(1);

    if (thumbnailFile && !thumbnailFile.deletedAt) {
      thumbnailUrl = await documentStorage.getSignedUrl(thumbnailFile.key);
    }
  }

  let enrollmentData = null;
  if (userId) {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(
        eq(enrollments.courseId, id),
        eq(enrollments.userId, userId)
      ))
      .limit(1);

    if (enrollment) {
      const [progress] = await db
        .select()
        .from(courseProgress)
        .where(eq(courseProgress.enrollmentId, enrollment.id))
        .limit(1);

      enrollmentData = {
        id: enrollment.id,
        enrolledAt: enrollment.enrolledAt.toISOString(),
        progress: progress ? {
          progressPercent: progress.progressPercent,
          lastWatchedSeconds: progress.lastWatchedSeconds || 0,
          isCompleted: progress.isCompleted,
          completedAt: progress.completedAt ? progress.completedAt.toISOString() : null,
        } : null,
      };
    }
  }

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    isFree: course.isFree,
    price: course.price,
    thumbnail: thumbnailUrl,
    level: course.level,
    language: course.language,
    status: course.status,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
    mentors: mentorsWithAvatars,
    enrollment: enrollmentData,
  };
};

/**
 * Lists all courses for admin view with pagination and filters.
 * 
 * @param {ListCoursesParams} params - Pagination and filter parameters.
 * @returns {Promise<{courses: Course[], pagination: object}>} - List of courses with pagination metadata.
 */
export const listCoursesAdminService = async (params: ListCoursesParams) => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  const conditions = [isNull(courses.deletedAt)];

  if (params.search) {
    conditions.push(like(courses.title, `%${params.search}%`));
  }

  if (params.level) {
    conditions.push(eq(courses.level, params.level));
  }

  if (params.status) {
    conditions.push(eq(courses.status, params.status));
  }

  if (params.isFree !== undefined) {
    conditions.push(eq(courses.isFree, params.isFree));
  }

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

  const [totalCount] = await db
    .select({ count: count() })
    .from(courses)
    .where(whereClause);

  const total = totalCount?.count || 0;
  const totalPages = Math.ceil(total / limit);

  const coursesList = await db
    .select()
    .from(courses)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(courses.createdAt);

  console.log("Admin Service - Raw coursesList:", JSON.stringify(coursesList, null, 2));

  const coursesData = await Promise.all(
    coursesList.map(async (course) => {
      const [enrollmentCount] = await db
        .select({ count: count() })
        .from(enrollments)
        .where(eq(enrollments.courseId, course.id));

      const enrolledCount = enrollmentCount?.count || 0;

      let thumbnailUrl: string | null = null;
      if (course.thumbnailFileId) {
        const [thumbnailFile] = await db
          .select()
          .from(files)
          .where(eq(files.id, course.thumbnailFileId))
          .limit(1);

        if (thumbnailFile && !thumbnailFile.deletedAt) {
          thumbnailUrl = await documentStorage.getSignedUrl(thumbnailFile.key);
        }
      }

      // Fetch mentors with details
      const mentorsList = await db
        .select({
          id: courseMentors.id,
          mentorId: courseMentors.mentorId,
          mentorName: user.name,
          mentorAvatar: user.image,
          avatarFileId: user.avatarFileId,
        })
        .from(courseMentors)
        .innerJoin(user, eq(courseMentors.mentorId, user.id))
        .where(eq(courseMentors.courseId, course.id));

      const mentorsWithAvatars = await Promise.all(
        mentorsList.map(async (mentor) => {
          let avatarUrl: string | null = mentor.mentorAvatar;
          if (mentor.avatarFileId) {
            const [avatarFile] = await db
              .select()
              .from(files)
              .where(eq(files.id, mentor.avatarFileId))
              .limit(1);

            if (avatarFile && !avatarFile.deletedAt) {
              avatarUrl = await documentStorage.getSignedUrl(avatarFile.key);
            }
          }

          return {
            id: mentor.id,
            mentorId: mentor.mentorId,
            name: mentor.mentorName,
            avatar: avatarUrl,
          };
        })
      );

      const courseData = {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        isFree: course.isFree,
        price: course.price,
        thumbnail: thumbnailUrl,
        level: course.level,
        language: course.language,
        status: course.status,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        enrolledCount,
        mentors: mentorsWithAvatars,
      };
      
      console.log("Admin Service - Single course data:", JSON.stringify(courseData, null, 2));
      return courseData;
    })
  );

  console.log("Admin Service - Final coursesData:", JSON.stringify(coursesData, null, 2));

  const result = {
    courses: coursesData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
  
  console.log("Admin Service - Final result:", JSON.stringify(result, null, 2));

  return result;
};

/**
 * Lists all courses for user view with pagination, filters, and enrollment/progress data.
 * 
 * @param {ListCoursesParams & {userId?: string}} params - Pagination, filter parameters, and userId.
 * @returns {Promise<{courses: Course[], pagination: object}>} - List of courses with enrollment data and pagination metadata.
 */
export const listCoursesUserService = async (params: ListCoursesParams & { userId?: string }) => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  const conditions = [
    isNull(courses.deletedAt),
    eq(courses.status, "published"),
  ];

  if (params.search) {
    conditions.push(like(courses.title, `%${params.search}%`));
  }

  if (params.level) {
    conditions.push(eq(courses.level, params.level));
  }

  if (params.isFree !== undefined) {
    conditions.push(eq(courses.isFree, params.isFree));
  }

  const whereClause = and(...conditions);
  console.log("whereClause", params)
  const [totalCount] = await db
    .select({ count: count() })
    .from(courses)
    .where(whereClause);

  const total = totalCount?.count || 0;
  const totalPages = Math.ceil(total / limit);

  const coursesList = await db
    .select()
    .from(courses)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(courses.createdAt);

    console.log("coursesList", coursesList)
  const coursesData = await Promise.all(
    coursesList.map(async (course) => {
      let thumbnailUrl: string | null = null;
      if (course.thumbnailFileId) {
        const [thumbnailFile] = await db
          .select()
          .from(files)
          .where(eq(files.id, course.thumbnailFileId))
          .limit(1);

        if (thumbnailFile && !thumbnailFile.deletedAt) {
          thumbnailUrl = await documentStorage.getSignedUrl(thumbnailFile.key);
        }
      }

      let enrollmentData = null;
      if (params.userId) {
        const [enrollment] = await db
          .select()
          .from(enrollments)
          .where(and(
            eq(enrollments.courseId, course.id),
            eq(enrollments.userId, params.userId)
          ))
          .limit(1);

        if (enrollment) {
          const [progress] = await db
            .select()
            .from(courseProgress)
            .where(eq(courseProgress.enrollmentId, enrollment.id))
            .limit(1);

          enrollmentData = {
            id: enrollment.id,
            enrolledAt: enrollment.enrolledAt.toISOString(),
            progress: progress ? {
              progressPercent: progress.progressPercent,
              lastWatchedSeconds: progress.lastWatchedSeconds || 0,
              isCompleted: progress.isCompleted,
              completedAt: progress.completedAt ? progress.completedAt.toISOString() : null,
            } : null,
          };
        }
      }

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        isFree: course.isFree,
        price: course.price,
        thumbnail: thumbnailUrl,
        level: course.level,
        language: course.language,
        enrollment: enrollmentData,
      };
    })
  );

  return {
    courses: coursesData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};
