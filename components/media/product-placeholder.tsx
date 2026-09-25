import type { ReactNode } from "react";
import type { CategoryIconKey } from "@/types";
import { CategoryIcon } from "@/components/common/category-icon";
import { cn } from "@/lib/utils";

/**
 * Placeholder for listing photos that haven't been uploaded: warm category
 * tint, faint topographic contours and the category mark. Reads as a
 * deliberate, calm surface rather than a broken image.
 */
export function ProductPlaceholder({
  tint,
  icon,
  glyph,
  label,
  className,
}: {
  tint: string;
  icon?: CategoryIconKey;
  /** Custom glyph instead of a category icon */
  glyph?: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("absolute inset-0 grid place-items-center overflow-hidden", className)}
      style={{ backgroundColor: tint }}
    >
      <svg className="absolute inset-0 h-full w-full text-ink/[0.07]" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth="0.8">
          <path d="M-10 118c30-12 52-4 78-14s38-30 70-28 50 18 72 12" />
          <path d="M-10 132c34-10 58-2 86-12s44-26 72-24 44 16 62 12" />
          <path d="M-10 104c26-14 46-8 70-18s34-34 66-32 54 18 84 10" />
          <path d="M-10 90c22-16 40-12 62-22s30-36 62-36 58 16 96 8" />
          <path d="M-10 76c20-18 36-16 56-26s26-36 58-38 60 12 106 4" />
          <path d="M-10 62c18-18 32-20 50-30s24-34 54-38 62 8 116 0" />
        </g>
      </svg>
      <span className="relative grid size-16 place-items-center rounded-full bg-white/55 text-mountain/70 ring-1 ring-white/70">
        {glyph ?? <CategoryIcon icon={icon ?? "grid"} size={30} strokeWidth={1.25} />}
      </span>
    </div>
  );
}
