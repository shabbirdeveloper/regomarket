"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { BadgeCheck, Banknote, CheckCircle2, Landmark, MapPin, MessageSquareText, Minus, PackageCheck, Plus, ShieldCheck, Smartphone, Store, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DistrictSlug, ListingCardData } from "@/types";
import { districtOptions } from "@/lib/options";
import { formatNumber, unitLabel } from "@/lib/format";
import { routes } from "@/lib/site";
import { Field, TextArea, TextInput } from "@/components/forms/fields";
import { FormSelect } from "@/components/forms/form-select";
import { cn } from "@/lib/utils";

type Pay = "cod" | "easypaisa" | "jazzcash" | "bank";
type Errors = Partial<Record<"name" | "phone" | "district" | "address", string>>;

const PAY: { id: Pay; Icon: LucideIcon; t: string; s: string }[] = [
  { id: "cod", Icon: Banknote, t: "Cash on delivery", s: "Pay the rider when it arrives" },
  { id: "easypaisa", Icon: Smartphone, t: "Easypaisa", s: "Shop sends its account after confirming" },
  { id: "jazzcash", Icon: Smartphone, t: "JazzCash", s: "Shop sends its account after confirming" },
  { id: "bank", Icon: Landmark, t: "Bank transfer", s: "Shop sends bank details after confirming" },
];

export interface CheckoutProps {
  listing: ListingCardData;
  shop: { name: string; slug?: string; district: DistrictSlug; town?: string; verified: boolean };
  initialQty: number;
  buyer: { name: string; phone: string; district: DistrictSlug; town?: string };
}

/**
 * One-page checkout for orderable items from verified shops. No card details
 * are ever collected here: cash on delivery or a wallet/bank transfer that the
 * shop confirms in chat.
 */
