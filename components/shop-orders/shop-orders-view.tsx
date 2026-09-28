"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BellRing, Check, ChevronRight, Loader2, Package, Search, Store, Truck, Wallet } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { ORDER_SELECT, PAY_LABEL, imgSrc, orderDate, rs, type OrderRow, type OrderStatus } from "@/components/orders/shared";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { NEXT, SHOP_STATUS_LABEL, updateOrder } from "./actions";
import { PaymentAccounts } from "./payment-accounts";
import { useMyShop, type MyShop } from "./use-my-shop";

const TABS: { key: string; label: string; match: (o: OrderRow) => boolean }[] = [
  { key: "new", label: "New", match: (o) => o.status === "placed" },
  { key: "ship", label: "To ship", match: (o) => o.status === "confirmed" },
  { key: "way", label: "On the way", match: (o) => o.status === "shipped" },
  { key: "done", label: "Delivered", match: (o) => o.status === "delivered" },
  { key: "cancelled", label: "Cancelled", match: (o) => o.status === "cancelled" },
  { key: "all", label: "All", match: () => true },
];

const TONE: Record<OrderStatus, string> = {
  placed: "bg-gold-wash text-gold-ink",
  confirmed: "bg-[#eaf1fb] text-[#1d4e89]",
  shipped: "bg-[#eaf1fb] text-[#1d4e89]",
  delivered: "bg-mint text-success",
  cancelled: "bg-urgent-wash text-urgent",
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function ShopOrdersView() {
  return (
    <RequireAuth title="Sign in to manage your shop's orders">
      <Gate />
    </RequireAuth>
  );
}

function Gate() {
  const shop = useMyShop();
  if (shop === undefined) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-muted" aria-label="Loading" />
      </div>
    );
  }
  if (!shop) {
    return (
      <div className="shell py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-mint text-mountain">
            <Store className="size-6" aria-hidden />
          </span>
          <h1 className="mt-4 text-[22px] font-bold tracking-[-0.02em] text-ink">You don&apos;t have a shop yet</h1>
          <p className="mt-2 text-[14.5px] text-muted">Open a shop to take online orders from buyers across Gilgit-Baltistan.</p>
          <Link href="/create-shop" className="mt-6 inline-flex h-12 items-center rounded-full bg-mountain px-7 text-[15px] font-semibold text-white hover:bg-mountain-hover">
            Create your shop
          </Link>
        </div>
      </div>
    );
  }
  return <Board shop={shop} />;
}

