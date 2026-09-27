import type { PostgrestError } from "@supabase/supabase-js";

// Small helpers shared by the data-access modules (lib/courses, lib/content, lib/training).

export const byDisplayOrder = (a: { display_order: number }, b: { display_order: number }) =>
  a.display_order - b.display_order;

/** Fails loudly so the route's error boundary shows, instead of rendering empty sections. */
export function throwIfError(error: PostgrestError | null, action: string): asserts error is null {
  if (error) throw new Error(`Could not ${action}: ${error.message}`);
}
