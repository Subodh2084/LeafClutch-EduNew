"use server";

import { z } from "zod";

import { deleteRow, insertRow, readColumn, runAdminAction, updateRow } from "@/lib/admin/actions";
import { clearFileColumn, removeFile, replaceFileColumn } from "@/lib/admin/files";
import {
  categorySchema,
  faqSchema,
  idSchema,
  testimonialSchema,
  type CategoryInput,
  type FaqInput,
  type TestimonialInput,
} from "@/lib/validation/admin";

// Admin actions for course categories, FAQs and testimonials.

// --- Categories -------------------------------------------------------------

export async function createCategory(values: CategoryInput) {
  return runAdminAction(categorySchema, values, (v, db) => insertRow(db, "course_categories", v));
}

export async function updateCategory(id: string, values: CategoryInput) {
  return runAdminAction(z.object({ id: idSchema, values: categorySchema }), { id, values }, (v, db) =>
    updateRow(db, "course_categories", v.id, v.values),
  );
}

/** Fails while courses still use the category (move or delete them first). */
export async function deleteCategory(id: string) {
  return runAdminAction(idSchema, id, async (rowId, db) => {
    const image = await readColumn(db, "course_categories", rowId, "image_url");
    const deleted = await deleteRow(db, "course_categories", rowId);
    await removeFile(db, image);
    return deleted;
  });
}

export async function uploadCategoryImage(id: string, formData: FormData) {
  return runAdminAction(idSchema, id, (rowId, db) =>
    replaceFileColumn(db, { table: "course_categories", id: rowId, column: "image_url" }, "courseThumbnails", formData.get("file")),
  );
}

export async function removeCategoryImage(id: string) {
  return runAdminAction(idSchema, id, (rowId, db) => clearFileColumn(db, { table: "course_categories", id: rowId, column: "image_url" }));
}

// --- FAQs -------------------------------------------------------------------

export async function createFaq(values: FaqInput) {
  return runAdminAction(faqSchema, values, (v, db) => insertRow(db, "faqs", v));
}

export async function updateFaq(id: string, values: FaqInput) {
  return runAdminAction(z.object({ id: idSchema, values: faqSchema }), { id, values }, (v, db) =>
    updateRow(db, "faqs", v.id, v.values),
  );
}

export async function deleteFaq(id: string) {
  return runAdminAction(idSchema, id, (rowId, db) => deleteRow(db, "faqs", rowId));
}

// --- Testimonials -----------------------------------------------------------

export async function createTestimonial(values: TestimonialInput) {
  return runAdminAction(testimonialSchema, values, (v, db) => insertRow(db, "testimonials", v));
}

export async function updateTestimonial(id: string, values: TestimonialInput) {
  return runAdminAction(z.object({ id: idSchema, values: testimonialSchema }), { id, values }, (v, db) =>
    updateRow(db, "testimonials", v.id, v.values),
  );
}

export async function deleteTestimonial(id: string) {
  return runAdminAction(idSchema, id, async (rowId, db) => {
    const image = await readColumn(db, "testimonials", rowId, "image");
    const deleted = await deleteRow(db, "testimonials", rowId);
    await removeFile(db, image);
    return deleted;
  });
}

export async function uploadTestimonialImage(id: string, formData: FormData) {
  return runAdminAction(idSchema, id, (rowId, db) =>
    replaceFileColumn(db, { table: "testimonials", id: rowId, column: "image" }, "instructorImages", formData.get("file")),
  );
}

export async function removeTestimonialImage(id: string) {
  return runAdminAction(idSchema, id, (rowId, db) => clearFileColumn(db, { table: "testimonials", id: rowId, column: "image" }));
}
