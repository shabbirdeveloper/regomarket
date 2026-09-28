"use client";

import { useMemo, useState } from "react";
import { Banknote, Check, Package, Truck, XCircle } from "lucide-react";
import type { AdminOrder, OrderStatus } from "@/lib/admin/types";
import { DISTRICT_OPTIONS, compact, place, rs } from "@/lib/admin/labels";
import { cn } from "@/lib/utils";
import { useAdmin, useRows } from "../store";
import { DataTable, type Column } from "../ui/data-table";
import { Drawer, ReasonDialog } from "../ui/overlay";
import { Btn, Facts } from "../ui/primitives";
import { StatusPill } from "../ui/status-pill";
import { When } from "../ui/when";

const PAY: Record<AdminOrder["payment"], string> = { cod: "Cash on delivery", easypaisa: "Easypaisa", jazzcash: "JazzCash", bank: "Bank transfer" };
const STEPS: OrderStatus[] = ["placed", "confirmed", "shipped", "delivered"];
const STEP_LABEL: Record<string, string> = { placed: "Placed", confirmed: "Confirmed by shop", shipped: "On the way", delivered: "Delivered" };
const NEXT_LABEL: Record<string, string> = { placed: "Mark confirmed", confirmed: "Mark shipped", shipped: "Mark delivered" };
const CANCEL = ["Buyer asked to cancel", "Shop out of stock", "Buyer not reachable", "Suspected fake order", "Delivery not possible"];

