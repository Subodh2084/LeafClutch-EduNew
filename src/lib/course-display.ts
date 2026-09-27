import type { LearningMode } from "@/types/course";

export const learningModeLabels: Record<LearningMode, string> = {
  online: "Online",
  physical: "In-person",
  hybrid: "Hybrid",
};

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
