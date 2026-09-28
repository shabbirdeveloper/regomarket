"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, MapPin, Pencil, Plus, Store, Warehouse } from "lucide-react";
import type { AdminBazaar } from "@/lib/admin/types";
import type { DistrictSlug } from "@/types";
import { DISTRICT_NAME, DISTRICT_OPTIONS } from "@/lib/admin/labels";
import { cn } from "@/lib/utils";
import { useAdmin, useRows } from "../store";
import { Drawer } from "../ui/overlay";
import { Btn, EmptyState, Switch } from "../ui/primitives";

const inputCls =
  "h-11 w-full rounded-xl border border-line-strong bg-white px-3.5 text-[14px] text-ink outline-none placeholder:text-muted focus:border-mountain focus:shadow-[0_0_0_4px_rgb(6_78_59/0.1)]";

type Form = { slug: string; name: string; district: DistrictSlug; town: string; description: string; isNew: boolean };

export function BazaarsModule({ initial }: { initial: AdminBazaar[] }) {
  const { patch, add } = useAdmin();
  const rows = useRows("bazaars", initial, "slug");
  const [form, setForm] = useState<Form | null>(null);

  const save = () => {
    if (!form) return;
    const data = { name: form.name.trim(), district: form.district, town: form.town.trim(), description: form.description.trim() };
    if (form.isNew) {
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      add("bazaars", { slug, ...data, image: null, shops: 0, products: 0, visible: false }, { action: "Added bazaar", target: data.name, toast: `${data.name} added (hidden until you turn it on)` });
    } else {
      patch("bazaars", form.slug, data, { action: "Edited bazaar", target: data.name, toast: "Saved" });
    }
    setForm(null);
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Btn tone="primary" onClick={() => setForm({ slug: "", name: "", district: "gilgit", town: "", description: "", isNew: true })}>
          <Plus /> Add bazaar
        </Btn>
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={<Warehouse />} title="No bazaars yet" />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((b) => (
            <li key={b.slug} className={cn("overflow-hidden rounded-2xl border border-line bg-white", !b.visible && "opacity-75")}>
              <div className="relative aspect-[16/8] bg-stone">
                {b.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.image.replace(/w=\d+/, "w=640")} alt="" loading="lazy" className="size-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center bg-[linear-gradient(135deg,#0b4a39,#06392d)] text-gold-soft">
                    <Warehouse className="size-8" aria-hidden />
                  </div>
                )}
                {!b.visible && <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[11.5px] font-semibold text-muted">Hidden</span>}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-ink">{b.name}</p>
                    <p className="flex items-center gap-1 text-[12.5px] text-muted">
                      <MapPin className="size-3.5" aria-hidden /> {b.town}, {DISTRICT_NAME[b.district]}
                    </p>
                  </div>
                  <Switch checked={b.visible} label={`Show ${b.name}`} onChange={(v) => patch("bazaars", b.slug, { visible: v }, { action: v ? "Showed bazaar" : "Hid bazaar", target: b.name, toast: v ? "Visible on the site" : "Hidden" })} />
                </div>
                <p className="mt-2 line-clamp-2 text-[13px] text-ink/75">{b.description || "No description yet."}</p>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
                  <span className="inline-flex items-center gap-1 text-[12.5px] text-muted">
                    <Store className="size-3.5" aria-hidden /> {b.shops} shops · {b.products} products
                  </span>
                  <span className="flex gap-1">
                    <Link href={`/bazaar/${b.slug}`} target="_blank" aria-label="View on site" className="grid size-8 place-items-center rounded-lg text-muted hover:bg-stone hover:text-ink">
                      <ExternalLink className="size-4" />
                    </Link>
                    <button type="button" onClick={() => setForm({ slug: b.slug, name: b.name, district: b.district, town: b.town, description: b.description, isNew: false })} aria-label={`Edit ${b.name}`} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-stone hover:text-ink">
                      <Pencil className="size-4" />
                    </button>
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Drawer
        open={Boolean(form)}
        onClose={() => setForm(null)}
        title={form?.isNew ? "New bazaar" : `Edit ${form?.name ?? ""}`}
        footer={
          <>
            <Btn onClick={() => setForm(null)}>Cancel</Btn>
            <Btn tone="primary" disabled={!form?.name.trim() || !form?.town.trim()} onClick={save}>
              Save
            </Btn>
          </>
        }
      >
        {form && (
          <div className="space-y-4">
            <div>
              <label htmlFor="b-name" className="text-[13px] font-semibold text-ink">
                Name
              </label>
              <input id="b-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Karimabad Bazaar" className={cn(inputCls, "mt-1.5")} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="b-district" className="text-[13px] font-semibold text-ink">
                  District
                </label>
                <select id="b-district" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value as DistrictSlug })} className={cn(inputCls, "mt-1.5")}>
                  {DISTRICT_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="b-town" className="text-[13px] font-semibold text-ink">
                  Town
                </label>
                <input id="b-town" value={form.town} onChange={(e) => setForm({ ...form, town: e.target.value })} placeholder="Karimabad" className={cn(inputCls, "mt-1.5")} />
              </div>
            </div>
            <div>
              <label htmlFor="b-desc" className="text-[13px] font-semibold text-ink">
                Description
              </label>
              <textarea id="b-desc" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={cn(inputCls, "mt-1.5 h-auto resize-none py-2.5")} />
            </div>
            <p className="text-[12px] text-muted">Cover photo upload comes with Supabase Storage (bucket “shop-media”).</p>
          </div>
        )}
      </Drawer>
    </>
  );
}
