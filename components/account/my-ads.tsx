"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, Heart, MessageSquareText, MoreHorizontal, Pencil, PackageCheck, Plus, RotateCcw, Trash2 } from "lucide-react";
import type { ListingCardData } from "@/types";
import { formatNumber, unitLabel } from "@/lib/format";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

type Status = "active" | "pending" | "sold" | "expired";
export type MyAd = ListingCardData & { meta: { status: Status; chats: number; saves: number } };

const STATUS: Record<Status, { label: string; cls: string }> = {
  active: { label: "Live", cls: "bg-mint text-success" },
  pending: { label: "In review", cls: "bg-gold-wash text-gold-ink" },
  sold: { label: "Sold", cls: "bg-stone text-ink/70" },
  expired: { label: "Expired", cls: "bg-[#fdeee8] text-[#c2410c]" },
};

/** The owner's ad list with status tabs and quick actions (local until Supabase). */
export function MyAds({ initial }: { initial: MyAd[] }) {
  const [ads, setAds] = useState(initial);
  const [tab, setTab] = useState<Status>("active");
  const [menu, setMenu] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const setStatus = (id: string, status: Status, msg: string) => {
    setAds((xs) => xs.map((a) => (a.id === id ? { ...a, meta: { ...a.meta, status } } : a)));
    setMenu(null);
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };
  const remove = (id: string) => {
    setAds((xs) => xs.filter((a) => a.id !== id));
    setMenu(null);
    setToast("Ad removed");
    setTimeout(() => setToast(""), 2200);
  };

  const tabs: Status[] = ["active", "pending", "sold", "expired"];
  const shown = ads.filter((a) => a.meta.status === tab);

  return (
    <div className="relative">
      <div role="tablist" aria-label="My ads" className="no-scrollbar flex gap-5 overflow-x-auto border-b border-line">
        {tabs.map((t) => {
          const n = ads.filter((a) => a.meta.status === t).length;
          const on = t === tab;
          return (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => setTab(t)}
              className={cn("relative flex h-11 shrink-0 items-center gap-1.5 text-[14px] font-semibold", on ? "text-ink" : "text-muted hover:text-ink")}
            >
              {t === "active" ? "Live" : t === "pending" ? "In review" : t === "sold" ? "Sold" : "Expired"}
              <span className={cn("rounded-full px-1.5 text-[11px]", on ? "bg-ink text-white" : "bg-stone")}>{n}</span>
              <span aria-hidden className={cn("absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-mountain transition-transform", on ? "scale-x-100" : "scale-x-0")} />
            </button>
          );
        })}
      </div>

      {shown.length ? (
        <ul className="divide-y divide-line">
          {shown.map((a) => (
            <li key={a.id} className="flex items-center gap-4 py-4">
              <Link href={routes.listing(a.slug)} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-stone md:size-24">
                {a.images[0]?.src && <Image src={a.images[0].src} alt="" fill sizes="96px" className="object-cover" />}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11.5px] font-semibold", STATUS[a.meta.status].cls)}>
                      {STATUS[a.meta.status].label}
                    </span>
                    <Link href={routes.listing(a.slug)} className="mt-1 block truncate text-[15px] font-semibold text-ink hover:text-mountain">
                      {a.title}
                    </Link>
                    <p className="text-[14px] font-bold text-ink">
                      Rs {formatNumber(a.price.amount)}
                      {a.price.unit && <span className="font-normal text-muted"> / {unitLabel(a.price.unit)}</span>}
                    </p>
                  </div>
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      aria-label={`Actions for ${a.title}`}
                      aria-expanded={menu === a.id}
                      onClick={() => setMenu(menu === a.id ? null : a.id)}
                      className="grid size-9 place-items-center rounded-full border border-line-strong hover:border-ink"
                    >
                      <MoreHorizontal className="size-4" aria-hidden />
                    </button>
                    {menu === a.id && (
                      <div className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg">
                        <Link href={`/sell?edit=${a.slug}`} className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13.5px] hover:bg-cream">
                          <Pencil className="size-4 text-muted" aria-hidden /> Edit ad
                        </Link>
                        {a.meta.status !== "sold" ? (
                          <button type="button" onClick={() => setStatus(a.id, "sold", "Marked as sold. Congratulations!")} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13.5px] hover:bg-cream">
                            <PackageCheck className="size-4 text-muted" aria-hidden /> Mark as sold
                          </button>
                        ) : (
                          <button type="button" onClick={() => setStatus(a.id, "active", "Ad is live again")} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13.5px] hover:bg-cream">
                            <RotateCcw className="size-4 text-muted" aria-hidden /> Relist
                          </button>
                        )}
                        <button type="button" onClick={() => remove(a.id)} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13.5px] text-[#b42318] hover:bg-[#fef3f2]">
                          <Trash2 className="size-4" aria-hidden /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="size-3.5" aria-hidden /> {formatNumber(a.views)} views
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquareText className="size-3.5" aria-hidden /> {a.meta.chats} chats
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Heart className="size-3.5" aria-hidden /> {a.meta.saves} saves
                  </span>
                  <span>Posted {a.postedLabel}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <p className="text-[15px] font-semibold text-ink">Nothing here</p>
          <p className="mt-1 text-[13.5px] text-muted">
            {tab === "active" ? "Post an ad and it will show up here." : "Ads move here when their status changes."}
          </p>
          {tab === "active" && (
            <Link href="/sell" className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-mountain px-5 text-[13.5px] font-semibold text-white">
              <Plus className="size-4" aria-hidden /> Post an ad
            </Link>
          )}
        </div>
      )}

      <p
        role="status"
        className={cn(
          "pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg transition-opacity md:bottom-8",
          toast ? "opacity-100" : "opacity-0",
        )}
      >
        {toast}
      </p>
    </div>
  );
}
