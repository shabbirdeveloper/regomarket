"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import { useAuth } from "./auth-provider";

/**
 * Shows its children only to signed-in users. Everyone else gets a short
 * "Sign in to continue" card that brings them back here afterwards.
 */
export function RequireAuth({ children, title = "Sign in to continue", body }: { children: ReactNode; title?: string; body?: string }) {
  const { loading, user, needsProfile } = useAuth();
  const pathname = usePathname();
  // Keep the query too (e.g. /checkout?buy=…) so people land back on the same thing
  const [path, setPath] = useState(pathname);
  useEffect(() => setPath(window.location.pathname + window.location.search), [pathname]);

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-muted" aria-label="Loading" />
      </div>
    );
  }

  if (!user || needsProfile) {
    return (
      <div className="shell py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-mint text-mountain">
            <LockKeyhole className="size-6" aria-hidden />
          </span>
          <h1 className="mt-4 text-[22px] font-bold tracking-[-0.02em] text-ink">{needsProfile ? "Finish your account" : title}</h1>
          <p className="mt-2 text-[14.5px] text-muted">{body ?? "It takes a few seconds: we email you a 6-digit code, no password needed."}</p>
          <Link
            href={`/login?next=${encodeURIComponent(path)}`}
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-mountain px-8 text-[15px] font-semibold text-white hover:bg-mountain-hover"
          >
            {needsProfile ? "Continue" : "Sign in"}
          </Link>
          {!needsProfile && (
            <p className="mt-4 text-[13px] text-muted">
              New here?{" "}
              <Link href={`/signup?next=${encodeURIComponent(path)}`} className="font-semibold text-mountain hover:underline">
                Create an account
              </Link>
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
