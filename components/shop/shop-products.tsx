"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, PackageSearch, Search, X } from "lucide-react";
import type { ListingCardData } from "@/types";
import { categoryBySlug } from "@/data/categories";
import { ProductCard } from "@/components/listings/product-card";
import { SelectMenu } from "@/components/search/select-menu";
import { cn } from "@/lib/utils";

type Sort = "popular" | "newest" | "low" | "high";

const SORTS = [
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest first" },
  { value: "low", label: "Price: low to high" },
  { value: "high", label: "Price: high to low" },
];

/** A shop's catalogue: search inside the shop, filter chips, sort, grid. */
export function ShopProducts({ products, shopName }: { products: ListingCardData[]; shopName: string }) {
  const [q, setQ] = useState("");
  const [chip, setChip] = useState("all");
  const [sort, setSort] = useState<Sort>("popular");

  const chips = useMemo(() => {
    const out: { id: string; label: string; count: number }[] = [{ id: "all", label: "All", count: products.length }];
    const cats = [...new Set(products.map((p) => p.category))];
    if (cats.length > 1) {
      for (const c of cats) out.push({ id: `cat:${c}`, label: categoryBySlug[c].shortName, count: products.filter((p) => p.category === c).length });
    }
    const add = (id: string, label: string, fn: (p: ListingCardData) => boolean) => {
      const n = products.filter(fn).length;
      if (n > 0 && n < products.length) out.push({ id, label, count: n });
    };
    add("orderable", "Order online", (p) => p.orderable);
    add("wholesale", "Wholesale", (p) => Boolean(p.wholesale));
    add("negotiable", "Negotiable", (p) => Boolean(p.price.negotiable));
    add("new", "Brand new", (p) => p.condition === "new");
    return out;
  }, [products]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = products.filter((p) => {
      if (needle && !p.title.toLowerCase().includes(needle)) return false;
      if (chip.startsWith("cat:")) return p.category === chip.slice(4);
      if (chip === "orderable") return p.orderable;
      if (chip === "wholesale") return Boolean(p.wholesale);
      if (chip === "negotiable") return Boolean(p.price.negotiable);
      if (chip === "new") return p.condition === "new";
      return true;
    });
    const by: Record<Sort, (a: ListingCardData, b: ListingCardData) => number> = {
      popular: (a, b) => b.views - a.views,
      newest: (a, b) => +new Date(b.postedAt) - +new Date(a.postedAt),
      low: (a, b) => a.price.amount - b.price.amount,
      high: (a, b) => b.price.amount - a.price.amount,
    };
    return [...list].sort(by[sort]);
  }, [products, q, chip, sort]);

  const reset = () => {
    setQ("");
    setChip("all");
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="relative block md:w-[340px]">
          <span className="sr-only">Search in {shopName}</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search in this shop`}
            className="h-11 w-full rounded-full border border-line-strong bg-cream pl-11 pr-10 text-[14.5px] text-ink outline-none transition placeholder:text-muted focus:border-mountain focus:bg-white focus:shadow-[0_0_0_4px_rgb(6_78_59/0.1)] [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-stone hover:text-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </label>

        <div className="flex h-11 items-center gap-1 rounded-full border border-line-strong bg-white md:w-[240px]">
          <SelectMenu
            id="shop-sort"
            name="sort"
            label="Sort products"
            options={SORTS}
            defaultValue="popular"
            panelWidth={240}
            icon={<ArrowDownUp className="size-4" aria-hidden />}
            onChange={(v) => setSort(v as Sort)}
            className="rounded-full [&>span:nth-child(2)]:text-[14px]"
          />
        </div>
      </div>

      {chips.length > 1 && (
        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {chips.map((c) => {
            const on = chip === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => setChip(c.id)}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-medium transition-colors",
                  on ? "bg-ink text-white" : "bg-stone text-ink hover:bg-line",
                )}
              >
                {c.label}
                <span className={cn("text-[12px] tabular-nums", on ? "text-white/70" : "text-muted")}>{c.count}</span>
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-5 text-[13px] text-muted" aria-live="polite">
        {shown.length === products.length ? `${products.length} products` : `${shown.length} of ${products.length} products`}
      </p>

      {shown.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
          {shown.map((l) => (
            <li key={l.id}>
              <ProductCard listing={l} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
          <PackageSearch className="size-9 text-muted" aria-hidden />
          <p className="mt-3 text-[15px] font-semibold text-ink">Nothing matches &ldquo;{q || "this filter"}&rdquo;</p>
          <p className="mt-1 text-[13.5px] text-muted">Try another word, or message the shop. They may have it in store.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 inline-flex h-10 items-center rounded-full border border-line-strong px-5 text-[13.5px] font-semibold text-ink hover:border-ink"
          >
            Show all products
          </button>
        </div>
      )}
    </div>
  );
}
