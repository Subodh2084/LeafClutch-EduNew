import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/supabase/env";

let client: SupabaseClient | undefined;

/**
 * Anonymous client for public pages. It sends no cookies, so RLS only returns
 * published/active rows. Nothing is cached: every request reads fresh data, so
 * edits in Supabase show on the next page load.
 */
export function getPublicClient() {
  if (!client) {
    const { url, anonKey } = getSupabaseEnv();
    client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    });
  }
  return client;
}
