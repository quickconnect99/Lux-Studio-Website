import "server-only";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Checks server-only configuration without exposing the service-role key. */
export function isServiceRoleConfigured() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

/**
 * Creates a server-only Supabase client that can perform trusted API work.
 *
 * The service-role key bypasses RLS and must never reach a Client Component.
 * `null` makes missing configuration an explicit state for API routes.
 */
export function createAdminSupabaseClient() {
  if (!isServiceRoleConfigured()) {
    return null;
  }

  return createClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
