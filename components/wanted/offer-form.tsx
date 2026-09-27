"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";

/** "Send offer" box on a Wanted request. Works locally until messages are wired to Supabase. */
export function OfferForm({ buyerName, title, unit }: { buyerName: string; title: string; unit?: string }) {
  const [sent, setSent] = useState<{ price: string; note: string } | null>(null);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!price.trim()) {
      setError("Enter your price so the buyer can compare offers.");
      return;
    }
    setError("");
    setSent({ price, note });
  };

  if (sent) {
    return (
      <div className="rounded-2xl bg-mint p-5 text-center" role="status">
        <CheckCircle2 className="mx-auto size-9 text-success" aria-hidden />
        <p className="mt-2 text-[16px] font-semibold text-ink">Offer sent to {buyerName}</p>
        <p className="mt-1 text-[13.5px] text-ink/70">
          Rs {Number(sent.price.replace(/[^\d]/g, "")).toLocaleString("en-US")}
          {unit ? ` / ${unit}` : ""} for &ldquo;{title}&rdquo;. You&apos;ll get a message when they reply.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href="/messages" className="inline-flex h-10 items-center justify-center rounded-full bg-mountain text-[13.5px] font-semibold text-white">
            Go to messages
          </Link>
          <button
            type="button"
            onClick={() => {
              setSent(null);
              setPrice("");
              setNote("");
            }}
            className="h-10 rounded-full border border-line-strong bg-white text-[13.5px] font-semibold text-ink"
          >
            Edit offer
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} id="offer" className="scroll-mt-28 space-y-3" noValidate>
      <div>
        <label htmlFor="offer-price" className="text-[13.5px] font-semibold text-ink">
          Your price
        </label>
        <div className="mt-1.5 flex h-12 items-center rounded-xl border border-line-strong bg-white px-4 focus-within:border-mountain focus-within:shadow-[0_0_0_4px_rgb(6_78_59/0.1)]">
          <span className="text-[15px] font-semibold text-muted">Rs</span>
          <input
            id="offer-price"
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^\d,]/g, ""))}
            placeholder="0"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "offer-err" : undefined}
            className="h-full min-w-0 flex-1 bg-transparent px-2 text-[16px] font-semibold text-ink outline-none"
          />
          {unit && <span className="text-[13.5px] text-muted">/ {unit}</span>}
        </div>
        {error && (
          <p id="offer-err" className="mt-1.5 text-[12.5px] font-medium text-[#b42318]">
            {error}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="offer-note" className="text-[13.5px] font-semibold text-ink">
          Message <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="offer-note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Quality, delivery time, where to see it…"
          className="mt-1.5 w-full resize-none rounded-xl border border-line-strong bg-white px-4 py-3 text-[14.5px] text-ink outline-none placeholder:text-muted focus:border-mountain"
        />
      </div>
      <button
        type="submit"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-mountain text-[15px] font-semibold text-white hover:bg-mountain-hover"
      >
        <Send className="size-[18px]" aria-hidden /> Send offer
      </button>
    </form>
  );
}
