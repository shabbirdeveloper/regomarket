"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Clock, Flame, Store, Truck } from "lucide-react";
import type { Category, CategorySlug, ListingCardData } from "@/types";
import { CategoryIcon } from "@/components/common/category-icon";
import { ProductCard } from "@/components/listings/product-card";
import { cn } from "@/lib/utils";

type FilterKey = "recommended" | "new" | "delivery" | "shops" | CategorySlug;

const PAGE = 20;

/**
 * The homepage feed: a scrollable chip row (like Temu/Daraz) filtering one
 * dense grid of product tiles, loaded 20 at a time. Filtering is client-side
 * on the already-loaded set, so it's instant on slow mountain connections.
 */
export function HomeFeed({ listings, categories }: { listings: ListingCardData[]; categories: Category[] }) {
  const [filter, setFilter] = useState<FilterKey>("recommended");
  const [shown, setShown] = useState(PAGE);
  const railRef = useRef<HTMLDivElement>(null);

  const chips: { key: FilterKey; label: string; icon?: ReactNode }[] = [
    { key: "recommended", label: "Recommended" },
    { key: "new", label: "Just posted", icon: <Clock className="size-4" aria-hidden /> },
    { key: "delivery", label: "Home delivery", icon: <Truck className="size-4" aria-hidden /> },
    { key: "shops", label: "From shops", icon: <Store className="size-4" aria-hidden /> },
    ...categories.map((c) => ({
      key: c.slug as FilterKey,
      label: c.shortName,
      icon: <CategoryIcon icon={c.icon} size={16} strokeWidth={1.8} />,
    })),
  ];

  const items = useMemo(() => {
    const byNew = (a: ListingCardData, b: ListingCardData) => +new Date(b.postedAt) - +new Date(a.postedAt);
    switch (filter) {
      case "recommended":
        return listings;
      case "new":
        return [...listings].sort(byNew);
      case "delivery":
        return listings.filter((l) => l.orderable);
      case "shops":
        return listings.filter((l) => l.seller.type === "shop");
      default:
        return listings.filter((l) => l.category === filter);
    }
  }, [filter, listings]);

  const active = chips.find((c) => c.key === filter);
  const heading =
    filter === "recommended" ? "Recommended for you" : filter === "new" ? "Just posted" : filter === "delivery" ? "Delivered to your door" : filter === "shops" ? "From verified shops" : active?.label ?? "Ads";

  const pick = (k: FilterKey) => {
    setFilter(k);
    setShown(PAGE);
  };

  return (
    <section aria-labelledby="feed-title" className="shell pb-14 pt-7 md:pb-20 md:pt-8">
      <h2 id="feed-title" className="sr-only">
        Ads across Gilgit-Baltistan
      </h2>

      {/* Phones: section title first, like an app */}
      <div className="mb-3.5 flex items-center justify-between md:hidden">
        <p className="text-[19px] font-semibold tracking-[-0.015em] text-ink" aria-hidden>
          Popular in GB
        </p>
        <Link href="/search" className="inline-flex items-center gap-0.5 text-[13.5px] font-medium text-muted">
          View all <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>

      {/* Chip row */}
      <div className="relative">
        <div
          ref={railRef}
          role="tablist"
          aria-label="Filter ads"
          className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 md:pr-14 [&::-webkit-scrollbar]:hidden"
        >
          {chips.map((c) => {
            const on = c.key === filter;
            return (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => pick(c.key)}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[14px] px-4 text-[13.5px] font-medium transition-colors md:h-9 md:rounded-full [&_svg]:opacity-70",
                  on ? "bg-mountain text-white [&_svg]:opacity-100" : "bg-surface text-ink/80 hover:bg-line md:bg-stone",
                )}
              >
                {c.icon}
                {c.label}
              </button>
            );
          })}
          <Link
            href="/wanted"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[14px] bg-surface px-4 text-[13.5px] font-medium text-ink/80 hover:bg-line md:h-9 md:rounded-full md:bg-stone [&_svg]:opacity-70"
          >
            <Flame className="size-4" aria-hidden />
            Wanted
          </Link>
        </div>
        <button
          type="button"
          aria-label="Scroll filters"
          onClick={() => railRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
          className="absolute right-0 top-0 hidden size-9 place-items-center rounded-full border border-line bg-white text-ink shadow-[-16px_0_14px_8px_#fff] hover:border-line-strong md:grid"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>

      {/* Grid heading */}
      <div className="mt-5 flex items-end justify-between gap-4 pb-1 md:mt-8 md:border-b md:border-line md:pb-3">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink md:text-[22px] md:tracking-[-0.02em]">{heading}</h3>
        <p className="tabular shrink-0 text-[13px] text-muted">{items.length} ads</p>
      </div>

      {/* Grid */}
      {items.length ? (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:mt-6 md:gap-x-5 md:gap-y-8 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {items.slice(0, shown).map((l, i) => (
            <li key={l.id}>
              <ProductCard listing={l} priority={i < 5} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 rounded-lg border border-dashed border-line-strong bg-white px-6 py-10 text-center text-[14.5px] text-muted">
          No ads here yet. Be the first:{" "}
          <Link href="/sell" className="font-semibold text-mountain underline underline-offset-4">
            post a free ad
          </Link>
          .
        </p>
      )}

      {items.length > shown && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE)}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-line-strong bg-white px-8 text-[14.5px] font-semibold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white"
          >
            See more ads
            <ChevronDown className="size-4" aria-hidden />
          </button>
        </div>
      )}
    </section>
  );
}
