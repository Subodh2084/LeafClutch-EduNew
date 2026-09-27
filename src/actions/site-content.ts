"use server";

import { z } from "zod";

import { deleteRow, insertRow, runAdminAction, updateRow } from "@/lib/admin/actions";
import { uploadFile } from "@/lib/admin/files";
import {
  aboutItemSchema,
  idSchema,
  siteSettingsSchema,
  type AboutItemInput,
  type SiteSettingsInput,
} from "@/lib/validation/admin";

// Admin actions for site settings and the About page cards.

/** Contact details, social links and opening hours (the single site_settings row). */
export async function updateSiteSettings(values: SiteSettingsInput, files?: Record<string, File> | File) {
  return runAdminAction(siteSettingsSchema, values, async (v, db) => {
    const fileMap: Record<string, File> = {};
    if (files instanceof File) {
      fileMap.logo_url = files;
    } else if (files && typeof files === "object") {
      Object.assign(fileMap, files);
    }

    const updates: Record<string, string | null> = {};
    for (const [key, file] of Object.entries(fileMap)) {
      if (file && file instanceof File && file.size > 0) {
        updates[key] = await uploadFile(db, "courseThumbnails", file);
      }
    }

    const payload = { id: 1, ...v, ...updates };
    const { data, error } = await db.from("site_settings").upsert(payload).select("id").single();
    if (error) throw error;
    return data;
  });
}

// --- About page cards: values, features, learning steps ----------------------

export async function createAboutItem(values: AboutItemInput) {
  return runAdminAction(aboutItemSchema, values, (v, db) => insertRow(db, "about_items", v));
}

export async function updateAboutItem(id: string, values: AboutItemInput) {
  return runAdminAction(z.object({ id: idSchema, values: aboutItemSchema }), { id, values }, (v, db) =>
    updateRow(db, "about_items", v.id, v.values),
  );
}

export async function deleteAboutItem(id: string) {
  return runAdminAction(idSchema, id, (rowId, db) => deleteRow(db, "about_items", rowId));
}