export function CheckoutForm({ listing, shop, initialQty, buyer }: CheckoutProps) {
  const unit = listing.price.unit ? unitLabel(listing.price.unit) : undefined;
  const presets = unit === "KG" ? [1, 5, 10, 20] : [];
  const [qty, setQty] = useState(Math.max(1, Math.min(999, initialQty)));
  const [name, setName] = useState(buyer.name);
  const [phone, setPhone] = useState(buyer.phone);
  const [district, setDistrict] = useState<string>(buyer.district);
  const [town, setTown] = useState(buyer.town ?? "");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [pay, setPay] = useState<Pay>("cod");
  const [errors, setErrors] = useState<Errors>({});
  const [order, setOrder] = useState<string | null>(null);

  const sameDistrict = district === shop.district;
  const delivery = district ? (sameDistrict ? 150 : 250) : 0;
  const eta = sameDistrict ? "Tomorrow" : "In 1–3 days";
  const subtotal = listing.price.amount * qty;
  const total = subtotal + delivery;
  const districtName = useMemo(() => districtOptions.find((d) => d.value === district)?.label, [district]);

  const submit = (e: FormEvent) => {
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
    setOrder(`RM-${Math.floor(100000 + Math.random() * 900000)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const thumb = listing.images[0]?.src;

  if (order) {
    const steps = [
      { t: "Order placed", s: "Just now", done: true },
      { t: `${shop.name} confirms`, s: "Usually within an hour", done: false },
      { t: "On the way", s: eta, done: false },
      { t: "Delivered", s: pay === "cod" ? `Pay Rs ${formatNumber(total)} to the rider` : "Enjoy!", done: false },
    ];
    return (
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border border-line bg-white p-6 md:p-8" role="status">
          <CheckCircle2 className="size-12 text-success" aria-hidden />
          <h2 className="mt-3 text-[26px] font-bold tracking-[-0.02em] text-ink">Order placed!</h2>
          <p className="mt-1 text-[14.5px] text-muted">
            Order <span className="font-semibold text-ink">{order}</span>. {shop.name} will confirm it shortly and message you.
          </p>
          <ol className="mt-7 space-y-0">
            {steps.map((s, i) => (
              <li key={s.t} className="relative flex gap-4 pb-6 last:pb-0">
                {i < steps.length - 1 && <span aria-hidden className={cn("absolute left-[11px] top-7 h-[calc(100%-20px)] w-0.5", s.done ? "bg-success" : "bg-line")} />}
                <span className={cn("grid size-6 shrink-0 place-items-center rounded-full ring-4 ring-white", s.done ? "bg-success text-white" : "border-2 border-line-strong bg-white")}>
                  {s.done && <CheckCircle2 className="size-4" aria-hidden />}
                </span>
                <span>
                  <span className={cn("block text-[14.5px] font-semibold", s.done ? "text-ink" : "text-ink/70")}>{s.t}</span>
                  <span className="block text-[13px] text-muted">{s.s}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-2">
            <Link href={`/messages?listing=${listing.slug}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-mountain px-6 text-[14px] font-semibold text-white hover:bg-mountain-hover">
              <MessageSquareText className="size-4" aria-hidden /> Message the shop
            </Link>
            <Link href="/" className="inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-[14px] font-semibold text-ink hover:border-ink">
              Continue shopping
            </Link>
          </div>
        </section>
        <aside className="h-fit rounded-2xl border border-line bg-white p-5">
          <p className="text-[13px] font-semibold text-muted">Delivering to</p>
          <p className="mt-1 text-[14.5px] font-semibold text-ink">{name}</p>
          <p className="text-[13.5px] text-ink/75">
            {address}, {town ? `${town}, ` : ""}
            {districtName}
          </p>
          <p className="text-[13.5px] text-ink/75">{phone}</p>
          <div className="mt-4 border-t border-line pt-4 text-[13.5px]">
            <p className="flex justify-between">
              <span className="text-muted">{listing.title}</span>
            </p>
            <p className="mt-1 flex justify-between">
              <span className="text-muted">
                {qty} {unit ?? (qty === 1 ? "item" : "items")}
              </span>
              <span className="font-semibold text-ink">Rs {formatNumber(total)}</span>
            </p>
            <p className="mt-1 text-[12.5px] text-muted">{PAY.find((p) => p.id === pay)?.t}</p>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="space-y-5">
        {/* Delivery details */}
        <section className="rounded-2xl border border-line bg-white p-5 md:p-7">
          <h2 className="flex items-center gap-2 text-[17px] font-semibold text-ink">
            <MapPin className="size-5 text-mountain" aria-hidden /> Delivery address
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="co-name" error={errors.name}>
              <TextInput id="co-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} invalid={Boolean(errors.name)} />
            </Field>
            <Field label="Mobile number" htmlFor="co-phone" error={errors.phone} hint="The rider will call this number.">
              <TextInput id="co-phone" type="tel" autoComplete="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0355 1234567" invalid={Boolean(errors.phone)} />
            </Field>
            <Field label="District" htmlFor="co-district" error={errors.district}>
              <FormSelect id="co-district" name="district" label="District" options={districtOptions} value={district} onChange={setDistrict} placeholder="Choose district" icon={<MapPin className="size-4" aria-hidden />} invalid={Boolean(errors.district)} />
            </Field>
            <Field label="Town / area" htmlFor="co-town" optional>
              <TextInput id="co-town" value={town} onChange={(e) => setTown(e.target.value)} placeholder="e.g. Jutial" />
            </Field>
          </div>
          <Field label="House, street or landmark" htmlFor="co-address" error={errors.address} className="mt-4">
            <TextInput id="co-address" autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. House 12, near Jutial Chowk mosque" invalid={Boolean(errors.address)} />
          </Field>
          <Field label="Note for the shop" htmlFor="co-note" optional className="mt-4">
            <TextArea id="co-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Call before coming, gift packing please" />
          </Field>
        </section>

        {/* Delivery method */}
        <section className="rounded-2xl border border-line bg-white p-5 md:p-7">
          <h2 className="flex items-center gap-2 text-[17px] font-semibold text-ink">
            <Truck className="size-5 text-mountain" aria-hidden /> Delivery
          </h2>
          <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-mountain bg-mint p-4">
            <div>
              <p className="text-[14.5px] font-semibold text-ink">{district ? (sameDistrict ? "Local delivery" : "Delivery across GB") : "Home delivery"}</p>
              <p className="text-[13px] text-muted">
                {district ? `${eta} · from ${shop.town ? `${shop.town}, ` : ""}${districtOptions.find((d) => d.value === shop.district)?.label}` : "Choose your district to see the time and fee"}
              </p>
            </div>
            <p className="shrink-0 text-[15px] font-bold text-ink">{district ? `Rs ${delivery}` : "—"}</p>
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
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                  pay === id ? "border-mountain bg-mint ring-1 ring-mountain" : "border-line-strong hover:border-ink/40",
                )}
              >
                <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2", pay === id ? "border-mountain" : "border-line-strong")}>
                  {pay === id && <span className="size-2.5 rounded-full bg-mountain" />}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[14.5px] font-semibold text-ink">
                    <Icon className="size-4 text-muted" aria-hidden /> {t}
                  </span>
                  <span className="block text-[12.5px] text-muted">{s}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="mt-4 flex items-start gap-2 text-[12.5px] leading-relaxed text-muted">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
            REGOMARKET never asks for card numbers, PINs or OTP codes. Only send money to the account the shop shares in your REGOMARKET chat.
          </p>
        </section>
      </div>

      {/* Summary */}
      <aside className="space-y-4 lg:sticky lg:top-[96px]">
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-[15px] font-semibold text-ink">Your order</p>
          <div className="mt-4 flex gap-3">
            <Link href={routes.listing(listing.slug)} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-stone">
              {thumb && <Image src={thumb} alt="" fill sizes="80px" className="object-cover" />}
            </Link>
            <div className="min-w-0">
              <Link href={routes.listing(listing.slug)} className="line-clamp-2 text-[14px] font-medium text-ink hover:text-mountain">
                {listing.title}
              </Link>
              <p className="mt-0.5 text-[13px] font-semibold text-ink">
                Rs {formatNumber(listing.price.amount)}
                {unit && <span className="font-normal text-muted"> / {unit}</span>}
              </p>
              <p className="mt-1 flex items-center gap-1 text-[12px] text-muted">
                <Store className="size-3.5" aria-hidden />
                {shop.slug ? (
                  <Link href={routes.shop(shop.slug)} className="truncate hover:text-ink">
                    {shop.name}
                  </Link>
                ) : (
                  shop.name
                )}
                {shop.verified && <BadgeCheck className="size-3.5 shrink-0 text-success" aria-label="Verified" />}
              </p>
            </div>
          </div>

          {presets.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={qty === p}
                  onClick={() => setQty(p)}
                  className={cn("h-8 rounded-full border px-3 text-[12.5px] font-medium", qty === p ? "border-ink bg-ink text-white" : "border-line-strong text-ink hover:border-ink/50")}
                >
                  {p} {unit}
                </button>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[13.5px] text-muted">Quantity{unit ? ` (${unit})` : ""}</span>
            <div className="inline-flex h-9 items-center rounded-full border border-line-strong">
              <button type="button" aria-label="Less" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-9 place-items-center rounded-full hover:bg-stone disabled:opacity-40">
                <Minus className="size-4" aria-hidden />
              </button>
              <span className="min-w-10 text-center text-[14px] font-semibold tabular-nums" aria-live="polite">
                {qty}
              </span>
              <button type="button" aria-label="More" onClick={() => setQty((q) => Math.min(999, q + 1))} className="grid size-9 place-items-center rounded-full hover:bg-stone">
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
          </div>

          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[14px]">
            <div className="flex justify-between">
              <dt className="text-muted">Items</dt>
              <dd className="text-ink">Rs {formatNumber(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd className="text-ink">{district ? `Rs ${delivery}` : "—"}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="font-semibold text-ink">Total</dt>
              <dd className="text-[22px] font-bold tracking-[-0.02em] text-ink">Rs {formatNumber(total)}</dd>
            </div>
          </dl>
        </div>

        <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-mountain text-[15.5px] font-semibold text-white hover:bg-mountain-hover">
          <PackageCheck className="size-5" aria-hidden /> Place order · Rs {formatNumber(total)}
        </button>
        <p className="px-1 text-center text-[12px] text-muted">You can cancel for free until the shop confirms.</p>
      </aside>
    </form>
  );
}
