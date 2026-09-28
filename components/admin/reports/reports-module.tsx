"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, Flag, MessageSquareQuote, Search, Store, Tag, User, XCircle } from "lucide-react";
import type { AdminReport } from "@/lib/admin/types";
import type { ModuleKey } from "@/lib/admin/modules";
import { cn } from "@/lib/utils";
import { useAdmin, useRows } from "../store";
import { DataTable, type Column } from "../ui/data-table";
import { Drawer, Modal } from "../ui/overlay";
import { Btn, Facts } from "../ui/primitives";
import { StatusPill } from "../ui/status-pill";
import { When } from "../ui/when";

const KIND = {
  ad: { label: "Ad", icon: Tag },
  user: { label: "User", icon: User },
  shop: { label: "Shop", icon: Store },
  review: { label: "Review", icon: MessageSquareQuote },
} as const;

interface Outcome {
  key: string;
  label: string;
  note: string;
  /** What else happens when this is chosen */
  effect?: { module: ModuleKey; changes: Record<string, unknown>; action: string };
}

function outcomesFor(kind: AdminReport["targetKind"]): Outcome[] {
  const warn: Outcome = { key: "warn", label: "Warn them", note: "Send a warning. Nothing is removed." };
  switch (kind) {
    case "ad":
      return [{ key: "remove", label: "Remove the ad", note: "The ad is taken down and the seller is told why.", effect: { module: "listings", changes: { status: "removed" }, action: "Removed ad" } }, warn];
    case "user":
      return [{ key: "suspend", label: "Suspend the user", note: "They can't post, message or order.", effect: { module: "users", changes: { status: "suspended" }, action: "Suspended user" } }, warn];
    case "shop":
      return [{ key: "suspend", label: "Suspend the shop", note: "Shop and its ads are hidden.", effect: { module: "shops", changes: { status: "suspended" }, action: "Suspended shop" } }, warn];
    case "review":
      return [{ key: "hide", label: "Hide the review", note: "It stops showing on the shop page.", effect: { module: "reviews", changes: { status: "hidden" }, action: "Hid review" } }, warn];
  }
}

