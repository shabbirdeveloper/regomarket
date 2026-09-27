"use client";

import { useSyncExternalStore } from "react";
import type { OpeningHours } from "@/types";
import { formatHour } from "@/lib/format";
import { cn } from "@/lib/utils";

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "Mon – Sat" → [1..6], "Daily" → all days. */
function openDays(days: string) {
  if (/daily/i.test(days)) return new Set([0, 1, 2, 3, 4, 5, 6]);
  const m = days.match(/(\w{3})\s*[–-]\s*(\w{3})/);
  if (!m) return new Set([0, 1, 2, 3, 4, 5, 6]);
  const a = DAY.indexOf(m[1]);
  const b = DAY.indexOf(m[2]);
  const out = new Set<number>();
  for (let i = a; ; i = (i + 1) % 7) {
    out.add(i);
    if (i === b) break;
  }
  return out;
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Current day + minute in Pakistan time, regardless of the viewer's clock. */
function nowInPK() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  return { day: DAY.indexOf(get("weekday")), min: Number(get("hour")) * 60 + Number(get("minute")) };
}

const subscribe = (cb: () => void) => {
  const t = setInterval(cb, 60_000);
  return () => clearInterval(t);
};

/** Live "Open now · closes 8 PM" pill. Renders nothing on the server. */
export function OpenStatus({ hours, className }: { hours: OpeningHours; className?: string }) {
  const snap = useSyncExternalStore(
    subscribe,
    () => {
      const n = nowInPK();
      return `${n.day}:${n.min}`;
    },
    () => null,
  );
  if (!snap) return <span className={cn("inline-block h-6 w-28", className)} aria-hidden />;

  const [day, min] = snap.split(":").map(Number);
  const days = openDays(hours.days);
  const open = days.has(day) && min >= toMin(hours.open) && min < toMin(hours.close);

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold",
        open ? "bg-mint text-success" : "bg-stone text-ink/70",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", open ? "bg-success" : "bg-muted")} aria-hidden />
      {open ? `Open now · closes ${formatHour(hours.close)}` : `Closed · opens ${formatHour(hours.open)}`}
    </span>
  );
}
