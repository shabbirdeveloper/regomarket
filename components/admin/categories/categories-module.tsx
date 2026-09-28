"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, FolderTree, Pencil, Plus } from "lucide-react";
import type { AdminCategory } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { useAdmin, useRows } from "../store";
import { Drawer } from "../ui/overlay";
import { Btn, EmptyState, Switch, Thumb } from "../ui/primitives";

const inputCls =
  "h-11 w-full rounded-xl border border-line-strong bg-white px-3.5 text-[14px] text-ink outline-none placeholder:text-muted focus:border-mountain focus:shadow-[0_0_0_4px_rgb(6_78_59/0.1)]";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

type Form = { slug: string; name: string; shortName: string; description: string; isNew: boolean };

export function CategoriesModule({ initial }: { initial: AdminCategory[] }) {
  const { patch, add } = useAdmin();
  const rows = useRows("categories", initial, "slug");
  const [form, setForm] = useState<Form | null>(null);

  const list = useMemo(() => [...rows].sort((a, b) => a.sort - b.sort), [rows]);

  const move = (i: number, dir: -1 | 1) => {
    const a = list[i];
    const b = list[i + dir];
    if (!a || !b) return;
    patch("categories", a.slug, { sort: b.sort });
    patch("categories", b.slug, { sort: a.sort }, { action: "Reordered categories", target: a.shortName, toast: `${a.shortName} moved ${dir < 0 ? "up" : "down"}`, undoable: false });
  };

  const save = () => {
    if (!form) return;
    const data = { name: form.name.trim(), shortName: form.shortName.trim() || form.name.trim(), description: form.description.trim() };
    if (form.isNew) {
      add(
        "categories",
        { slug: form.slug || slugify(data.name), ...data, icon: null, ads: 0, visible: false, sort: list.length + 1 },
        { action: "Added category", target: data.name, toast: `${data.shortName} added (hidden until you turn it on)` },
      );
    } else {
      patch("categories", form.slug, data, { action: "Edited category", target: data.shortName, toast: "Saved" });
    }
    setForm(null);
  };

  return (
    <>
      <div className="rounded-2xl border border-line bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <p className="text-[13.5px] text-muted">The order here is the order on the homepage and in menus.</p>
          <Btn tone="primary" size="sm" onClick={() => setForm({ slug: "", name: "", shortName: "", description: "", isNew: true })}>
            <Plus /> Add category
          </Btn>
        </div>
        {list.length === 0 ? (
          <EmptyState icon={<FolderTree />} title="No categories" />
        ) : (
          <ol className="divide-y divide-line">
            {list.map((c, i) => (
              <li key={c.slug} className={cn("flex items-center gap-3 px-4 py-3 md:px-5", !c.visible && "bg-[#fbfaf6]")}>
                <div className="flex flex-col">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${c.shortName} up`} className="grid size-6 place-items-center rounded text-muted hover:bg-stone hover:text-ink disabled:opacity-30">
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button type="button" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${c.shortName} down`} className="grid size-6 place-items-center rounded text-muted hover:bg-stone hover:text-ink disabled:opacity-30">
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
                <span className="w-6 text-center text-[12px] font-semibold tabular-nums text-muted">{i + 1}</span>
                <Thumb src={c.icon} size={40} className="bg-mint p-1 [&_img]:object-contain" fallback={c.shortName.slice(0, 2)} />
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-[14px] font-semibold", c.visible ? "text-ink" : "text-muted")}>{c.name}</p>
                  <p className="truncate text-[12.5px] text-muted">{c.description || "—"}</p>
                </div>
                <span className="hidden w-20 text-right text-[13px] tabular-nums text-muted sm:block">{c.ads} ads</span>
                <Link href={`/search?category=${c.slug}`} target="_blank" aria-label="View on site" className="hidden size-9 place-items-center rounded-lg text-muted hover:bg-stone hover:text-ink md:grid">
                  <ExternalLink className="size-4" />
                </Link>
                <button type="button" onClick={() => setForm({ slug: c.slug, name: c.name, shortName: c.shortName, description: c.description, isNew: false })} aria-label={`Edit ${c.shortName}`} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-stone hover:text-ink">
                  <Pencil className="size-4" />
                </button>
                <Switch
                  checked={c.visible}
                  label={`Show ${c.shortName}`}
                  onChange={(v) => patch("categories", c.slug, { visible: v }, { action: v ? "Showed category" : "Hid category", target: c.shortName, toast: v ? `${c.shortName} is visible` : `${c.shortName} hidden` })}
                />
              </li>
            ))}
          </ol>
        )}
      </div>

      <Drawer
        open={Boolean(form)}
        onClose={() => setForm(null)}
        title={form?.isNew ? "New category" : `Edit ${form?.shortName ?? ""}`}
        footer={
          <>
            <Btn onClick={() => setForm(null)}>Cancel</Btn>
            <Btn tone="primary" disabled={!form?.name.trim()} onClick={save}>
              Save
            </Btn>
          </>
        }
      >
        {form && (
          <div className="space-y-4">
            <div>
              <label htmlFor="c-name" className="text-[13px] font-semibold text-ink">
                Full name
              </label>
              <input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.isNew ? slugify(e.target.value) : form.slug })} placeholder="Tourism & Guides" className={cn(inputCls, "mt-1.5")} />
            </div>
            <div>
              <label htmlFor="c-short" className="text-[13px] font-semibold text-ink">
                Short name <span className="font-normal text-muted">(menus and chips)</span>
              </label>
              <input id="c-short" value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })} placeholder="Tourism" className={cn(inputCls, "mt-1.5")} />
            </div>
            <div>
              <label htmlFor="c-desc" className="text-[13px] font-semibold text-ink">
                Description
              </label>
              <textarea id="c-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={cn(inputCls, "mt-1.5 h-auto resize-none py-2.5")} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-ink">Web address</p>
              <p className="mt-1.5 rounded-xl bg-stone px-3.5 py-2.5 font-mono text-[12.5px] text-ink/80">/search?category={form.slug || "…"}</p>
              {!form.isNew && <p className="mt-1 text-[12px] text-muted">The address can’t change, so old links keep working.</p>}
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
