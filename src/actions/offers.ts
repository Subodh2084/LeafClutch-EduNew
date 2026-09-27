"use server";

import { z } from "zod";

import { deleteRow, insertRow, readColumn, runAdminAction, updateRow } from "@/lib/admin/actions";
import { clearFileColumn, removeFile, replaceFileColumn } from "@/lib/admin/files";
import { idSchema, offerSchema, type OfferInput } from "@/lib/validation/admin";

export async function createOffer(values: OfferInput) {
  return runAdminAction(offerSchema, values, (v, db) => insertRow(db, "offers", v));
}

export async function updateOffer(id: string, values: OfferInput) {
  return runAdminAction(z.object({ id: idSchema, values: offerSchema }), { id, values }, (v, db) =>
    updateRow(db, "offers", v.id, v.values),
  );
}

export async function setOfferActive(id: string, isActive: boolean) {
  return runAdminAction(z.object({ id: idSchema, is_active: z.boolean() }), { id, is_active: isActive }, (v, db) =>
    updateRow(db, "offers", v.id, { is_active: v.is_active }),
  );
}

export async function deleteOffer(id: string) {
  return runAdminAction(idSchema, id, async (rowId, db) => {
    const thumbnail = await readColumn(db, "offers", rowId, "thumbnail");
    const deleted = await deleteRow(db, "offers", rowId);
    await removeFile(db, thumbnail);
    return deleted;
  });
}

export async function uploadOfferThumbnail(id: string, formData: FormData) {
  return runAdminAction(idSchema, id, (rowId, db) =>
    replaceFileColumn(db, { table: "offers", id: rowId, column: "thumbnail" }, "offerImages", formData.get("file")),
  );
}

export async function removeOfferThumbnail(id: string) {
  return runAdminAction(idSchema, id, (rowId, db) =>
    clearFileColumn(db, { table: "offers", id: rowId, column: "thumbnail" }),
  );
}