function Board({ shop }: { shop: MyShop }) {
  const [rows, setRows] = useState<OrderRow[] | null>(null);
  const [tab, setTab] = useState("new");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const known = useRef<Set<string>>(new Set());
  const db = supabaseBrowser();

  const load = useCallback(async () => {
    if (!db) return;
    const { data } = await db.from("orders").select(ORDER_SELECT).eq("shop_id", shop.id).order("created_at", { ascending: false }).limit(300);
    const list = (data as unknown as OrderRow[]) ?? [];
    // Highlight orders that arrived while the page was open
    if (known.current.size) {
      const added = list.filter((o) => !known.current.has(o.id)).map((o) => o.id);
      if (added.length) setFresh((f) => new Set([...f, ...added]));
    }
    known.current = new Set(list.map((o) => o.id));
    setRows(list);
  }, [db, shop.id]);

  useEffect(() => {
    load();
    if (!db) return;
    const ch = db
      .channel(`shop-orders-${shop.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `shop_id=eq.${shop.id}` }, () => load())
      .subscribe();
    const t = setInterval(load, 60_000); // backup if realtime is off
    return () => {
      db.removeChannel(ch);
      clearInterval(t);
    };
  }, [db, shop.id, load]);

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.key, (rows ?? []).filter(t.match).length])), [rows]);

  const list = useMemo(() => {
    const t = TABS.find((x) => x.key === tab)!;
    const n = q.trim().toLowerCase();
    return (rows ?? []).filter((o) => t.match(o) && (!n || `${o.id} ${o.ship_name} ${o.ship_phone} ${o.ship_town ?? ""}`.toLowerCase().includes(n)));
  }, [rows, tab, q]);

  const month = new Date();
  month.setDate(1);
  month.setHours(0, 0, 0, 0);
  const sales = (rows ?? []).filter((o) => o.status === "delivered" && new Date(o.delivered_at ?? o.created_at) >= month).reduce((n, o) => n + o.total, 0);
  const toCheck = (rows ?? []).filter((o) => o.payment_status === "submitted" && o.status !== "cancelled").length;

  const advance = async (o: OrderRow) => {
    const step = NEXT[o.status];
    if (!step) return;
    setBusy(o.id);
    setError("");
    const err = await updateOrder(o.id, { status: step.to });
    setBusy(null);
    if (err) setError(`${o.id}: ${err}`);
    else load();
  };

  return (
    <div className="bg-cream">
      <div className="shell pb-16 pt-4 md:pt-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[13px] font-medium text-muted">
              <Store className="size-4 text-mountain" aria-hidden /> {shop.name}
              {!shop.accepts_orders && <span className="rounded-full bg-stone px-2 py-0.5 text-[11.5px] font-semibold text-muted">Online orders off</span>}
            </p>
            <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink md:text-[30px]">Shop orders</h1>
          </div>
          <Link href={`/shop/${shop.slug}`} className="text-[13.5px] font-semibold text-mountain hover:underline">
            View my shop page
          </Link>
        </div>

        {/* Numbers */}
        <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { Icon: BellRing, l: "New orders", v: rows ? String(counts.new) : "…", hot: (counts.new ?? 0) > 0 },
            { Icon: Package, l: "To ship", v: rows ? String(counts.ship) : "…" },
            { Icon: Wallet, l: "Payments to check", v: rows ? String(toCheck) : "…", hot: toCheck > 0 },
            { Icon: Truck, l: "Sales this month", v: rows ? rs(sales) : "…" },
          ].map(({ Icon, l, v, hot }) => (
            <div key={l} className={cn("flex items-center gap-3 rounded-2xl border bg-white p-4", hot ? "border-gold" : "border-line")}>
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", hot ? "bg-gold-wash text-gold-ink" : "bg-mint text-mountain")}>
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <dt className="text-[12.5px] text-muted">{l}</dt>
                <dd className="truncate text-[19px] font-bold tabular-nums text-ink">{v}</dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <section className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line px-3 pt-2">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  aria-pressed={tab === t.key}
                  className={cn("relative flex h-11 shrink-0 items-center gap-1.5 px-3 text-[13.5px] font-semibold", tab === t.key ? "text-mountain" : "text-muted hover:text-ink")}
                >
                  {t.label}
                  <span className={cn("rounded-full px-1.5 text-[11.5px]", tab === t.key ? "bg-mint text-mountain" : "bg-stone text-muted")}>{counts[t.key] ?? 0}</span>
                  {tab === t.key && <span aria-hidden className="absolute inset-x-2 -bottom-px h-[2.5px] rounded-full bg-mountain" />}
                </button>
              ))}
            </div>
            <div className="border-b border-line p-3">
              <label className="relative block md:w-80">
                <span className="sr-only">Search orders</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Order number, buyer name or phone"
                  className="h-10 w-full rounded-lg border border-line-strong pl-9 pr-3 text-[14px] outline-none focus:border-mountain"
                />
              </label>
            </div>

            {error && <p className="mx-3 mt-3 rounded-xl bg-urgent-wash px-4 py-2.5 text-[13px] font-medium text-urgent">{error}</p>}

            {rows === null ? (
              <div className="grid place-items-center py-16">
                <Loader2 className="size-6 animate-spin text-muted" aria-label="Loading" />
              </div>
            ) : list.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <Package className="mx-auto size-9 text-muted/60" aria-hidden />
                <p className="mt-3 text-[15px] font-semibold text-ink">{tab === "new" ? "No new orders right now" : "Nothing here"}</p>
                <p className="mt-1 text-[13px] text-muted">New orders show up here straight away. Keep this page open or watch your notifications.</p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {list.map((o) => {
                  const step = NEXT[o.status];
                  const first = o.order_items[0];
                  const more = o.order_items.length - 1;
                  const img = imgSrc(first?.image ?? null, 120);
                  return (
                    <li key={o.id} className={cn("flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center md:px-5", fresh.has(o.id) && "bg-gold-wash/50")}>
                      <Link href={`/shop-orders/${o.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="block size-14 shrink-0 overflow-hidden rounded-xl bg-stone">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {img && <img src={img} alt="" className="size-full object-cover" loading="lazy" />}
                        </span>
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-[14px] font-bold text-ink">{o.id}</span>
                            <span className={cn("rounded-full px-2 py-0.5 text-[11.5px] font-semibold", TONE[o.status])}>{SHOP_STATUS_LABEL[o.status]}</span>
                            {o.payment !== "cod" && o.status !== "cancelled" && (
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-[11.5px] font-semibold",
                                  o.payment_status === "paid" ? "bg-mint text-success" : o.payment_status === "submitted" ? "bg-gold-wash text-gold-ink" : "bg-stone text-muted",
                                )}
                              >
                                {PAY_LABEL[o.payment]} · {o.payment_status === "paid" ? "paid" : o.payment_status === "submitted" ? "check payment" : "not paid yet"}
                              </span>
                            )}
                            {fresh.has(o.id) && <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-[#2b1d05]">Just in</span>}
                          </span>
                          <span className="mt-0.5 block truncate text-[13.5px] text-ink/85">
                            {first?.qty} × {first?.title}
                            {more > 0 ? ` + ${more} more` : ""}
                          </span>
                          <span className="block truncate text-[12.5px] text-muted">
                            {o.ship_name} · {o.ship_town ? `${o.ship_town}, ` : ""}
                            {cap(o.ship_district)} · {orderDate(o.created_at)}
                          </span>
                        </span>
                      </Link>
                      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                        <span className="text-[15px] font-bold tabular-nums text-ink">{rs(o.total)}</span>
                        {step ? (
                          <button
                            type="button"
                            onClick={() => advance(o)}
                            disabled={busy === o.id}
                            className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full bg-mountain px-4 text-[13px] font-semibold text-white hover:bg-mountain-hover disabled:opacity-60 sm:ml-0"
                          >
                            {busy === o.id ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />}
                            {step.label}
                          </button>
                        ) : (
                          <Link href={`/shop-orders/${o.id}`} className="ml-auto inline-flex items-center gap-0.5 text-[13px] font-semibold text-mountain sm:ml-0">
                            Details <ChevronRight className="size-4" aria-hidden />
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <PaymentAccounts shopId={shop.id} />
        </div>
      </div>
    </div>
  );
}
