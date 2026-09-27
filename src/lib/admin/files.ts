import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { UserError, readColumn, updateRow } from "@/lib/admin/actions";
import { buckets, detectFileType, extensions, type BucketKey } from "@/lib/storage";
import { getSupabaseEnv } from "@/lib/supabase/env";

// Uploads for admin actions. Files are validated by size and by their real
// content type, stored under a random name, and referenced by public URL.

/** Validates and uploads a file from FormData; returns its public URL. */
export async function uploadFile(supabase: SupabaseClient, key: BucketKey, file: FormDataEntryValue | null) {
  const bucket = buckets[key];

  if (!(file instanceof File) || file.size === 0) throw new UserError("Choose a file to upload.");
  if (file.size > bucket.maxBytes) {
    throw new UserError(`File is too large. The limit is ${bucket.maxBytes / (1024 * 1024)} MB.`);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectFileType(bytes);
  if (!type || !(bucket.types as readonly string[]).includes(type)) {
    throw new UserError(
      key === "courseCurriculums" ? "Upload a PDF file." : "Upload a JPG, PNG or WebP image.",
    );
  }

  const path = `${crypto.randomUUID()}.${extensions[type]}`;
  const { error } = await supabase.storage.from(bucket.id).upload(path, bytes, { contentType: type });
  if (error) throw error;

  return supabase.storage.from(bucket.id).getPublicUrl(path).data.publicUrl;
}

/**
 * Deletes a file we uploaded, given its public URL. Anything else (e.g. a
 * /public path from the seed data) is left alone. Best effort: a leftover
 * file is harmless, so failures are logged rather than failing the action.
 */
export async function removeFile(supabase: SupabaseClient, url: string | null) {
  const prefix = `${getSupabaseEnv().url}/storage/v1/object/public/`;
  if (!url?.startsWith(prefix)) return;

  const [bucketId, ...rest] = url.slice(prefix.length).split("/");
  const { error } = await supabase.storage.from(bucketId).remove([decodeURIComponent(rest.join("/"))]);
  if (error) console.error("Could not delete old file:", url, error);
}

/** Upload a new file into `table.column` for row `id`, then delete the file it replaces. */
export async function replaceFileColumn(
  supabase: SupabaseClient,
  target: { table: string; id: string; column: string },
  key: BucketKey,
  file: FormDataEntryValue | null,
) {
  const previous = await readColumn(supabase, target.table, target.id, target.column);
  const url = await uploadFile(supabase, key, file);
  try {
    await updateRow(supabase, target.table, target.id, { [target.column]: url });
  } catch (error) {
    await removeFile(supabase, url); // don't leave an orphan behind
    throw error;
  }
  await removeFile(supabase, previous);
  return { url };
}

/** Clear `table.column` for row `id` and delete the file it pointed to. */
export async function clearFileColumn(
  supabase: SupabaseClient,
  target: { table: string; id: string; column: string },
) {
  const previous = await readColumn(supabase, target.table, target.id, target.column);
  await updateRow(supabase, target.table, target.id, { [target.column]: null });
  await removeFile(supabase, previous);
  return null;
}
