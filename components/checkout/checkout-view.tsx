"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AlertTriangle, ArrowLeft, Banknote, CheckCircle2, Landmark, Loader2, LockKeyhole, MapPin, Package, ShieldCheck, ShoppingCart, Smartphone, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { RequireAuth } from "@/components/auth/require-auth";
import { thumbSrc, useCartCheck } from "@/components/cart/cart-view";
import { Field, TextArea, TextInput } from "@/components/forms/fields";
import { FormSelect } from "@/components/forms/form-select";
import { byShop, cart, deliveryFee, useCart, type CartItem } from "@/lib/cart";
import { districtOptions } from "@/lib/options";
import { friendlyError, supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

export type SeedItem = Omit<CartItem, "addedAt">;
type Pay = "cod" | "easypaisa" | "jazzcash" | "bank";
type Errors = Partial<Record<"name" | "phone" | "district" | "address", string>>;
interface Placed {
  id: string;
  shop: string;
  total: number;
}

const nf = new Intl.NumberFormat("en-US");
const rs = (n: number) => `Rs ${nf.format(n)}`;

const PAY: { id: Pay; Icon: LucideIcon; t: string; s: string }[] = [
  { id: "cod", Icon: Banknote, t: "Cash on delivery", s: "Pay the rider when it arrives" },
  { id: "easypaisa", Icon: Smartphone, t: "Easypaisa", s: "Send to the shop's account, then add the transaction ID" },
  { id: "jazzcash", Icon: Smartphone, t: "JazzCash", s: "Send to the shop's account, then add the transaction ID" },
  { id: "bank", Icon: Landmark, t: "Bank transfer", s: "Transfer to the shop's bank, then add the reference" },
];

export function CheckoutView({ buy, seed }: { buy?: string; seed: SeedItem | null }) {
  const { enabled } = useAuth();
  const body = <Checkout buy={buy ?? seed?.listingId} seed={seed} />;
  return enabled ? (
    <RequireAuth title="Sign in to check out" body="We need your account to send you order updates. It only takes a few seconds.">
      {body}
    </RequireAuth>
  ) : (
    body
  );
}

function Checkout({ buy, seed }: { buy?: string; seed: SeedItem | null }) {
  const { enabled, profile } = useAuth();
  const { items: all, remove } = useCart();
  const [mounted, setMounted] = useState(false);
  const seeded = useRef(false);

  // Old "Order now" links put their item in the cart first
  useEffect(() => {
    if (seed && !seeded.current) {
      seeded.current = true;
      const { qty, ...item } = seed;
      cart.set(item, qty);
    }
    setMounted(true);
  }, [seed]);

  const items = useMemo(() => (buy ? all.filter((i) => i.listingId === buy) : all), [all, buy]);
  const groups = byShop(items);
  const { unavailable, checked } = useCartCheck(items);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [town, setTown] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [pay, setPay] = useState<Pay>("cod");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [placed, setPlaced] = useState<Placed[] | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  // Fill in what we already know about the buyer
  useEffect(() => {
    if (prefilled || !profile) return;
    setPrefilled(true);
    if (profile.name && profile.name !== "New user") setName(profile.name);
    if (profile.district) setDistrict(profile.district);
    if (profile.town) setTown(profile.town);
    supabaseBrowser()
      ?.from("seller_contacts")
      .select("phone")
      .eq("seller_id", profile.sellerId)
      .maybeSingle<{ phone: string }>()
      .then(({ data }) => {
        if (data?.phone) setPhone(data.phone.replace(/^\+92/, "0"));
      });
  }, [profile, prefilled]);

  const fees = groups.map((g) => (district ? deliveryFee(g.shopDistrict, district) : 0));
  const subtotal = groups.reduce((n, g) => n + g.subtotal, 0);
  const delivery = fees.reduce((n, f) => n + f, 0);
  const blocked = items.some((i) => unavailable.has(i.listingId));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Enter the name for delivery.";
    if (phone.replace(/\D/g, "").length < 10) next.phone = "Enter a mobile number the rider can call.";
    if (!district) next.district = "Choose your district.";
    if (address.trim().length < 8) next.address = "Add a street, house or nearby landmark.";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      document.getElementById(`co-${first}`)?.focus();
      return;
    }
    setFailure("");
    setBusy(true);
    try {
      const db = supabaseBrowser();
      let result: Placed[];
      if (db && enabled) {
        const { data, error } = await db.rpc("place_order", {
          p_items: items.map((i) => ({ listing_id: i.listingId, qty: i.qty })),
          p_ship: { name: name.trim(), phone: phone.trim(), district, town: town.trim(), address: address.trim(), note: note.trim() },
          p_payment: pay,
        });
        if (error) throw error;
        result = data as Placed[];
      } else {
        await new Promise((r) => setTimeout(r, 700));
        result = groups.map((g, i) => ({ id: `RM-${100001 + i}`, shop: g.shopName, total: g.subtotal + fees[i] }));
      }
      items.forEach((i) => remove(i.listingId));
      setPlaced(result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setFailure(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  if (!mounted) return <div className="min-h-[60vh] bg-cream" />;

  /* ---------- Success ---------- */
  if (placed) {
    const wallet = pay !== "cod";
    return (
      <div className="bg-cream">
        <div className="shell pb-16 pt-8">
          <section className="mx-auto max-w-2xl rounded-2xl border border-line bg-white p-6 md:p-8" role="status">
            <CheckCircle2 className="size-12 text-success" aria-hidden />
            <h1 className="mt-3 text-[26px] font-bold tracking-[-0.02em] text-ink">{placed.length > 1 ? `${placed.length} orders placed!` : "Order placed!"}</h1>
            <p className="mt-1 text-[14.5px] text-muted">
              {wallet
                ? "Next: open your order to see the shop's account, send the money, and add the transaction ID."
                : "The shop will confirm soon. You'll get a notification at every step."}
            </p>
            <ul className="mt-6 divide-y divide-line rounded-xl border border-line">
              {placed.map((o) => (
                <li key={o.id} className="flex items-center gap-3 px-4 py-3.5">
                  <Package className="size-5 shrink-0 text-mountain" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] font-semibold text-ink">{o.id}</p>
                    <p className="truncate text-[13px] text-muted">
                      {o.shop} · {rs(o.total)}
                    </p>
                  </div>
                  {enabled && (
                    <Link href={`/orders/${o.id}`} className="shrink-0 rounded-full border border-line-strong px-4 py-2 text-[13px] font-semibold text-ink hover:border-ink">
                      {wallet ? "Pay now" : "Track"}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              {enabled && (
                <Link href="/orders" className="inline-flex h-11 items-center rounded-full bg-mountain px-6 text-[14px] font-semibold text-white hover:bg-mountain-hover">
                  My orders
                </Link>
              )}
              <Link href="/" className="inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-[14px] font-semibold text-ink hover:border-ink">
                Continue shopping
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  /* ---------- Empty ---------- */
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] bg-cream">
        <div className="shell py-16">
          <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-mint text-mountain">
              <ShoppingCart className="size-6" aria-hidden />
            </span>
            <h1 className="mt-4 text-[22px] font-bold tracking-[-0.02em] text-ink">Nothing to check out</h1>
            <p className="mt-2 text-[14.5px] text-muted">Add items with the “Delivery” tag to your cart first.</p>
            <Link href="/search?delivery=1" className="mt-6 inline-flex h-11 items-center rounded-full bg-mountain px-6 text-[14px] font-semibold text-white">
              See items with delivery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Form ---------- */
  return (
    <div className="bg-cream">
      <div className="shell pb-16 pt-4 md:pt-6">
        <Link href="/cart" className="-ml-2 inline-flex h-9 items-center gap-1 rounded-full px-2 text-[13.5px] font-medium text-muted hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> Back to cart
        </Link>
        <h1 className="mt-1 text-[26px] font-bold tracking-[-0.02em] text-ink md:text-[30px]">Checkout</h1>

        <form onSubmit={submit} noValidate className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="space-y-6">
            {/* Delivery */}
            <section className="rounded-2xl border border-line bg-white p-5 md:p-7">
              <h2 className="flex items-center gap-2 text-[17px] font-semibold text-ink">
                <MapPin className="size-5 text-mountain" aria-hidden /> Delivery address
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Full name" htmlFor="co-name" error={errors.name}>
                  <TextInput id="co-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" invalid={Boolean(errors.name)} />
                </Field>
                <Field label="Mobile number" htmlFor="co-phone" error={errors.phone}>
                  <TextInput id="co-phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0355 1234567" autoComplete="tel" invalid={Boolean(errors.phone)} />
                </Field>
                <Field label="District" htmlFor="co-district" error={errors.district}>
                  <FormSelect id="co-district" name="district" label="District" options={districtOptions} value={district} onChange={setDistrict} placeholder="Choose district" invalid={Boolean(errors.district)} />
                </Field>
                <Field label="Town / village" htmlFor="co-town" optional>
                  <TextInput id="co-town" value={town} onChange={(e) => setTown(e.target.value)} placeholder="e.g. Jutial" />
                </Field>
                <Field label="Address" htmlFor="co-address" error={errors.address} className="sm:col-span-2">
                  <TextArea id="co-address" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House, street, nearby landmark" invalid={Boolean(errors.address)} />
                </Field>
                <Field label="Note for the shop" htmlFor="co-note" optional className="sm:col-span-2">
                  <TextInput id="co-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Call before coming" maxLength={300} />
                </Field>
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-2xl border border-line bg-white p-5 md:p-7">
              <h2 className="flex items-center gap-2 text-[17px] font-semibold text-ink">
                <Banknote className="size-5 text-mountain" aria-hidden /> Payment
              </h2>
              <div role="radiogroup" aria-label="Payment method" className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {PAY.map(({ id, Icon, t, s }) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={pay === id}
                    onClick={() => setPay(id)}
                    className={cn("flex items-start gap-3 rounded-xl border p-4 text-left transition-colors", pay === id ? "border-mountain bg-mint ring-1 ring-mountain" : "border-line-strong hover:border-ink/40")}
                  >
                    <Icon className={cn("mt-0.5 size-5 shrink-0", pay === id ? "text-mountain" : "text-muted")} aria-hidden />
                    <span>
                      <span className="block text-[14px] font-semibold text-ink">{t}</span>
                      <span className="block text-[12.5px] text-muted">{s}</span>
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-4 flex items-start gap-2 text-[12.5px] text-muted">
                <LockKeyhole className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                REGOMARKET never asks for card numbers, PINs or OTP codes. Only send money to the account shown on your order page.
              </p>
            </section>
          </div>

          {/* Summary */}
          <aside className="space-y-4 lg:sticky lg:top-28">
            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="text-[16px] font-semibold text-ink">Your order</h2>
              <div className="mt-3 space-y-4">
                {groups.map((g, gi) => (
                  <div key={g.sellerId} className="rounded-xl border border-line">
                    <p className="flex items-center gap-2 border-b border-line bg-[#fbfaf6] px-3 py-2 text-[13px] font-semibold text-ink">
                      <Store className="size-4 text-mountain" aria-hidden /> {g.shopName}
                    </p>
                    <ul className="divide-y divide-line">
                      {g.items.map((it) => {
                        const img = thumbSrc(it.image, 120);
                        const off = unavailable.has(it.listingId);
                        return (
                          <li key={it.listingId} className="flex items-center gap-3 px-3 py-2.5">
                            <span className="block size-11 shrink-0 overflow-hidden rounded-lg bg-stone">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              {img && <img src={img} alt="" className="size-full object-cover" />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="line-clamp-1 text-[13px] font-medium text-ink">{it.title}</span>
                              <span className={cn("block text-[12px]", off ? "font-semibold text-urgent" : "text-muted")}>
                                {off ? "No longer available" : `${it.qty} × ${rs(it.price)}`}
                              </span>
                            </span>
                            <span className="text-[13px] font-semibold tabular-nums text-ink">{rs(it.price * it.qty)}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="flex justify-between border-t border-line px-3 py-2 text-[12.5px] text-muted">
                      <span>Delivery</span>
                      <span className="tabular-nums">{district ? rs(fees[gi]) : "Choose district"}</span>
                    </p>
                  </div>
                ))}
              </div>
              <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-[14px]">
                <div className="flex justify-between">
                  <dt className="text-muted">Items</dt>
                  <dd className="tabular-nums text-ink">{rs(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Delivery</dt>
                  <dd className="tabular-nums text-ink">{district ? rs(delivery) : "—"}</dd>
                </div>
                <div className="flex justify-between pt-1 text-[17px] font-bold">
                  <dt className="text-ink">Total</dt>
                  <dd className="tabular-nums text-ink">{rs(subtotal + delivery)}</dd>
                </div>
              </dl>

              {blocked && (
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-urgent-wash px-3 py-2.5 text-[12.5px] font-medium text-urgent">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> Some items are no longer available.{" "}
                  <Link href="/cart" className="underline">
                    Fix your cart
                  </Link>
                </p>
              )}
              {failure && (
                <p role="alert" className="mt-3 rounded-xl bg-urgent-wash px-3 py-2.5 text-[13px] font-medium text-urgent">
                  {failure}
                </p>
              )}

              <button
                type="submit"
                disabled={busy || blocked || !checked}
                className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-mountain text-[16px] font-semibold text-white shadow-[0_12px_24px_-12px_rgb(6_78_59/0.7)] hover:bg-mountain-hover disabled:opacity-60"
              >
                {busy && <Loader2 className="size-5 animate-spin" aria-hidden />}
                Place order · {rs(subtotal + delivery)}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-muted">
                <ShieldCheck className="size-4 text-success" aria-hidden /> Verified shops only · you can cancel before the shop confirms
              </p>
            </section>
            {!enabled && (
              <p className="rounded-xl bg-gold-wash px-4 py-3 text-[12.5px] text-gold-ink">Preview mode: orders are not saved.</p>
            )}
          </aside>
        </form>
      </div>
    </div>
  );
}
