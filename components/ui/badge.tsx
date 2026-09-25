import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Small, refined status labels. Use at most one per image and one per text row.
 *   verified  — green: Verified seller / shop, Phone / ID verified
 *   featured  — gold: paid or curated placement
 *   wholesale — neutral
 *   urgent    — muted red
 *   delivery  — green outline: shop delivers / accepts orders
 *   wanted    — gold wash: buyer demand
 */
export const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-xs font-semibold leading-none [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        verified: "bg-mint text-success",
        featured: "bg-gold-wash text-gold-ink",
        wholesale: "bg-stone text-ink/80",
        urgent: "bg-urgent-wash text-urgent",
        delivery: "bg-paper text-mountain ring-1 ring-inset ring-mountain/25",
        wanted: "bg-gold-wash text-gold-ink",
        neutral: "bg-stone text-muted",
        /** Solid chip for use on top of photos */
        overlay: "bg-paper/95 text-ink shadow-hairline",
        dark: "bg-deep/80 text-white",
      },
      size: {
        sm: "h-[22px] px-2 text-[11.5px]",
        md: "h-6 px-2.5 text-[12px]",
      },
    },
    defaultVariants: { tone: "neutral", size: "sm" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}
