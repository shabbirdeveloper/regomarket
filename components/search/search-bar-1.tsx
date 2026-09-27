import { LayoutGrid, MapPin, Search } from "lucide-react";
import type { Category, District } from "@/types";
import { formatNumber } from "@/lib/format";
import { SelectMenu, type SelectOption } from "./select-menu";
import { cn } from "@/lib/utils";

const DIVISIONS = ["Gilgit", "Baltistan", "Diamer"] as const;

/**
 * Marketplace search — one connected bar: What · Category · Location · Search.
 * A plain GET form to /search, so it works without JavaScript and produces
 * shareable URLs: /search?q=walnut&category=dry-fruits&district=hunza
 *
 * `compact` (phones): a single input + button; category and location are
 * chosen on the results page.
 */
export function SearchBar({
  categories,
  districts,
  className,
  idPrefix = "search",
  compact = false,
}: {
  categories: Category[];
  districts: District[];
  className?: string;
  idPrefix?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <form
        action="/search"
        method="get"
        role="search"
        aria-label="Search REGOMARKET"
        className={cn("on-light flex h-14 items-center rounded-xl bg-white pl-4 pr-1.5 shadow-[0_12px_32px_-16px_rgb(0_0_0/0.45)]", className)}
      >
        <Search className="size-5 shrink-0 text-muted" strokeWidth={2} aria-hidden />
        <label htmlFor={`${idPrefix}-q`} className="sr-only">
          What are you looking for?
        </label>
        <input
          id={`${idPrefix}-q`}
          name="q"
          type="search"
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Search khubani, goats, land…"
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] text-ink outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-mountain px-4 text-[14px] font-semibold text-white transition-colors hover:bg-mountain-hover"
        >
          Search
        </button>
      </form>
    );
  }

  const totalAds = categories.reduce((n, c) => n + c.activeListings, 0);
  const categoryOptions: SelectOption[] = [
    { value: "", label: "All categories", hint: formatNumber(totalAds) },
    ...categories.map((c) => ({
      value: c.slug,
      label: c.name,
      hint: formatNumber(c.activeListings),
      thumb: c.image?.src ?? undefined,
    })),
  ];
  const districtOptions: SelectOption[] = [
    { value: "", label: "All Gilgit-Baltistan", hint: formatNumber(districts.reduce((n, d) => n + d.activeListings, 0)) },
    ...DIVISIONS.flatMap((div) =>
      districts
        .filter((d) => d.division === div)
        .map((d) => ({ value: d.slug, label: d.name, hint: formatNumber(d.activeListings), group: `${div} Division` })),
    ),
  ];

  return (
    <form
      action="/search"
      method="get"
      role="search"
      aria-label="Search REGOMARKET"
      className={cn(
        "on-light flex h-16 items-stretch rounded-xl bg-white p-1.5 shadow-[0_12px_32px_-16px_rgb(0_0_0/0.45)]",
        className,
      )}
    >
      {/* What */}
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl pl-4 pr-3 transition-colors focus-within:bg-cream">
        <Search className="size-5 shrink-0 text-muted" strokeWidth={2} aria-hidden />
        <label htmlFor={`${idPrefix}-q`} className="sr-only">
          What are you looking for?
        </label>
        <input
          id={`${idPrefix}-q`}
          name="q"
          type="search"
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Search for apricots, goats, land, phones…"
          className="h-full w-full min-w-0 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted/90"
        />
      </div>

      <span className="my-3 w-px shrink-0 bg-line-strong/70" aria-hidden />

      {/* Category */}
      <div className="hidden w-[210px] shrink-0 lg:block xl:w-[250px]">
        <SelectMenu
          id={`${idPrefix}-category`}
          name="category"
          label="Category"
          options={categoryOptions}
          icon={<LayoutGrid className="size-[18px]" strokeWidth={1.9} aria-hidden />}
          panelWidth={340}
        />
      </div>

      <span className="my-3 hidden w-px shrink-0 bg-line-strong/70 lg:block" aria-hidden />

      {/* Where */}
      <div className="w-[220px] shrink-0 xl:w-[250px]">
        <SelectMenu
          id={`${idPrefix}-district`}
          name="district"
          label="Location"
          options={districtOptions}
          icon={<MapPin className="size-[18px]" strokeWidth={1.9} aria-hidden />}
          panelWidth={300}
        />
      </div>

      <button
        type="submit"
        className="group ml-1.5 inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-mountain px-7 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-mountain-hover xl:px-9"
      >
        <Search className="size-5" strokeWidth={2.2} aria-hidden />
        Search
      </button>
    </form>
  );
}
