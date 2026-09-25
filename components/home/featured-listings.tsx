"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { CategorySlug, ListingCardData } from "@/types";
import { ListingCard } from "@/components/listings/listing-card";
import { EmptyState } from "@/components/common/states";
import { MobileViewAll, SectionHeader } from "@/components/common/section-header";
import { cn } from "@/lib/utils";

type TabKey = "latest" | "shops" | CategorySlug;

const TABS: { key: TabKey; label: string; href: string }[] = [
  { key: "latest", label: "Latest", href: "/search?sort=newest" },
  { key: "property", label: "Property", href: "/search?category=property" },
  { key: "vehicles", label: "Vehicles", href: "/search?category=vehicles" },
  { key: "electronics", label: "Electronics", href: "/search?category=electronics" },
  { key: "livestock", label: "Livestock", href: "/search?category=livestock" },
  { key: "shops", label: "From Shops", href: "/search?seller=shop" },
];

/** Tabs filter an already-loaded set — no network round-trip on slow links. */
export function FeaturedListings({ listings, titleId }: { listings: ListingCardData[]; titleId: string }) {
  const [tab, setTab] = useState<TabKey>("latest");
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const items = listings
    .filter((l) => (tab === "latest" ? true : tab === "shops" ? l.seller.type === "shop" : l.category === tab))
    .slice(0, 8);
  const active = TABS.find((t) => t.key === tab)!;

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
    setTab(TABS[next].key);
    tabRefs.current[next]?.focus();
  };

  return (
    <>
      <SectionHeader
        id={titleId}
        eyebrow="Across Gilgit-Baltistan"
        title="Featured Listings"
        description="Hand-picked from verified sellers — property, vehicles, electronics and more."
        action={{ label: `View all ${active.key === "latest" ? "listings" : active.label.toLowerCase()}`, href: active.href }}
      />

      <div role="tablist" aria-label="Filter featured listings" className="rail -mx-4 mt-8 gap-6 border-b border-line px-4 sm:mx-0 sm:px-0">
        {TABS.map((t, i) => {
          const selected = t.key === tab;
          return (
            <button
              key={t.key}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${t.key}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(t.key)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "relative h-11 shrink-0 text-[14px] font-medium transition-colors",
                "after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-mountain after:transition-transform after:duration-300",
                selected ? "text-ink after:scale-x-100" : "text-muted after:scale-x-0 hover:text-ink",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-tab-${tab}`} className="mt-8">
        {items.length ? (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {items.map((l) => (
              <li key={l.id} className="animate-fade-in">
                <ListingCard listing={l} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Nothing here yet" description="New listings in this category will appear here." />
        )}
      </div>
      <MobileViewAll href={active.href} label={`View all ${active.key === "latest" ? "listings" : active.label.toLowerCase()}`} />
    </>
  );
}
