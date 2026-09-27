"use server";

import { z } from "zod";

import { deleteRow, insertRow, readColumn, runAdminAction, updateRow } from "@/lib/admin/actions";
import { clearFileColumn, removeFile, replaceFileColumn, uploadFile } from "@/lib/admin/files";
import {
  idSchema,
  orderedItemSchema,
  trainingGalleryItemSchema,
  trainingProgramSchema,
  trainingStatusSchema,
  type OrderedItemInput,
  type TrainingGalleryItemInput,
  type TrainingProgramInput,
} from "@/lib/validation/admin";
import type { TrainingStatus } from "@/types/training";

// Admin actions for corporate / academic / government training programmes.

const withId = <S extends z.ZodType>(schema: S) => z.object({ id: idSchema, values: schema });

// --- Programme --------------------------------------------------------------

export async function createTrainingProgram(values: TrainingProgramInput) {
  return runAdminAction(trainingProgramSchema, values, (v, db) => insertRow(db, "training_programs", v));
}

export async function updateTrainingProgram(id: string, values: TrainingProgramInput) {
  return runAdminAction(withId(trainingProgramSchema), { id, values }, (v, db) =>
    updateRow(db, "training_programs", v.id, v.values),
  );
}

export async function setTrainingProgramStatus(id: string, status: TrainingStatus) {
  return runAdminAction(z.object({ id: idSchema, status: trainingStatusSchema }), { id, status }, (v, db) =>
    updateRow(db, "training_programs", v.id, { status: v.status }),
  );
}

/** Deletes the programme, its objectives/topics/gallery (cascade) and its images. */
export async function deleteTrainingProgram(id: string) {
  return runAdminAction(idSchema, id, async (programId, db) => {
    const thumbnail = await readColumn(db, "training_programs", programId, "thumbnail");
    const { data: gallery, error } = await db
      .from("training_gallery")
      .select("image_url")
      .eq("training_program_id", programId);
    if (error) throw error;

    const deleted = await deleteRow(db, "training_programs", programId);
    await Promise.all([thumbnail, ...gallery.map((g) => g.image_url as string)].map((url) => removeFile(db, url)));
    return deleted;
  });
}

export async function uploadTrainingThumbnail(id: string, formData: FormData) {
  return runAdminAction(idSchema, id, (programId, db) =>
    replaceFileColumn(db, { table: "training_programs", id: programId, column: "thumbnail" }, "trainingImages", formData.get("file")),
  );
}

export async function removeTrainingThumbnail(id: string) {
  return runAdminAction(idSchema, id, (programId, db) =>
    clearFileColumn(db, { table: "training_programs", id: programId, column: "thumbnail" }),
  );
}

// --- Objectives and topics (same shape) -------------------------------------

type ItemTable = "training_objectives" | "training_topics";

function itemActions(table: ItemTable) {
  return {
    create: (programId: string, values: OrderedItemInput) =>
      runAdminAction(withId(orderedItemSchema), { id: programId, values }, (v, db) =>
        insertRow(db, table, { ...v.values, training_program_id: v.id }),
      ),
    update: (id: string, values: OrderedItemInput) =>
      runAdminAction(withId(orderedItemSchema), { id, values }, (v, db) => updateRow(db, table, v.id, v.values)),
    remove: (id: string) => runAdminAction(idSchema, id, (rowId, db) => deleteRow(db, table, rowId)),
  };
}

const objectives = itemActions("training_objectives");
const topics = itemActions("training_topics");

export async function createTrainingObjective(programId: string, values: OrderedItemInput) {
  return objectives.create(programId, values);
}
export async function updateTrainingObjective(id: string, values: OrderedItemInput) {
  return objectives.update(id, values);
}
export async function deleteTrainingObjective(id: string) {
  return objectives.remove(id);
}

export async function createTrainingTopic(programId: string, values: OrderedItemInput) {
  return topics.create(programId, values);
}
export async function updateTrainingTopic(id: string, values: OrderedItemInput) {
  return topics.update(id, values);
}
export async function deleteTrainingTopic(id: string) {
  return topics.remove(id);
}

// --- Gallery ----------------------------------------------------------------

/** Adds a photo; the image is the "file" field of formData. */
export async function addTrainingGalleryImage(
  programId: string,
  values: TrainingGalleryItemInput,
  formData: FormData,
) {
  return runAdminAction(withId(trainingGalleryItemSchema), { id: programId, values }, async (v, db) => {
    const image_url = await uploadFile(db, "trainingImages", formData.get("file"));
    try {
      return await insertRow(db, "training_gallery", { ...v.values, image_url, training_program_id: v.id });
    } catch (error) {
      await removeFile(db, image_url);
      throw error;
    }
  });
}

export async function updateTrainingGalleryImage(id: string, values: TrainingGalleryItemInput) {
  return runAdminAction(withId(trainingGalleryItemSchema), { id, values }, (v, db) =>
    updateRow(db, "training_gallery", v.id, v.values),
  );
}

export async function deleteTrainingGalleryImage(id: string) {
  return runAdminAction(idSchema, id, async (rowId, db) => {
    const url = await readColumn(db, "training_gallery", rowId, "image_url");
    const deleted = await deleteRow(db, "training_gallery", rowId);
    await removeFile(db, url);
    return deleted;
  });
}
