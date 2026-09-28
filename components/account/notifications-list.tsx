"use client";

import Link from "next/link";
import { useState } from "react";
import { BellOff, HandCoins, Megaphone, MessageSquareText, Settings2, Star, Store, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationView {
  id: string;
  kind: "message" | "offer" | "price" | "follow" | "wanted" | "system" | "review";
  title: string;
  body: string;
  href: string;
  when: string;
  read: boolean;
}

const KIND: Record<NotificationView["kind"], { Icon: LucideIcon; cls: string }> = {
  message: { Icon: MessageSquareText, cls: "bg-mint text-mountain" },
  offer: { Icon: HandCoins, cls: "bg-gold-wash text-gold-ink" },
  price: { Icon: TrendingDown, cls: "bg-[#fdeee8] text-[#c2410c]" },
  follow: { Icon: Store, cls: "bg-[#e9f2f7] text-[#2b5c78]" },
  wanted: { Icon: Megaphone, cls: "bg-[#fdeee8] text-[#c2410c]" },
  system: { Icon: Settings2, cls: "bg-stone text-ink/70" },
  review: { Icon: Star, cls: "bg-gold-wash text-gold-ink" },
};

export function NotificationsList({
  initial,
  onRead,
  onReadAll,
}: {
  initial: NotificationView[];
  /** Save "read" (live site) */
  onRead?: (id: string) => void;
  onReadAll?: () => void;
}) {
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const unread = items.filter((n) => !n.read).length;
  const shown = tab === "all" ? items : items.filter((n) => !n.read);

  const markRead = (id: string) => {
    setItems((xs) => xs.map((n) => (n.id === id ? { ...n, read: true } : n)));
    onRead?.(id);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-5">
        <div className="flex gap-1.5">
          {(["all", "unread"] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "h-8 rounded-full px-3.5 text-[13px] font-medium transition-colors",
                tab === t ? "bg-ink text-white" : "bg-stone text-ink/80 hover:bg-line",
              )}
            >
              {t === "all" ? "All" : `Unread${unread ? ` (${unread})` : ""}`}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!unread}
          onClick={() => {
            setItems((xs) => xs.map((n) => ({ ...n, read: true })));
            onReadAll?.();
          }}
          className="text-[13px] font-semibold text-mountain disabled:text-muted"
        >
          Mark all as read
        </button>
      </div>

      {shown.length ? (
        <ul className="divide-y divide-line">
          {shown.map((n) => {
            const { Icon, cls } = KIND[n.kind] ?? KIND.system;
            return (
              <li key={n.id}>
                <Link
                  href={n.href}
                  onClick={() => markRead(n.id)}
                  className={cn("flex items-start gap-3.5 px-4 py-4 transition-colors hover:bg-cream md:px-5", !n.read && "bg-[#f6faf8]")}
                >
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", cls)}>
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className={cn("text-[14.5px] text-ink", n.read ? "font-medium" : "font-semibold")}>{n.title}</span>
                      <span className="shrink-0 text-[12px] text-muted">{n.when}</span>
                    </span>
                    <span className="mt-0.5 block text-[13.5px] text-ink/70">{n.body}</span>
                  </span>
                  {!n.read && <span className="mt-2 size-2.5 shrink-0 rounded-full bg-mountain" aria-label="Unread" />}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-mint text-mountain">
            <BellOff className="size-6" aria-hidden />
          </span>
          <p className="mt-4 text-[16px] font-semibold text-ink">You&apos;re all caught up</p>
          <p className="mt-1 text-[13.5px] text-muted">New offers, replies and price drops will show up here.</p>
        </div>
      )}
    </div>
  );
}

