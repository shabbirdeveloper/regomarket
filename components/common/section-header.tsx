import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { MountainMark } from "./ornaments";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  /** @deprecated use description */
  subtitle?: ReactNode;
  eyebrow?: string;
  action?: { label: string; href: string };
  /** Small gold mountain mark above the eyebrow */
  mark?: boolean;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
}

/**
 * Editorial section heading: gold-rule eyebrow, Poppins title, one-line lead,
 * and a quiet "View all" link on the right (desktop).
 */
export function SectionHeader({
  id,
  title,
  description,
  subtitle,
  eyebrow,
  action,
  mark = false,
  tone = "light",
  align = "left",
  className,
  children,
}: SectionHeaderProps) {
  const dark = tone === "dark";
  const lead = description ?? subtitle;
  const center = align === "center";
  return (
    <div
      data-reveal=""
      className={cn(
        "flex flex-col gap-3",
        center ? "items-center text-center" : "md:flex-row md:items-end md:justify-between md:gap-6",
        className,
      )}
    >
      <div className={cn("min-w-0", center ? "max-w-2xl" : "max-w-3xl")}>
        {mark && <MountainMark className={cn("mb-4 h-4 w-9", center && "mx-auto")} />}
        {/* Eyebrows were dropped: real marketplaces lead with the title. Kept in
            the API (screen-reader context only) so callers don't break. */}
        {eyebrow && <span className="sr-only">{eyebrow}: </span>}
        <h2 id={id} className={cn("heading-section", dark ? "text-white" : "text-ink")}>
          {title}
        </h2>
        {lead && (
          <p className={cn("mt-1.5 text-[14.5px] leading-relaxed", dark ? "text-white/70" : "text-muted", center && "mx-auto")}>{lead}</p>
        )}
      </div>
      {(children || action) && (
        <div className="flex min-w-0 shrink-0 items-center gap-4">
          {children}
          {action && (
            <Link
              href={action.href}
              className={cn(
                "group hidden shrink-0 items-center gap-1.5 text-[14px] font-semibold md:inline-flex",
                dark ? "text-gold-soft hover:text-white" : "text-mountain hover:text-forest",
              )}
            >
              <span className="link-draw pb-0.5">{action.label}</span>
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

/** Mobile-only full-width "View all" button placed below a section's content */
export function MobileViewAll({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="press mt-8 flex h-11 items-center justify-center gap-1.5 rounded-md border border-mountain/35 bg-paper text-[14px] font-semibold text-ink md:hidden"
    >
      {label}
      <ArrowRight className="size-4" aria-hidden />
    </Link>
  );
}
