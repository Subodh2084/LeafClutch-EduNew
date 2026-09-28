import type { Course, LearningMode } from "@/types/course";

export const learningModeLabels: Record<LearningMode, string> = {
  online: "Online",
  physical: "In-person",
  hybrid: "Hybrid",
};

/** True when the course comes with a free Udemy course (a link, or bonus courses to choose from). */
export function hasUdemyBonus(course: Pick<Course, "udemy_url" | "udemy_bonus_courses">): boolean {
  return Boolean(course.udemy_url) || Boolean(course.udemy_bonus_courses?.length);
}

export function courseHref(slug: string) {
  return `/courses/${slug}`;
}

/** Courses listing URL with optional filters, e.g. /courses?category=ai-ml */
export function coursesHref(
  filters: { category?: string | null; search?: string | null; page?: number } = {},
) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  const query = params.toString();
  return query ? `/courses?${query}` : "/courses";
}

/** Route that generates a course's curriculum PDF. */
export function curriculumPdfHref(slug: string) {
  return `/api/courses/${encodeURIComponent(slug)}/curriculum/pdf`;
}

/** User-facing file name, e.g. "generative-ai-course-curriculum.pdf". */
export function curriculumPdfFilename(slug: string) {
  const safe = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "course";
  return `${safe}-course-curriculum.pdf`;
}