export function ReportsModule({ initial, query }: { initial: AdminReport[]; query: { q?: string; tab?: string } }) {
  const { patch } = useAdmin();
  const rows = useRows("reports", initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [resolving, setResolving] = useState<AdminReport | null>(null);
  const [outcome, setOutcome] = useState<string>("");
  const [note, setNote] = useState("");
  const open = rows.find((r) => r.id === openId) ?? null;

  useEffect(() => {
    setOutcome("");
    setNote("");
  }, [resolving]);

  const columns = useMemo<Column<AdminReport>[]>(
    () => [
      {
        key: "what",
        header: "Report",
        sort: (r) => r.reason,
        cell: (r) => {
          const K = KIND[r.targetKind];
          return (
            <div className="flex min-w-[260px] items-center gap-3">
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", r.status === "open" ? "bg-urgent-wash text-urgent" : "bg-stone text-muted")}>
                <K.icon className="size-[18px]" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{r.reason}</p>
                <p className="truncate text-[12px] text-muted">
                  {K.label}: {r.targetLabel}
                </p>
              </div>
            </div>
          );
        },
      },
      { key: "details", header: "Details", hideBelow: "xl", cell: (r) => <p className="line-clamp-2 max-w-xs text-[12.5px] text-muted">{r.details ?? "—"}</p> },
      { key: "by", header: "Reported by", hideBelow: "lg", sort: (r) => r.reporter, cell: (r) => <span className="whitespace-nowrap text-ink/85">{r.reporter}</span> },
      {
        key: "dup",
        header: "Others",
        align: "right",
        sort: (r) => r.duplicates,
        cell: (r) => (r.duplicates ? <span className="font-semibold tabular-nums text-urgent">+{r.duplicates}</span> : <span className="text-muted">—</span>),
      },
      { key: "at", header: "When", sort: (r) => +new Date(r.createdAt), cell: (r) => <When iso={r.createdAt} className="whitespace-nowrap text-muted" /> },
      { key: "status", header: "Status", sort: (r) => r.status, cell: (r) => <StatusPill status={r.status} /> },
    ],
    [],
  );

  const outs = resolving ? outcomesFor(resolving.targetKind) : [];

  return (
    <>
      <DataTable
        rows={rows}
        getId={(r) => r.id}
        columns={columns}
        initialTab={query.tab ?? (query.q ? "all" : "open")}
        initialQuery={query.q}
        tabs={[
          { key: "open", label: "Needs action", filter: (r) => r.status === "open" || r.status === "reviewing" },
          { key: "resolved", label: "Resolved", filter: (r) => r.status === "resolved" },
          { key: "dismissed", label: "Dismissed", filter: (r) => r.status === "dismissed" },
          { key: "all", label: "All", filter: () => true },
        ]}
        search={(r) => `${r.reason} ${r.targetLabel} ${r.reporter} ${r.details ?? ""}`}
        searchPlaceholder="Search reason, target or reporter"
        facets={[
          {
            key: "kind",
            label: "About",
            options: Object.entries(KIND).map(([value, k]) => ({ value, label: k.label })),
            get: (r) => r.targetKind,
          },
        ]}
        onRowClick={(r) => setOpenId(r.id)}
        rowClassName={(r) => (r.duplicates >= 2 && r.status === "open" ? "shadow-[inset_3px_0_0_#b4432f]" : undefined)}
        mobile={(r) => (
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[14px] font-semibold text-ink">{r.reason}</p>
              <StatusPill status={r.status} />
            </div>
            <p className="mt-0.5 truncate text-[12.5px] text-muted">
              {KIND[r.targetKind].label}: {r.targetLabel} · <When iso={r.createdAt} />
            </p>
          </div>
        )}
        empty={{ title: "No reports", body: "Nothing needs action right now.", icon: <Flag /> }}
      />

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        title={open?.reason}
        subtitle={
          open && (
            <span className="flex items-center gap-2">
              <StatusPill status={open.status} /> <When iso={open.createdAt} /> · by {open.reporter}
            </span>
          )
        }
        footer={
          open &&
          (open.status === "open" || open.status === "reviewing") && (
            <>
              {open.status === "open" && (
                <Btn className="mr-auto" onClick={() => patch("reports", open.id, { status: "reviewing" }, { action: "Started review", target: open.targetLabel, toast: "Marked as in review" })}>
                  <Search /> Start review
                </Btn>
              )}
              <Btn
                tone="danger-soft"
                onClick={() =>
                  patch("reports", open.id, { status: "dismissed", resolution: "No rule broken" }, { action: "Dismissed report", target: open.targetLabel, detail: "No rule broken", toast: "Report dismissed" })
                }
              >
                <XCircle /> Dismiss
              </Btn>
              <Btn tone="primary" onClick={() => setResolving(open)}>
                <CheckCircle2 /> Take action
              </Btn>
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <Link href={open.targetHref} className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 hover:border-mountain/40">
              <span className="grid size-10 place-items-center rounded-xl bg-stone text-ink/70">
                {(() => {
                  const I = KIND[open.targetKind].icon;
                  return <I className="size-5" aria-hidden />;
                })()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] text-muted">{KIND[open.targetKind].label}</span>
                <span className="block truncate text-[14px] font-semibold text-ink">{open.targetLabel}</span>
              </span>
              <ArrowUpRight className="size-4 text-muted" aria-hidden />
            </Link>

            {open.details && (
              <blockquote className="rounded-xl border-l-4 border-gold bg-white p-4 text-[14px] leading-relaxed text-ink/85">“{open.details}”</blockquote>
            )}

            <Facts
              items={[
                ["Reported by", open.reporter],
                ["Same report from others", open.duplicates ? `${open.duplicates} more` : "None"],
                ...(open.resolution ? ([["Outcome", open.resolution]] as [string, string][]) : []),
              ]}
            />
            {open.duplicates >= 2 && open.status !== "resolved" && (
              <p className="rounded-xl bg-urgent-wash px-4 py-3 text-[13px] text-urgent">Several people reported this. Look at it first.</p>
            )}
          </div>
        )}
      </Drawer>

      <Modal
        open={Boolean(resolving)}
        onClose={() => setResolving(null)}
        title="Take action"
        footer={
          <>
            <Btn onClick={() => setResolving(null)}>Cancel</Btn>
            <Btn
              tone="primary"
              disabled={!outcome}
              onClick={() => {
                if (!resolving) return;
                const o = outs.find((x) => x.key === outcome)!;
                const resolution = [o.label, note.trim()].filter(Boolean).join(" — ");
                if (o.effect) patch(o.effect.module, resolving.targetId, { ...o.effect.changes, reason: resolving.reason }, { action: o.effect.action, target: resolving.targetLabel, detail: resolving.reason });
                patch("reports", resolving.id, { status: "resolved", resolution }, { action: "Resolved report", target: resolving.targetLabel, detail: resolution, toast: "Report resolved — reporter notified" });
                setResolving(null);
              }}
            >
              Resolve report
            </Btn>
          </>
        }
      >
        <div role="radiogroup" aria-label="Outcome" className="space-y-2">
          {outs.map((o) => (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={outcome === o.key}
              onClick={() => setOutcome(o.key)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                outcome === o.key ? "border-mountain bg-mint/60" : "border-line-strong hover:border-ink/30",
              )}
            >
              <span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border-2", outcome === o.key ? "border-mountain" : "border-line-strong")}>
                {outcome === o.key && <span className="size-2 rounded-full bg-mountain" />}
              </span>
              <span>
                <span className="block text-[14px] font-semibold text-ink">{o.label}</span>
                <span className="block text-[12.5px] text-muted">{o.note}</span>
              </span>
            </button>
          ))}
        </div>
        <label htmlFor="res-note" className="mt-4 block text-[13px] font-semibold text-ink">
          Note <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="res-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1.5 w-full resize-none rounded-xl border border-line-strong px-3.5 py-2.5 text-[14px] outline-none focus:border-mountain"
        />
      </Modal>
    </>
  );
}
