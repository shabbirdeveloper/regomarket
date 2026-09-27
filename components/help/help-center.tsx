"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { Faq } from "@/data/help";
import { helpTopics } from "@/data/help";
import { cn } from "@/lib/utils";

/** Searchable, filterable help questions. */
export function HelpCenter({ faqs }: { faqs: Faq[] }) {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<Faq["topic"] | "all">("all");

  const shown = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return faqs.filter(
      (f) => (topic === "all" || f.topic === topic) && words.every((w) => `${f.q} ${f.a}`.toLowerCase().includes(w)),
    );
  }, [faqs, q, topic]);

  return (
    <div>
      <label className="relative block max-w-2xl">
        <span className="sr-only">Search help</span>
        <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search: delivery, verified, cancel order…"
          className="h-14 w-full rounded-full border border-line-strong bg-cream pl-[52px] pr-5 text-[15.5px] text-ink outline-none placeholder:text-muted focus:border-mountain focus:bg-white focus:shadow-[0_0_0_4px_rgb(6_78_59/0.1)]"
        />
      </label>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {helpTopics.map((t) => {
          const on = topic === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              onClick={() => setTopic(on ? "all" : t.id)}
              className={cn(
                "rounded-2xl border p-4 text-left transition-colors",
                on ? "border-mountain bg-mint ring-1 ring-mountain" : "border-line hover:border-ink/40",
              )}
            >
              <span className={cn("block text-[15px] font-semibold", on ? "text-mountain" : "text-ink")}>{t.title}</span>
              <span className="mt-0.5 block text-[12.5px] text-muted">{t.sub}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <p className="text-[13px] text-muted" aria-live="polite">
          {shown.length} {shown.length === 1 ? "answer" : "answers"}
          {topic !== "all" && (
            <button type="button" onClick={() => setTopic("all")} className="ml-2 font-semibold text-mountain">
              Show all topics
            </button>
          )}
        </p>
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
          {shown.map((f) => (
            <li key={f.q}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <div className="px-5 pb-5 text-[14.5px] leading-relaxed text-ink/75">
                  <p>{f.a}</p>
                  {f.link && (
                    <Link href={f.link.href} className="mt-2 inline-block font-semibold text-mountain hover:underline">
                      {f.link.label} →
                    </Link>
                  )}
                </div>
              </details>
            </li>
          ))}
          {shown.length === 0 && (
            <li className="px-5 py-10 text-center text-[14px] text-muted">
              No answer found.{" "}
              <Link href="/contact" className="font-semibold text-mountain">
                Ask our team
              </Link>
              .
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
