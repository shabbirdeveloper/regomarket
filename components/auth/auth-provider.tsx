"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DistrictSlug, SellerType, VerificationLevel } from "@/types";
import { AUTH_ENABLED, supabaseBrowser } from "@/lib/supabase/browser";

export interface Profile {
  sellerId: string;
  name: string;
  type: SellerType;
  district?: DistrictSlug;
  town?: string;
  phoneMasked: string;
  verifications: VerificationLevel[];
  memberSince: string;
  shopSlug?: string;
}

interface AuthState {
  /** Supabase is configured (false = local preview with demo data) */
  enabled: boolean;
  /** Still reading the session from this device */
  loading: boolean;
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  /** Name not set yet → show the "Almost done" step */
  needsProfile: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

type Row = {
  id: string;
  name: string;
  type: SellerType;
  district: DistrictSlug | null;
  town: string | null;
  phone_masked: string;
  verifications: VerificationLevel[];
  member_since: string;
  shop_slug: string | null;
};

const toProfile = (r: Row): Profile => ({
  sellerId: r.id,
  name: r.name,
  type: r.type,
  district: r.district ?? undefined,
  town: r.town ?? undefined,
  phoneMasked: r.phone_masked,
  verifications: r.verifications ?? [],
  memberSince: r.member_since,
  shopSlug: r.shop_slug ?? undefined,
});

/** Keeps the signed-in user and their profile (sellers row) for every page. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(AUTH_ENABLED);
  const [user, setUser] = useState<AuthState["user"]>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (uid: string | undefined) => {
    const db = supabaseBrowser();
    if (!db || !uid) {
      setProfile(null);
      return;
    }
    const { data } = await db
      .from("sellers")
      .select("id,name,type,district,town,phone_masked,verifications,member_since,shop_slug")
      .eq("user_id", uid)
      .maybeSingle<Row>();
    setProfile(data ? toProfile(data) : null);
  }, []);

  useEffect(() => {
    const db = supabaseBrowser();
    if (!db) {
      setLoading(false);
      return;
    }
    let alive = true;
    db.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      const u = data.session?.user;
      setUser(u ? { id: u.id, email: u.email } : null);
      await loadProfile(u?.id);
      if (alive) setLoading(false);
    });
    const { data: sub } = db.auth.onAuthStateChange((event, session) => {
      const u = session?.user;
      setUser(u ? { id: u.id, email: u.email } : null);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        // Don't await inside the callback (supabase-js deadlock rule)
        setTimeout(() => loadProfile(u?.id), 0);
      }
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(() => loadProfile(user?.id), [loadProfile, user?.id]);

  const signOut = useCallback(async () => {
    await supabaseBrowser()?.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      enabled: AUTH_ENABLED,
      loading,
      user,
      profile,
      needsProfile: Boolean(user && profile && (!profile.name || profile.name === "New user")),
      refreshProfile,
      signOut,
    }),
    [loading, user, profile, refreshProfile, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export const initialsOf = (name: string) =>
  name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "ME";
