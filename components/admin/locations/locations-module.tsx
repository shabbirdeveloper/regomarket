"use client";

import { useState } from "react";
import { ChevronDown, Map, MapPin, Plus } from "lucide-react";
import type { AdminDistrict } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { useAdmin, useRows } from "../store";
import { Btn, EmptyState } from "../ui/primitives";

/** Districts → tehsils → towns. Towns added here appear in every location picker. */
export function LocationsModule({ initial }: { initial: AdminDistrict[] }) {
  const { patch } = useAdmin();
  const rows = useRows("locations", initial, "slug");
  const [open, setOpen] = useState<string | null>(initial[0]?.slug ?? null);
  const [adding, setAdding] = useState<{ district: string; tehsil: string; name: string } | null>(null);

  const addTown = () => {
    if (!adding || !adding.name.trim()) return;
    const d = rows.find((r) => r.slug === adding.district)!;
    const tehsils = d.tehsils.map((t) => (t.name === adding.tehsil ? { ...t, towns: t.towns + 1, added: [...((t as { added?: string[] }).added ?? []), adding.name.trim()] } : t));
    patch("locations", d.slug, { tehsils }, { action: "Added town", target: `${adding.name.trim()}, ${d.name}`, toast: `${adding.name.trim()} added to ${adding.tehsil}` });
    setAdding(null);
  };

  const totalTowns = rows.reduce((n, d) => n + d.tehsils.reduce((m, t) => m + t.towns, 0), 0);

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-3 gap-3">
        {[
          ["Districts", rows.length],
          ["Tehsils", rows.reduce((n, d) => n + d.tehsils.length, 0)],
          ["Towns & villages", totalTowns],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-line bg-white p-4">
            <dt className="text-[12.5px] text-muted">{l}</dt>
            <dd className="text-[22px] font-bold tabular-nums text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      {rows.length === 0 ? (
        <EmptyState icon={<Map />} title="No districts" />
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-line bg-white">
          {rows.map((d) => {
            const isOpen = open === d.slug;
            return (
              <li key={d.slug} className="border-b border-line last:border-0">
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : d.slug)} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-[#fbfaf6]">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mint text-mountain">
                    <MapPin className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-ink">{d.name}</span>
                    <span className="block text-[12.5px] text-muted">
                      {d.division} division · HQ {d.headquarters} · {d.tehsils.length} tehsils
                    </span>
                  </span>
                  <span className="hidden text-[13px] tabular-nums text-muted sm:block">{d.ads} ads</span>
                  <ChevronDown className={cn("size-5 text-muted transition-transform", isOpen && "rotate-180")} aria-hidden />
                </button>
                {isOpen && (
                  <div className="grid grid-cols-1 gap-3 bg-[#fbfaf6] px-5 pb-5 pt-1 sm:grid-cols-2 xl:grid-cols-3">
                    {d.tehsils.map((t) => {
                      const added = (t as { added?: string[] }).added ?? [];
                      const here = adding?.district === d.slug && adding.tehsil === t.name;
                      return (
                        <div key={t.name} className="rounded-xl border border-line bg-white p-4">
                          <p className="text-[14px] font-semibold text-ink">{t.name}</p>
                          <p className="text-[12.5px] text-muted">{t.towns} towns & villages</p>
                          {added.length > 0 && <p className="mt-1 text-[12px] text-success">New: {added.join(", ")}</p>}
                          {here ? (
                            <form
                              className="mt-3 flex gap-2"
                              onSubmit={(e) => {
                                e.preventDefault();
                                addTown();
                              }}
                            >
                              <input
                                autoFocus
                                value={adding.name}
                                onChange={(e) => setAdding({ ...adding, name: e.target.value })}
                                placeholder="Town name"
                                aria-label="Town name"
                                className="h-9 min-w-0 flex-1 rounded-lg border border-line-strong px-3 text-[13.5px] outline-none focus:border-mountain"
                              />
                              <Btn size="sm" tone="primary" type="submit" disabled={!adding.name.trim()}>
                                Add
                              </Btn>
                            </form>
                          ) : (
                            <button type="button" onClick={() => setAdding({ district: d.slug, tehsil: t.name, name: "" })} className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-mountain hover:underline">
                              <Plus className="size-3.5" aria-hidden /> Add town
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
