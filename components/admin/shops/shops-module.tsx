"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BadgeCheck, Check, ExternalLink, FileText, Lock, PauseCircle, PlayCircle, Star, Store, X } from "lucide-react";
import type { AdminShop } from "@/lib/admin/types";
import type { VerificationLevel } from "@/types";
import { CATEGORY_NAME, CATEGORY_OPTIONS, DISTRICT_OPTIONS, compact, place } from "@/lib/admin/labels";
import { cn } from "@/lib/utils";
import { useAdmin, useRows } from "../store";
import { DataTable, type Column } from "../ui/data-table";
import { Drawer, ReasonDialog } from "../ui/overlay";
import { Btn, Facts, Switch, Thumb } from "../ui/primitives";
import { StatusPill } from "../ui/status-pill";
import { When } from "../ui/when";

const REJECT_SHOP = ["Documents missing or unclear", "Name already used", "Not a real business", "Outside Gilgit-Baltistan", "Please verify your ID first"];
const SUSPEND_SHOP = ["Many buyer complaints", "Selling banned items", "Fake reviews", "Orders not delivered", "Owner asked to pause"];

const LEVELS: { key: VerificationLevel; label: string; note: string }[] = [
  { key: "phone", label: "Phone", note: "OTP confirmed" },
  { key: "identity", label: "ID (CNIC)", note: "Checked by the team" },
  { key: "business", label: "Business", note: "Documents checked" },
  { key: "rego", label: "REGO Verified", note: "Gold badge — visited or long record" },
];

function ShopMark({ s, size = 44 }: { s: AdminShop; size?: number }) {
  return s.logo ? (
    <Thumb src={s.logo} size={size} className="rounded-xl" />
  ) : (
    <span style={{ width: size, height: size }} className="grid shrink-0 place-items-center rounded-xl bg-forest text-[13px] font-bold text-gold-soft">
      {s.monogram}
    </span>
  );
}

