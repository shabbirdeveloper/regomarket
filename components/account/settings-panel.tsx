"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const PREFS = [
  { id: "offers", label: "Offers and messages", hint: "When someone replies or makes an offer" },
  { id: "price", label: "Price drops", hint: "On ads you saved" },
  { id: "shops", label: "Shops I follow", hint: "New stock and news" },
  { id: "wanted", label: "Matching Wanted requests", hint: "When a buyer needs what you sell" },
] as const;

/** Notification switches (stored on the account once sign-in is live). */
export function SettingsPanel() {
  const [on, setOn] = useState<Record<string, boolean>>({ offers: true, price: true, shops: true, wanted: false });
  return (
    <ul className="divide-y divide-line">
      {PREFS.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-4 py-3.5">
          <span>
            <span className="block text-[14px] font-medium text-ink">{p.label}</span>
            <span className="block text-[12.5px] text-muted">{p.hint}</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={on[p.id]}
            aria-label={p.label}
            onClick={() => setOn((s) => ({ ...s, [p.id]: !s[p.id] }))}
            className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", on[p.id] ? "bg-mountain" : "bg-line-strong")}
          >
            <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform", on[p.id] ? "translate-x-[22px]" : "translate-x-0.5")} />
          </button>
        </li>
      ))}
    </ul>
  );
}
