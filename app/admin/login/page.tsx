import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { adminMode, getAdmin } from "@/lib/admin/auth";
import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");
  const mode = adminMode();

  return (
    <div className="grid min-h-dvh bg-[#f6f4ee] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#06392d_0%,#021f18_100%)] p-12 text-white lg:flex lg:flex-col">
        <svg viewBox="0 0 800 400" className="absolute inset-x-0 bottom-0 w-full opacity-[0.18]" aria-hidden preserveAspectRatio="none">
          <path d="M0 400 L150 190 L240 280 L380 90 L520 260 L610 170 L800 330 L800 400 Z" fill="#E3C27E" />
          <path d="M0 400 L110 290 L220 350 L330 240 L470 330 L600 260 L800 380 L800 400 Z" fill="#ffffff" fillOpacity="0.5" />
        </svg>
        <div className="relative flex items-center gap-3">
          <svg viewBox="0 0 40 40" className="size-11" aria-hidden>
            <rect width="40" height="40" rx="10" fill="#0B4A39" />
            <path d="M6 29 L15.5 16.5 L20 22 L25.5 12.5 L34 29" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22.9 17 L25.5 12.5 L28 16.7 L26.4 15.9 L25.4 17 L24.2 16 Z" fill="#E3C27E" />
          </svg>
          <span className="text-[18px] font-bold">
            REGO<span className="text-gold-soft">MARKET</span>
          </span>
        </div>
        <div className="relative mt-auto max-w-md pb-24">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-soft">Admin console</p>
          <h1 className="mt-3 text-[34px] font-bold leading-tight tracking-[-0.02em]">Keep Gilgit-Baltistan&apos;s market safe and moving.</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-white/70">Approve ads, verify sellers, handle reports and orders — all in one place.</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-5">
        <div className="w-full max-w-sm">
          <span className="grid size-12 place-items-center rounded-2xl bg-mint text-mountain">
            <ShieldCheck className="size-6" aria-hidden />
          </span>
          <h2 className="mt-5 text-[26px] font-bold tracking-[-0.02em] text-ink">Admin sign in</h2>
          <p className="mt-1 text-[14px] text-muted">Only for the REGOMARKET team.</p>
          <div className="mt-7">
            <AdminLoginForm mode={mode} />
          </div>
        </div>
      </div>
    </div>
  );
}
