"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Heart, Store } from "lucide-react";
import type { ListingCardData, Shop } from "@/types";
import { usePersistentSet } from "@/hooks/use-persistent-set";
import { ProductCard } from "@/components/listings/product-card";
import { ShopCard } from "@/components/shops/shop-card";
import { cn } from "@/lib/utils";

const noop = () => () => {};

/** Saved ads + followed shops, read from this device (synced to the account once sign-in is live). */
export function SavedView({ listings, shops }: { listings: ListingCardData[]; shops: Shop[] }) {
  const saved = usePersistentSet("saved");
  const following = usePersistentSet("following");
  const [tab, setTab] = useState<"ads" | "shops">("ads");
  // Avoid a flash of "nothing saved" before local storage is read
  const ready = useSyncExternalStore(noop, () => true, () => false);

  // Newest saved first
  const ads = [...saved.ids].reverse().map((id) => listings.find((l) => l.id === id)).filter(Boolean) as ListingCardData[];
  const followed = [...following.ids].reverse().map((id) => shops.find((s) => s.id === id)).filter(Boolean) as Shop[];

  const tabs = [
    { id: "ads" as const, label: "Saved ads", count: ads.length },
    { id: "shops" as const, label: "Followed shops", count: followed.length },
  ];

  return (
    <div>
      <div role="tablist" aria-label="Saved" className="flex gap-6 border-b border-line">
        {tabs.map((t) => {
          const on = t.id === tab;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative flex h-12 items-center gap-1.5 text-[15px] font-semibold transition-colors",
                on ? "text-ink" : "text-muted hover:text-ink",
              )}
            >
              {t.label}
              {ready && (
                <span className={cn("rounded-full px-1.5 text-[11.5px]", on ? "bg-ink text-white" : "bg-stone text-ink/70")}>{t.count}</span>
              )}
              <span aria-hidden className={cn("absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-mountain transition-transform", on ? "scale-x-100" : "scale-x-0")} />
            </button>
          );
        })}
      </div>

      {!ready ? (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5" aria-hidden>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-stone" />
          ))}
        </div>
      ) : tab === "ads" ? (
        ads.length ? (
          <>
            <p className="mt-5 text-[13px] text-muted">Tap the heart on any ad to remove it.</p>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-x-5 md:gap-y-8 lg:grid-cols-4 xl:grid-cols-5">
              {ads.map((l) => (
                <li key={l.id}>
                  <ProductCard listing={l} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Empty
            Icon={Heart}
            title="No saved ads yet"
            text="Tap the ♥ on any ad to keep it here. You'll also hear about price drops."
            href="/search"
            cta="Browse ads"
          />
        )
      ) : followed.length ? (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {followed.map((s) => (
            <li key={s.id}>
              <ShopCard shop={s} />
            </li>
          ))}
        </ul>
      ) : (
        <Empty Icon={Store} title="You don't follow any shops" text="Follow a shop to see its new stock first." href="/shops" cta="Find shops" />
      )}
    </div>
  );
}

function Empty({ Icon, title, text, href, cta }: { Icon: typeof Heart; title: string; text: string; href: string; cta: string }) {
  return (
    <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-mint text-mountain">
        <Icon className="size-6" aria-hidden />
      </span>
      <p className="mt-4 text-[17px] font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-[14px] text-muted">{text}</p>
      <Link href={href} className="mt-5 inline-flex h-11 items-center rounded-full bg-mountain px-6 text-[14px] font-semibold text-white hover:bg-mountain-hover">
        {cta}
      </Link>
    </div>
  );
}
