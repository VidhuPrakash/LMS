import { eq, and, isNull, asc, count } from "drizzle-orm";
import { db } from "../../db";
import { modules } from "../../db/schema/modules";
import { quizzes, quizQuestions, quizOptions, quizAttempts, quizAnswers } from "../../db/schema/quiz";
import type { createQuizSchema, addQuestionSchema, updateQuizSchema, updateQuestionSchema, submitQuizAnswerSchema } from "./validation";
import type { z } from "zod";
import { courseWatchedLessons } from "../../db/schema/course";

/**
 * Creates a new quiz without questions in the database
 * @param data - Quiz creation data
 * @returns The created quiz
 * @throws Error if module doesn't exist
 */
export const createQuizService = async (data: z.infer<typeof createQuizSchema>) => {
  const module = await db.query.modules.findFirst({
    where: and(eq(modules.id, data.moduleId), isNull(modules.deletedAt)),
  });

  if (!module) {
    throw new Error("Module not found");
  }

  const [newQuiz] = await db
    .insert(quizzes)
    .values({
      moduleId: data.moduleId,
      title: data.title,
      quizOrder: data.quizOrder,
      instructions: data.instructions,
      unlockAfterLessonId: data.unlockAfterLessonId,
    })
    .returning();

  return {
    ...newQuiz
  };
};

/**
 * Adds a question with options to an existing quiz
 * @param data - Question data with options
 * @returns The created question with options
 * @throws Error if quiz doesn't exist
 */
