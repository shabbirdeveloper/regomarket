"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpenText, Eye, ExternalLink, FileText, Pencil, Plus } from "lucide-react";
import type { AdminPost } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { useAdmin, useRows } from "../store";
import { DataTable, type Column } from "../ui/data-table";
import { Drawer } from "../ui/overlay";
import { Btn, Thumb } from "../ui/primitives";
import { StatusPill } from "../ui/status-pill";

const CATS = ["Guides", "Selling tips", "Safety", "Local"];
const inputCls =
  "h-11 w-full rounded-xl border border-line-strong bg-white px-3.5 text-[14px] text-ink outline-none placeholder:text-muted focus:border-mountain focus:shadow-[0_0_0_4px_rgb(6_78_59/0.1)]";

type Form = { slug: string; title: string; excerpt: string; category: string; cover: string; body: string; isNew: boolean; status: AdminPost["status"] };

/** Very small writing format: "## " heading, "- " list item, blank line = new paragraph. */
function Preview({ body }: { body: string }) {
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-3 text-[14.5px] leading-relaxed text-ink/85">
      {blocks.map((b, i) =>
        b.startsWith("## ") ? (
          <h3 key={i} className="pt-2 text-[17px] font-semibold text-ink">
            {b.slice(3)}
          </h3>
        ) : b.split("\n").every((l) => l.trim().startsWith("- ")) ? (
          <ul key={i} className="list-disc space-y-1 pl-5">
            {b.split("\n").map((l, j) => (
              <li key={j}>{l.trim().slice(2)}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{b}</p>
        ),
      )}
      {blocks.length === 0 && <p className="text-muted">Nothing written yet.</p>}
    </div>
  );
}

export function BlogModule({ initial, startNew }: { initial: AdminPost[]; startNew?: boolean }) {
  const { admin, patch, add } = useAdmin();
  const rows = useRows("blog", initial, "slug");
  const [form, setForm] = useState<Form | null>(startNew ? { slug: "", title: "", excerpt: "", category: "Guides", cover: "", body: "", isNew: true, status: "draft" } : null);
  const [preview, setPreview] = useState(false);

  const save = (status: AdminPost["status"]) => {
    if (!form) return;
    const words = form.body.split(/\s+/).filter(Boolean).length;
    const data = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      category: form.category,
      cover: form.cover.trim() || null,
      body: form.body,
      readMins: Math.max(1, Math.round(words / 200)),
      status,
    };
    const verb = status === "published" ? "Published post" : "Saved draft";
    if (form.isNew) {
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
      add("blog", { slug, ...data, date: new Date().toISOString().slice(0, 10), author: admin.name }, { action: verb, target: data.title, toast: status === "published" ? "Post published" : "Draft saved" });
    } else {
      patch("blog", form.slug, data, { action: verb, target: data.title, toast: status === "published" ? "Post published" : "Draft saved" });
    }
    setForm(null);
    setPreview(false);
  };

  const columns = useMemo<Column<AdminPost>[]>(
    () => [
      {
        key: "post",
        header: "Post",
        sort: (r) => r.title,
        cell: (r) => (
          <div className="flex min-w-[260px] items-center gap-3">
            <Thumb src={r.cover} size={56} className="h-10 w-14" fallback={<FileText className="size-4" />} />
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{r.title}</p>
              <p className="truncate text-[12px] text-muted">{r.excerpt}</p>
            </div>
          </div>
        ),
      },
      { key: "cat", header: "Category", hideBelow: "lg", cell: (r) => <span className="text-muted">{r.category}</span> },
      { key: "author", header: "Author", hideBelow: "xl", cell: (r) => <span className="text-muted">{r.author}</span> },
      { key: "date", header: "Date", sort: (r) => r.date, cell: (r) => <span className="whitespace-nowrap text-muted">{new Date(r.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span> },
      { key: "status", header: "Status", sort: (r) => r.status, cell: (r) => <StatusPill status={r.status} /> },
      {
        key: "act",
        header: <span className="sr-only">Actions</span>,
        align: "right",
        cell: (r) => (
          <div className="flex items-center justify-end gap-1">
            {r.status === "published" && (
              <Link href={`/blog/${r.slug}`} target="_blank" aria-label="View on site" className="grid size-8 place-items-center rounded-lg text-muted hover:bg-stone hover:text-ink">
                <ExternalLink className="size-4" />
              </Link>
            )}
            <button
              type="button"
              aria-label={`Edit ${r.title}`}
              onClick={() => setForm({ slug: r.slug, title: r.title, excerpt: r.excerpt, category: r.category, cover: r.cover ?? "", body: (r as AdminPost & { body?: string }).body ?? "", isNew: false, status: r.status })}
              className="grid size-8 place-items-center rounded-lg text-muted hover:bg-stone hover:text-ink"
            >
              <Pencil className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const words = form ? form.body.split(/\s+/).filter(Boolean).length : 0;

  return (
    <>
      <DataTable
        rows={rows}
        getId={(r) => r.slug}
        columns={columns}
        tabs={[
          { key: "all", label: "All", filter: () => true },
          { key: "published", label: "Published", filter: (r) => r.status === "published" },
          { key: "draft", label: "Drafts", filter: (r) => r.status === "draft" },
        ]}
        search={(r) => `${r.title} ${r.excerpt}`}
        searchPlaceholder="Search posts"
        toolbar={
          <Btn tone="primary" onClick={() => setForm({ slug: "", title: "", excerpt: "", category: "Guides", cover: "", body: "", isNew: true, status: "draft" })}>
            <Plus /> New post
          </Btn>
        }
        mobile={(r) => (
          <div className="flex items-center gap-3">
            <Thumb src={r.cover} size={52} fallback={<FileText className="size-4" />} />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-ink">{r.title}</p>
              <div className="mt-1">
                <StatusPill status={r.status} />
              </div>
            </div>
          </div>
        )}
        empty={{ title: "No posts", icon: <BookOpenText /> }}
      />

      <Drawer
        open={Boolean(form)}
        onClose={() => {
          setForm(null);
          setPreview(false);
        }}
        width={760}
        title={form?.isNew ? "New post" : "Edit post"}
        subtitle={form && `${words} words · about ${Math.max(1, Math.round(words / 200))} min read`}
        footer={
          form && (
            <>
              <Btn className="mr-auto" tone="ghost" onClick={() => setPreview((p) => !p)}>
                {preview ? <Pencil /> : <Eye />} {preview ? "Write" : "Preview"}
              </Btn>
              <Btn disabled={!form.title.trim()} onClick={() => save("draft")}>
                {form.status === "published" && !form.isNew ? "Unpublish" : "Save draft"}
              </Btn>
              <Btn tone="primary" disabled={!form.title.trim() || !form.excerpt.trim()} onClick={() => save("published")}>
                {form.status === "published" && !form.isNew ? "Update" : "Publish"}
              </Btn>
            </>
          )
        }
      >
        {form &&
          (preview ? (
            <article className="rounded-2xl border border-line bg-white p-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-gold-ink">{form.category}</p>
              <h2 className="mt-2 text-[24px] font-bold leading-tight tracking-[-0.02em] text-ink">{form.title || "Untitled"}</h2>
              <p className="mt-2 text-[15px] text-muted">{form.excerpt}</p>
              <hr className="my-5 border-line" />
              <Preview body={form.body} />
            </article>
          ) : (
            <div className="space-y-4">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Post title"
                aria-label="Title"
                className="w-full bg-transparent text-[24px] font-bold tracking-[-0.02em] text-ink outline-none placeholder:text-line-strong"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
                <div>
                  <label htmlFor="p-ex" className="text-[13px] font-semibold text-ink">
                    Short summary
                  </label>
                  <input id="p-ex" maxLength={160} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="One line shown on cards and Google" className={cn(inputCls, "mt-1.5")} />
                </div>
                <div>
                  <label htmlFor="p-cat" className="text-[13px] font-semibold text-ink">
                    Category
                  </label>
                  <select id="p-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={cn(inputCls, "mt-1.5")}>
                    {CATS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="p-cover" className="text-[13px] font-semibold text-ink">
                  Cover photo link <span className="font-normal text-muted">(optional)</span>
                </label>
                <input id="p-cover" value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} placeholder="https://…" className={cn(inputCls, "mt-1.5 font-mono text-[12.5px]")} />
              </div>
              <div>
                <div className="flex items-end justify-between gap-2">
                  <label htmlFor="p-body" className="text-[13px] font-semibold text-ink">
                    Text
                  </label>
                  <span className="text-[11.5px] text-muted">## Heading · - list item · empty line = new paragraph</span>
                </div>
                <textarea
                  id="p-body"
                  rows={16}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder={"Start writing…\n\n## First heading\n\n- A point\n- Another point"}
                  className={cn(inputCls, "mt-1.5 h-auto resize-y py-3 leading-relaxed")}
                />
                {!form.isNew && !form.body && <p className="mt-1 text-[12px] text-muted">Existing posts keep their current text unless you write a new version here.</p>}
              </div>
            </div>
          ))}
      </Drawer>
    </>
  );
}
