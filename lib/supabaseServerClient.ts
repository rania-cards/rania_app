import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the service role key.
 * This bypasses Row Level Security and is safe ONLY on the server.
 *
 * ENV REQUIRED:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SITE_URL (optional)
 * - SUPABASE_SERVICE_ROLE_KEY
 */
export function getServerSupabaseClient(): SupabaseClient {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in environment");
  }
  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY in environment. Create a service role key in Supabase → Project Settings → API, then add it to your Vercel project and .env.local (without NEXT_PUBLIC_).",
    );
  }

  supabase = createClient(url, serviceRoleKey, {
    auth: {
      // We are on the server, no need to persist a session.
      persistSession: false,
    },
  });

  return supabase;
}