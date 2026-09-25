import { MapPin, Search } from "lucide-react";
import type { Category, District } from "@/types";
import { LocationSelector } from "./location-selector";
import { cn } from "@/lib/utils";

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
  const fieldLabel = "block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted";

  if (compact) {
    return (
      <form
        action="/search"
        method="get"
        role="search"
        aria-label="Search REGOMARKET"
        className={cn("on-light flex h-14 items-center rounded-lg border border-line bg-paper pl-4 pr-1.5 shadow-float", className)}
      >
        <Search className="size-5 shrink-0 text-muted" aria-hidden />
        <label htmlFor={`${idPrefix}-q`} className="sr-only">
          What are you looking for?
        </label>
        <input
          id={`${idPrefix}-q`}
          name="q"
          type="search"
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Search apricots, goats, land…"
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] text-ink outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-md bg-mountain px-4 text-[14px] font-semibold text-white transition-colors hover:bg-mountain-hover"
        >
          Search
        </button>
      </form>
    );
  }

  return (
    <form
      action="/search"
      method="get"
      role="search"
      aria-label="Search REGOMARKET"
      className={cn(
        "on-light flex h-[62px] items-stretch rounded-[14px] border border-line bg-paper p-1.5 shadow-float",
        className,
      )}
    >
      {/* What */}
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-md pl-4 pr-3 transition-colors focus-within:bg-cream">
        <Search className="size-5 shrink-0 text-muted" aria-hidden />
        <label htmlFor={`${idPrefix}-q`} className="sr-only">
          What are you looking for?
        </label>
        <input
          id={`${idPrefix}-q`}
          name="q"
          type="search"
          autoComplete="off"
          enterKeyHint="search"
          placeholder="What are you looking for?"
          className="h-full w-full min-w-0 bg-transparent text-[15.5px] text-ink outline-none placeholder:text-muted"
        />
      </div>

      <span className="my-2 w-px shrink-0 bg-line" aria-hidden />

      {/* Category */}
      <div className="relative hidden w-[190px] shrink-0 flex-col justify-center rounded-md px-4 transition-colors focus-within:bg-cream lg:flex xl:w-[220px]">
        <label htmlFor={`${idPrefix}-category`} className={fieldLabel}>
          Category
        </label>
        <select
          id={`${idPrefix}-category`}
          name="category"
          defaultValue=""
          className="select-native -ml-px mt-0.5 w-full cursor-pointer truncate bg-transparent !bg-[position:right_0_center] !pr-6 text-[14.5px] font-medium text-ink outline-none"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <span className="my-2 hidden w-px shrink-0 bg-line lg:block" aria-hidden />

      {/* Where */}
      <div className="relative flex w-[200px] shrink-0 flex-col justify-center rounded-md px-4 transition-colors focus-within:bg-cream xl:w-[230px]">
        <label htmlFor={`${idPrefix}-district`} className={cn(fieldLabel, "flex items-center gap-1")}>
          <MapPin className="size-3" aria-hidden /> Location
        </label>
        <LocationSelector
          id={`${idPrefix}-district`}
          districts={districts}
          className="-ml-px mt-0.5 w-full cursor-pointer truncate bg-transparent !bg-[position:right_0_center] !pr-6 text-[14.5px] font-medium text-ink outline-none"
        />
      </div>

      <button
        type="submit"
        className="group ml-1 inline-flex shrink-0 items-center justify-center gap-2 rounded-[10px] bg-mountain px-7 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-mountain-hover"
      >
        <Search className="size-[18px]" strokeWidth={2.2} aria-hidden />
        Search
      </button>
    </form>
  );
}
