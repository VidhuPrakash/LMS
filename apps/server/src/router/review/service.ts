import { db } from "../../db";
import { reviews, courses } from "../../db/schema/course";
import { user } from "../../db/schema/auth";
import { eq, and, isNull, desc, sql } from "drizzle-orm";
import type z from "zod";
import type { createReviewSchema, updateReviewSchema } from "./validation";

/**
 * Calculate and update the total rating for a course
 * This function calculates the average rating from all non-deleted reviews
 * and updates the course's totalRating field
 */
const updateCourseRating = async (courseId: string) => {
  const result = await db
    .select({
      avgRating: sql<string>`COALESCE(AVG(${reviews.rating}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(reviews)
    .where(and(eq(reviews.courseId, courseId), isNull(reviews.deletedAt)))
    .groupBy(reviews.courseId);

  const avgRating = result[0]?.avgRating || "0";

  await db
    .update(courses)
    .set({
      totalRating: avgRating,
      updatedAt: new Date(),
    })
    .where(eq(courses.id, courseId));

  return avgRating;
};

/**
 * Creates a review for a course
 * Only one review per user per course is allowed
 * Automatically updates the course's total rating after creation
 */
export const createReviewService = async (
  userId: string,
  data: z.infer<typeof createReviewSchema>
) => {
  const { courseId, rating, comment } = data;
  const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
  if (!course) {
    throw new Error("Course not found");
  }
  const existingReview = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.courseId, courseId), isNull(reviews.deletedAt)))
    .limit(1);

  if (existingReview.length > 0) {
    throw new Error("You have already reviewed this course");
  }
  const [newReview] = await db
    .insert(reviews)
    .values({
      userId,
      courseId,
      rating: rating.toString(),
      comment,
    })
    .returning();
  await updateCourseRating(courseId);

  return newReview;
};

/**
 * Gets a single review by ID
 * Includes user details (name and avatar)
 */
export const getReviewService = async (reviewId: string) => {
  const result = await db
    .select({
      id: reviews.id,
      userId: reviews.userId,
      courseId: reviews.courseId,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
      userName: user.name,
      userAvatar: user.image,
    })
    .from(reviews)
    .leftJoin(user, eq(reviews.userId, user.id))
    .where(and(eq(reviews.id, reviewId), isNull(reviews.deletedAt)))
    .limit(1);

  if (result.length === 0) {
    throw new Error("Review not found");
  }

  return result[0];
};

/**
 * Lists reviews with pagination
 * Can be filtered by courseId
 * Includes user details for each review
 */
export const listReviewsService = async (params: {
  courseId?: string;
  page: number;
  limit: number;
}) => {
  const { courseId, page, limit } = params;
  const offset = (page - 1) * limit;

  const conditions = [isNull(reviews.deletedAt)];
  if (courseId) {
    conditions.push(eq(reviews.courseId, courseId));
  }

  const [{ count: totalCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reviews)
    .where(and(...conditions));

  const reviewsList = await db
    .select({
      id: reviews.id,
      userId: reviews.userId,
      courseId: reviews.courseId,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
      userName: user.name,
      userAvatar: user.image,
    })
    .from(reviews)
    .leftJoin(user, eq(reviews.userId, user.id))
    .where(and(...conditions))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    reviews: reviewsList,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    },
  };
};

/**
 * Updates a review
 * Users can only update their own reviews
 * Automatically updates the course's total rating after update
 */
export const updateReviewService = async (
  reviewId: string,
  userId: string,
  data: z.infer<typeof updateReviewSchema>
) => {
  const [existingReview] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.id, reviewId), eq(reviews.userId, userId), isNull(reviews.deletedAt)))
    .limit(1);

  if (!existingReview) {
    throw new Error("Review not found or you don't have permission to update it");
  }

  const updateData: Partial<typeof reviews.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (data.rating !== undefined) {
    updateData.rating = data.rating.toString();
  }

  if (data.comment !== undefined) {
    updateData.comment = data.comment;
  }

  const [updatedReview] = await db
    .update(reviews)
    .set(updateData)
    .where(eq(reviews.id, reviewId))
    .returning();

  if (data.rating !== undefined) {
    await updateCourseRating(existingReview.courseId);
  }

  return updatedReview;
};

/**
 * Soft deletes a review
 * Users can only delete their own reviews
 * Automatically updates the course's total rating after deletion
 */
export const deleteReviewService = async (reviewId: string, userId: string) => {
  const [existingReview] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.id, reviewId), eq(reviews.userId, userId), isNull(reviews.deletedAt)))
    .limit(1);

  if (!existingReview) {
    throw new Error("Review not found or you don't have permission to delete it");
  }

  await db
    .update(reviews)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(reviews.id, reviewId));

  await updateCourseRating(existingReview.courseId);

  return { success: true, message: "Review deleted successfully" };
};