export function OrdersModule({ initial, query }: { initial: AdminOrder[]; query: { q?: string; tab?: string } }) {
  const { patch } = useAdmin();
  const rows = useRows("orders", initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<AdminOrder | null>(null);
  const open = rows.find((r) => r.id === openId) ?? null;

  const advance = (o: AdminOrder) => {
    const next = STEPS[STEPS.indexOf(o.status) + 1];
    if (next) patch("orders", o.id, { status: next }, { action: `Order ${STEP_LABEL[next].toLowerCase()}`, target: o.id, toast: `${o.id}: ${STEP_LABEL[next]}` });
  };

  const stats = useMemo(() => {
    const live = rows.filter((r) => r.status !== "cancelled");
    return [
      { label: "New", value: rows.filter((r) => r.status === "placed").length, icon: Package },
      { label: "On the way", value: rows.filter((r) => r.status === "confirmed" || r.status === "shipped").length, icon: Truck },
      { label: "Delivered", value: rows.filter((r) => r.status === "delivered").length, icon: Check },
      { label: "Order value", value: `Rs ${compact(live.reduce((n, r) => n + r.total, 0))}`, icon: Banknote },
    ];
  }, [rows]);

  const columns = useMemo<Column<AdminOrder>[]>(
    () => [
      {
        key: "id",
        header: "Order",
        sort: (r) => r.id,
        cell: (r) => (
          <div className="min-w-[220px]">
            <p className="font-semibold text-ink">{r.listingTitle}</p>
            <p className="text-[12px] text-muted">
              <span className="font-mono">{r.id}</span> · qty {r.qty}
            </p>
          </div>
        ),
      },
      { key: "shop", header: "Shop", sort: (r) => r.shopName, cell: (r) => <span className="whitespace-nowrap text-ink/85">{r.shopName}</span> },
      {
        key: "buyer",
        header: "Buyer",
        hideBelow: "lg",
        cell: (r) => (
          <div className="whitespace-nowrap">
            <p className="text-ink/85">{r.buyerName}</p>
            <p className="text-[12px] text-muted">{place(r.district, r.town)}</p>
          </div>
        ),
      },
      { key: "pay", header: "Payment", hideBelow: "xl", cell: (r) => <span className="whitespace-nowrap text-muted">{PAY[r.payment]}</span> },
      { key: "total", header: "Total", align: "right", sort: (r) => r.total, cell: (r) => <span className="whitespace-nowrap font-semibold tabular-nums text-ink">{rs(r.total)}</span> },
      { key: "at", header: "Placed", sort: (r) => +new Date(r.createdAt), cell: (r) => <When iso={r.createdAt} className="whitespace-nowrap text-muted" /> },
      { key: "status", header: "Status", sort: (r) => STEPS.indexOf(r.status), cell: (r) => <StatusPill status={r.status} /> },
    ],
    [],
  );

  return (
    <>
      <dl className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-mint text-mountain">
              <s.icon className="size-5" aria-hidden />
            </span>
            <div>
              <dt className="text-[12.5px] text-muted">{s.label}</dt>
              <dd className="text-[20px] font-bold tabular-nums text-ink">{s.value}</dd>
            </div>
          </div>
        ))}
      </dl>

      <DataTable
        rows={rows}
        getId={(r) => r.id}
        columns={columns}
        initialTab={query.tab ?? "active"}
        initialQuery={query.q}
        tabs={[
          { key: "active", label: "In progress", filter: (r) => r.status === "placed" || r.status === "confirmed" || r.status === "shipped" },
          { key: "delivered", label: "Delivered", filter: (r) => r.status === "delivered" },
          { key: "cancelled", label: "Cancelled", filter: (r) => r.status === "cancelled" },
          { key: "all", label: "All", filter: () => true },
        ]}
        search={(r) => `${r.id} ${r.listingTitle} ${r.shopName} ${r.buyerName}`}
        searchPlaceholder="Search order ID, item, shop or buyer"
        facets={[
          { key: "pay", label: "Payment", options: Object.entries(PAY).map(([value, label]) => ({ value, label })), get: (r) => r.payment },
          { key: "district", label: "District", options: DISTRICT_OPTIONS, get: (r) => r.district },
        ]}
        onRowClick={(r) => setOpenId(r.id)}
        mobile={(r) => (
          <div>
            <div className="flex items-start justify-between gap-2">
              <p className="text-[14px] font-semibold leading-snug text-ink">{r.listingTitle}</p>
              <StatusPill status={r.status} />
            </div>
            <p className="mt-0.5 text-[12.5px] text-muted">
              {rs(r.total)} · {r.shopName} → {r.buyerName}
            </p>
          </div>
        )}
        empty={{ title: "No orders here", icon: <Package /> }}
      />

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        title={open ? `Order ${open.id}` : ""}
        subtitle={
          open && (
            <span className="flex items-center gap-2">
              <StatusPill status={open.status} /> Placed <When iso={open.createdAt} />
            </span>
          )
        }
        footer={
          open &&
          open.status !== "delivered" &&
          open.status !== "cancelled" && (
            <>
              <Btn tone="danger-soft" className="mr-auto" onClick={() => setCancelling(open)}>
                <XCircle /> Cancel order
              </Btn>
              <Btn tone="primary" onClick={() => advance(open)}>
                <Check /> {NEXT_LABEL[open.status]}
              </Btn>
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            {/* Progress */}
            <ol className="flex items-start justify-between gap-1 rounded-xl border border-line bg-white p-4">
              {STEPS.map((s, i) => {
                const at = STEPS.indexOf(open.status);
                const done = open.status !== "cancelled" && i <= at;
                return (
                  <li key={s} className="flex flex-1 flex-col items-center text-center">
                    <span className="flex w-full items-center">
                      <span className={cn("h-0.5 flex-1", i === 0 ? "bg-transparent" : done ? "bg-success" : "bg-line")} />
                      <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-bold", done ? "bg-success text-white" : "bg-stone text-muted")}>
                        {done ? <Check className="size-4" /> : i + 1}
                      </span>
                      <span className={cn("h-0.5 flex-1", i === STEPS.length - 1 ? "bg-transparent" : done && i < at ? "bg-success" : "bg-line")} />
                    </span>
                    <span className={cn("mt-1.5 text-[11.5px] font-medium", done ? "text-ink" : "text-muted")}>{STEP_LABEL[s]}</span>
                  </li>
                );
              })}
            </ol>
            {open.status === "cancelled" && <p className="rounded-xl bg-urgent-wash px-4 py-3 text-[13px] text-urgent">This order was cancelled.</p>}

            <Facts
              items={[
                ["Item", open.listingTitle],
                ["Quantity", open.qty],
                ["Total", <span key="t" className="font-semibold tabular-nums">{rs(open.total)}</span>],
                ["Payment", PAY[open.payment]],
                ["Shop", open.shopName],
                ["Buyer", open.buyerName],
                ["Buyer phone", open.buyerPhone],
                ["Deliver to", place(open.district, open.town)],
              ]}
            />
            {open.payment !== "cod" && (
              <p className="rounded-xl bg-gold-wash px-4 py-3 text-[12.5px] text-gold-ink">
                Payment goes from the buyer straight to the shop. REGOMARKET never holds money or asks for card details.
              </p>
            )}
          </div>
        )}
      </Drawer>

      <ReasonDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        title={`Cancel ${cancelling?.id ?? "order"}?`}
        intro="Buyer and shop both get a message."
        reasons={CANCEL}
        confirmLabel="Cancel order"
        onConfirm={(reason) => cancelling && patch("orders", cancelling.id, { status: "cancelled", note: reason }, { action: "Cancelled order", target: cancelling.id, detail: reason, toast: "Order cancelled", tone: "danger" })}
      />
    </>
  );
}
