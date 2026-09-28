"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, ExternalLink, LogOut, Menu, Search, X } from "lucide-react";
import { ADMIN_MODULES, MODULE_GROUPS, ROLE_LABEL, canOpen, type AdminModule } from "@/lib/admin/modules";
import { cn } from "@/lib/utils";
import { useAdmin } from "../store";
import { CommandPalette } from "./command-palette";

function isActive(pathname: string, m: AdminModule) {
  return m.href === "/admin" ? pathname === "/admin" : pathname === m.href || pathname.startsWith(m.href + "/");
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5 px-2">
      <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden>
        <rect width="40" height="40" rx="10" fill="#0B4A39" />
        <path d="M6 29 L15.5 16.5 L20 22 L25.5 12.5 L34 29" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22.9 17 L25.5 12.5 L28 16.7 L26.4 15.9 L25.4 17 L24.2 16 Z" fill="#E3C27E" />
      </svg>
      <span className="leading-none">
        <span className="block text-[15px] font-bold tracking-[-0.01em] text-white">
          REGO<span className="text-gold-soft">MARKET</span>
        </span>
        <span className="mt-1 block text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/50">Admin console</span>
      </span>
    </Link>
  );
}

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { admin, queueCount, ready } = useAdmin();
  const mods = ADMIN_MODULES.filter((m) => canOpen(admin.role, m));
  return (
    <nav aria-label="Admin" className="flex-1 space-y-5 overflow-y-auto px-3 pb-6 pt-2 [scrollbar-color:rgb(255_255_255/0.15)_transparent] [scrollbar-width:thin]">
      {MODULE_GROUPS.map((g) => {
        const items = mods.filter((m) => m.group === g);
        if (!items.length) return null;
        return (
          <div key={g}>
            {g !== "Main" && <p className="px-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/40">{g}</p>}
            <ul className="space-y-0.5">
              {items.map((m) => {
                const on = isActive(pathname, m);
                const n = m.queue && ready ? queueCount(m.key) : undefined;
                return (
                  <li key={m.key}>
                    <Link
                      href={m.href}
                      onClick={onNavigate}
                      aria-current={on ? "page" : undefined}
                      className={cn(
                        "group relative flex h-10 items-center gap-3 rounded-lg px-3 text-[13.5px] font-medium transition-colors",
                        on ? "bg-white/[0.09] text-white" : "text-white/70 hover:bg-white/[0.05] hover:text-white",
                      )}
                    >
                      {on && <span aria-hidden className="absolute -left-3 top-2 h-6 w-[3px] rounded-r-full bg-gold" />}
                      <m.icon className={cn("size-[18px] shrink-0", on ? "text-gold-soft" : "text-white/55 group-hover:text-white/80")} aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{m.label}</span>
                      {n ? (
                        <span className="min-w-6 rounded-full bg-gold px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums text-[#2b1d05]">{n}</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  const { admin } = useAdmin();
  return (
    <div className="border-t border-white/10 p-3">
      <div className="flex items-center gap-3 rounded-xl px-2 py-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold-soft text-[13px] font-bold text-forest">{admin.initials}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-semibold text-white">{admin.name}</span>
          <span className="block text-[11.5px] text-white/50">{ROLE_LABEL[admin.role]}</span>
        </span>
        <form action="/admin/logout" method="post">
          <button type="submit" aria-label="Sign out" title="Sign out" className="grid size-9 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white">
            <LogOut className="size-[18px]" />
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [palette, setPalette] = useState(false);
  const { queueCount, ready } = useAdmin();

  useEffect(() => setMenu(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const waiting = ready ? ADMIN_MODULES.reduce((n, m) => n + (m.queue ? queueCount(m.key) ?? 0 : 0), 0) : 0;
  const current = [...ADMIN_MODULES].reverse().find((m) => isActive(pathname, m));

  return (
    <div className="min-h-dvh bg-[#f6f4ee]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col bg-[linear-gradient(180deg,#06392d_0%,#042b22_100%)] lg:flex">
        <div className="flex h-16 items-center px-3">
          <Brand />
        </div>
        <Nav />
        <SidebarFooter />
      </aside>

      {/* Phone / tablet drawer */}
      {menu && (
        <div className="fixed inset-0 z-[65] lg:hidden">
          <div className="absolute inset-0 bg-black/45" onClick={() => setMenu(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 flex w-[84%] max-w-[300px] animate-fade-in flex-col bg-[linear-gradient(180deg,#06392d_0%,#042b22_100%)]">
            <div className="flex h-16 items-center justify-between px-3">
              <Brand />
              <button type="button" onClick={() => setMenu(false)} aria-label="Close menu" className="grid size-10 place-items-center rounded-lg text-white/70 hover:bg-white/10">
                <X className="size-5" />
              </button>
            </div>
            <Nav onNavigate={() => setMenu(false)} />
            <SidebarFooter />
          </aside>
        </div>
      )}

      <div className="lg:pl-[264px]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-line bg-white/85 px-3 backdrop-blur-md md:px-6">
          <button type="button" onClick={() => setMenu(true)} aria-label="Open menu" className="grid size-10 place-items-center rounded-lg text-ink hover:bg-stone lg:hidden">
            <Menu className="size-5" />
          </button>
          <p className="truncate text-[15px] font-semibold text-ink lg:hidden">{current?.label ?? "Admin"}</p>

          <button
            type="button"
            onClick={() => setPalette(true)}
            className="ml-auto flex h-10 items-center gap-2 rounded-lg border border-line-strong bg-white px-3 text-[13.5px] text-muted hover:border-ink/30 lg:ml-0 lg:w-[380px]"
          >
            <Search className="size-4" aria-hidden />
            <span className="hidden sm:inline">Search or jump to…</span>
            <kbd className="ml-auto hidden rounded border border-line bg-stone px-1.5 py-0.5 text-[11px] font-semibold text-muted lg:inline">Ctrl K</kbd>
          </button>

          <div className="flex items-center gap-1 lg:ml-auto">
            <Link href="/" target="_blank" className="hidden h-10 items-center gap-1.5 rounded-lg px-3 text-[13.5px] font-semibold text-ink hover:bg-stone md:inline-flex">
              View site <ExternalLink className="size-3.5" aria-hidden />
            </Link>
            <Link href="/admin" aria-label={waiting ? `${waiting} items waiting` : "Nothing waiting"} className="relative grid size-10 place-items-center rounded-lg text-ink hover:bg-stone">
              <Bell className="size-5" />
              {waiting > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-gold ring-2 ring-white" />}
            </Link>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-[1320px] px-4 pb-28 pt-6 md:px-6 md:pt-8">
          {children}
        </main>
      </div>

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </div>
  );
}
