"use server";

import { z } from "zod";

import { deleteRow, insertRow, readColumn, runAdminAction, updateRow } from "@/lib/admin/actions";
import { clearFileColumn, removeFile, replaceFileColumn } from "@/lib/admin/files";
import { idSchema, instructorSchema, type InstructorInput } from "@/lib/validation/admin";

// Assign instructors to courses with setCourseInstructors (actions/courses).

export async function createInstructor(values: InstructorInput) {
  return runAdminAction(instructorSchema, values, (v, db) => insertRow(db, "instructors", v));
}

export async function updateInstructor(id: string, values: InstructorInput) {
  return runAdminAction(z.object({ id: idSchema, values: instructorSchema }), { id, values }, (v, db) =>
    updateRow(db, "instructors", v.id, v.values),
  );
}

/** Hides the instructor everywhere without losing course assignments. */
export async function setInstructorActive(id: string, isActive: boolean) {
  return runAdminAction(z.object({ id: idSchema, is_active: z.boolean() }), { id, is_active: isActive }, (v, db) =>
    updateRow(db, "instructors", v.id, { is_active: v.is_active }),
  );
}

/** Permanently deletes the instructor and removes them from all courses. */
export async function deleteInstructor(id: string) {
  return runAdminAction(idSchema, id, async (rowId, db) => {
    const image = await readColumn(db, "instructors", rowId, "image");
    const deleted = await deleteRow(db, "instructors", rowId);
    await removeFile(db, image);
    return deleted;
  });
}

export async function uploadInstructorImage(id: string, formData: FormData) {
  return runAdminAction(idSchema, id, (rowId, db) =>
    replaceFileColumn(db, { table: "instructors", id: rowId, column: "image" }, "instructorImages", formData.get("file")),
  );
}

export async function removeInstructorImage(id: string) {
  return runAdminAction(idSchema, id, (rowId, db) =>
    clearFileColumn(db, { table: "instructors", id: rowId, column: "image" }),
  );
}
