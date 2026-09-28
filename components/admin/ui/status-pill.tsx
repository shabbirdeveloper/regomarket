import { cn } from "@/lib/utils";

type Tone = "wait" | "good" | "bad" | "info" | "quiet";

const TONE: Record<Tone, string> = {
  wait: "bg-[#fdf3dc] text-[#8a5a00] ring-[#f1d9a0]",
  good: "bg-mint text-success ring-[#cfe4d8]",
  bad: "bg-urgent-wash text-urgent ring-[#efcfc7]",
  info: "bg-[#eaf1fb] text-[#1d4e89] ring-[#cfdcf0]",
  quiet: "bg-stone text-muted ring-line",
};

const DOT: Record<Tone, string> = {
  wait: "bg-[#d99a00]",
  good: "bg-success",
  bad: "bg-urgent",
  info: "bg-[#2f6fbf]",
  quiet: "bg-muted/60",
};

/** Every status used in the admin, with one label and one tone. */
const STATUS: Record<string, [string, Tone]> = {
  pending: ["Pending", "wait"],
  active: ["Live", "good"],
  rejected: ["Rejected", "bad"],
  sold: ["Sold", "quiet"],
  expired: ["Expired", "quiet"],
  removed: ["Removed", "bad"],
  suspended: ["Suspended", "bad"],
  banned: ["Banned", "bad"],
  approved: ["Approved", "good"],
  open: ["Open", "wait"],
  reviewing: ["In review", "info"],
  resolved: ["Resolved", "good"],
  dismissed: ["Dismissed", "quiet"],
  published: ["Published", "good"],
  flagged: ["Flagged", "wait"],
  hidden: ["Hidden", "quiet"],
  closed: ["Closed", "quiet"],
  placed: ["New order", "wait"],
  confirmed: ["Confirmed", "info"],
  shipped: ["Shipped", "info"],
  delivered: ["Delivered", "good"],
  cancelled: ["Cancelled", "bad"],
  new: ["New", "wait"],
  replied: ["Replied", "good"],
  draft: ["Draft", "quiet"],
  visible: ["Visible", "good"],
  off: ["Hidden", "quiet"],
};

export function statusLabel(status: string) {
  return STATUS[status]?.[0] ?? status;
}

export function StatusPill({ status, label, className }: { status: string; label?: string; className?: string }) {
  const [text, tone] = STATUS[status] ?? [status, "quiet" as Tone];
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[12px] font-semibold ring-1 ring-inset",
        TONE[tone],
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", DOT[tone])} />
      {label ?? text}
    </span>
  );
}
