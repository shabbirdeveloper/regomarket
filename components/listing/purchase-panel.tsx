"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Check, MessageCircle, Minus, Phone, Plus, ShoppingBag, ShoppingCart } from "lucide-react";
import { cart, useCart } from "@/lib/cart";
import { SaveButton } from "@/components/listings/save-button";
import { WhatsAppIcon } from "@/components/common/brand-icons";
import { cn } from "@/lib/utils";

const nf = new Intl.NumberFormat("en-US");

/**
 * The action area of a listing. Two modes:
 * - `orderable` (verified shop + shippable item): quantity → live total → Order now.
 * - everything else (livestock, land, cars, individuals): Call / WhatsApp / Chat.
 */
export function PurchasePanel({
  slug,
  item,
  amount,
  unit,
  orderable,
  phoneMasked,
  whatsapp,
  sellerName,
  saveId,
  title,
}: {
  slug: string;
  /** For the heart on the phone buy bar */
  saveId: string;
  title: string;
  /** What goes into the cart (orderable items only) */
  item?: { listingId: string; title: string; image: string | null; sellerId: string; shopName: string; shopSlug?: string; shopDistrict: string };
  amount: number;
  /** e.g. "KG" — enables weight presets */
  unit?: string;
  orderable: boolean;
  phoneMasked: string;
  whatsapp?: boolean;
  sellerName: string;
}) {
  const presets = unit === "KG" ? [1, 5, 10, 20] : [];
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const line = item ? { ...item, slug, price: amount, unit } : null;
  const total = amount * qty;
  const { count: inCart } = useCart();
  const label = unit ? unit : qty === 1 ? "item" : "items";

  if (orderable) {
    return (
      <div className="space-y-5">
        {presets.length > 0 && (
          <div>
            <p className="text-[13.5px] font-semibold text-ink">How much?</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setQty(p)}
                  aria-pressed={qty === p}
                  className={cn(
                    "h-10 rounded-full border px-4 text-[13.5px] font-medium transition-colors",
                    qty === p ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink hover:border-ink/50",
                  )}
                >
                  {p} {unit}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <p className="text-[13.5px] font-semibold text-ink">Quantity</p>
          <div className="inline-flex h-10 items-center rounded-full border border-line-strong bg-white">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="grid size-10 place-items-center rounded-full text-ink hover:bg-stone disabled:opacity-40"
              disabled={qty <= 1}
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <span className="tabular min-w-12 text-center text-[15px] font-semibold text-ink" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(999, q + 1))}
              aria-label="Increase quantity"
              className="grid size-10 place-items-center rounded-full text-ink hover:bg-stone"
            >
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
          <p className="text-[13px] text-muted">
            {qty} {label} · <span className="font-semibold text-ink">Rs {nf.format(total)}</span>
          </p>
        </div>

        <div className="grid gap-2.5">
          <div className="grid grid-cols-1 gap-2.5 max-md:hidden sm:grid-cols-2">
            <button
              type="button"
              disabled={!line}
              onClick={() => {
                if (!line) return;
                cart.add(line, qty);
                setAdded(true);
              }}
              className="flex h-14 items-center justify-center gap-2 rounded-full border-2 border-mountain bg-white text-[15.5px] font-semibold text-mountain transition-colors hover:bg-mint disabled:opacity-50"
            >
              {added ? <Check className="size-5" aria-hidden /> : <ShoppingCart className="size-5" aria-hidden />}
              {added ? "Added" : "Add to cart"}
            </button>
            <button
              type="button"
              disabled={!line}
              onClick={() => {
                if (!line) return;
                cart.set(line, qty);
                router.push(`/checkout?buy=${encodeURIComponent(line.listingId)}`);
              }}
              className="flex h-14 items-center justify-center gap-2 rounded-full bg-mountain text-[15.5px] font-semibold text-white shadow-[0_12px_24px_-12px_rgb(6_78_59/0.7)] transition-colors hover:bg-mountain-hover disabled:opacity-50"
            >
              <ShoppingBag className="size-5" aria-hidden />
              Buy now
            </button>
          </div>
          {added && (
            <p role="status" className="flex items-center justify-center gap-2 rounded-xl bg-mint px-4 py-2.5 text-[13.5px] text-mountain">
              <Check className="size-4" aria-hidden /> In your cart ·{" "}
              <Link href="/cart" className="font-semibold underline underline-offset-4">
                View cart
              </Link>
            </p>
          )}
          <Link
            href={`/messages?listing=${slug}`}
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-line-strong bg-white text-[15px] font-semibold text-ink transition-colors hover:border-ink"
          >
            <MessageCircle className="size-[18px]" aria-hidden />
            Ask {sellerName.split(" ")[0]} a question
          </Link>
        </div>

        <BuyBar saveId={saveId} title={title}>
          {added ? (
            <Link href="/cart" className={barPrimary}>
              <ShoppingBag className="size-5" aria-hidden />
              View cart{inCart ? ` · ${inCart}` : ""}
            </Link>
          ) : (
            <button
              type="button"
              disabled={!line}
              onClick={() => {
                if (!line) return;
                cart.add(line, qty);
                setAdded(true);
              }}
              className={barPrimary}
            >
              <ShoppingCart className="size-5" aria-hidden />
              Add to cart · Rs {nf.format(total)}
            </button>
          )}
        </BuyBar>
      </div>
    );
  }

  return (
    <div className="grid gap-2.5">
      <button
        type="button"
        onClick={() => setShowPhone(true)}
        className="flex h-14 items-center justify-center gap-2 rounded-full bg-mountain text-[16px] font-semibold text-white shadow-[0_12px_24px_-12px_rgb(6_78_59/0.7)] transition-colors hover:bg-mountain-hover"
      >
        <Phone className="size-5" aria-hidden />
        {showPhone ? phoneMasked : "Show phone number"}
      </button>
      {showPhone && (
        <p className="-mt-1 text-center text-[12.5px] text-muted">
          <Link href="/login" className="font-medium text-mountain underline underline-offset-4">
            Sign in
          </Link>{" "}
          to see the full number. It keeps sellers safe from spam.
        </p>
      )}
      <div className="grid grid-cols-2 gap-2.5">
        {whatsapp && (
          <Link
            href={`/messages?listing=${slug}&via=whatsapp`}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#1f7a52] text-[15px] font-semibold text-white transition-colors hover:bg-[#186643]"
          >
            <WhatsAppIcon size={18} />
            WhatsApp
          </Link>
        )}
        <Link
          href={`/messages?listing=${slug}`}
          className={cn(
            "flex h-12 items-center justify-center gap-2 rounded-full border border-line-strong bg-white text-[15px] font-semibold text-ink transition-colors hover:border-ink",
            !whatsapp && "col-span-2",
          )}
        >
          <MessageCircle className="size-[18px]" aria-hidden />
          Chat
        </Link>
      </div>

      <BuyBar saveId={saveId} title={title}>
        <Link href={`/messages?listing=${slug}`} className={barPrimary}>
          <MessageCircle className="size-5" aria-hidden />
          Chat with seller
        </Link>
      </BuyBar>
    </div>
  );
}

const barPrimary =
  "flex h-[52px] min-w-0 flex-1 items-center justify-center gap-2 truncate rounded-[16px] bg-mountain px-4 text-[15px] font-semibold text-white transition-colors active:bg-mountain-hover disabled:opacity-50";

/** Phones: a floating bar with the heart and the one main action (the tab dock hides on ad pages). */
function BuyBar({ saveId, title, children }: { saveId: string; title: string; children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] md:hidden print:hidden">
      <div className="mx-auto flex max-w-md items-center gap-2.5 rounded-[24px] bg-white p-2 shadow-dock ring-1 ring-ink/[0.06]">
        <SaveButton id={saveId} title={title} className="size-[52px] shrink-0 rounded-[16px] border-line bg-surface shadow-none" />
        {children}
      </div>
    </div>
  );
}
