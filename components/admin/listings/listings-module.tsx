"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, Ban, Check, ExternalLink, Eye, Flag, RotateCcw, Store, Tag, X } from "lucide-react";
import type { AdminListing } from "@/lib/admin/types";
import { CATEGORY_NAME, CATEGORY_OPTIONS, DISTRICT_OPTIONS, place, rs } from "@/lib/admin/labels";
import { useAdmin, useRows } from "../store";
import { DataTable, type Column } from "../ui/data-table";
import { Drawer, ReasonDialog } from "../ui/overlay";
import { Btn, Facts, Tag as Chip, Thumb } from "../ui/primitives";
import { StatusPill } from "../ui/status-pill";
import { When } from "../ui/when";
import { REJECT_AD_REASONS, REMOVE_AD_REASONS } from "./reasons";

type Ask = { kind: "reject" | "remove"; rows: AdminListing[] } | null;

export function ListingsModule({
  initial,
  query,
}: {
  initial: AdminListing[];
  query: { q?: string; tab?: string; open?: string; category?: string; district?: string };
}) {
  const { patch } = useAdmin();
  const rows = useRows("listings", initial);
  const [openId, setOpenId] = useState<string | null>(query.open ?? null);
  const [ask, setAsk] = useState<Ask>(null);
  const open = rows.find((r) => r.id === openId) ?? null;

  const hasPending = rows.some((r) => r.status === "pending");

  const approve = (list: AdminListing[]) =>
    patch(
      "listings",
      list.map((l) => l.id),
      { status: "active", reason: undefined },
      {
        action: list.length > 1 ? `Approved ${list.length} ads` : "Approved ad",
        target: list.length > 1 ? list.map((l) => l.title).slice(0, 3).join(", ") : list[0].title,
        toast: list.length > 1 ? `${list.length} ads approved and live` : `“${list[0].title}” is live`,
      },
    );

  const restore = (l: AdminListing) =>
    patch("listings", l.id, { status: "active", reason: undefined }, { action: "Restored ad", target: l.title, toast: "Ad restored" });

  const columns = useMemo<Column<AdminListing>[]>(
    () => [
      {
        key: "ad",
        header: "Ad",
        sort: (r) => r.title.toLowerCase(),
        cell: (r) => (
          <div className="flex min-w-[240px] items-center gap-3">
            <Thumb src={r.image} size={48} />
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{r.title}</p>
              <p className="flex items-center gap-1.5 text-[12px] text-muted">
                {CATEGORY_NAME[r.category]}
                {r.flags.length > 0 && (
                  <span className="inline-flex items-center gap-0.5 font-semibold text-urgent">
                    <AlertTriangle className="size-3" aria-hidden /> {r.flags.length} check{r.flags.length > 1 ? "s" : ""}
                  </span>
                )}
                {r.reports > 0 && (
                  <span className="inline-flex items-center gap-0.5 font-semibold text-urgent">
                    <Flag className="size-3" aria-hidden /> {r.reports}
                  </span>
                )}
              </p>
            </div>
          </div>
        ),
      },
      { key: "price", header: "Price", sort: (r) => r.price, cell: (r) => <span className="whitespace-nowrap font-semibold tabular-nums text-ink">{rs(r.price)}</span> },
      {
        key: "seller",
        header: "Seller",
        sort: (r) => r.sellerName,
        cell: (r) => (
          <span className="inline-flex items-center gap-1 whitespace-nowrap text-ink/85">
            {r.isShop && <Store className="size-3.5 text-muted" aria-label="Shop" />}
            {r.sellerName}
            {r.sellerVerified && <BadgeCheck className="size-4 text-success" aria-label="Verified" />}
          </span>
        ),
      },
      { key: "place", header: "Location", hideBelow: "xl", sort: (r) => r.district, cell: (r) => <span className="whitespace-nowrap text-muted">{place(r.district, r.town)}</span> },
      { key: "posted", header: "Posted", sort: (r) => +new Date(r.postedAt), cell: (r) => <When iso={r.postedAt} className="whitespace-nowrap text-muted" /> },
      { key: "views", header: "Views", hideBelow: "xl", align: "right", sort: (r) => r.views, cell: (r) => <span className="tabular-nums text-muted">{r.views}</span> },
      { key: "status", header: "Status", sort: (r) => r.status, cell: (r) => <StatusPill status={r.status} /> },
      {
        key: "act",
        header: <span className="sr-only">Actions</span>,
        align: "right",
        cell: (r) => (
          <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {r.status === "pending" ? (
              <>
                <Btn size="sm" tone="danger-soft" onClick={() => setAsk({ kind: "reject", rows: [r] })}>
                  Reject
                </Btn>
                <Btn size="sm" tone="success" onClick={() => approve([r])}>
                  Approve
                </Btn>
              </>
            ) : r.status === "active" ? (
              <Btn size="sm" tone="ghost" onClick={() => setAsk({ kind: "remove", rows: [r] })}>
                Remove
              </Btn>
            ) : r.status === "rejected" || r.status === "removed" ? (
              <Btn size="sm" tone="ghost" onClick={() => restore(r)}>
                Restore
              </Btn>
            ) : null}
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <DataTable
        rows={rows}
        getId={(r) => r.id}
        columns={columns}
        initialTab={query.tab ?? (query.q || query.category || query.district ? "all" : hasPending ? "pending" : "active")}
        initialQuery={query.q}
        initialFacets={{ ...(query.category ? { category: query.category } : {}), ...(query.district ? { district: query.district } : {}) }}
        tabs={[
          { key: "pending", label: "Waiting", filter: (r) => r.status === "pending" },
          { key: "active", label: "Live", filter: (r) => r.status === "active" },
          { key: "rejected", label: "Rejected / removed", filter: (r) => r.status === "rejected" || r.status === "removed" },
          { key: "closed", label: "Sold / expired", filter: (r) => r.status === "sold" || r.status === "expired" },
          { key: "all", label: "All", filter: () => true },
        ]}
        search={(r) => `${r.title} ${r.sellerName} ${r.id} ${r.town ?? ""}`}
        searchPlaceholder="Search title, seller or ad ID"
        facets={[
          { key: "category", label: "Category", options: CATEGORY_OPTIONS, get: (r) => r.category },
          { key: "district", label: "District", options: DISTRICT_OPTIONS, get: (r) => r.district },
          {
            key: "risk",
            label: "Checks",
            options: [
              { value: "flag", label: "Has automatic flags" },
              { value: "rep", label: "Reported by users" },
              { value: "new", label: "Unverified seller" },
            ],
            get: (r) => [r.flags.length ? "flag" : "", r.reports ? "rep" : "", r.sellerVerified ? "" : "new"],
          },
        ]}
        bulk={[
          { label: "Approve", icon: Check, tone: "good", run: (list) => approve(list.filter((l) => l.status === "pending")) },
          { label: "Reject", icon: X, tone: "danger", run: (list) => setAsk({ kind: "reject", rows: list }) },
        ]}
        onRowClick={(r) => setOpenId(r.id)}
        rowClassName={(r) => (r.flags.length || r.reports ? "shadow-[inset_3px_0_0_#b4432f]" : undefined)}
        mobile={(r) => (
          <div className="flex gap-3">
            <Thumb src={r.image} size={64} />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-ink">{r.title}</p>
              <p className="mt-0.5 text-[13px] font-semibold text-ink">{rs(r.price)}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-muted">
                <StatusPill status={r.status} />
                <span>{r.sellerName}</span>
                <When iso={r.postedAt} />
              </div>
            </div>
          </div>
        )}
        empty={{ title: "No ads here", body: "Nothing matches these filters.", icon: <Tag /> }}
      />

      {/* Detail */}
      <Drawer
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        title={open?.title}
        subtitle={
          open && (
            <span className="flex flex-wrap items-center gap-2">
              <StatusPill status={open.status} /> {open.id} · <When iso={open.postedAt} />
            </span>
          )
        }
        footer={
          open && (
            <>
              <Link href={`/listing/${open.slug}`} target="_blank" className="mr-auto inline-flex h-10 items-center gap-1.5 px-2 text-[13.5px] font-semibold text-mountain hover:underline">
                View on site <ExternalLink className="size-3.5" aria-hidden />
              </Link>
              {open.status === "pending" && (
                <>
                  <Btn tone="danger-soft" onClick={() => setAsk({ kind: "reject", rows: [open] })}>
                    <X /> Reject
                  </Btn>
                  <Btn tone="success" onClick={() => approve([open])}>
                    <Check /> Approve
                  </Btn>
                </>
              )}
              {open.status === "active" && (
                <Btn tone="danger-soft" onClick={() => setAsk({ kind: "remove", rows: [open] })}>
                  <Ban /> Remove ad
                </Btn>
              )}
              {(open.status === "rejected" || open.status === "removed") && (
                <Btn tone="primary" onClick={() => restore(open)}>
                  <RotateCcw /> Restore
                </Btn>
              )}
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-xl border border-line bg-stone">
              {open.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={open.image.replace(/w=\d+/, "w=900")} alt="" className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="grid aspect-[4/3] place-items-center text-muted">No photo</div>
              )}
            </div>

            {open.flags.length > 0 && (
              <div className="rounded-xl border border-[#efcfc7] bg-urgent-wash p-4">
                <p className="flex items-center gap-2 text-[13.5px] font-semibold text-urgent">
                  <AlertTriangle className="size-4" aria-hidden /> Automatic checks
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-ink/85">
                  {open.flags.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {open.reason && (
              <p className="rounded-xl bg-stone px-4 py-3 text-[13px] text-ink/85">
                <span className="font-semibold">Reason sent to seller:</span> {open.reason}
              </p>
            )}

            <Facts
              items={[
                ["Price", <span key="p" className="tabular-nums">{rs(open.price)}{open.unit ? ` / ${open.unit}` : ""}</span>],
                ["Category", CATEGORY_NAME[open.category]],
                ["Location", place(open.district, open.town)],
                ["Views", open.views],
                ["Reports", open.reports ? <span key="r" className="text-urgent">{open.reports}</span> : "None"],
              ]}
            />

            {open.description && (
              <div>
                <p className="text-[13px] font-semibold text-ink">Description</p>
                <p className="mt-1.5 whitespace-pre-line rounded-xl border border-line bg-white p-4 text-[14px] leading-relaxed text-ink/85">{open.description}</p>
              </div>
            )}

            <div className="flex items-center gap-3 rounded-xl border border-line bg-white p-4">
              <span className="grid size-10 place-items-center rounded-full bg-mint text-mountain">{open.isShop ? <Store className="size-5" /> : <Eye className="size-5" />}</span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 text-[14px] font-semibold text-ink">
                  {open.sellerName} {open.sellerVerified && <BadgeCheck className="size-4 text-success" aria-label="Verified" />}
                </p>
                <p className="text-[12.5px] text-muted">{open.isShop ? "Shop" : "Individual seller"} · {open.sellerVerified ? "ID verified" : "Not verified yet"}</p>
              </div>
              <Link href={`/admin/users?q=${encodeURIComponent(open.sellerName)}`} className="text-[13px] font-semibold text-mountain hover:underline">
                Open user
              </Link>
            </div>

            {!open.sellerVerified && open.status === "pending" && <Chip tone="gold">Tip: first ad from an unverified seller — check photos and price carefully.</Chip>}
          </div>
        )}
      </Drawer>

      <ReasonDialog
        open={ask?.kind === "reject"}
        onClose={() => setAsk(null)}
        title={ask && ask.rows.length > 1 ? `Reject ${ask.rows.length} ads?` : "Reject this ad?"}
        intro="The seller gets your reason by SMS and in the app, and can fix the ad and send it again."
        reasons={REJECT_AD_REASONS}
        confirmLabel="Reject"
        onConfirm={(reason) =>
          ask &&
          patch(
            "listings",
            ask.rows.map((r) => r.id),
            { status: "rejected", reason },
            {
              action: ask.rows.length > 1 ? `Rejected ${ask.rows.length} ads` : "Rejected ad",
              target: ask.rows.map((r) => r.title).slice(0, 3).join(", "),
              detail: reason,
              toast: ask.rows.length > 1 ? `${ask.rows.length} ads rejected` : "Ad rejected",
              tone: "danger",
            },
          )
        }
      />
      <ReasonDialog
        open={ask?.kind === "remove"}
        onClose={() => setAsk(null)}
        title="Remove this live ad?"
        intro="It disappears from the site straight away. The seller is told why."
        reasons={REMOVE_AD_REASONS}
        confirmLabel="Remove ad"
        onConfirm={(reason) =>
          ask &&
          patch("listings", ask.rows.map((r) => r.id), { status: "removed", reason }, { action: "Removed ad", target: ask.rows[0].title, detail: reason, toast: "Ad removed", tone: "danger" })
        }
      />
    </>
  );
}
