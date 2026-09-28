"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CornerDownLeft, ExternalLink, Search, Zap } from "lucide-react";
import { ADMIN_MODULES, canOpen } from "@/lib/admin/modules";
import { cn } from "@/lib/utils";
import { useAdmin } from "../store";

interface Item {
  id: string;
  label: string;
  hint: string;
  href: string;
  icon: typeof Search;
  words: string;
  external?: boolean;
}

const ACTIONS: Omit<Item, "icon">[] = [
  { id: "a-ads", label: "Review pending ads", hint: "Ads", href: "/admin/listings?tab=pending", words: "approve moderate queue" },
  { id: "a-ver", label: "Check CNIC verifications", hint: "Verifications", href: "/admin/verifications", words: "id kyc" },
  { id: "a-rep", label: "Open reports", hint: "Reports", href: "/admin/reports", words: "complaints scam" },
  { id: "a-note", label: "Send a notification", hint: "Announcements", href: "/admin/announcements", words: "broadcast push message" },
  { id: "a-post", label: "Write a blog post", hint: "Blog", href: "/admin/blog?new=1", words: "article new" },
  { id: "a-team", label: "Add an admin", hint: "Settings", href: "/admin/settings#team", words: "moderator team role" },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { admin } = useAdmin();
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setI(0);
      requestAnimationFrame(() => input.current?.focus());
    }
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const mods: Item[] = ADMIN_MODULES.filter((m) => canOpen(admin.role, m)).map((m) => ({
      id: m.key,
      label: m.label,
      hint: m.description,
      href: m.href,
      icon: m.icon,
      words: `${m.keywords ?? ""} ${m.group}`,
    }));
    const acts: Item[] = ACTIONS.map((a) => ({ ...a, icon: Zap }));
    const site: Item = { id: "site", label: "Open the website", hint: "In a new tab", href: "/", icon: ExternalLink, words: "home public", external: true };
    const all = [...acts, ...mods, site];
    const n = q.trim().toLowerCase();
    if (!n) return all;
    return all.filter((x) => `${x.label} ${x.hint} ${x.words}`.toLowerCase().includes(n));
  }, [q, admin.role]);

  const go = (it: Item) => {
    onClose();
    if (it.external) window.open(it.href, "_blank", "noopener");
    else router.push(it.href);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[85] flex items-start justify-center p-3 pt-[12vh]">
      <div className="absolute inset-0 animate-fade-in bg-[#0b1511]/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label="Search the admin" className="relative w-full max-w-xl animate-fade-in overflow-hidden rounded-2xl bg-white shadow-float">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-5 text-muted" aria-hidden />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setI(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setI((x) => Math.min(items.length - 1, x + 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setI((x) => Math.max(0, x - 1));
              }
              if (e.key === "Enter" && items[i]) go(items[i]);
            }}
            placeholder="Type a module or an action…"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-list"
            aria-activedescendant={items[i] ? `cmdk-${items[i].id}` : undefined}
            className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
          />
          <kbd className="rounded border border-line bg-stone px-1.5 py-0.5 text-[11px] font-semibold text-muted">Esc</kbd>
        </div>
        <ul id="cmdk-list" role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
          {items.length === 0 && <li className="px-3 py-8 text-center text-[14px] text-muted">No match for “{q}”</li>}
          {items.map((it, n) => (
            <li key={it.id} id={`cmdk-${it.id}`} role="option" aria-selected={n === i}>
              <button
                type="button"
                onMouseEnter={() => setI(n)}
                onClick={() => go(it)}
                className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left", n === i ? "bg-mint" : "hover:bg-stone")}
              >
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", n === i ? "bg-white text-mountain" : "bg-stone text-ink/70")}>
                  <it.icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-ink">{it.label}</span>
                  <span className="block truncate text-[12.5px] text-muted">{it.hint}</span>
                </span>
                {n === i ? <CornerDownLeft className="size-4 text-mountain" aria-hidden /> : <ArrowRight className="size-4 text-muted/60" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