export function ShopsModule({ initial, query }: { initial: AdminShop[]; query: { q?: string; tab?: string } }) {
  const { patch } = useAdmin();
  const rows = useRows("shops", initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [ask, setAsk] = useState<{ kind: "reject" | "suspend"; shop: AdminShop } | null>(null);
  const open = rows.find((r) => r.id === openId) ?? null;

  const approve = (s: AdminShop) =>
    patch("shops", s.id, { status: "active", reason: undefined }, { action: "Approved shop", target: s.name, toast: `${s.name} is now live` });
  const reactivate = (s: AdminShop) =>
    patch("shops", s.id, { status: "active", reason: undefined }, { action: "Reactivated shop", target: s.name, toast: "Shop reactivated" });
  const setLevel = (s: AdminShop, level: VerificationLevel, on: boolean) =>
    patch(
      "shops",
      s.id,
      { verifications: on ? [...new Set([...s.verifications, level])] : s.verifications.filter((v) => v !== level) },
      { action: on ? "Added badge" : "Removed badge", target: s.name, detail: LEVELS.find((l) => l.key === level)?.label, toast: on ? "Badge added" : "Badge removed" },
    );

  const columns = useMemo<Column<AdminShop>[]>(
    () => [
      {
        key: "shop",
        header: "Shop",
        sort: (r) => r.name.toLowerCase(),
        cell: (r) => (
          <div className="flex min-w-[240px] items-center gap-3">
            <ShopMark s={r} />
            <div className="min-w-0">
              <p className="flex items-center gap-1 truncate font-semibold text-ink">
                {r.name}
                {r.verifications.includes("business") && <BadgeCheck className="size-4 shrink-0 text-success" aria-label="Business verified" />}
              </p>
              <p className="truncate text-[12px] text-muted">{r.tagline}</p>
            </div>
          </div>
        ),
      },
      { key: "owner", header: "Owner", sort: (r) => r.ownerName, cell: (r) => <span className="whitespace-nowrap text-ink/85">{r.ownerName}</span> },
      { key: "cat", header: "Category", hideBelow: "xl", cell: (r) => <span className="whitespace-nowrap text-muted">{CATEGORY_NAME[r.category]}</span> },
      { key: "place", header: "Location", hideBelow: "lg", sort: (r) => r.district, cell: (r) => <span className="whitespace-nowrap text-muted">{place(r.district, r.town)}</span> },
      {
        key: "rating",
        header: "Rating",
        sort: (r) => r.rating,
        cell: (r) =>
          r.reviewCount ? (
            <span className="inline-flex items-center gap-1 whitespace-nowrap tabular-nums">
              <Star className="size-3.5 fill-gold text-gold" aria-hidden /> {r.rating.toFixed(1)} <span className="text-muted">({r.reviewCount})</span>
            </span>
          ) : (
            <span className="text-muted">New</span>
          ),
      },
      { key: "followers", header: "Followers", hideBelow: "xl", align: "right", sort: (r) => r.followers, cell: (r) => <span className="tabular-nums text-muted">{compact(r.followers)}</span> },
      { key: "status", header: "Status", sort: (r) => r.status, cell: (r) => <StatusPill status={r.status} /> },
      {
        key: "act",
        header: <span className="sr-only">Actions</span>,
        align: "right",
        cell: (r) => (
          <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {r.status === "pending" && (
              <>
                <Btn size="sm" tone="danger-soft" onClick={() => setAsk({ kind: "reject", shop: r })}>
                  Reject
                </Btn>
                <Btn size="sm" tone="success" onClick={() => approve(r)}>
                  Approve
                </Btn>
              </>
            )}
            {r.status === "suspended" && (
              <Btn size="sm" tone="ghost" onClick={() => reactivate(r)}>
                Reactivate
              </Btn>
            )}
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const hasPending = rows.some((r) => r.status === "pending");

  return (
    <>
      <DataTable
        rows={rows}
        getId={(r) => r.id}
        columns={columns}
        initialTab={query.tab ?? (query.q ? "all" : hasPending ? "pending" : "active")}
        initialQuery={query.q}
        tabs={[
          { key: "pending", label: "Applications", filter: (r) => r.status === "pending" },
          { key: "active", label: "Live", filter: (r) => r.status === "active" },
          { key: "suspended", label: "Suspended / rejected", filter: (r) => r.status === "suspended" || r.status === "rejected" },
          { key: "all", label: "All", filter: () => true },
        ]}
        search={(r) => `${r.name} ${r.ownerName} ${r.slug} ${r.town ?? ""}`}
        searchPlaceholder="Search shop or owner"
        facets={[
          { key: "category", label: "Category", options: CATEGORY_OPTIONS, get: (r) => r.category },
          { key: "district", label: "District", options: DISTRICT_OPTIONS, get: (r) => r.district },
          { key: "orders", label: "Orders", options: [{ value: "on", label: "Takes orders" }, { value: "off", label: "No orders" }], get: (r) => (r.acceptsOrders ? "on" : "off") },
        ]}
        onRowClick={(r) => setOpenId(r.id)}
        mobile={(r) => (
          <div className="flex items-center gap-3">
            <ShopMark s={r} size={52} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-ink">{r.name}</p>
              <p className="truncate text-[12.5px] text-muted">
                {r.ownerName} · {place(r.district, r.town)}
              </p>
              <div className="mt-1">
                <StatusPill status={r.status} />
              </div>
            </div>
          </div>
        )}
        empty={{ title: "No shops here", icon: <Store /> }}
      />

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        title={open?.name}
        subtitle={
          open && (
            <span className="flex flex-wrap items-center gap-2">
              <StatusPill status={open.status} /> Applied <When iso={open.createdAt} />
            </span>
          )
        }
        footer={
          open && (
            <>
              {open.status !== "pending" && (
                <Link href={`/shop/${open.slug}`} target="_blank" className="mr-auto inline-flex h-10 items-center gap-1.5 px-2 text-[13.5px] font-semibold text-mountain hover:underline">
                  View shop <ExternalLink className="size-3.5" aria-hidden />
                </Link>
              )}
              {open.status === "pending" && (
                <>
                  <Btn tone="danger-soft" onClick={() => setAsk({ kind: "reject", shop: open })}>
                    <X /> Reject
                  </Btn>
                  <Btn tone="success" onClick={() => approve(open)}>
                    <Check /> Approve shop
                  </Btn>
                </>
              )}
              {open.status === "active" && (
                <Btn tone="danger-soft" onClick={() => setAsk({ kind: "suspend", shop: open })}>
                  <PauseCircle /> Suspend
                </Btn>
              )}
              {(open.status === "suspended" || open.status === "rejected") && (
                <Btn tone="primary" onClick={() => reactivate(open)}>
                  <PlayCircle /> Reactivate
                </Btn>
              )}
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-xl border border-line bg-white p-4">
              <ShopMark s={open} size={64} />
              <div className="min-w-0">
                <p className="text-[16px] font-semibold text-ink">{open.name}</p>
                <p className="text-[13px] text-muted">{open.tagline}</p>
              </div>
            </div>

            {open.reason && (
              <p className="rounded-xl bg-urgent-wash px-4 py-3 text-[13px] text-urgent">
                <span className="font-semibold">Reason:</span> {open.reason}
              </p>
            )}

            <Facts
              items={[
                ["Owner", <Link key="o" href={`/admin/users?q=${encodeURIComponent(open.ownerName)}`} className="text-mountain hover:underline">{open.ownerName}</Link>],
                ["Category", CATEGORY_NAME[open.category]],
                ["Location", place(open.district, open.town)],
                ["Products", open.products],
                ["Followers", compact(open.followers)],
                ["Rating", open.reviewCount ? `${open.rating.toFixed(1)} from ${open.reviewCount} reviews` : "No reviews yet"],
              ]}
            />

            {open.documents && (
              <div>
                <p className="text-[13px] font-semibold text-ink">Documents</p>
                <ul className="mt-2 space-y-2">
                  {open.documents.map((d) => (
                    <li key={d} className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-[13.5px]">
                      <FileText className="size-4 text-muted" aria-hidden />
                      <span className="flex-1 text-ink">{d}</span>
                      <span className="inline-flex items-center gap-1 text-[12px] text-muted">
                        <Lock className="size-3" aria-hidden /> Private
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[12px] text-muted">Files open from private storage with a 5-minute link once Supabase is connected. They are never public.</p>
              </div>
            )}

            <div>
              <p className="text-[13px] font-semibold text-ink">Badges</p>
              <ul className="mt-2 divide-y divide-line rounded-xl border border-line bg-white">
                {LEVELS.map((l) => {
                  const on = open.verifications.includes(l.key);
                  return (
                    <li key={l.key} className="flex items-center gap-3 px-4 py-3">
                      <BadgeCheck className={cn("size-5", on ? (l.key === "rego" ? "text-gold" : "text-success") : "text-line-strong")} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-semibold text-ink">{l.label}</span>
                        <span className="block text-[12px] text-muted">{l.note}</span>
                      </span>
                      <Switch checked={on} disabled={l.key === "phone"} onChange={(v) => setLevel(open, l.key, v)} label={l.label} />
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-ink">Selling</p>
              <ul className="mt-2 divide-y divide-line rounded-xl border border-line bg-white">
                <li className="flex items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold text-ink">Online orders</span>
                    <span className="block text-[12px] text-muted">Buyers can order with checkout. Only for business-verified shops.</span>
                  </span>
                  <Switch
                    checked={open.acceptsOrders}
                    disabled={!open.verifications.includes("business")}
                    onChange={(v) =>
                      patch("shops", open.id, { acceptsOrders: v }, { action: v ? "Turned on orders" : "Turned off orders", target: open.name, toast: v ? "Orders turned on" : "Orders turned off" })
                    }
                    label="Online orders"
                  />
                </li>
                <li className="flex items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold text-ink">Delivery</span>
                    <span className="block text-[12px] text-muted">Shows “Delivers” on the shop and its ads.</span>
                  </span>
                  <Switch
                    checked={open.delivery}
                    onChange={(v) => patch("shops", open.id, { delivery: v }, { action: v ? "Turned on delivery" : "Turned off delivery", target: open.name, toast: "Saved" })}
                    label="Delivery"
                  />
                </li>
              </ul>
            </div>
          </div>
        )}
      </Drawer>

      <ReasonDialog
        open={ask?.kind === "reject"}
        onClose={() => setAsk(null)}
        title="Reject this shop application?"
        intro="The owner is told why and can apply again."
        reasons={REJECT_SHOP}
        confirmLabel="Reject"
        onConfirm={(reason) => ask && patch("shops", ask.shop.id, { status: "rejected", reason }, { action: "Rejected shop", target: ask.shop.name, detail: reason, toast: "Application rejected", tone: "danger" })}
      />
      <ReasonDialog
        open={ask?.kind === "suspend"}
        onClose={() => setAsk(null)}
        title={`Suspend ${ask?.shop.name ?? "shop"}?`}
        intro="The shop page and all its ads are hidden until you reactivate it."
        reasons={SUSPEND_SHOP}
        confirmLabel="Suspend shop"
        onConfirm={(reason) => ask && patch("shops", ask.shop.id, { status: "suspended", reason }, { action: "Suspended shop", target: ask.shop.name, detail: reason, toast: "Shop suspended", tone: "danger" })}
      />
    </>
  );
}
