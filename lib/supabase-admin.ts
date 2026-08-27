import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

function getServiceRoleConfiguration() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  };
}

/** Checks server-only configuration without exposing the service-role key. */
export function isServiceRoleConfigured() {
  const { supabaseUrl, serviceRoleKey } = getServiceRoleConfiguration();
  return Boolean(supabaseUrl && serviceRoleKey);
}

/**
 * Creates a server-only Supabase client that can perform trusted API work.
 *
 * The service-role key bypasses RLS and must never reach a Client Component.
 * `null` makes missing configuration an explicit state for API routes.
 */
export function createAdminSupabaseClient() {
  const { supabaseUrl, serviceRoleKey } = getServiceRoleConfiguration();

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
