"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, Eye, EyeOff, MessageSquareQuote, Star } from "lucide-react";
import type { AdminReview } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { useAdmin, useRows } from "../store";
import { DataTable, type Column } from "../ui/data-table";
import { Btn } from "../ui/primitives";
import { StatusPill } from "../ui/status-pill";
import { When } from "../ui/when";

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("size-3.5", i <= n ? "fill-gold text-gold" : "text-line-strong")} aria-hidden />
      ))}
    </span>
  );
}

export function ReviewsModule({ initial, query }: { initial: AdminReview[]; query: { q?: string; tab?: string } }) {
  const { patch } = useAdmin();
  const rows = useRows("reviews", initial);

  const hide = (list: AdminReview[]) =>
    patch("reviews", list.map((r) => r.id), { status: "hidden" }, { action: list.length > 1 ? `Hid ${list.length} reviews` : "Hid review", target: list.map((r) => `${r.author} on ${r.shopName}`).join(", "), toast: list.length > 1 ? `${list.length} reviews hidden` : "Review hidden" });
  const publish = (list: AdminReview[]) =>
    patch("reviews", list.map((r) => r.id), { status: "published", flagReason: undefined }, { action: "Published review", target: list.map((r) => `${r.author} on ${r.shopName}`).join(", "), toast: "Review is visible" });

  const columns = useMemo<Column<AdminReview>[]>(
    () => [
      {
        key: "review",
        header: "Review",
        sort: (r) => r.rating,
        cell: (r) => (
          <div className="min-w-[280px] max-w-xl">
            <div className="flex items-center gap-2">
              <Stars n={r.rating} />
              <span className="text-[12.5px] font-semibold text-ink">{r.author}</span>
              <span className="text-[12px] text-muted">· {r.from}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-ink/85">{r.text}</p>
            {r.flagReason && (
              <p className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-urgent">
                <AlertTriangle className="size-3.5" aria-hidden /> {r.flagReason}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "shop",
        header: "Shop",
        sort: (r) => r.shopName,
        cell: (r) => (
          <Link href={`/admin/shops?q=${encodeURIComponent(r.shopName)}`} onClick={(e) => e.stopPropagation()} className="whitespace-nowrap text-ink/85 hover:text-mountain hover:underline">
            {r.shopName}
          </Link>
        ),
      },
      { key: "at", header: "Posted", hideBelow: "lg", sort: (r) => +new Date(r.postedAt), cell: (r) => <When iso={r.postedAt} className="whitespace-nowrap text-muted" /> },
      { key: "status", header: "Status", sort: (r) => r.status, cell: (r) => <StatusPill status={r.status} /> },
      {
        key: "act",
        header: <span className="sr-only">Actions</span>,
        align: "right",
        cell: (r) => (
          <div className="flex justify-end gap-1.5">
            {r.status !== "hidden" && (
              <Btn size="sm" tone="danger-soft" onClick={() => hide([r])}>
                <EyeOff /> Hide
              </Btn>
            )}
            {r.status !== "published" && (
              <Btn size="sm" tone={r.status === "flagged" ? "success" : "ghost"} onClick={() => publish([r])}>
                <Eye /> {r.status === "flagged" ? "Keep" : "Show"}
              </Btn>
            )}
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <DataTable
      rows={rows}
      getId={(r) => r.id}
      columns={columns}
      initialTab={query.tab ?? (rows.some((r) => r.status === "flagged") ? "flagged" : "published")}
      initialQuery={query.q}
      tabs={[
        { key: "flagged", label: "Flagged", filter: (r) => r.status === "flagged" },
        { key: "published", label: "Published", filter: (r) => r.status === "published" },
        { key: "hidden", label: "Hidden", filter: (r) => r.status === "hidden" },
        { key: "all", label: "All", filter: () => true },
      ]}
      search={(r) => `${r.text} ${r.author} ${r.shopName}`}
      searchPlaceholder="Search text, author or shop"
      facets={[
        {
          key: "rating",
          label: "Stars",
          options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} star${n > 1 ? "s" : ""}` })),
          get: (r) => String(r.rating),
        },
      ]}
      bulk={[
        { label: "Hide", icon: EyeOff, tone: "danger", run: hide },
        { label: "Publish", icon: Eye, tone: "good", run: publish },
      ]}
      mobile={(r) => (
        <div>
          <div className="flex items-center justify-between gap-2">
            <Stars n={r.rating} />
            <StatusPill status={r.status} />
          </div>
          <p className="mt-1.5 line-clamp-3 text-[13.5px] text-ink/85">{r.text}</p>
          <p className="mt-1 text-[12px] text-muted">
            {r.author} → {r.shopName}
          </p>
          <div className="mt-2 flex gap-2">
            {r.status !== "hidden" && (
              <Btn size="sm" tone="danger-soft" onClick={() => hide([r])}>
                Hide
              </Btn>
            )}
            {r.status !== "published" && (
              <Btn size="sm" tone="success" onClick={() => publish([r])}>
                {r.status === "flagged" ? "Keep" : "Show"}
              </Btn>
            )}
          </div>
        </div>
      )}
      empty={{ title: "No reviews here", icon: <MessageSquareQuote /> }}
    />
  );
}
