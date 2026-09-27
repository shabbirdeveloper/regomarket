import { cva, type VariantProps } from "class-variance-authority";

/**
 * Card surfaces — frosted glass (see `.glass-*` in app/globals.css). The hover
 * lift is reserved for cards that navigate somewhere. Radius 16px.
 */
export const cardVariants = cva("relative overflow-hidden rounded-lg", {
  variants: {
    variant: {
      /** Standard frosted card */
      plain: "glass-card",
      /** Clickable frosted card: -4px lift, gold-tinted edge and deeper glow on hover */
      interactive:
        "group glass-card glass-card-hover has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-mountain has-[a:focus-visible]:ring-offset-2",
      /** Recessed glass panel (spec tables, summaries) */
      muted: "glass-inset",
      /** Demand card (Wanted) — frosted with a gold edge */
      notice: "group glass-card glass-card-hover ring-1 ring-inset ring-gold/25",
      /** Photo card with overlay text */
      media: "group isolate bg-deep text-white",
    },
  },
  defaultVariants: { variant: "plain" },
});

export type CardVariant = VariantProps<typeof cardVariants>["variant"];
