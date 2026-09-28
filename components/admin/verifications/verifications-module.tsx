"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Building2, Check, FileImage, IdCard, Lock, ShieldCheck, X } from "lucide-react";
import type { AdminVerification } from "@/lib/admin/types";
import { place } from "@/lib/admin/labels";
import { cn } from "@/lib/utils";
import { useAdmin, useRows } from "../store";
import { DataTable, type Column } from "../ui/data-table";
import { Drawer, ReasonDialog } from "../ui/overlay";
import { Avatar, Btn, Facts, Tag } from "../ui/primitives";
import { StatusPill } from "../ui/status-pill";
import { When } from "../ui/when";

const REJECT = ["Photo blurry or cut off", "Name doesn't match the account", "CNIC expired", "Selfie missing or doesn't match", "Document looks edited", "Business papers missing"];

const CHECKS: Record<AdminVerification["level"], string[]> = {
  identity: ["Name on CNIC matches the account", "CNIC number and photo are clear", "CNIC is not expired", "Selfie matches the CNIC photo"],
  business: ["Business name matches the shop", "Registration / chamber letter is readable", "Address is in Gilgit-Baltistan", "Owner's CNIC already verified"],
};

export function VerificationsModule({ initial, query }: { initial: AdminVerification[]; query: { q?: string; tab?: string } }) {
  const { patch } = useAdmin();
  const rows = useRows("verifications", initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<AdminVerification | null>(null);
  const [ticked, setTicked] = useState<Set<number>>(new Set());
  const open = rows.find((r) => r.id === openId) ?? null;

  useEffect(() => setTicked(new Set()), [openId]);

  const approve = (v: AdminVerification) => {
    patch("verifications", v.id, { status: "approved", reason: undefined }, { action: v.level === "business" ? "Verified business" : "Verified ID", target: v.userName, toast: `${v.userName} is now verified` });
    // Next in the queue
    const next = rows.find((r) => r.status === "pending" && r.id !== v.id);
    setOpenId(next?.id ?? null);
  };

  const columns = useMemo<Column<AdminVerification>[]>(
    () => [
      {
        key: "user",
        header: "Person",
        sort: (r) => r.userName,
        cell: (r) => (
          <div className="flex min-w-[200px] items-center gap-3">
            <Avatar name={r.userName} />
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{r.userName}</p>
              <p className="text-[12px] tabular-nums text-muted">{r.phone}</p>
            </div>
          </div>
        ),
      },
      {
        key: "level",
        header: "Check",
        sort: (r) => r.level,
        cell: (r) => (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-ink/85">
            {r.level === "business" ? <Building2 className="size-4 text-muted" aria-hidden /> : <IdCard className="size-4 text-muted" aria-hidden />}
            {r.level === "business" ? "Business" : "CNIC (ID)"}
          </span>
        ),
      },
      { key: "docs", header: "Documents", hideBelow: "lg", cell: (r) => <span className="text-muted">{r.documents.length} file{r.documents.length > 1 ? "s" : ""}{r.note ? ` · ${r.note}` : ""}</span> },
      { key: "place", header: "District", hideBelow: "xl", cell: (r) => <span className="text-muted">{place(r.district)}</span> },
      { key: "at", header: "Sent", sort: (r) => +new Date(r.submittedAt), cell: (r) => <When iso={r.submittedAt} className="whitespace-nowrap text-muted" /> },
      { key: "status", header: "Status", sort: (r) => r.status, cell: (r) => <StatusPill status={r.status} /> },
      {
        key: "go",
        header: <span className="sr-only">Review</span>,
        align: "right",
        cell: (r) =>
          r.status === "pending" ? (
            <Btn size="sm" tone="primary" onClick={() => setOpenId(r.id)}>
              Review
            </Btn>
          ) : null,
      },
    ],
    [],
  );

  const checks = open ? CHECKS[open.level] : [];
  const allTicked = checks.every((_, i) => ticked.has(i));

  return (
    <>
      <div className="mb-4 flex items-start gap-3 rounded-2xl border border-line bg-white p-4 text-[13.5px] text-ink/85">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-mountain" aria-hidden />
        <p>
          Documents are stored in a <span className="font-semibold">private</span> bucket and open only here, with a link that expires in 5 minutes. Never download or share
          them. After approval the files can be deleted and only the result is kept.
        </p>
      </div>

      <DataTable
        rows={rows}
        getId={(r) => r.id}
        columns={columns}
        initialTab={query.tab ?? "pending"}
        initialQuery={query.q}
        tabs={[
          { key: "pending", label: "Waiting", filter: (r) => r.status === "pending" },
          { key: "approved", label: "Approved", filter: (r) => r.status === "approved" },
          { key: "rejected", label: "Rejected", filter: (r) => r.status === "rejected" },
          { key: "all", label: "All", filter: () => true },
        ]}
        search={(r) => `${r.userName} ${r.phone} ${r.businessName ?? ""}`}
        searchPlaceholder="Search name or phone"
        facets={[{ key: "level", label: "Type", options: [{ value: "identity", label: "CNIC (ID)" }, { value: "business", label: "Business" }], get: (r) => r.level }]}
        onRowClick={(r) => setOpenId(r.id)}
        mobile={(r) => (
          <div className="flex items-center gap-3">
            <Avatar name={r.userName} size={44} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-ink">{r.userName}</p>
              <p className="text-[12.5px] text-muted">
                {r.level === "business" ? "Business" : "CNIC"} · <When iso={r.submittedAt} />
              </p>
            </div>
            <StatusPill status={r.status} />
          </div>
        )}
        empty={{ title: "Queue is empty", body: "No documents waiting. New requests appear here.", icon: <BadgeCheck /> }}
      />

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        width={640}
        title={open ? `${open.level === "business" ? "Business check" : "ID check"} · ${open.userName}` : ""}
        subtitle={
          open && (
            <span className="flex items-center gap-2">
              <StatusPill status={open.status} /> Sent <When iso={open.submittedAt} />
            </span>
          )
        }
        footer={
          open?.status === "pending" && (
            <>
              <Btn tone="danger-soft" onClick={() => setRejecting(open)}>
                <X /> Reject
              </Btn>
              <Btn tone="success" disabled={!allTicked} onClick={() => approve(open)} title={allTicked ? undefined : "Tick every check first"}>
                <Check /> Approve & verify
              </Btn>
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {open.documents.map((d) => (
                <div key={d} className="overflow-hidden rounded-xl border border-line bg-white">
                  <div className="relative grid aspect-[16/10] place-items-center bg-[repeating-linear-gradient(135deg,#f5f2ea_0_10px,#efebe1_10px_20px)]">
                    <FileImage className="size-9 text-muted/70" aria-hidden />
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[11px] font-semibold text-muted">
                      <Lock className="size-3" aria-hidden /> Private
                    </span>
                  </div>
                  <p className="px-3 py-2 text-[13px] font-medium text-ink">{d}</p>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-muted">Preview: real photos load here from Supabase Storage (bucket “verification”) once it is connected.</p>

            <Facts
              items={[
                ["Name on account", open.userName],
                ...(open.businessName ? ([["Business", open.businessName]] as [string, string][]) : []),
                ["Phone", open.phone],
                ["District", place(open.district)],
              ]}
            />

            {open.note && <Tag tone="gold">Note: {open.note}</Tag>}
            {open.reason && <p className="rounded-xl bg-urgent-wash px-4 py-3 text-[13px] text-urgent">Rejected: {open.reason}</p>}

            {open.status === "pending" && (
              <fieldset>
                <legend className="text-[13px] font-semibold text-ink">Checklist</legend>
                <ul className="mt-2 divide-y divide-line rounded-xl border border-line bg-white">
                  {checks.map((c, i) => {
                    const on = ticked.has(i);
                    return (
                      <li key={c}>
                        <label className="flex cursor-pointer items-center gap-3 px-4 py-3 text-[13.5px]">
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() =>
                              setTicked((s) => {
                                const n = new Set(s);
                                if (n.has(i)) n.delete(i);
                                else n.add(i);
                                return n;
                              })
                            }
                            className="size-4 accent-mountain"
                          />
                          <span className={cn(on ? "text-ink" : "text-ink/80")}>{c}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            )}
          </div>
        )}
      </Drawer>

      <ReasonDialog
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        title="Reject these documents?"
        intro="The person is told what to fix and can send them again."
        reasons={REJECT}
        confirmLabel="Reject"
        onConfirm={(reason) => {
          if (!rejecting) return;
          patch("verifications", rejecting.id, { status: "rejected", reason }, { action: "Rejected verification", target: rejecting.userName, detail: reason, toast: "Rejected — user notified", tone: "danger" });
          setOpenId(null);
        }}
      />
    </>
  );
}
