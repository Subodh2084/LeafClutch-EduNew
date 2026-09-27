"use server";

import { z } from "zod";

import {
  deleteRow,
  insertRow,
  readColumn,
  replaceLinks,
  runAdminAction,
  updateRow,
} from "@/lib/admin/actions";
import { clearFileColumn, removeFile, replaceFileColumn } from "@/lib/admin/files";
import {
  courseBenefitSchema,
  courseInstallmentSchema,
  courseInstructorIdsSchema,
  courseSchema,
  courseStatusSchema,
  idSchema,
  orderedItemSchema,
  type CourseBenefitInput,
  type CourseInput,
  type CourseInstallmentInput,
  type OrderedItemInput,
} from "@/lib/validation/admin";
import type { CourseStatus } from "@/types/course";

// Admin actions for courses and everything on the course detail page.
// Every action returns ActionResult ({ ok, data } or { ok: false, error }).

const withId = <S extends z.ZodType>(schema: S) => z.object({ id: idSchema, values: schema });

// --- Course -----------------------------------------------------------------

export async function createCourse(values: CourseInput) {
  return runAdminAction(courseSchema, values, (v, db) => insertRow(db, "courses", v));
}

export async function updateCourse(id: string, values: CourseInput) {
  return runAdminAction(withId(courseSchema), { id, values }, (v, db) =>
    updateRow(db, "courses", v.id, v.values),
  );
}

export async function setCourseStatus(id: string, status: CourseStatus) {
  return runAdminAction(z.object({ id: idSchema, status: courseStatusSchema }), { id, status }, (v, db) =>
    updateRow(db, "courses", v.id, { status: v.status }),
  );
}

/** Deletes the course, its benefits/curriculum/links (cascade) and its uploaded files. */
export async function deleteCourse(id: string) {
  return runAdminAction(idSchema, id, async (courseId, db) => {
    const thumbnail = await readColumn(db, "courses", courseId, "thumbnail");
    const pdf = await readColumn(db, "courses", courseId, "curriculum_pdf_url");
    const deleted = await deleteRow(db, "courses", courseId);
    await Promise.all([removeFile(db, thumbnail), removeFile(db, pdf)]);
    return deleted;
  });
}

// --- Files (FormData with a "file" field) -----------------------------------

export async function uploadCourseThumbnail(id: string, formData: FormData) {
  return runAdminAction(idSchema, id, (courseId, db) =>
    replaceFileColumn(db, { table: "courses", id: courseId, column: "thumbnail" }, "courseThumbnails", formData.get("file")),
  );
}

export async function removeCourseThumbnail(id: string) {
  return runAdminAction(idSchema, id, (courseId, db) =>
    clearFileColumn(db, { table: "courses", id: courseId, column: "thumbnail" }),
  );
}

/** Uploads or replaces the curriculum PDF (PDF only, max 10 MB). */
export async function uploadCurriculumPdf(id: string, formData: FormData) {
  return runAdminAction(idSchema, id, (courseId, db) =>
    replaceFileColumn(
      db,
      { table: "courses", id: courseId, column: "curriculum_pdf_url" },
      "courseCurriculums",
      formData.get("file"),
    ),
  );
}

export async function removeCurriculumPdf(id: string) {
  return runAdminAction(idSchema, id, (courseId, db) =>
    clearFileColumn(db, { table: "courses", id: courseId, column: "curriculum_pdf_url" }),
  );
}

// --- Benefits ("What You Will Get") -----------------------------------------

export async function createCourseBenefit(courseId: string, values: CourseBenefitInput) {
  return runAdminAction(withId(courseBenefitSchema), { id: courseId, values }, (v, db) =>
    insertRow(db, "course_benefits", { ...v.values, course_id: v.id }),
  );
}

export async function updateCourseBenefit(id: string, values: CourseBenefitInput) {
  return runAdminAction(withId(courseBenefitSchema), { id, values }, (v, db) =>
    updateRow(db, "course_benefits", v.id, v.values),
  );
}

export async function deleteCourseBenefit(id: string) {
  return runAdminAction(idSchema, id, (rowId, db) => deleteRow(db, "course_benefits", rowId));
}

// --- Curriculum: modules and lessons ----------------------------------------

export async function createCourseModule(courseId: string, values: OrderedItemInput) {
  return runAdminAction(withId(orderedItemSchema), { id: courseId, values }, (v, db) =>
    insertRow(db, "course_modules", { ...v.values, course_id: v.id }),
  );
}

export async function updateCourseModule(id: string, values: OrderedItemInput) {
  return runAdminAction(withId(orderedItemSchema), { id, values }, (v, db) =>
    updateRow(db, "course_modules", v.id, v.values),
  );
}

/** Also deletes the module's lessons. */
export async function deleteCourseModule(id: string) {
  return runAdminAction(idSchema, id, (rowId, db) => deleteRow(db, "course_modules", rowId));
}

export async function createCourseLesson(moduleId: string, values: OrderedItemInput) {
  return runAdminAction(withId(orderedItemSchema), { id: moduleId, values }, (v, db) =>
    insertRow(db, "course_lessons", { ...v.values, module_id: v.id }),
  );
}

export async function updateCourseLesson(id: string, values: OrderedItemInput) {
  return runAdminAction(withId(orderedItemSchema), { id, values }, (v, db) =>
    updateRow(db, "course_lessons", v.id, v.values),
  );
}

export async function deleteCourseLesson(id: string) {
  return runAdminAction(idSchema, id, (rowId, db) => deleteRow(db, "course_lessons", rowId));
}

// --- Instalments ------------------------------------------------------------

export async function createCourseInstallment(courseId: string, values: CourseInstallmentInput) {
  return runAdminAction(withId(courseInstallmentSchema), { id: courseId, values }, (v, db) =>
    insertRow(db, "course_installments", { ...v.values, course_id: v.id }),
  );
}

export async function updateCourseInstallment(id: string, values: CourseInstallmentInput) {
  return runAdminAction(withId(courseInstallmentSchema), { id, values }, (v, db) =>
    updateRow(db, "course_installments", v.id, v.values),
  );
}

export async function deleteCourseInstallment(id: string) {
  return runAdminAction(idSchema, id, (rowId, db) => deleteRow(db, "course_installments", rowId));
}

// --- Assignments ------------------------------------------------------------

/** Sets the course's instructors; array order is display order. */
export async function setCourseInstructors(courseId: string, instructorIds: string[]) {
  return runAdminAction(withId(courseInstructorIdsSchema), { id: courseId, values: instructorIds }, (v, db) =>
    replaceLinks(
      db,
      "course_instructors",
      { column: "course_id", id: v.id },
      { column: "instructor_id", ids: v.values },
      (_, index) => ({ display_order: index + 1 }),
    ),
  );
}
