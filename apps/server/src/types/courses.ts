export interface ListCoursesParams {
  page?: number;
  limit?: number;
  search?: string;
  level?: "beginner" | "intermediate" | "advanced";
  status?: "published" | "on_hold" | "draft";
  isFree?: boolean;
}