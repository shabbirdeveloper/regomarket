"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, Lock } from "lucide-react";
import { adminSignIn } from "@/app/admin/login/actions";

export function AdminLoginForm({ mode }: { mode: "open" | "ready" | "locked" }) {
  const [state, action, pending] = useActionState(adminSignIn, {});
  const [show, setShow] = useState(false);

  if (mode === "locked") {
    return (
      <div className="rounded-2xl border border-line bg-white p-5 text-[14px] leading-relaxed text-ink/85">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <Lock className="size-4 text-gold-ink" aria-hidden /> Admin is locked
        </p>
        <p className="mt-2 text-muted">No admin password has been set on the server yet. On your computer, run:</p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-[#0f1a15] p-3 text-[12px] text-white">npx sst secret set AdminPassword &quot;your-strong-password&quot; --stage production</pre>
        <p className="mt-3 text-muted">Then deploy again (push to GitHub). Use at least 12 characters.</p>
      </div>
    );
  }

  if (mode === "open") {
    return (
      <div className="space-y-4">
        <p className="rounded-xl bg-gold-wash px-4 py-3 text-[13.5px] text-gold-ink">
          Development mode: no password is set, so the admin opens directly on this computer. The live site always needs a password.
        </p>
        <Link href="/admin" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-mountain text-[15px] font-semibold text-white hover:bg-mountain-hover">
          Open admin
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="admin-password" className="text-[14px] font-semibold text-ink">
          Password
        </label>
        <div className="relative mt-1.5">
          <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="admin-password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            autoFocus
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "admin-password-err" : undefined}
            className="h-12 w-full rounded-xl border border-line-strong bg-white pl-11 pr-12 text-[15px] outline-none focus:border-mountain focus:shadow-[0_0_0_4px_rgb(6_78_59/0.1)] aria-[invalid=true]:border-[#d92d20]"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-ink"
          >
            {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        </div>
        {state.error && (
          <p id="admin-password-err" className="mt-1.5 text-[13px] font-medium text-[#b42318]">
            {state.error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-mountain text-[15px] font-semibold text-white hover:bg-mountain-hover disabled:opacity-70"
      >
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Sign in
      </button>
      <p className="text-center text-[12.5px] text-muted">Signed in for 12 hours on this device.</p>
    </form>
  );
}
