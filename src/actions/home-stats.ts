"use server";

import { z } from "zod";

import { deleteRow, insertRow, runAdminAction, updateRow } from "@/lib/admin/actions";
import { homeStatSchema, idSchema, type HomeStatInput } from "@/lib/validation/admin";

// Admin actions for the home page stats ("1,000+ Students trained").

export async function createHomeStat(values: HomeStatInput) {
  return runAdminAction(homeStatSchema, values, (v, db) => insertRow(db, "home_stats", v));
}

export async function updateHomeStat(id: string, values: HomeStatInput) {
  return runAdminAction(z.object({ id: idSchema, values: homeStatSchema }), { id, values }, (v, db) =>
    updateRow(db, "home_stats", v.id, v.values),
  );
}

/** Hides the stat without deleting it. */
export async function setHomeStatActive(id: string, isActive: boolean) {
  return runAdminAction(z.object({ id: idSchema, is_active: z.boolean() }), { id, is_active: isActive }, (v, db) =>
    updateRow(db, "home_stats", v.id, { is_active: v.is_active }),
  );
}

export async function deleteHomeStat(id: string) {
  return runAdminAction(idSchema, id, (rowId, db) => deleteRow(db, "home_stats", rowId));
}
