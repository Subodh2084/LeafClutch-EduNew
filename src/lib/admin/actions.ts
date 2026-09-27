import "server-only";

import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { NotAdminError, requireAdmin } from "@/lib/admin/auth";

// Plumbing shared by every admin server action in src/actions:
// validate → check admin → run → return a plain result. Public pages read
// live data, so changes show on the next page load without any cache refresh.

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

/** An error whose message is safe to show to the admin. */
export class UserError extends Error {}

/** Validates `input` with `schema`, then runs `action` as the signed-in admin. */
export async function runAdminAction<S extends z.ZodType, T>(
  schema: S,
  input: unknown,
  action: (values: z.output<S>, supabase: SupabaseClient) => Promise<T>,
): Promise<ActionResult<T>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[] | undefined>,
    };
  }
  return withAdmin((supabase) => action(parsed.data, supabase));
}

/** Runs `action` as the signed-in admin. */
export async function withAdmin<T>(
  action: (supabase: SupabaseClient) => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const supabase = await requireAdmin();
    return { ok: true, data: await action(supabase) };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

function toMessage(error: unknown): string {
  if (error instanceof NotAdminError || error instanceof UserError) return error.message;

  // Postgres / PostgREST codes → messages an admin can act on.
  switch ((error as Partial<PostgrestError>)?.code) {
    case "23505":
      return "That slug is already used. Choose another.";
    case "23503":
      return "This item is linked to other records. Remove those links first.";
    case "23514":
      return "Some values aren't allowed. Check prices, links and slugs.";
    case "PGRST116":
      return "That item no longer exists.";
  }

  console.error("Admin action failed:", error);
  return "Something went wrong. Please try again.";
}

// ---------------------------------------------------------------------------
// Row helpers. Each throws the Supabase error, which toMessage() translates.
// ---------------------------------------------------------------------------

async function must<T>(query: PromiseLike<{ data: T | null; error: PostgrestError | null }>): Promise<T> {
  const { data, error } = await query;
  if (error) throw error;
  return data as T;
}

export function insertRow(supabase: SupabaseClient, table: string, values: object) {
  return must<{ id: string }>(supabase.from(table).insert(values).select("id").single());
}

export function updateRow(supabase: SupabaseClient, table: string, id: string, values: object) {
  return must<{ id: string }>(supabase.from(table).update(values).eq("id", id).select("id").single());
}

export function deleteRow(supabase: SupabaseClient, table: string, id: string) {
  return must<{ id: string }>(supabase.from(table).delete().eq("id", id).select("id").single());
}

/** Reads one column of one row, e.g. the current thumbnail URL before replacing it. */
export async function readColumn(supabase: SupabaseClient, table: string, id: string, column: string) {
  const row = await must<Record<string, string | null>>(
    supabase.from(table).select(column).eq("id", id).single(),
  );
  return row[column] ?? null;
}

/**
 * Makes a join table hold exactly `rows` for one parent: upserts the wanted
 * links, then deletes the rest. If the second step fails, extra links remain
 * (visible, retryable) rather than the parent losing all its links.
 */
export async function replaceLinks(
  supabase: SupabaseClient,
  table: string,
  parent: { column: string; id: string },
  child: { column: string; ids: string[] },
  extra: (id: string, index: number) => object = () => ({}),
) {
  if (child.ids.length > 0) {
    const rows = child.ids.map((id, i) => ({ [parent.column]: parent.id, [child.column]: id, ...extra(id, i) }));
    await must(supabase.from(table).upsert(rows, { onConflict: `${parent.column},${child.column}` }));
  }

  let stale = supabase.from(table).delete().eq(parent.column, parent.id);
  if (child.ids.length > 0) stale = stale.not(child.column, "in", `(${child.ids.join(",")})`);
  await must(stale);
}
