import type { Faq } from "@/types/content";
import type { TrainingType } from "@/types/training";

export type CourseStatus = "draft" | "published" | "archived";

export type LearningMode = "online" | "physical" | "hybrid";

export interface CourseCategory {
  id: string;
  name: string;
  short_name: string;
  slug: string;
  description: string | null;
  display_order: number;
  image_url: string | null;
}

export interface Course {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  /** Paragraphs separated by a blank line. */
  description: string;
  thumbnail: string | null;
  category_id: string;
  category: CourseCategory;
  actual_price: number;
  discount_price: number | null;
  duration: string;
  learning_mode: LearningMode;
  curriculum_pdf_url: string | null;
  udemy_url: string | null;
  certificate_available: boolean;
  is_featured: boolean;
  status: CourseStatus;
  /** Training pages this course is offered on. Will become a join table. */
  training_types?: TrainingType[];
}

export interface CourseBenefit {
  id: string;
  course_id: string;
  title: string;
  description: string;
  display_order: number;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  display_order: number;
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  display_order: number;
}

export interface CourseModuleWithLessons extends CourseModule {
  lessons: CourseLesson[];
}

export interface Instructor {
  id: string;
  name: string;
  image: string | null;
  designation: string;
  bio: string;
  linkedin_url: string | null;
  is_active: boolean;
}

/** Join between courses and instructors. */
export interface CourseInstructor {
  course_id: string;
  instructor_id: string;
  display_order: number;
}

export interface CourseInstallment {
  id: string;
  course_id: string;
  title: string;
  percentage: number;
  description: string;
  display_order: number;
}

/** A category with its courses, as used by navigation menus. */
export interface CourseNavGroup {
  category: CourseCategory;
  courses: Pick<Course, "id" | "name" | "slug">[];
}

/** Course as stored; `category` is resolved by the data layer. */
export type CourseRecord = Omit<Course, "category">;

/** Everything the /courses/[slug] page needs, loaded in one query. */
export interface CourseDetail extends Course {
  benefits: CourseBenefit[];
  modules: CourseModuleWithLessons[];
  instructors: Instructor[];
  installments: CourseInstallment[];
  faqs: Faq[];
}
