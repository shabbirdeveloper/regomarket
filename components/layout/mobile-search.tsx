"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeaderQueryInput } from "./header-query-input";

const inputCls =
  "h-12 w-full rounded-[16px] bg-surface pl-11 pr-4 text-[15px] text-ink outline-none ring-1 ring-transparent transition-[box-shadow,background-color] placeholder:text-muted focus:bg-white focus:ring-mountain/40";

/**
 * Phone search: a soft grey field with the icon inside, and a green filter
 * button beside it. On /search the button opens the filter sheet in place;
 * elsewhere it opens /search with the sheet already open.
 */
export function MobileSearch({ id, className }: { id: string; className?: string }) {
  const pathname = usePathname();
  const input = {
    id,
    name: "q",
    type: "search",
    autoComplete: "off",
    enterKeyHint: "search" as const,
    placeholder: "Search khubani, goats, land…",
    className: inputCls,
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <form action="/search" method="get" role="search" aria-label="Search REGOMARKET" className="relative min-w-0 flex-1">
        <label htmlFor={id} className="sr-only">
          Search ads
        </label>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-ink/55" strokeWidth={2} aria-hidden />
        <Suspense fallback={<input {...input} />}>
          <HeaderQueryInput {...input} />
        </Suspense>
        <button type="submit" className="sr-only">
          Search
        </button>
      </form>
      <Link
        href="/search?filters=open"
        onClick={(e) => {
          if (pathname !== "/search") return;
          e.preventDefault();
          window.dispatchEvent(new Event("rego:open-filters"));
        }}
        aria-label="Filters"
        className="grid size-12 shrink-0 place-items-center rounded-[16px] bg-mountain text-white transition-colors active:bg-mountain-hover"
      >
        <SlidersHorizontal className="size-5" strokeWidth={2} aria-hidden />
      </Link>
    </div>
  );
}

/** The header's phone search row — the home page draws its own under the welcome line. */
export function MobileSearchRow() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <div className="shell pb-3 md:hidden">
      <MobileSearch id="header-q-m" />
    </div>
  );
}
