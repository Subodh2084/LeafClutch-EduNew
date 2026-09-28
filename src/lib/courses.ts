import "server-only";

import { cache } from "react";

import { byDisplayOrder, throwIfError } from "@/lib/data";
import { getPublicClient } from "@/lib/supabase/public";
import type { Faq } from "@/types/content";
import type {
  Course,
  CourseBenefit,
  CourseCategory,
  CourseDetail,
  CourseInstallment,
  CourseLesson,
  CourseModule,
  CourseNavGroup,
  CourseTool,
  Instructor,
  UdemyBonusCourse,
} from "@/types/course";

// Public course data. Pages call these and pass the results to components as
// props. RLS guarantees only published courses (and their content) come back.

const COURSE_WITH_CATEGORY = "*, category:course_categories!inner(*)";

/** Published courses with their category, oldest first. Deduplicated per request. */
export const getPublishedCourses = cache(async (): Promise<Course[]> => {
  const { data, error } = await getPublicClient()
    .from("courses")
    .select(COURSE_WITH_CATEGORY)
    .eq("status", "published")
    .order("created_at");
  throwIfError(error, "load courses");
  return data as Course[];
});

export async function getFeaturedCourses(): Promise<Course[]> {
  return (await getPublishedCourses()).filter((course) => course.is_featured);
}


/** Categories that have at least one published course, in display order. */
export async function getCourseCategories(): Promise<CourseCategory[]> {
  const byId = new Map<string, CourseCategory>();
  for (const course of await getPublishedCourses()) byId.set(course.category.id, course.category);
  return [...byId.values()].sort(byDisplayOrder);
}

/** Categories with their published courses, for navigation menus. */
export async function getCourseNavigation(): Promise<CourseNavGroup[]> {
  const published = await getPublishedCourses();
  return (await getCourseCategories()).map((category) => ({
    category,
    courses: published
      .filter((course) => course.category_id === category.id)
      .map(({ id, name, slug }) => ({ id, name, slug })),
  }));
}

export async function getRelatedCourses(
  courseId: string,
  categoryId: string,
  limit = 3,
): Promise<Course[]> {
  return (await getPublishedCourses())
    .filter((course) => course.category_id === categoryId && course.id !== courseId)
    .slice(0, limit);
}

/** Active instructors, for the About page's mentors section. */
export async function getInstructors(): Promise<Instructor[]> {
  const { data, error } = await getPublicClient().from("instructors").select("*").order("created_at");
  throwIfError(error, "load instructors");
  return data as Instructor[];
}

/** Light lookup (course + category), e.g. for the enroll page. */
export async function getPublishedCourseBySlug(slug: string): Promise<Course | null> {
  return (await getPublishedCourses()).find((course) => course.slug === slug) ?? null;
}

// ---------------------------------------------------------------------------
// Course detail — one round trip for every section of /courses/[slug]
// ---------------------------------------------------------------------------

const COURSE_DETAIL = `
  ${COURSE_WITH_CATEGORY},
  benefits:course_benefits(*),
  modules:course_modules(*, lessons:course_lessons(*)),
  installments:course_installments(*),
  course_instructors(display_order, instructor:instructors(*)),
  faqs(*),
  tools:course_tools(id, name, icon, description, display_order),
  udemy_bonus_courses:course_udemy_bonus(*)
`;

interface CourseDetailRow extends Course {
  benefits: CourseBenefit[];
  modules: (CourseModule & { lessons: CourseLesson[] })[];
  installments: CourseInstallment[];
  // Inactive instructors are hidden by RLS and arrive as null.
  course_instructors: { display_order: number; instructor: Instructor | null }[];
  faqs: Faq[];
  tools: (CourseTool & { display_order: number })[];
  udemy_bonus_courses: (UdemyBonusCourse & { display_order: number })[];
}

/** A published course with everything its detail page shows, or null. */
export const getCourseBySlug = cache(async (slug: string): Promise<CourseDetail | null> => {
  const { data, error } = await getPublicClient()
    .from("courses")
    .select(COURSE_DETAIL)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  throwIfError(error, `load course "${slug}"`);
  if (!data) return null;

  const { course_instructors, ...row } = data as CourseDetailRow;

  return {
    ...row,
    // Hidden tools / bonus courses are filtered out by RLS.
    tools: row.tools.sort(byDisplayOrder).map(({ id, name, icon, description }) => ({ id, name, icon, description })),
    // A bonus course without a cover image isn't shown (the card needs one).
    udemy_bonus_courses: row.udemy_bonus_courses
      .filter((bonus) => bonus.image_url)
      .sort(byDisplayOrder)
      .map((bonus) => ({ ...bonus, rating: Number(bonus.rating) })),
    benefits: row.benefits.sort(byDisplayOrder),
    modules: row.modules
      .sort(byDisplayOrder)
      .map((module) => ({ ...module, lessons: module.lessons.sort(byDisplayOrder) })),
    installments: row.installments.sort(byDisplayOrder),
    instructors: course_instructors
      .sort(byDisplayOrder)
      .flatMap(({ instructor }) => (instructor ? [instructor] : [])),
    faqs: row.faqs.sort(byDisplayOrder),
  };
});
