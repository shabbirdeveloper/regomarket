import type { ReactNode } from "react";
import { Breadcrumb } from "./breadcrumb";
import { cn } from "@/lib/utils";

/** Simple, readable layout for help and company pages. */
export function ContentPage({
  crumbs,
  eyebrow,
  title,
  intro,
  updated,
  children,
  wide,
}: {
  crumbs: { label: string; href?: string }[];
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  updated?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="bg-white">
      <div className={cn("shell pb-16 pt-4 md:pt-6", !wide && "max-w-4xl")}>
        <Breadcrumb items={crumbs} />
        <header className="mt-5 border-b border-line pb-8">
          {eyebrow && <p className="text-[13px] font-semibold text-gold-ink">{eyebrow}</p>}
          <h1 className="mt-1 text-[30px] font-bold leading-tight tracking-[-0.02em] text-ink md:text-[40px]">{title}</h1>
          {intro && <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">{intro}</p>}
          {updated && <p className="mt-3 text-[12.5px] text-muted">Last updated: {updated}</p>}
        </header>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

/** Long-form text styling without a typography plugin. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-3xl text-[15.5px] leading-[1.75] text-ink/80",
        "[&_h2]:mt-10 [&_h2]:scroll-mt-28 [&_h2]:text-[20px] [&_h2]:font-semibold [&_h2]:tracking-[-0.01em] [&_h2]:text-ink first:[&_h2]:mt-0",
        "[&_h3]:mt-6 [&_h3]:text-[16.5px] [&_h3]:font-semibold [&_h3]:text-ink",
        "[&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5",
        "[&_a]:font-medium [&_a]:text-mountain [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-semibold [&_strong]:text-ink",
        className,
      )}
    >
      {children}
    </div>
  );
}
