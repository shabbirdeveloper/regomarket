"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Minus, Plus, ShieldCheck, ShoppingCart, Store, Trash2, Truck } from "lucide-react";
import { byShop, useCart, type CartItem } from "@/lib/cart";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

const nf = new Intl.NumberFormat("en-US");
const rs = (n: number) => `Rs ${nf.format(n)}`;

export function thumbSrc(src: string | null, w = 200) {
  if (!src) return null;
  return src.includes("images.unsplash.com") ? src.replace(/w=\d+/, `w=${w}`) : src;
}

/**
 * Checks the cart against the live database: current prices, and whether
 * each item can still be ordered. Returns the ids that can't.
 */
export function useCartCheck(items: CartItem[]) {
  const { update } = useCart();
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());
  const [changed, setChanged] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);
  const ids = items.map((i) => i.listingId).sort().join(",");

  useEffect(() => {
    const db = supabaseBrowser();
    if (!db || !ids) {
      setChecked(true);
      return;
    }
    let alive = true;
    db.from("listings")
      .select("id,price,status")
      .in("id", ids.split(","))
      .then(({ data, error }) => {
        if (!alive || error) return setChecked(true);
        const live = new Map((data ?? []).map((r: { id: string; price: number; status: string }) => [r.id, r]));
        const bad = new Set<string>();
        const moved = new Set<string>();
        for (const it of items) {
          const r = live.get(it.listingId);
          if (!r || r.status !== "active") bad.add(it.listingId);
          else if (Number(r.price) !== it.price) {
            moved.add(it.listingId);
            update(it.listingId, { price: Number(r.price) });
          }
        }
        setUnavailable(bad);
        setChanged(moved);
        setChecked(true);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  return { unavailable, changed, checked };
}

export function QtyStepper({ value, onChange, small }: { value: number; onChange: (n: number) => void; small?: boolean }) {
  const s = small ? "size-8" : "size-10";
  return (
    <div className="inline-flex items-center rounded-full border border-line-strong bg-white">
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Less" className={cn("grid place-items-center rounded-full text-ink hover:bg-stone disabled:opacity-40", s)}>
        <Minus className="size-4" aria-hidden />
      </button>
      <input
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value.replace(/\D/g, ""));
          if (n) onChange(n);
        }}
        inputMode="numeric"
        aria-label="Quantity"
        className={cn("w-10 bg-transparent text-center font-semibold tabular-nums text-ink outline-none", small ? "text-[13.5px]" : "text-[15px]")}
      />
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= 999} aria-label="More" className={cn("grid place-items-center rounded-full text-ink hover:bg-stone disabled:opacity-40", s)}>
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export function CartView() {
  const { items, count, subtotal, setQty, remove } = useCart();
  const { unavailable, changed } = useCartCheck(items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const groups = byShop(items);
  const blocked = items.some((i) => unavailable.has(i.listingId));

  if (!mounted) return <div className="min-h-[60vh] bg-cream" />;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] bg-cream">
        <div className="shell py-16">
          <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-mint text-mountain">
              <ShoppingCart className="size-6" aria-hidden />
            </span>
            <h1 className="mt-4 text-[22px] font-bold tracking-[-0.02em] text-ink">Your cart is empty</h1>
            <p className="mt-2 text-[14.5px] text-muted">Dry fruits, honey, crafts and more from verified shops, delivered across Gilgit-Baltistan.</p>
            <Link href="/search?delivery=1" className="mt-6 inline-flex h-12 items-center rounded-full bg-mountain px-7 text-[15px] font-semibold text-white hover:bg-mountain-hover">
              Shop items with delivery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream">
      <div className="shell pb-28 pt-4 md:pb-16 md:pt-6">
        <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink md:text-[30px]">
          Cart <span className="text-[18px] font-semibold text-muted">({count})</span>
        </h1>

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-4">
            {groups.map((g) => (
              <section key={g.sellerId} className="overflow-hidden rounded-2xl border border-line bg-white">
                <header className="flex items-center justify-between gap-3 border-b border-line bg-[#fbfaf6] px-5 py-3">
                  <p className="flex min-w-0 items-center gap-2 text-[14px] font-semibold text-ink">
                    <Store className="size-4 shrink-0 text-mountain" aria-hidden />
                    {g.shopSlug ? (
                      <Link href={`/shop/${g.shopSlug}`} className="truncate hover:underline">
                        {g.shopName}
                      </Link>
                    ) : (
                      <span className="truncate">{g.shopName}</span>
                    )}
                  </p>
                  <span className="shrink-0 text-[12.5px] text-muted">Delivers from {g.shopDistrict.charAt(0).toUpperCase() + g.shopDistrict.slice(1)}</span>
                </header>
                <ul className="divide-y divide-line">
                  {g.items.map((it) => {
                    const off = unavailable.has(it.listingId);
                    const img = thumbSrc(it.image);
                    return (
                      <li key={it.listingId} className={cn("flex gap-4 px-5 py-4", off && "bg-urgent-wash/40")}>
                        <Link href={`/listing/${it.slug}`} className="block size-20 shrink-0 overflow-hidden rounded-xl bg-stone">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {img && <img src={img} alt="" className={cn("size-full object-cover", off && "opacity-50 grayscale")} loading="lazy" />}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link href={`/listing/${it.slug}`} className="line-clamp-2 text-[14.5px] font-semibold leading-snug text-ink hover:underline">
                            {it.title}
                          </Link>
                          <p className="mt-0.5 text-[13px] text-muted">
                            {rs(it.price)}
                            {it.unit ? ` / ${it.unit}` : ""}
                            {changed.has(it.listingId) && <span className="ml-2 font-semibold text-gold-ink">Price updated</span>}
                          </p>
                          {off ? (
                            <p className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-urgent">
                              <AlertTriangle className="size-4" aria-hidden /> No longer available
                            </p>
                          ) : (
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                              <QtyStepper small value={it.qty} onChange={(n) => setQty(it.listingId, n)} />
                              <span className="text-[14px] font-semibold tabular-nums text-ink">{rs(it.price * it.qty)}</span>
                            </div>
                          )}
                        </div>
                        <button type="button" onClick={() => remove(it.listingId)} aria-label={`Remove ${it.title}`} className="grid size-9 shrink-0 place-items-center self-start rounded-full text-muted hover:bg-urgent-wash hover:text-urgent">
                          <Trash2 className="size-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          {/* Summary */}
          <aside className="rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-28">
            <h2 className="text-[16px] font-semibold text-ink">Summary</h2>
            <dl className="mt-3 space-y-2 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-muted">Items ({count})</dt>
                <dd className="font-semibold tabular-nums text-ink">{rs(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="text-right text-muted">
                  Rs 150–250 per shop
                  <span className="block text-[12px]">worked out at checkout</span>
                </dd>
              </div>
            </dl>
            {groups.length > 1 && (
              <p className="mt-3 rounded-xl bg-stone px-3 py-2.5 text-[12.5px] text-ink/80">
                Items from {groups.length} shops arrive as {groups.length} separate orders.
              </p>
            )}
            {blocked && (
              <p className="mt-3 rounded-xl bg-urgent-wash px-3 py-2.5 text-[12.5px] font-medium text-urgent">Remove the items that are no longer available to continue.</p>
            )}
            <Link
              href="/checkout"
              aria-disabled={blocked}
              onClick={(e) => blocked && e.preventDefault()}
              className={cn(
                "mt-4 hidden h-12 items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-white lg:flex",
                blocked ? "pointer-events-none bg-muted/50" : "bg-mountain hover:bg-mountain-hover",
              )}
            >
              Checkout <ArrowRight className="size-4" aria-hidden />
            </Link>
            <ul className="mt-4 space-y-2 text-[12.5px] text-muted">
              <li className="flex items-center gap-2">
                <Truck className="size-4 text-mountain" aria-hidden /> Delivered by the shop, anywhere in GB
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-mountain" aria-hidden /> Cash on delivery, Easypaisa, JazzCash or bank
              </li>
            </ul>
          </aside>
        </div>
      </div>

      {/* Phones: sticky checkout bar above the tab bar */}
      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-line bg-white px-4 py-3 md:bottom-0 md:pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-muted">Items total</p>
            <p className="text-[17px] font-bold tabular-nums text-ink">{rs(subtotal)}</p>
          </div>
          <Link
            href="/checkout"
            aria-disabled={blocked}
            onClick={(e) => blocked && e.preventDefault()}
            className={cn("flex h-12 items-center gap-2 rounded-full px-7 text-[15px] font-semibold text-white", blocked ? "pointer-events-none bg-muted/50" : "bg-mountain")}
          >
            Checkout <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
