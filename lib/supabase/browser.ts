import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The one Supabase client used in the browser (sign-in, cart checkout,
 * orders, profile). The session is kept on this device (localStorage) and
 * refreshed automatically. Every read and write is protected by Row Level
 * Security in the database, so this public key can't see other people's data.
 *
 * detectSessionInUrl: the sign-in link in the email (as well as the 6-digit
 * code) also works: the tokens in the link are read once and removed.
 *
 * Returns null when Supabase isn't configured (local preview without .env.local).
 */
let client: SupabaseClient | null | undefined;

export function supabaseBrowser(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client =
    typeof window !== "undefined" && url && key
      ? createClient(url, key, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "rego-auth" },
        })
      : null;
  return client;
}

export const AUTH_ENABLED = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** Turn a Supabase / Postgres error into one short sentence for people. */
export function friendlyError(e: unknown): string {
  const m = (e as { message?: string })?.message ?? String(e);
  if (/rate limit|too many/i.test(m)) return "Too many tries. Please wait a minute and try again.";
  if (/expired|invalid.*(otp|token)|token.*(invalid|expired)/i.test(m)) return "That code is wrong or has expired. Ask for a new one.";
  if (/network|fetch/i.test(m)) return "No internet connection. Check your signal and try again.";
  if (/sign in/i.test(m)) return "Please sign in first.";
  return m.length < 160 ? m : "Something went wrong. Please try again.";
}
