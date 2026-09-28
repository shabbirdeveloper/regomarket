import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminRole } from "./types";

/**
 * Admin access — step 1 (until Supabase phone login is live).
 *
 * One strong password, kept as a server-only secret:
 *   production: `npx sst secret set AdminPassword "<12+ characters>" --stage production`
 *   local dev:  ADMIN_PASSWORD=... in .env.local (or leave it out: dev opens without a password)
 * It is never sent to the browser. After sign-in the browser keeps an
 * httpOnly cookie holding an HMAC of the password, valid for 12 hours.
 *
 * Step 2 (with Supabase Auth): the same `requireAdmin()` will read the Supabase
 * session and the `admins` table (role), see supabase/migrations/*_admin.sql.
 */

const COOKIE = "rego_admin";
const MAX_AGE = 60 * 60 * 12;
const MIN_LENGTH = 12;

function password() {
  const p = process.env.ADMIN_PASSWORD ?? "";
  return p.length >= MIN_LENGTH && p !== "not-set" ? p : null;
}

const isDev = process.env.NODE_ENV !== "production";

/** "open": dev without a password · "ready": password set · "locked": production without a password */
export function adminMode(): "open" | "ready" | "locked" {
  if (password()) return "ready";
  return isDev ? "open" : "locked";
}

function token(p: string) {
  return createHmac("sha256", p).update("regomarket-admin-v1").digest("hex");
}

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export interface AdminSession {
  name: string;
  role: AdminRole;
  initials: string;
}

const OWNER: AdminSession = { name: "Shabbir Hussain", role: "owner", initials: "SH" };

export async function getAdmin(): Promise<AdminSession | null> {
  const mode = adminMode();
  if (mode === "open") return OWNER;
  if (mode === "locked") return null;
  const jar = await cookies();
  const v = jar.get(COOKIE)?.value;
  return v && same(v, token(password()!)) ? OWNER : null;
}

/** Call at the top of every admin page and server action. */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function signInAdmin(input: string): Promise<boolean> {
  const p = password();
  if (!p) return false;
  const ok = same(token(input), token(p));
  if (!ok) {
    // Slow down guessing
    await new Promise((r) => setTimeout(r, 900));
    return false;
  }
  const jar = await cookies();
  jar.set(COOKIE, token(p), {
    httpOnly: true,
    secure: !isDev,
    sameSite: "strict",
    path: "/admin",
    maxAge: MAX_AGE,
  });
  return true;
}

export async function signOutAdmin() {
  const jar = await cookies();
  jar.delete({ name: COOKIE, path: "/admin" });
}
