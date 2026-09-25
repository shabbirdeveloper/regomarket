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
 * Editorial section heading: optional eyebrow, Poppins title, one-line lead,
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
      className={cn(
        "flex flex-col gap-5",
        center ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("min-w-0", center ? "max-w-2xl" : "max-w-3xl")}>
        {mark && <MountainMark className={cn("mb-4 h-4 w-9", center && "mx-auto")} />}
        {eyebrow && <p className={cn("eyebrow mb-3", dark ? "text-gold-soft" : "text-gold-ink")}>{eyebrow}</p>}
        <h2 id={id} className={cn("heading-section", dark ? "text-white" : "text-ink")}>
          {title}
        </h2>
        {lead && (
          <p className={cn("lead mt-3", dark && "text-white/75", center && "mx-auto")}>{lead}</p>
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
              {action.label}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
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
      className="mt-8 flex h-11 items-center justify-center gap-1.5 rounded-md border border-mountain/35 bg-paper text-[14px] font-semibold text-ink md:hidden"
    >
      {label}
      <ArrowRight className="size-4" aria-hidden />
    </Link>
  );
}
