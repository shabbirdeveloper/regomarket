"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BadgeCheck, ExternalLink, Search } from "lucide-react";
import type { AdminWanted } from "@/lib/admin/types";
import { CATEGORY_NAME, CATEGORY_OPTIONS, DISTRICT_OPTIONS, place } from "@/lib/admin/labels";
import { useAdmin, useRows } from "../store";
import { DataTable, type Column } from "../ui/data-table";
import { ReasonDialog } from "../ui/overlay";
import { Btn } from "../ui/primitives";
import { StatusPill } from "../ui/status-pill";
import { When } from "../ui/when";

const REMOVE = ["Spam", "Not a real request", "Asking for something not allowed", "Duplicate request", "Contact details in text"];

export function WantedModule({ initial, query }: { initial: AdminWanted[]; query: { q?: string; tab?: string } }) {
  const { patch } = useAdmin();
  const rows = useRows("wanted", initial);
  const [removing, setRemoving] = useState<AdminWanted[] | null>(null);

  const setStatus = (list: AdminWanted[], status: AdminWanted["status"], action: string, toast: string) =>
    patch("wanted", list.map((w) => w.id), { status }, { action, target: list.map((w) => w.title).join(", "), toast });

  const columns = useMemo<Column<AdminWanted>[]>(
    () => [
      {
        key: "req",
        header: "Request",
        sort: (r) => r.title,
        cell: (r) => (
          <div className="min-w-[240px]">
            <p className="font-semibold text-ink">{r.title}</p>
            <p className="flex items-center gap-1 text-[12px] text-muted">
              {r.buyerName}
              {r.buyerVerified && <BadgeCheck className="size-3.5 text-success" aria-label="Verified buyer" />} · {CATEGORY_NAME[r.category]} · {place(r.district)}
            </p>
          </div>
        ),
      },
      { key: "budget", header: "Budget", cell: (r) => <span className="whitespace-nowrap font-medium tabular-nums text-ink">{r.budget}</span> },
      { key: "mode", header: "Type", hideBelow: "xl", cell: (r) => <span className="text-muted">{r.mode}</span> },
      { key: "offers", header: "Offers", align: "right", sort: (r) => r.offers, cell: (r) => <span className="font-semibold tabular-nums">{r.offers}</span> },
      { key: "at", header: "Posted", hideBelow: "lg", sort: (r) => +new Date(r.postedAt), cell: (r) => <When iso={r.postedAt} className="whitespace-nowrap text-muted" /> },
      { key: "status", header: "Status", sort: (r) => r.status, cell: (r) => <StatusPill status={r.status} /> },
      {
        key: "act",
        header: <span className="sr-only">Actions</span>,
        align: "right",
        cell: (r) => (
          <div className="flex items-center justify-end gap-1.5">
            <Link href={`/wanted/${r.slug}`} target="_blank" aria-label="View on site" className="grid size-8 place-items-center rounded-lg text-muted hover:bg-stone hover:text-ink">
              <ExternalLink className="size-4" />
            </Link>
            {r.status === "open" ? (
              <>
                <Btn size="sm" tone="ghost" onClick={() => setStatus([r], "closed", "Closed request", "Request closed")}>
                  Close
                </Btn>
                <Btn size="sm" tone="danger-soft" onClick={() => setRemoving([r])}>
                  Remove
                </Btn>
              </>
            ) : (
              <Btn size="sm" tone="ghost" onClick={() => setStatus([r], "open", "Reopened request", "Request is open again")}>
                Reopen
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
    <>
      <DataTable
        rows={rows}
        getId={(r) => r.id}
        columns={columns}
        initialTab={query.tab ?? "open"}
        initialQuery={query.q}
        tabs={[
          { key: "open", label: "Open", filter: (r) => r.status === "open" },
          { key: "closed", label: "Closed", filter: (r) => r.status === "closed" },
          { key: "removed", label: "Removed", filter: (r) => r.status === "removed" },
          { key: "all", label: "All", filter: () => true },
        ]}
        search={(r) => `${r.title} ${r.buyerName}`}
        searchPlaceholder="Search request or buyer"
        facets={[
          { key: "category", label: "Category", options: CATEGORY_OPTIONS, get: (r) => r.category },
          { key: "district", label: "District", options: DISTRICT_OPTIONS, get: (r) => r.district },
        ]}
        bulk={[
          { label: "Close", run: (list) => setStatus(list, "closed", `Closed ${list.length} requests`, `${list.length} closed`) },
          { label: "Remove", tone: "danger", run: (list) => setRemoving(list) },
        ]}
        mobile={(r) => (
          <div>
            <div className="flex items-start justify-between gap-2">
              <p className="text-[14px] font-semibold leading-snug text-ink">{r.title}</p>
              <StatusPill status={r.status} />
            </div>
            <p className="mt-0.5 text-[12.5px] text-muted">
              {r.budget} · {r.offers} offers · <When iso={r.postedAt} />
            </p>
          </div>
        )}
        empty={{ title: "No requests", icon: <Search /> }}
      />
      <ReasonDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title={removing && removing.length > 1 ? `Remove ${removing.length} requests?` : "Remove this request?"}
        intro="It disappears from Wanted. Sellers who sent offers are told."
        reasons={REMOVE}
        confirmLabel="Remove"
        onConfirm={(reason) =>
          removing && patch("wanted", removing.map((w) => w.id), { status: "removed", reason }, { action: "Removed request", target: removing.map((w) => w.title).join(", "), detail: reason, toast: "Removed", tone: "danger" })
        }
      />
    </>
  );
}
