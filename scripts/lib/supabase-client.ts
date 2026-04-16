/**
 * supabase-client.ts
 * Creates an admin (service-role) Supabase client for use in Node.js scripts.
 *
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY
 * Scripts must call loadEnvConfig(process.cwd()) before using this module.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _adminClient: SupabaseClient | null = null;

/**
 * Returns a lazily-created singleton admin client.
 * Throws early with a clear message if env vars are missing.
 */
export function getAdminClient(): SupabaseClient {
  if (_adminClient) return _adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url) {
    throw new Error(
      "[supabase-client] NEXT_PUBLIC_SUPABASE_URL is not set. " +
        "Run loadEnvConfig(process.cwd()) before calling getAdminClient()."
    );
  }
  if (!key) {
    throw new Error(
      "[supabase-client] SUPABASE_SECRET_KEY is not set. " +
        "Run loadEnvConfig(process.cwd()) before calling getAdminClient()."
    );
  }

  _adminClient = createClient(url, key, {
    auth: { persistSession: false },
  });

  return _adminClient;
}
