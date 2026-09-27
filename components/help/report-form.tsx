"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Flag } from "lucide-react";
import { Field, Segmented, TextArea, TextInput } from "@/components/forms/fields";
import { cn } from "@/lib/utils";

const REASONS = [
  "Scam or asked for advance payment",
  "Fake or stolen item",
  "Wrong price or misleading ad",
  "Prohibited item",
  "Rude or abusive messages",
  "Something else",
];

/** Report an ad, user or shop. Local until the moderation queue is live. */
export function ReportForm({ initialLink = "" }: { initialLink?: string }) {
  const [what, setWhat] = useState<"ad" | "user" | "shop">("ad");
  const [link, setLink] = useState(initialLink);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [err, setErr] = useState<{ link?: string; reason?: string }>({});
  const [caseId, setCaseId] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof err = {};
    if (link.trim().length < 3) next.link = "Paste the link, ad ID or name.";
    if (!reason) next.reason = "Choose a reason.";
    setErr(next);
    if (Object.keys(next).length) return;
    setCaseId(`CASE-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  if (caseId) {
    return (
      <div className="rounded-2xl border border-line p-8 text-center" role="status">
        <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden />
        <h2 className="mt-3 text-[22px] font-bold text-ink">Thank you. We&apos;re on it.</h2>
        <p className="mt-2 text-[14.5px] text-muted">
          Your report number is <span className="font-semibold text-ink">{caseId}</span>. Our team checks every report within a day. Until then, don&apos;t send any
          money to this person.
        </p>
        <Link href="/help/safety" className="mt-5 inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-[14px] font-semibold text-ink">
          Read safety tips
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6 rounded-2xl border border-line p-5 md:p-7">
      <Field label="What are you reporting?">
        <Segmented
          name="what"
          label="What are you reporting"
          value={what}
          onChange={setWhat}
          options={[
            { value: "ad", label: "An ad" },
            { value: "user", label: "A person" },
            { value: "shop", label: "A shop" },
          ]}
        />
      </Field>
      <Field label={what === "ad" ? "Ad link or ID" : what === "shop" ? "Shop link or name" : "Their name or phone"} htmlFor="rp-link" error={err.link}>
        <TextInput id="rp-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder={what === "ad" ? "e.g. regomarket.pk/listing/… or L-1002" : ""} invalid={Boolean(err.link)} />
      </Field>
      <fieldset>
        <legend className="text-[14px] font-semibold text-ink">Reason</legend>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {REASONS.map((r) => (
            <label
              key={r}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-[14px] transition-colors",
                reason === r ? "border-mountain bg-mint text-mountain" : "border-line-strong text-ink hover:border-ink/40",
              )}
            >
              <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="size-4 accent-mountain" />
              {r}
            </label>
          ))}
        </div>
        {err.reason && <p className="mt-1.5 text-[12.5px] font-medium text-[#b42318]">{err.reason}</p>}
      </fieldset>
      <Field label="What happened?" htmlFor="rp-details" optional hint="Dates, amounts, what they said. Don't include your bank or card numbers.">
        <TextArea id="rp-details" rows={4} maxLength={1000} value={details} onChange={(e) => setDetails(e.target.value)} />
      </Field>
      <button type="submit" className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 text-[15px] font-semibold text-white hover:bg-ink/85">
        <Flag className="size-4" aria-hidden /> Send report
      </button>
    </form>
  );
}
