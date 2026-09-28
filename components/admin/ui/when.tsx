import { timeAgo } from "@/lib/format";

/** Relative time ("5 min ago") with the full date on hover. */
export function When({ iso, className }: { iso: string; className?: string }) {
  const full = new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <time dateTime={iso} title={full} className={className} suppressHydrationWarning>
      {timeAgo(iso)}
    </time>
  );
}
