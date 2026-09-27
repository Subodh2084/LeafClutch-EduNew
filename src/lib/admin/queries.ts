import "server-only";

import { cache } from "react";

import { requireAdmin } from "@/lib/admin/auth";
import { byDisplayOrder, throwIfError } from "@/lib/data";
import type { Offer } from "@/types/content";
import type { TrainingType } from "@/types/training";

// Reads for the admin panel. They run as the signed-in admin, so unlike the
// public queries they include drafts, hidden rows and inactive items.

type Row = Record<string, unknown> & { id: string };

const adminClient = cache(requireAdmin);

async function listRows(
  table: string,
  { order = "display_order", filters = {} }: { order?: string; filters?: Record<string, string | null> } = {},
): Promise<Row[]> {
  let query = (await adminClient()).from(table).select("*");
  for (const [column, value] of Object.entries(filters)) {
    query = value === null ? query.is(column, null) : query.eq(column, value);
  }
  const { data, error } = await query.order(order);
  throwIfError(error, `load ${table}`);
  return data as Row[];
}

export async function getAdminCourses() {
  const db = await adminClient();
  const { data, error } = await db
    .from("courses")
    .select("id, name, slug, status, is_featured, actual_price, discount_price, training_types, category:course_categories(name)")
    .order("created_at");
  throwIfError(error, "load courses");
  return data as unknown as (Row & {
    name: string;
    slug: string;
    status: string;
    is_featured: boolean;
    actual_price: number;
    discount_price: number | null;
    training_types: string[];
    category: { name: string } | null;
  })[];
}

/** One course with everything its edit page manages. */
export async function getAdminCourse(id: string) {
  const db = await adminClient();
  const { data, error } = await db
    .from("courses")
    .select(
      `*,
       benefits:course_benefits(*),
       modules:course_modules(*, lessons:course_lessons(*)),
       installments:course_installments(*),
       course_instructors(instructor_id, display_order)`,
    )
    .eq("id", id)
    .maybeSingle();
  throwIfError(error, "load course");
  if (!data) return null;

  type Ordered = Row & { display_order: number };
  type Module = Ordered & { lessons: Ordered[] };
  const { benefits, modules, installments, course_instructors, ...fields } = data as Row & {
    benefits: Ordered[];
    modules: Module[];
    installments: Ordered[];
    course_instructors: { instructor_id: string; display_order: number }[];
  };
  return {
    /** The course's own columns. */
    fields: fields as Row,
    benefits: benefits.sort(byDisplayOrder),
    modules: modules.sort(byDisplayOrder).map((module): Module => ({ ...module, lessons: module.lessons.sort(byDisplayOrder) })),
    installments: installments.sort(byDisplayOrder),
    instructorIds: course_instructors.sort(byDisplayOrder).map((link) => link.instructor_id),
  };
}

export const getAdminCategories = () => listRows("course_categories");
export const getAdminInstructors = () => listRows("instructors", { order: "name" });
export const getAdminFaqs = () => listRows("faqs");
export const getAdminTestimonials = () => listRows("testimonials");
export const getAdminHomeStats = () => listRows("home_stats");
export const getAdminAboutItems = () => listRows("about_items");
export const getAdminSharedSteps = () =>
  listRows("training_page_items", { filters: { section: "process_step", type: null } });

export async function getAdminTrainingPage(type: TrainingType) {
  const [partners, items, images] = await Promise.all([
    listRows("training_partners", { filters: { type } }),
    listRows("training_page_items", { filters: { type } }),
    listRows("training_page_images", { filters: { type } }),
  ]);
  return {
    partners,
    features: items.filter((item) => item.section === "feature"),
    programs: items.filter((item) => item.section === "program"),
    steps: items.filter((item) => item.section === "process_step"),
    images,
  };
}

export async function getAdminSiteSettings() {
  const db = await adminClient();
  const { data, error } = await db.from("site_settings").select("*").eq("id", 1).maybeSingle();
  throwIfError(error, "load site settings");
  return data as Row | null;
}

/** Course names for pickers (FAQ / testimonial "related course"). */
export async function getAdminCourseOptions() {
  const courses = await getAdminCourses();
  return courses.map((course) => ({ value: course.id, label: course.name }));
}

export async function getAdminOffers() {
  const db = await adminClient();
  const { data, error } = await db
    .from("offers")
    .select("*, course:courses(name)")
    .order("display_order");
  throwIfError(error, "load offers");
  type Row = Omit<Offer, "course_name"> & { course: { name: string } | null };
  return (data as Row[]).map(({ course, ...rest }) => ({
    ...rest,
    course_name: course?.name ?? null,
  }));
}

export async function getAdminCounts() {
  const db = await adminClient();
  const tables = ["courses", "instructors", "faqs", "testimonials", "training_partners"] as const;
  const counts = await Promise.all(
    tables.map(async (table) => {
      const { count, error } = await db.from(table).select("id", { count: "exact", head: true });
      throwIfError(error, `count ${table}`);
      return [table, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(counts) as Record<(typeof tables)[number], number>;
}