export const addQuestionToQuizService = async (data: z.infer<typeof addQuestionSchema>) => {
  const quiz = await db.query.quizzes.findFirst({
    where: and(eq(quizzes.id, data.quizId), isNull(quizzes.deletedAt)),
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  const [newQuestion] = await db
    .insert(quizQuestions)
    .values({
      quizId: data.quizId,
      questionText: data.questionText,
      questionOrder: data.questionOrder,
    })
    .returning();

  const optionsData = data.options.map((option) => ({
    questionId: newQuestion.id,
    optionText: option.optionText,
    isCorrect: option.isCorrect,
  }));

  const newOptions = await db
    .insert(quizOptions)
    .values(optionsData)
    .returning();

  return {
    ...newQuestion,
    options: newOptions,
  };
};

/**
 * Lists all quizzes for a module with questions and options (Admin - includes isCorrect)
 * @param moduleId - The module ID to filter quizzes
 * @returns Array of quizzes with their questions and options
 * @throws Error if module doesn't exist
 */
export const listQuizzesService = async (moduleId: string) => {
  const module = await db.query.modules.findFirst({
    where: and(eq(modules.id, moduleId), isNull(modules.deletedAt)),
  });

  if (!module) {
    throw new Error("Module not found");
  }

  const quizzesData = await db.query.quizzes.findMany({
    where: and(eq(quizzes.moduleId, moduleId), isNull(quizzes.deletedAt)),
    orderBy: [asc(quizzes.quizOrder)],
    with: {
      questions: {
        where: isNull(quizQuestions.deletedAt),
        orderBy: [asc(quizQuestions.questionOrder)],
        with: {
          options: {
            where: isNull(quizOptions.deletedAt),
          },
        },
      },
    },
  });

  return quizzesData;
};

/**
 * Lists all quizzes for a module with questions and options (User - excludes isCorrect)
 * @param moduleId - The module ID to filter quizzes
 * @param userId - The user ID to check lesson completion
 * @returns Array of quizzes with their questions and options (without isCorrect field)
 * @throws Error if module doesn't exist or if required lesson is not completed
 */
export const listQuizzesUserService = async (moduleId: string, userId: string) => {
  const module = await db.query.modules.findFirst({
    where: and(eq(modules.id, moduleId), isNull(modules.deletedAt)),
  });

  if (!module) {
    throw new Error("Module not found");
  }

  const quizzesData = await db.query.quizzes.findMany({
    where: and(eq(quizzes.moduleId, moduleId), isNull(quizzes.deletedAt)),
    orderBy: [asc(quizzes.quizOrder)],
    with: {
      questions: {
        where: isNull(quizQuestions.deletedAt),
        orderBy: [asc(quizQuestions.questionOrder)],
        with: {
          options: {
            where: isNull(quizOptions.deletedAt),
          },
        },
      },
    },
  });

  const accessibleQuizzes = [];
  for (const quiz of quizzesData) {
    if (quiz.unlockAfterLessonId) {
      const completion = await db.query.courseWatchedLessons.findFirst({
        where: and(
          eq(courseWatchedLessons.userId, userId),
          eq(courseWatchedLessons.lessonId, quiz.unlockAfterLessonId),
          isNull(courseWatchedLessons.deletedAt)
        ),
      });

      if (completion) {
        accessibleQuizzes.push(quiz);
      }
    } else {
      accessibleQuizzes.push(quiz);
    }
  }

  return accessibleQuizzes.map(quiz => ({
    ...quiz,
    questions: quiz.questions.map(question => ({
      ...question,
      options: question.options.map(({ isCorrect, ...option }) => option),
    })),
  }));
};

/**
 * Gets a single quiz by ID with questions and options (Admin - includes isCorrect)
 * @param id - Quiz ID
 * @returns The quiz with questions and options
 * @throws Error if quiz doesn't exist
 */
export const getQuizByIdService = async (id: string) => {
  const quiz = await db.query.quizzes.findFirst({
    where: and(eq(quizzes.id, id), isNull(quizzes.deletedAt)),
    with: {
      questions: {
        where: isNull(quizQuestions.deletedAt),
        orderBy: [asc(quizQuestions.questionOrder)],
        with: {
          options: {
            where: isNull(quizOptions.deletedAt),
          },
        },
      },
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  return quiz;
};

/**
 * Gets a single quiz by ID with questions and options (User - excludes isCorrect)
 * @param id - Quiz ID
 * @param userId - The user ID to check lesson completion
 * @returns The quiz with questions and options (without isCorrect field)
 * @throws Error if quiz doesn't exist or if required lesson is not completed
 */
export const getQuizByIdUserService = async (id: string, userId: string) => {
  const quiz = await db.query.quizzes.findFirst({
    where: and(eq(quizzes.id, id), isNull(quizzes.deletedAt)),
    with: {
      questions: {
        where: isNull(quizQuestions.deletedAt),
        orderBy: [asc(quizQuestions.questionOrder)],
        with: {
          options: {
            where: isNull(quizOptions.deletedAt),
          },
        },
      },
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  // Check if quiz requires lesson completion
  if (quiz.unlockAfterLessonId) {
    const completion = await db.query.courseWatchedLessons.findFirst({
      where: and(
        eq(courseWatchedLessons.userId, userId),
        eq(courseWatchedLessons.lessonId, quiz.unlockAfterLessonId),
        isNull(courseWatchedLessons.deletedAt)
      ),
    });

    if (!completion) {
      throw new Error("Required lesson not completed");
    }
  }

  return {
    ...quiz,
    questions: quiz.questions.map(question => ({
      ...question,
      options: question.options.map(({ isCorrect, ...option }) => option),
    })),
  };
};

/**
 * Soft deletes a quiz and all associated questions and options
 * @param id - Quiz ID
 * @throws Error if quiz doesn't exist
 */
export const deleteQuizService = async (id: string) => {
  const existingQuiz = await db.query.quizzes.findFirst({
    where: and(eq(quizzes.id, id), isNull(quizzes.deletedAt)),
  });

  if (!existingQuiz) {
    throw new Error("Quiz not found");
  }

  const questions = await db.query.quizQuestions.findMany({
    where: and(eq(quizQuestions.quizId, id), isNull(quizQuestions.deletedAt)),
  });

  const now = new Date();

  await db
    .update(quizzes)
    .set({ deletedAt: now })
    .where(eq(quizzes.id, id));

  if (questions.length > 0) {
    for (const question of questions) {
      await db
        .update(quizQuestions)
        .set({ deletedAt: now })
        .where(eq(quizQuestions.id, question.id));

      await db
        .update(quizOptions)
        .set({ deletedAt: now })
        .where(eq(quizOptions.questionId, question.id));
    }
  }

  return { id, deletedAt: now };
};

/**
 * Soft deletes a question and all associated options
 * @param id - Question ID
 * @throws Error if question doesn't exist
 */
export const deleteQuestionService = async (id: string) => {
  const existingQuestion = await db.query.quizQuestions.findFirst({
    where: and(eq(quizQuestions.id, id), isNull(quizQuestions.deletedAt)),
  });

  if (!existingQuestion) {
    throw new Error("Question not found");
  }

  const now = new Date();

  await db
    .update(quizQuestions)
    .set({ deletedAt: now })
    .where(eq(quizQuestions.id, id));

  await db
    .update(quizOptions)
    .set({ deletedAt: now })
    .where(eq(quizOptions.questionId, id));

  return { id, deletedAt: now };
};

/**
 * Updates a quiz
 * @param id - Quiz ID
 * @param data - Quiz update data
 * @returns The updated quiz with questions and options
 * @throws Error if quiz doesn't exist
 */
export const updateQuizService = async (
  id: string,
  data: z.infer<typeof updateQuizSchema>
) => {
  const existingQuiz = await db.query.quizzes.findFirst({
    where: and(eq(quizzes.id, id), isNull(quizzes.deletedAt)),
  });

  if (!existingQuiz) {
    throw new Error("Quiz not found");
  }

  const [updatedQuiz] = await db
    .update(quizzes)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(quizzes.id, id))
    .returning();

  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, id),
    with: {
      questions: {
        where: isNull(quizQuestions.deletedAt),
        orderBy: [asc(quizQuestions.questionOrder)],
        with: {
          options: {
            where: isNull(quizOptions.deletedAt),
          },
        },
      },
    },
  });

  return quiz;
};

/**
 * Updates a question and replaces all its options
 * @param id - Question ID
 * @param data - Question update data
 * @returns The updated question with options
 * @throws Error if question doesn't exist
 */
export const updateQuestionService = async (
  id: string,
  data: z.infer<typeof updateQuestionSchema>
) => {
  const existingQuestion = await db.query.quizQuestions.findFirst({
    where: and(eq(quizQuestions.id, id), isNull(quizQuestions.deletedAt)),
  });

  if (!existingQuestion) {
    throw new Error("Question not found");
  }

  const updateData: Partial<z.infer<typeof updateQuestionSchema>> & { updatedAt: Date } = {
    updatedAt: new Date(),
  };

  if (data.questionText !== undefined) {
    updateData.questionText = data.questionText;
  }
  if (data.questionOrder !== undefined) {
    updateData.questionOrder = data.questionOrder;
  }

  const [updatedQuestion] = await db
    .update(quizQuestions)
    .set(updateData)
    .where(eq(quizQuestions.id, id))
    .returning();


  if (data.options && data.options.length > 0) {

    await db
      .update(quizOptions)
      .set({ deletedAt: new Date() })
      .where(eq(quizOptions.questionId, id));


    const optionsData = data.options.map((option) => ({
      questionId: id,
      optionText: option.optionText,
      isCorrect: option.isCorrect,
    }));

    const newOptions = await db
      .insert(quizOptions)
      .values(optionsData)
      .returning();

    return {
      ...updatedQuestion,
      options: newOptions,
    };
  }

  const existingOptions = await db.query.quizOptions.findMany({
    where: and(eq(quizOptions.questionId, id), isNull(quizOptions.deletedAt)),
  });

  return {
    ...updatedQuestion,
    options: existingOptions,
  };
};

/**
 * Submit quiz answers and calculate score
 * @param data - Quiz submission data with answers
 * @returns Quiz attempt result with score
 * @throws Error if quiz doesn't exist, lesson not completed, or invalid answers
 */
export const submitQuizAnswerService = async (
  data: z.infer<typeof submitQuizAnswerSchema>
) => {
  const quiz = await db.query.quizzes.findFirst({
    where: and(eq(quizzes.id, data.quizId), isNull(quizzes.deletedAt)),
    with: {
      questions: {
        where: isNull(quizQuestions.deletedAt),
        with: {
          options: {
            where: isNull(quizOptions.deletedAt),
          },
        },
      },
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  // if quiz requires lesson completion
  if (quiz.unlockAfterLessonId) {
    const completion = await db.query.courseWatchedLessons.findFirst({
      where: and(
        eq(courseWatchedLessons.userId, data.userId),
        eq(courseWatchedLessons.lessonId, quiz.unlockAfterLessonId),
        isNull(courseWatchedLessons.deletedAt)
      ),
    });

    if (!completion) {
      throw new Error("Required lesson not completed");
    }
  }

  // Validate all questions are answered
  const questionIds = new Set(quiz.questions.map(q => q.id));
  const answeredQuestionIds = new Set(data.answers.map(a => a.questionId));

  for (const qId of questionIds) {
    if (!answeredQuestionIds.has(qId)) {
      throw new Error("All questions must be answered");
    }
  }

  // Validate all selected options exist and belong to correct questions
  for (const answer of data.answers) {
    const question = quiz.questions.find(q => q.id === answer.questionId);
    if (!question) {
      throw new Error(`Question ${answer.questionId} not found in this quiz`);
    }

    const option = question.options.find(o => o.id === answer.selectedOptionId);
    if (!option) {
      throw new Error(`Option ${answer.selectedOptionId} not found for question ${answer.questionId}`);
    }
  }

  // Get attempt number for this user and quiz
  const [attemptCountResult] = await db
    .select({ count: count() })
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.quizId, data.quizId),
        eq(quizAttempts.userId, data.userId)
      )
    );

  const attemptNumber = (attemptCountResult?.count || 0) + 1;


  const [attempt] = await db
    .insert(quizAttempts)
    .values({
      quizId: data.quizId,
      userId: data.userId,
      attemptNumber,
      startedAt: new Date(),
    })
    .returning();

  // Save answers and calculate score
  let correctCount = 0;
  const totalQuestions = quiz.questions.length;

  for (const answer of data.answers) {
    const question = quiz.questions.find(q => q.id === answer.questionId);
    const selectedOption = question?.options.find(o => o.id === answer.selectedOptionId);
    const isCorrect = selectedOption?.isCorrect || false;

    if (isCorrect) {
      correctCount++;
    }

    await db.insert(quizAnswers).values({
      userId: data.userId,
      questionId: answer.questionId,
      selectedOptionId: answer.selectedOptionId,
      isCorrect,
    });
  }

  const scorePercentage = (correctCount / totalQuestions) * 100;
  const completedAt = new Date();

  await db
    .update(quizAttempts)
    .set({
      score: scorePercentage.toFixed(2),
      completedAt,
    })
    .where(eq(quizAttempts.id, attempt.id));

  return {
    attemptId: attempt.id,
    score: Number(scorePercentage.toFixed(2)),
    totalQuestions,
    correctAnswers: correctCount,
    attemptNumber,
    completedAt: completedAt.toISOString(),
  };
};
