"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search, SearchX, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./primitives";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** Return a value to make the column sortable */
  sort?: (row: T) => string | number;
  className?: string;
  headClassName?: string;
  align?: "left" | "right";
  /** Hide on narrower desktop widths */
  hideBelow?: "lg" | "xl";
}

export interface Tab<T> {
  key: string;
  label: string;
  filter: (row: T) => boolean;
}

export interface Facet<T> {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  get: (row: T) => string | string[] | undefined;
}

export interface BulkAction<T> {
  label: string;
  icon?: LucideIcon;
  tone?: "default" | "good" | "danger";
  run: (rows: T[]) => void;
}

const HIDE = { lg: "hidden lg:table-cell", xl: "hidden xl:table-cell" };

export function DataTable<T>({
  rows,
  getId,
  columns,
  tabs,
  initialTab,
  search,
  searchPlaceholder = "Search",
  initialQuery = "",
  facets,
  initialFacets,
  bulk,
  onRowClick,
  mobile,
  pageSize = 20,
  empty,
  toolbar,
  rowClassName,
}: {
  rows: T[];
  getId: (row: T) => string;
  columns: Column<T>[];
  tabs?: Tab<T>[];
  initialTab?: string;
  search?: (row: T) => string;
  searchPlaceholder?: string;
  initialQuery?: string;
  facets?: Facet<T>[];
  initialFacets?: Record<string, string>;
  bulk?: BulkAction<T>[];
  onRowClick?: (row: T) => void;
  /** Card layout for phones */
  mobile?: (row: T) => ReactNode;
  pageSize?: number;
  empty?: { title: string; body?: string; icon?: ReactNode };
  toolbar?: ReactNode;
  rowClassName?: (row: T) => string | undefined;
}) {
  const [tab, setTab] = useState(initialTab ?? tabs?.[0]?.key ?? "");
  const [q, setQ] = useState(initialQuery);
  const [facetVals, setFacetVals] = useState<Record<string, string>>(initialFacets ?? {});
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const counts = useMemo(() => Object.fromEntries((tabs ?? []).map((t) => [t.key, rows.filter(t.filter).length])), [tabs, rows]);

  const filtered = useMemo(() => {
    const t = tabs?.find((x) => x.key === tab);
    const needle = q.trim().toLowerCase();
    let list = rows.filter((r) => (!t || t.filter(r)) && (!needle || !search || search(r).toLowerCase().includes(needle)));
    for (const f of facets ?? []) {
      const v = facetVals[f.key];
      if (!v) continue;
      list = list.filter((r) => {
        const got = f.get(r);
        return Array.isArray(got) ? got.includes(v) : got === v;
      });
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sort) {
        const get = col.sort;
        list = [...list].sort((a, b) => {
          const x = get(a);
          const y = get(b);
          return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
        });
      }
    }
    return list;
  }, [rows, tabs, tab, q, search, facets, facetVals, sort, columns]);

  // Back to page 1 whenever the filters change; drop selections that disappeared
  useEffect(() => setPage(0), [tab, q, facetVals, sort]);
  useEffect(() => {
    setSelected((s) => {
      const ids = new Set(filtered.map(getId));
      const next = new Set([...s].filter((id) => ids.has(id)));
      return next.size === s.size ? s : next;
    });
  }, [filtered, getId]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * pageSize, current * pageSize + pageSize);
  const allOnPage = visible.length > 0 && visible.every((r) => selected.has(getId(r)));
  const selectedRows = filtered.filter((r) => selected.has(getId(r)));

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const togglePage = () =>
    setSelected((s) => {
      const n = new Set(s);
      for (const r of visible) {
        if (allOnPage) n.delete(getId(r));
        else n.add(getId(r));
      }
      return n;
    });

  const activeFacets = Object.values(facetVals).filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-line bg-white">
      {/* Tabs */}
      {tabs && tabs.length > 1 && (
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line px-3 pt-2">
          {tabs.map((t) => {
            const on = t.key === tab;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                aria-pressed={on}
                className={cn(
                  "relative flex h-11 shrink-0 items-center gap-2 px-3 text-[13.5px] font-semibold transition-colors",
                  on ? "text-mountain" : "text-muted hover:text-ink",
                )}
              >
                {t.label}
                <span className={cn("rounded-full px-1.5 py-px text-[11.5px] font-semibold tabular-nums", on ? "bg-mint text-mountain" : "bg-stone text-muted")}>
                  {counts[t.key]}
                </span>
                {on && <span aria-hidden className="absolute inset-x-2 -bottom-px h-[2.5px] rounded-full bg-mountain" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Toolbar */}
      {(search || facets?.length || toolbar) && (
        <div className="flex flex-col gap-2 border-b border-line p-3 md:flex-row md:items-center">
          {search && (
            <label className="relative block md:w-80">
              <span className="sr-only">{searchPlaceholder}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-lg border border-line-strong bg-white pl-9 pr-9 text-[14px] outline-none placeholder:text-muted focus:border-mountain focus:shadow-[0_0_0_3px_rgb(6_78_59/0.1)]"
              />
              {q && (
                <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded text-muted hover:text-ink">
                  <X className="size-4" />
                </button>
              )}
            </label>
          )}
          {facets && facets.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {facets.map((f) => (
                <select
                  key={f.key}
                  aria-label={f.label}
                  value={facetVals[f.key] ?? ""}
                  onChange={(e) => setFacetVals((v) => ({ ...v, [f.key]: e.target.value }))}
                  className={cn(
                    "h-10 rounded-lg border bg-white pl-3 pr-8 text-[13.5px] outline-none focus:border-mountain",
                    facetVals[f.key] ? "border-mountain text-mountain" : "border-line-strong text-ink",
                  )}
                >
                  <option value="">{f.label}: All</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ))}
              {activeFacets > 0 && (
                <button type="button" onClick={() => setFacetVals({})} className="h-10 px-2 text-[13px] font-semibold text-mountain hover:underline">
                  Clear
                </button>
              )}
            </div>
          )}
          {toolbar && <div className="flex flex-wrap items-center gap-2 md:ml-auto">{toolbar}</div>}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={empty?.icon ?? <SearchX />} title={empty?.title ?? "Nothing here"} body={empty?.body ?? (q ? "Try a different search." : undefined)} />
      ) : (
        <>
          {/* Desktop table */}
          <div className={cn("overflow-x-auto", mobile && "hidden md:block")}>
            <table className="w-full min-w-[640px] border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-line bg-[#fbfaf6] text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">
                  {bulk && (
                    <th className="w-10 py-2.5 pl-4">
                      <input type="checkbox" aria-label="Select all on this page" checked={allOnPage} onChange={togglePage} className="size-4 accent-mountain" />
                    </th>
                  )}
                  {columns.map((c) => {
                    const on = sort?.key === c.key;
                    return (
                      <th
                        key={c.key}
                        scope="col"
                        aria-sort={on ? (sort!.dir === 1 ? "ascending" : "descending") : undefined}
                        className={cn("px-4 py-2.5 font-semibold", c.align === "right" && "text-right", c.hideBelow && HIDE[c.hideBelow], c.headClassName)}
                      >
                        {c.sort ? (
                          <button
                            type="button"
                            onClick={() => setSort(on ? (sort!.dir === -1 ? { key: c.key, dir: 1 } : null) : { key: c.key, dir: -1 })}
                            className={cn("inline-flex items-center gap-1 uppercase hover:text-ink", on && "text-ink")}
                          >
                            {c.header}
                            {on && (sort!.dir === 1 ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />)}
                          </button>
                        ) : (
                          c.header
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const id = getId(r);
                  const sel = selected.has(id);
                  return (
                    <tr
                      key={id}
                      onClick={onRowClick ? () => onRowClick(r) : undefined}
                      onKeyDown={onRowClick ? (e) => e.key === "Enter" && e.target === e.currentTarget && onRowClick(r) : undefined}
                      tabIndex={onRowClick ? 0 : undefined}
                      className={cn(
                        "border-b border-line last:border-0 transition-colors",
                        onRowClick && "cursor-pointer outline-none hover:bg-[#fbfaf6] focus-visible:bg-mint/60",
                        sel && "bg-mint/50 hover:bg-mint/60",
                        rowClassName?.(r),
                      )}
                    >
                      {bulk && (
                        <td className="py-3 pl-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" aria-label="Select row" checked={sel} onChange={() => toggle(id)} className="size-4 accent-mountain" />
                        </td>
                      )}
                      {columns.map((c) => (
                        <td key={c.key} className={cn("px-4 py-3 align-middle", c.align === "right" && "text-right", c.hideBelow && HIDE[c.hideBelow], c.className)}>
                          {c.cell(r)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Phone cards */}
          {mobile && (
            <ul className="divide-y divide-line md:hidden">
              {visible.map((r) => {
                const id = getId(r);
                return (
                  <li key={id} className={cn("flex gap-3 px-4 py-3.5", selected.has(id) && "bg-mint/50")}>
                    {bulk && <input type="checkbox" aria-label="Select" checked={selected.has(id)} onChange={() => toggle(id)} className="mt-1 size-4 shrink-0 accent-mountain" />}
                    <div
                      className={cn("min-w-0 flex-1", onRowClick && "cursor-pointer")}
                      onClick={onRowClick ? () => onRowClick(r) : undefined}
                      role={onRowClick ? "button" : undefined}
                      tabIndex={onRowClick ? 0 : undefined}
                      onKeyDown={onRowClick ? (e) => e.key === "Enter" && onRowClick(r) : undefined}
                    >
                      {mobile(r)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-[13px] text-muted">
            <span className="tabular-nums">
              {current * pageSize + 1}–{Math.min(filtered.length, (current + 1) * pageSize)} of {filtered.length}
            </span>
            {pages > 1 && (
              <div className="flex items-center gap-1">
                <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)} aria-label="Previous page" className="grid size-8 place-items-center rounded-lg border border-line-strong text-ink disabled:opacity-40">
                  <ChevronLeft className="size-4" />
                </button>
                <span className="px-2 tabular-nums">
                  {current + 1} / {pages}
                </span>
                <button type="button" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} aria-label="Next page" className="grid size-8 place-items-center rounded-lg border border-line-strong text-ink disabled:opacity-40">
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Bulk bar */}
      {bulk && selectedRows.length > 0 && (
        <div className="fixed inset-x-3 bottom-4 z-[60] mx-auto flex max-w-2xl animate-fade-in flex-wrap items-center gap-2 rounded-2xl bg-[#0f1a15] p-2 pl-4 text-white shadow-[0_24px_50px_-20px_rgb(0_0_0/0.6)] ring-1 ring-white/10 lg:left-[calc(264px+1rem)]">
          <span className="mr-auto text-[13.5px] font-semibold tabular-nums">{selectedRows.length} selected</span>
          {bulk.map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={() => {
                b.run(selectedRows);
                setSelected(new Set());
              }}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold",
                b.tone === "good" && "bg-[#1f8a5f] hover:bg-[#1a7550]",
                b.tone === "danger" && "bg-[#b4432f] hover:bg-[#9a3b2e]",
                (!b.tone || b.tone === "default") && "bg-white/10 hover:bg-white/20",
              )}
            >
              {b.icon && <b.icon className="size-4" aria-hidden />}
              {b.label}
            </button>
          ))}
          <button type="button" onClick={() => setSelected(new Set())} aria-label="Clear selection" className="grid size-9 place-items-center rounded-lg hover:bg-white/10">
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
