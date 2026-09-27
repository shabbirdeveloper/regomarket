"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Native share sheet on phones, copy-link everywhere else. */
export function ShareButton({ title, className }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* user closed the sheet */
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      aria-label={copied ? "Link copied" : `Share ${title}`}
      className={cn(
        "relative grid size-11 shrink-0 place-items-center rounded-full border border-line-strong bg-white text-ink transition-colors hover:border-ink",
        className,
      )}
    >
      {copied ? <Check className="size-[18px] text-success" aria-hidden /> : <Share2 className="size-[18px]" aria-hidden />}
      <span
        role="status"
        className={cn(
          "pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11.5px] font-medium text-white transition-opacity",
          copied ? "opacity-100" : "opacity-0",
        )}
      >
        {copied ? "Link copied" : ""}
      </span>
    </button>
  );
}
