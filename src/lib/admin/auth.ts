import "server-only";

import { createSessionClient } from "@/lib/supabase/server";

/**
 * The signed-in admin's Supabase client, or throws. Call it first in every
 * admin action: hiding a button is not a security boundary, since actions
 * can be called directly. RLS then re-checks the admin role on each write.
 */
export async function requireAdmin() {
  const supabase = await createSessionClient();

  // getUser() verifies the token with Supabase (getSession() would trust the cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new NotAdminError();

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) throw new NotAdminError();

  return supabase;
}

export class NotAdminError extends Error {
  constructor() {
    super("You must be signed in as an admin.");
  }
}

/** The signed-in admin's email, or null if the visitor isn't an admin. For pages; actions use requireAdmin. */
export async function getAdminEmail(): Promise<string | null> {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin } = await supabase.rpc("is_admin");
  return isAdmin ? (user.email ?? "admin") : null;
}
