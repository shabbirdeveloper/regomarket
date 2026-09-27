import { BadgeCheck, Clock, Package, Star } from "lucide-react";
import type { ListingBadge as BadgeKind } from "@/types";
import { cn } from "@/lib/utils";

const META: Record<BadgeKind, { label: string; Icon: typeof Star; icon: string }> = {
  featured: { label: "Featured", Icon: Star, icon: "fill-gold text-gold" },
  verified: { label: "Verified", Icon: BadgeCheck, icon: "text-success" },
  urgent: { label: "Urgent", Icon: Clock, icon: "text-urgent" },
  wholesale: { label: "Wholesale", Icon: Package, icon: "text-ink/60" },
};

export const badgeLabel = (b: BadgeKind) => META[b].label;

/** Priority when a listing has several: show only the most meaningful one on the photo. */
export function primaryBadge(badges: BadgeKind[]): BadgeKind | undefined {
  return (["urgent", "verified", "featured", "wholesale"] as const).find((b) => badges.includes(b));
}

/** Small frosted-glass chip that sits on product photos. One per image. */
export function ListingBadge({ badge, className }: { badge: BadgeKind; className?: string }) {
  const { label, Icon, icon } = META[badge];
  return (
    <span
      className={cn(
        "glass-pill inline-flex h-6 items-center gap-1 rounded-md px-2 text-[11.5px] font-semibold text-ink",
        className,
      )}
    >
      <Icon className={cn("size-3.5", icon)} strokeWidth={2} aria-hidden />
      {label}
    </span>
  );
}
