"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Banknote, CheckCircle2, Copy, Loader2, MapPin, MessageSquareText, Package, Store, XCircle } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { RequireAuth } from "@/components/auth/require-auth";
import { friendlyError, supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { ORDER_SELECT, PAY_LABEL, STATUS_LABEL, STATUS_TONE, imgSrc, orderDate, rs, type OrderRow } from "./shared";

interface PayAccount {
  method: string;
  account_title: string;
  account_number: string;
  bank_name: string | null;
}

export function OrderDetail({ id }: { id: string }) {
  return (
    <RequireAuth title="Sign in to see this order">
      <Detail id={id} />
    </RequireAuth>
  );
}

function Detail({ id }: { id: string }) {
  const { user } = useAuth();
  const [o, setO] = useState<OrderRow | null | undefined>(undefined);
  const [account, setAccount] = useState<PayAccount | null | undefined>(undefined);
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState<"" | "pay" | "cancel">("");
  const [error, setError] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [copied, setCopied] = useState(false);
  const db = supabaseBrowser();

  const load = useCallback(async () => {
    if (!db || !user) return;
    const { data } = await db.from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle();
    const row = (data as unknown as OrderRow) ?? null;
    setO(row);
    if (row && row.payment !== "cod") {
      const { data: acc } = await db
        .from("shop_payment_accounts")
        .select("method,account_title,account_number,bank_name")
        .eq("shop_id", row.shop_id)
        .eq("method", row.payment)
        .maybeSingle<PayAccount>();
      setAccount(acc ?? null);
    }
  }, [db, id, user]);

  useEffect(() => {
    load();
    if (!db) return;
    // Live updates when the shop confirms / ships
    const ch = db
      .channel(`order-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, () => load())
      .subscribe();
    return () => {
      db.removeChannel(ch);
    };
  }, [db, id, load]);

  if (o === undefined) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-muted" aria-label="Loading" />
      </div>
    );
  }

  if (o === null) {
    return (
      <div className="shell py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-8 text-center">
          <Package className="mx-auto size-10 text-muted" aria-hidden />
          <h1 className="mt-3 text-[20px] font-bold text-ink">Order not found</h1>
          <p className="mt-1 text-[14px] text-muted">It may belong to another account.</p>
          <Link href="/orders" className="mt-5 inline-flex h-11 items-center rounded-full bg-mountain px-6 text-[14px] font-semibold text-white">
            My orders
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { key: "placed", t: "Order placed", at: o.created_at },
    { key: "confirmed", t: "Confirmed by the shop", at: o.confirmed_at },
    { key: "shipped", t: "On the way", at: o.shipped_at },
    { key: "delivered", t: "Delivered", at: o.delivered_at },
  ];
  const reached = ["placed", "confirmed", "shipped", "delivered"].indexOf(o.status);
  const needsPayment = o.payment !== "cod" && o.payment_status === "unpaid" && o.status !== "cancelled";

  const submitRef = async () => {
    if (!db) return;
    setBusy("pay");
    setError("");
    const { error: e } = await db.rpc("submit_payment_ref", { p_order: o.id, p_ref: ref.trim() });
    setBusy("");
    if (e) return setError(friendlyError(e));
    setRef("");
    load();
  };

  const cancel = async () => {
    if (!db) return;
    setBusy("cancel");
    setError("");
    const { error: e } = await db.rpc("cancel_my_order", { p_order: o.id, p_reason: "Cancelled by the buyer" });
    setBusy("");
    setConfirmCancel(false);
    if (e) return setError(friendlyError(e));
    load();
  };

  return (
    <div className="bg-cream">
      <div className="shell pb-16 pt-4 md:pt-6">
        <div className="mx-auto max-w-4xl">
          <Link href="/orders" className="-ml-2 inline-flex h-9 items-center gap-1 rounded-full px-2 text-[13.5px] font-medium text-muted hover:text-ink">
            <ArrowLeft className="size-4" aria-hidden /> My orders
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink md:text-[30px]">Order {o.id}</h1>
            <span className={cn("rounded-full px-3 py-1 text-[12.5px] font-semibold", STATUS_TONE[o.status])}>{STATUS_LABEL[o.status]}</span>
          </div>
          <p className="mt-1 text-[13.5px] text-muted">Placed {orderDate(o.created_at)}</p>

          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-urgent-wash px-4 py-3 text-[13.5px] font-medium text-urgent">
              {error}
            </p>
          )}

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="space-y-6">
              {/* Progress */}
              {o.status === "cancelled" ? (
                <section className="flex items-start gap-3 rounded-2xl border border-[#efcfc7] bg-urgent-wash p-5">
                  <XCircle className="size-6 shrink-0 text-urgent" aria-hidden />
                  <div>
                    <p className="text-[15px] font-semibold text-urgent">This order was cancelled</p>
                    <p className="mt-0.5 text-[13.5px] text-ink/80">
                      {o.cancelled_by === "buyer" ? "You cancelled it." : o.cancelled_by === "shop" ? "The shop cancelled it." : "Cancelled by REGOMARKET."}
                      {o.cancel_reason && o.cancelled_by !== "buyer" ? ` Reason: ${o.cancel_reason}` : ""}
                    </p>
                  </div>
                </section>
              ) : (
                <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
                  <ol>
                    {steps.map((s, i) => {
                      const done = i <= reached;
                      return (
                        <li key={s.key} className="relative flex gap-4 pb-6 last:pb-0">
                          {i < steps.length - 1 && <span aria-hidden className={cn("absolute left-[11px] top-7 h-[calc(100%-20px)] w-0.5", i < reached ? "bg-success" : "bg-line")} />}
                          <span className={cn("grid size-6 shrink-0 place-items-center rounded-full ring-4 ring-white", done ? "bg-success text-white" : "border-2 border-line-strong bg-white")}>
                            {done && <CheckCircle2 className="size-4" aria-hidden />}
                          </span>
                          <span>
                            <span className={cn("block text-[14.5px] font-semibold", done ? "text-ink" : "text-ink/60")}>{s.t}</span>
                            <span className="block text-[12.5px] text-muted">{s.at ? orderDate(s.at) : i === reached + 1 ? "Next" : ""}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              )}

              {/* Payment */}
              {o.payment !== "cod" && o.status !== "cancelled" && (
                <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
                  <h2 className="flex items-center gap-2 text-[16px] font-semibold text-ink">
                    <Banknote className="size-5 text-mountain" aria-hidden /> Pay with {PAY_LABEL[o.payment]}
                  </h2>
                  {o.payment_status === "paid" ? (
                    <p className="mt-3 flex items-center gap-2 text-[14px] font-semibold text-success">
                      <CheckCircle2 className="size-5" aria-hidden /> Payment received by the shop
                    </p>
                  ) : o.payment_status === "submitted" ? (
                    <p className="mt-3 text-[14px] text-ink/85">
                      You sent transaction ID <span className="font-mono font-semibold">{o.payment_ref}</span>. The shop will check it and confirm.
                    </p>
                  ) : (
                    <>
                      {account ? (
                        <div className="mt-3 rounded-xl bg-[#fbfaf6] p-4 ring-1 ring-line">
                          <p className="text-[12.5px] text-muted">Send exactly</p>
                          <p className="text-[22px] font-bold tabular-nums text-ink">{rs(o.total)}</p>
                          <p className="mt-2 text-[12.5px] text-muted">to {account.bank_name ?? PAY_LABEL[o.payment]} account</p>
                          <p className="text-[14.5px] font-semibold text-ink">{account.account_title}</p>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(account.account_number);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 1500);
                            }}
                            className="mt-1 inline-flex items-center gap-2 font-mono text-[17px] font-semibold text-mountain"
                          >
                            {account.account_number}
                            <Copy className="size-4" aria-hidden />
                            <span className="font-sans text-[12px] font-medium text-muted">{copied ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                      ) : account === null ? (
                        <p className="mt-3 rounded-xl bg-gold-wash px-4 py-3 text-[13.5px] text-gold-ink">
                          The shop hasn&apos;t added its {PAY_LABEL[o.payment]} account yet. They will message you the details. Only pay to an account you get from the shop.
                        </p>
                      ) : null}
                      <label htmlFor="pay-ref" className="mt-4 block text-[13.5px] font-semibold text-ink">
                        Transaction ID from your receipt
                      </label>
                      <div className="mt-1.5 flex gap-2">
                        <input
                          id="pay-ref"
                          value={ref}
                          onChange={(e) => setRef(e.target.value)}
                          placeholder="e.g. 23984712345"
                          maxLength={60}
                          className="h-11 min-w-0 flex-1 rounded-xl border border-line-strong px-3.5 font-mono text-[14px] outline-none focus:border-mountain"
                        />
                        <button
                          type="button"
                          disabled={ref.trim().length < 4 || busy === "pay"}
                          onClick={submitRef}
                          className="inline-flex h-11 items-center gap-2 rounded-xl bg-mountain px-4 text-[13.5px] font-semibold text-white disabled:opacity-50"
                        >
                          {busy === "pay" && <Loader2 className="size-4 animate-spin" aria-hidden />}
                          I&apos;ve paid
                        </button>
                      </div>
                      <p className="mt-2 text-[12px] text-muted">Never share your PIN or OTP code with anyone, including the shop.</p>
                    </>
                  )}
                </section>
              )}

              {/* Items */}
              <section className="overflow-hidden rounded-2xl border border-line bg-white">
                <p className="flex items-center gap-2 border-b border-line bg-[#fbfaf6] px-5 py-3 text-[14px] font-semibold text-ink">
                  <Store className="size-4 text-mountain" aria-hidden />
                  {o.shops?.slug ? (
                    <Link href={`/shop/${o.shops.slug}`} className="hover:underline">
                      {o.shops.name}
                    </Link>
                  ) : (
                    o.shops?.name ?? "Shop"
                  )}
                </p>
                <ul className="divide-y divide-line">
                  {o.order_items.map((it) => {
                    const img = imgSrc(it.image);
                    return (
                      <li key={it.id} className="flex items-center gap-4 px-5 py-3.5">
                        <span className="block size-14 shrink-0 overflow-hidden rounded-lg bg-stone">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {img && <img src={img} alt="" className="size-full object-cover" loading="lazy" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          {it.listing_slug ? (
                            <Link href={`/listing/${it.listing_slug}`} className="line-clamp-2 text-[14px] font-semibold text-ink hover:underline">
                              {it.title}
                            </Link>
                          ) : (
                            <p className="line-clamp-2 text-[14px] font-semibold text-ink">{it.title}</p>
                          )}
                          <p className="text-[12.5px] text-muted">
                            {it.qty} × {rs(it.unit_price)}
                            {it.unit ? ` / ${it.unit}` : ""}
                          </p>
                        </div>
                        <span className="text-[14px] font-semibold tabular-nums text-ink">{rs(it.line_total)}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>

            {/* Side */}
            <aside className="space-y-4">
              <section className="rounded-2xl border border-line bg-white p-5">
                <dl className="space-y-1.5 text-[14px]">
                  <div className="flex justify-between">
                    <dt className="text-muted">Items</dt>
                    <dd className="tabular-nums">{rs(o.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Delivery</dt>
                    <dd className="tabular-nums">{rs(o.delivery_fee)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-line pt-2 text-[16px] font-bold">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{rs(o.total)}</dd>
                  </div>
                  <div className="flex justify-between pt-1 text-[13px]">
                    <dt className="text-muted">Payment</dt>
                    <dd className="font-medium">{PAY_LABEL[o.payment]}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-line bg-white p-5 text-[13.5px]">
                <p className="flex items-center gap-2 font-semibold text-ink">
                  <MapPin className="size-4 text-mountain" aria-hidden /> Delivering to
                </p>
                <p className="mt-2 font-medium text-ink">{o.ship_name}</p>
                <p className="text-ink/75">
                  {o.ship_address}
                  {o.ship_town ? `, ${o.ship_town}` : ""}, {o.ship_district.charAt(0).toUpperCase() + o.ship_district.slice(1)}
                </p>
                <p className="text-ink/75">{o.ship_phone}</p>
                {o.note && <p className="mt-2 rounded-lg bg-stone px-3 py-2 text-ink/80">“{o.note}”</p>}
              </section>

              <Link
                href={`/messages?shop=${o.shops?.slug ?? ""}`}
                className="flex h-11 items-center justify-center gap-2 rounded-full border border-line-strong bg-white text-[14px] font-semibold text-ink hover:border-ink"
              >
                <MessageSquareText className="size-4" aria-hidden /> Message the shop
              </Link>

              {o.status === "placed" &&
                (confirmCancel ? (
                  <div className="rounded-2xl border border-[#efcfc7] bg-white p-4 text-center">
                    <p className="text-[13.5px] font-semibold text-ink">Cancel this order?</p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => setConfirmCancel(false)} className="h-10 flex-1 rounded-full border border-line-strong text-[13.5px] font-semibold">
                        Keep it
                      </button>
                      <button type="button" onClick={cancel} disabled={busy === "cancel"} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-urgent text-[13.5px] font-semibold text-white">
                        {busy === "cancel" && <Loader2 className="size-4 animate-spin" aria-hidden />}
                        Cancel order
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirmCancel(true)} className="w-full text-center text-[13.5px] font-semibold text-[#b42318] hover:underline">
                    Cancel order
                  </button>
                ))}
              {needsPayment && <p className="text-center text-[12px] text-muted">The shop starts packing after your payment is confirmed.</p>}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
