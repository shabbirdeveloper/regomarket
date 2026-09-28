"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Banknote, Check, CheckCircle2, Loader2, MapPin, Phone, Printer, XCircle } from "lucide-react";
import { WhatsAppIcon } from "@/components/common/brand-icons";
import { RequireAuth } from "@/components/auth/require-auth";
import { ORDER_SELECT, PAY_LABEL, imgSrc, orderDate, rs, type OrderRow } from "@/components/orders/shared";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { CANCEL_REASONS, NEXT, SHOP_STATUS_LABEL, updateOrder } from "./actions";
import { useMyShop } from "./use-my-shop";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "03551234567" / "+923551234567" → "923551234567" for wa.me */
const waNumber = (p: string) => {
  const d = p.replace(/\D/g, "");
  return d.startsWith("92") ? d : d.startsWith("0") ? `92${d.slice(1)}` : `92${d}`;
};

export function ShopOrderDetail({ id }: { id: string }) {
  return (
    <RequireAuth title="Sign in to manage this order">
      <Detail id={id} />
    </RequireAuth>
  );
}

function Detail({ id }: { id: string }) {
  const shop = useMyShop();
  const [o, setO] = useState<OrderRow | null | undefined>(undefined);
  const [busy, setBusy] = useState<string>("");
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");
  const db = supabaseBrowser();

  const load = useCallback(async () => {
    if (!db || !shop) return;
    const { data } = await db.from("orders").select(ORDER_SELECT).eq("id", id).eq("shop_id", shop.id).maybeSingle();
    setO((data as unknown as OrderRow) ?? null);
  }, [db, id, shop]);

  useEffect(() => {
    if (shop === null) setO(null);
    if (!shop) return;
    load();
    if (!db) return;
    const ch = db
      .channel(`shop-order-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, () => load())
      .subscribe();
    return () => {
      db.removeChannel(ch);
    };
  }, [db, id, shop, load]);

  const run = async (key: string, change: Parameters<typeof updateOrder>[1]) => {
    setBusy(key);
    setError("");
    const err = await updateOrder(id, change);
    setBusy("");
    if (err) setError(err);
    else {
      setCancelling(false);
      load();
    }
  };

  if (o === undefined || shop === undefined) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-muted" aria-label="Loading" />
      </div>
    );
  }
  if (!o) {
    return (
      <div className="shell py-16 text-center">
        <p className="text-[18px] font-semibold text-ink">Order not found</p>
        <p className="mt-1 text-[14px] text-muted">It isn&apos;t an order for your shop.</p>
        <Link href="/shop-orders" className="mt-5 inline-flex h-11 items-center rounded-full bg-mountain px-6 text-[14px] font-semibold text-white">
          Shop orders
        </Link>
      </div>
    );
  }

  const step = NEXT[o.status];
  const wallet = o.payment !== "cod";
  const canCancel = o.status !== "delivered" && o.status !== "cancelled";
  const phone = o.ship_phone;

  return (
    <div className="bg-cream print:bg-white">
      <div className="shell pb-16 pt-4 md:pt-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-3 print:hidden">
            <Link href="/shop-orders" className="-ml-2 inline-flex h-9 items-center gap-1 rounded-full px-2 text-[13.5px] font-medium text-muted hover:text-ink">
              <ArrowLeft className="size-4" aria-hidden /> Shop orders
            </Link>
            <button type="button" onClick={() => window.print()} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong bg-white px-3.5 text-[13px] font-semibold text-ink hover:border-ink">
              <Printer className="size-4" aria-hidden /> Packing slip
            </button>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink md:text-[30px]">Order {o.id}</h1>
            <span className="rounded-full bg-stone px-3 py-1 text-[12.5px] font-semibold text-ink/80">{SHOP_STATUS_LABEL[o.status]}</span>
          </div>
          <p className="mt-1 text-[13.5px] text-muted">
            {shop?.name} · placed {orderDate(o.created_at)}
          </p>

          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-urgent-wash px-4 py-3 text-[13.5px] font-medium text-urgent print:hidden">
              {error}
            </p>
          )}

          {/* Next step */}
          {step && (
            <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-mountain/30 bg-mint/60 p-5 sm:flex-row sm:items-center print:hidden">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-ink">Next: {step.label.toLowerCase()}</p>
                <p className="text-[13px] text-muted">
                  {step.hint}. The buyer gets a notification.
                  {wallet && o.payment_status !== "paid" && o.status === "placed" ? " For wallet or bank orders, confirm after the money arrives." : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => run("next", { status: step.to })}
                disabled={busy !== ""}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-mountain px-6 text-[15px] font-semibold text-white hover:bg-mountain-hover disabled:opacity-60"
              >
                {busy === "next" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Check className="size-5" aria-hidden />}
                {step.label}
              </button>
            </section>
          )}
          {o.status === "cancelled" && (
            <section className="mt-5 flex items-start gap-3 rounded-2xl border border-[#efcfc7] bg-urgent-wash p-5">
              <XCircle className="size-6 shrink-0 text-urgent" aria-hidden />
              <p className="text-[14px] text-ink/85">
                Cancelled by {o.cancelled_by === "buyer" ? "the buyer" : o.cancelled_by === "shop" ? "you" : "REGOMARKET"}
                {o.cancel_reason ? ` — ${o.cancel_reason}` : ""}.
              </p>
            </section>
          )}
          {o.status === "delivered" && (
            <section className="mt-5 flex items-center gap-3 rounded-2xl border border-mountain/30 bg-mint/60 p-5">
              <CheckCircle2 className="size-6 text-success" aria-hidden />
              <p className="text-[14px] font-semibold text-ink">Delivered {o.delivered_at ? orderDate(o.delivered_at) : ""}. Well done!</p>
            </section>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="space-y-6">
              {/* Items */}
              <section className="overflow-hidden rounded-2xl border border-line bg-white">
                <h2 className="border-b border-line bg-[#fbfaf6] px-5 py-3 text-[14px] font-semibold text-ink">Pack these items</h2>
                <ul className="divide-y divide-line">
                  {o.order_items.map((it) => {
                    const img = imgSrc(it.image);
                    return (
                      <li key={it.id} className="flex items-center gap-4 px-5 py-3.5">
                        <span className="block size-14 shrink-0 overflow-hidden rounded-lg bg-stone print:hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {img && <img src={img} alt="" className="size-full object-cover" loading="lazy" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14.5px] font-semibold text-ink">{it.title}</p>
                          <p className="text-[12.5px] text-muted">
                            {rs(it.unit_price)}
                            {it.unit ? ` / ${it.unit}` : ""}
                          </p>
                        </div>
                        <span className="rounded-lg bg-ink px-2.5 py-1 text-[14px] font-bold tabular-nums text-white">× {it.qty}</span>
                        <span className="w-24 text-right text-[14px] font-semibold tabular-nums text-ink">{rs(it.line_total)}</span>
                      </li>
                    );
                  })}
                </ul>
                <dl className="space-y-1 border-t border-line px-5 py-4 text-[14px]">
                  <div className="flex justify-between">
                    <dt className="text-muted">Items</dt>
                    <dd className="tabular-nums">{rs(o.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Delivery</dt>
                    <dd className="tabular-nums">{rs(o.delivery_fee)}</dd>
                  </div>
                  <div className="flex justify-between pt-1 text-[16px] font-bold">
                    <dt>{o.payment === "cod" ? "Collect on delivery" : "Total"}</dt>
                    <dd className="tabular-nums">{rs(o.total)}</dd>
                  </div>
                </dl>
              </section>

              {/* Payment */}
              <section className="rounded-2xl border border-line bg-white p-5">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                  <Banknote className="size-5 text-mountain" aria-hidden /> {PAY_LABEL[o.payment]}
                </h2>
                {!wallet ? (
                  <p className="mt-2 text-[13.5px] text-muted">
                    {o.payment_status === "paid" ? "Cash collected on delivery." : `The rider collects ${rs(o.total)} in cash.`}
                  </p>
                ) : o.payment_status === "paid" ? (
                  <p className="mt-2 flex items-center gap-2 text-[14px] font-semibold text-success">
                    <CheckCircle2 className="size-5" aria-hidden /> Payment received
                  </p>
                ) : (
                  <div className="mt-2 space-y-3">
                    {o.payment_status === "submitted" ? (
                      <p className="rounded-xl bg-gold-wash px-4 py-3 text-[13.5px] text-gold-ink">
                        Buyer says they sent {rs(o.total)}. Transaction ID: <span className="font-mono font-semibold">{o.payment_ref}</span>. Check your {PAY_LABEL[o.payment]} account.
                      </p>
                    ) : (
                      <p className="text-[13.5px] text-muted">Waiting for the buyer to send {rs(o.total)} and add the transaction ID.</p>
                    )}
                    {o.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() => run("paid", { paid: true })}
                        disabled={busy !== ""}
                        className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-mountain px-4 text-[13.5px] font-semibold text-mountain hover:bg-mint disabled:opacity-60 print:hidden"
                      >
                        {busy === "paid" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />}
                        Money received
                      </button>
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* Buyer */}
            <aside className="space-y-4">
              <section className="rounded-2xl border border-line bg-white p-5 text-[14px]">
                <p className="flex items-center gap-2 font-semibold text-ink">
                  <MapPin className="size-4 text-mountain" aria-hidden /> Deliver to
                </p>
                <p className="mt-2 text-[15px] font-semibold text-ink">{o.ship_name}</p>
                <p className="text-ink/80">{o.ship_address}</p>
                <p className="text-ink/80">
                  {o.ship_town ? `${o.ship_town}, ` : ""}
                  {cap(o.ship_district)}
                </p>
                <p className="mt-1 font-mono text-ink">{phone}</p>
                {o.note && <p className="mt-3 rounded-lg bg-gold-wash px-3 py-2 text-[13px] text-gold-ink">Note: “{o.note}”</p>}
                <div className="mt-4 grid grid-cols-2 gap-2 print:hidden">
                  <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-line-strong text-[13px] font-semibold text-ink hover:border-ink">
                    <Phone className="size-4" aria-hidden /> Call
                  </a>
                  <a
                    href={`https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(`Salam ${o.ship_name.split(" ")[0]}, about your REGOMARKET order ${o.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#1f7a52] text-[13px] font-semibold text-white hover:bg-[#186643]"
                  >
                    <WhatsAppIcon size={16} /> WhatsApp
                  </a>
                </div>
              </section>

              {canCancel && (
                <section className="rounded-2xl border border-line bg-white p-5 print:hidden">
                  {!cancelling ? (
                    <button type="button" onClick={() => setCancelling(true)} className="w-full text-center text-[13.5px] font-semibold text-[#b42318] hover:underline">
                      Cancel this order
                    </button>
                  ) : (
                    <div>
                      <p className="text-[14px] font-semibold text-ink">Why are you cancelling?</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {CANCEL_REASONS.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setReason(r)}
                            aria-pressed={reason === r}
                            className={cn("rounded-full border px-3 py-1.5 text-[12.5px] font-medium", reason === r ? "border-mountain bg-mint text-mountain" : "border-line-strong text-ink/80")}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-[12px] text-muted">The buyer sees this reason. Cancelling often lowers your shop&apos;s rating.</p>
                      <div className="mt-3 flex gap-2">
                        <button type="button" onClick={() => setCancelling(false)} className="h-10 flex-1 rounded-full border border-line-strong text-[13px] font-semibold">
                          Keep
                        </button>
                        <button
                          type="button"
                          disabled={!reason || busy !== ""}
                          onClick={() => run("cancel", { status: "cancelled", reason })}
                          className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-urgent text-[13px] font-semibold text-white disabled:opacity-50"
                        >
                          {busy === "cancel" && <Loader2 className="size-4 animate-spin" aria-hidden />}
                          Cancel order
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
