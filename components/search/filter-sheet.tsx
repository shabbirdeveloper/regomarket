"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { FilterForm } from "./filter-form";
import { cn } from "@/lib/utils";

/** Phone/tablet filters: a full-height sheet with the same fields as the sidebar. */
export function FilterSheet({ count, clearHref, total, children }: { count: number; clearHref: string; total: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  // The phone search's filter button: an event on /search, or ?filters=open from other pages
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("rego:open-filters", show);
    if (new URLSearchParams(window.location.search).get("filters") === "open") show();
    return () => window.removeEventListener("rego:open-filters", show);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-line-strong bg-white px-4 text-[13.5px] font-semibold text-ink hover:border-ink lg:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Filters
        {count > 0 && <span className="grid size-5 place-items-center rounded-full bg-mountain text-[11px] text-white">{count}</span>}
      </button>

      <div
        className={cn("fixed inset-0 z-[60] lg:hidden", open ? "visible" : "invisible")}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
      >
        <button
          type="button"
          aria-label="Close filters"
          onClick={() => setOpen(false)}
          className={cn("absolute inset-0 bg-ink/40 transition-opacity", open ? "opacity-100" : "opacity-0")}
        />
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <p className="text-[17px] font-semibold text-ink">Filters</p>
            <div className="flex items-center gap-2">
              {count > 0 && (
                <Link href={clearHref} onClick={() => setOpen(false)} className="text-[13.5px] font-semibold text-mountain">
                  Clear all
                </Link>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid size-9 place-items-center rounded-full hover:bg-stone"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
          </div>
          {open && (
            <FilterForm id="filters-sheet" onDone={() => setOpen(false)} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
              <div className="border-t border-line p-4">
                <button
                  type="submit"
                  className="h-12 w-full rounded-full bg-mountain text-[15px] font-semibold text-white hover:bg-mountain-hover"
                >
                  Show results
                </button>
                <p className="mt-2 text-center text-[12px] text-muted">{total} ads match right now</p>
              </div>
            </FilterForm>
          )}
        </div>
      </div>
    </>
  );
}
