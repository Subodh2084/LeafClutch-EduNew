"use server";

import { z } from "zod";

import { deleteRow, insertRow, readColumn, runAdminAction, updateRow } from "@/lib/admin/actions";
import { clearFileColumn, removeFile, replaceFileColumn } from "@/lib/admin/files";
import { idSchema, trainingPartnerSchema, type TrainingPartnerInput } from "@/lib/validation/admin";

// Admin actions for the partners shown on the corporate / academic /
// government training pages.

export async function createTrainingPartner(values: TrainingPartnerInput) {
  return runAdminAction(trainingPartnerSchema, values, (v, db) => insertRow(db, "training_partners", v));
}

export async function updateTrainingPartner(id: string, values: TrainingPartnerInput) {
  return runAdminAction(z.object({ id: idSchema, values: trainingPartnerSchema }), { id, values }, (v, db) =>
    updateRow(db, "training_partners", v.id, v.values),
  );
}

/** Hides the partner without deleting it. */
export async function setTrainingPartnerActive(id: string, isActive: boolean) {
  return runAdminAction(z.object({ id: idSchema, is_active: z.boolean() }), { id, is_active: isActive }, (v, db) =>
    updateRow(db, "training_partners", v.id, { is_active: v.is_active }),
  );
}

export async function deleteTrainingPartner(id: string) {
  return runAdminAction(idSchema, id, async (rowId, db) => {
    const logo = await readColumn(db, "training_partners", rowId, "logo");
    const deleted = await deleteRow(db, "training_partners", rowId);
    await removeFile(db, logo);
    return deleted;
  });
}

/** Uploads or replaces the partner's logo (JPG, PNG or WebP). */
export async function uploadTrainingPartnerLogo(id: string, formData: FormData) {
  return runAdminAction(idSchema, id, (rowId, db) =>
    replaceFileColumn(db, { table: "training_partners", id: rowId, column: "logo" }, "trainingImages", formData.get("file")),
  );
}

export async function removeTrainingPartnerLogo(id: string) {
  return runAdminAction(idSchema, id, (rowId, db) =>
    clearFileColumn(db, { table: "training_partners", id: rowId, column: "logo" }),
  );
}
