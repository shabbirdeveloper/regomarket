import { cva, type VariantProps } from "class-variance-authority";

/**
 * Card surfaces. Border-first; the hover lift is reserved for cards that
 * navigate somewhere. Radius 12px (large image blocks use rounded-xl = 16px).
 */
export const cardVariants = cva("relative overflow-hidden rounded-lg", {
  variants: {
    variant: {
      /** Standard white card */
      plain: "border border-line bg-paper",
      /** Clickable card: -2px lift, stronger border, whisper shadow */
      interactive:
        "group border border-line bg-paper transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-hover has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-mountain has-[a:focus-visible]:ring-offset-2",
      /** Quiet inset panel (spec tables, summaries) */
      muted: "bg-stone",
      /** Demand card (Wanted) */
      notice: "border border-gold/40 bg-paper",
      /** Photo card with overlay text */
      media: "group isolate bg-deep text-white",
    },
  },
  defaultVariants: { variant: "plain" },
});

export type CardVariant = VariantProps<typeof cardVariants>["variant"];
