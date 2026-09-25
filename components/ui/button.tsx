import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button system — one shape, clear hierarchy.
 *   primary   Mountain Green, the main action on a surface (one per area)
 *   secondary Warm white with green keyline — second choice
 *   premium   Deep forest with a fine gold keyline — brand moments (Create Shop, Order)
 *   ghost     Text-weight actions
 *   light / outline-light  on dark green or photo backgrounds
 *   danger    Muted red — destructive only
 * Heights: sm 36 · md 44 · lg 52.  Radius: 10px.
 * Use `buttonVariants()` on <Link> for navigational CTAs.
 */
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-[background-color,border-color,color,box-shadow] duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-mountain text-white hover:bg-mountain-hover",
        secondary: "border border-mountain/35 bg-paper text-ink hover:border-mountain hover:bg-mint",
        premium: "bg-forest text-white ring-1 ring-inset ring-gold/70 hover:bg-deep hover:ring-gold",
        ghost: "text-mountain hover:bg-mint",
        light: "bg-paper text-forest hover:bg-white",
        "outline-light": "border border-white/35 text-white hover:border-white hover:bg-white/10",
        danger: "bg-urgent text-white hover:bg-[#7f3026]",
        whatsapp: "bg-[#1f7a52] text-white hover:bg-[#186643]",
        /* Back-compat aliases */
        brand: "bg-forest text-white ring-1 ring-inset ring-gold/70 hover:bg-deep hover:ring-gold",
        gold: "border border-mountain/35 bg-paper text-ink hover:border-mountain hover:bg-mint",
        outline: "border border-line bg-paper text-ink hover:border-line-strong",
      },
      size: {
        sm: "h-9 rounded-sm px-3.5 text-[13px] [&_svg]:size-4",
        md: "h-11 px-5 text-[14px] [&_svg]:size-[18px]",
        lg: "h-[52px] px-6 text-[15px] [&_svg]:size-5",
        icon: "size-11 [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
