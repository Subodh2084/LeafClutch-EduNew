"use server";

import { z } from "zod";

import { deleteRow, insertRow, readColumn, runAdminAction, updateRow } from "@/lib/admin/actions";
import { removeFile, replaceFileColumn, uploadFile } from "@/lib/admin/files";
import {
  idSchema,
  trainingPageImageSchema,
  trainingPageItemSchema,
  type TrainingPageImageInput,
  type TrainingPageItemInput,
} from "@/lib/validation/admin";

// Admin actions for the lists and images on the corporate / academic /
// government training pages.

// --- Features, programs, process steps -------------------------------------

export async function createTrainingPageItem(values: TrainingPageItemInput) {
  return runAdminAction(trainingPageItemSchema, values, (v, db) => insertRow(db, "training_page_items", v));
}

export async function updateTrainingPageItem(id: string, values: TrainingPageItemInput) {
  return runAdminAction(z.object({ id: idSchema, values: trainingPageItemSchema }), { id, values }, (v, db) =>
    updateRow(db, "training_page_items", v.id, v.values),
  );
}

export async function deleteTrainingPageItem(id: string) {
  return runAdminAction(idSchema, id, (rowId, db) => deleteRow(db, "training_page_items", rowId));
}

// --- Images (hero slider and why-choose-us collage) -------------------------

/** Uploads an image (JPG, PNG or WebP, max 5 MB) and adds it to a page. */
export async function addTrainingPageImage(values: TrainingPageImageInput, formData: FormData) {
  return runAdminAction(trainingPageImageSchema, values, async (v, db) => {
    const image_url = await uploadFile(db, "trainingImages", formData.get("file"));
    try {
      return await insertRow(db, "training_page_images", { ...v, image_url });
    } catch (error) {
      await removeFile(db, image_url);
      throw error;
    }
  });
}

/** Changes an image's description, order, placement or visibility. */
export async function updateTrainingPageImage(id: string, values: TrainingPageImageInput) {
  return runAdminAction(z.object({ id: idSchema, values: trainingPageImageSchema }), { id, values }, (v, db) =>
    updateRow(db, "training_page_images", v.id, v.values),
  );
}

/** Swaps the picture itself, keeping its description and position. */
export async function replaceTrainingPageImageFile(id: string, formData: FormData) {
  return runAdminAction(idSchema, id, (rowId, db) =>
    replaceFileColumn(db, { table: "training_page_images", id: rowId, column: "image_url" }, "trainingImages", formData.get("file")),
  );
}

export async function deleteTrainingPageImage(id: string) {
  return runAdminAction(idSchema, id, async (rowId, db) => {
    const url = await readColumn(db, "training_page_images", rowId, "image_url");
    const deleted = await deleteRow(db, "training_page_images", rowId);
    await removeFile(db, url);
    return deleted;
  });
}
