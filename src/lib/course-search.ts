import type { Course } from "@/types/course";

export interface CourseFilters {
  search?: string;
  /** Category slug, e.g. "ai-ml". */
  category?: string;
}

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Matches course name, descriptions and category. Each query word must match
 * the start of a word ("ai" finds "AI" but not "maintain"), and every word
 * must match, so "ai agent" narrows rather than widens results.
 * Pure and dependency-free so it runs on the server and in the browser.
 */
export function matchesSearch(course: Course, query: string): boolean {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const haystack = normalize(
    [
      course.name,
      course.short_description,
      course.description,
      course.category.name,
      course.category.short_name,
    ].join(" "),
  );

  return terms.every((term) =>
    new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(term)}`).test(haystack),
  );
}

export function filterCourses(courses: Course[], { search, category }: CourseFilters): Course[] {
  return courses.filter(
    (course) =>
      (!category || course.category.slug === category) &&
      (!search || matchesSearch(course, search)),
  );
}

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

/**
 * Normalises /courses query params. Unknown categories are ignored rather
 * than producing an empty page, and the page number is always a positive int.
 */
export function parseCourseFilters(params: RawSearchParams, validCategorySlugs: string[]) {
  const category = firstParam(params.category);
  const page = Number.parseInt(firstParam(params.page), 10);
  return {
    search: firstParam(params.search).slice(0, 100),
    category: validCategorySlugs.includes(category) ? category : "",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Slices one page; out-of-range pages are clamped to the last page. */
export function paginate<T>(items: T[], requestedPage: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    totalPages,
    from: items.length === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, items.length),
  };
}
