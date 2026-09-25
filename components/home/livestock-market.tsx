"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import type { ListingCardData, LivestockAnimal } from "@/types";
import { LivestockCard } from "@/components/listings/livestock-card";
import { EmptyState } from "@/components/common/states";
import { MobileViewAll } from "@/components/common/section-header";
import { cn } from "@/lib/utils";

const FILTERS: { key: LivestockAnimal | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "goat", label: "Goats" },
  { key: "sheep", label: "Sheep" },
  { key: "cow", label: "Cows" },
  { key: "yak", label: "Yaks" },
  { key: "poultry", label: "Poultry" },
];

export function LivestockMarket({ listings }: { listings: ListingCardData[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const items = listings.filter((l) => filter === "all" || l.livestock?.animal === filter).slice(0, 4);

  return (
    <>
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter by animal" className="rail -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex gap-1 rounded-md border border-line bg-paper p-1">
            {FILTERS.map((f) => {
              const on = f.key === filter;
              return (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "h-9 shrink-0 rounded-sm px-4 text-[13.5px] font-medium transition-colors",
                    on ? "bg-mountain text-white" : "text-ink/75 hover:bg-stone hover:text-ink",
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
        <p className="flex items-start gap-2 text-[13px] text-muted lg:max-w-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-gold-ink" aria-hidden />
          See the animal in person and ask for vaccination records before you pay.
        </p>
      </div>

      <div className="mt-8" aria-live="polite">
        {items.length ? (
          <ul className="grid gap-4 md:gap-6 lg:grid-cols-2">
            {items.map((l, i) => (
              <li key={l.id} className={cn(i > 1 && "hidden md:block")}>
                <LivestockCard listing={l} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No animals listed here yet"
            description="Check back soon, or post a Wanted request and let sellers come to you."
          />
        )}
      </div>
      <MobileViewAll href="/search?category=livestock" label="View all livestock" />
    </>
  );
}
