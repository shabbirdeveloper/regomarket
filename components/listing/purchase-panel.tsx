"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageCircle, Minus, Phone, Plus, ShoppingBag } from "lucide-react";
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
  amount,
  unit,
  orderable,
  phoneMasked,
  whatsapp,
  sellerName,
}: {
  slug: string;
  amount: number;
  /** e.g. "KG" — enables weight presets */
  unit?: string;
  orderable: boolean;
  phoneMasked: string;
  whatsapp?: boolean;
  sellerName: string;
}) {
  const presets = unit === "KG" ? [1, 5, 10, 20] : [];
  const [qty, setQty] = useState(1);
  const [showPhone, setShowPhone] = useState(false);
  const total = amount * qty;
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
          <Link
            href={`/checkout?listing=${slug}&qty=${qty}`}
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-mountain text-[16px] font-semibold text-white shadow-[0_12px_24px_-12px_rgb(6_78_59/0.7)] transition-colors hover:bg-mountain-hover"
          >
            <ShoppingBag className="size-5" aria-hidden />
            Order now · Rs {nf.format(total)}
          </Link>
          <Link
            href={`/messages?listing=${slug}`}
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-line-strong bg-white text-[15px] font-semibold text-ink transition-colors hover:border-ink"
          >
            <MessageCircle className="size-[18px]" aria-hidden />
            Ask {sellerName.split(" ")[0]} a question
          </Link>
        </div>
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
    </div>
  );
}
