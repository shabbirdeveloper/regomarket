import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------- Page header ---------- */

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-gold-ink">{eyebrow}</p>}
        <h1 className="text-[24px] font-bold tracking-[-0.02em] text-ink md:text-[28px]">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-[14px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/* ---------- Surfaces ---------- */

export function Panel({ title, action, children, className, bodyClassName }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-white", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          {typeof title === "string" ? <h2 className="text-[15px] font-semibold text-ink">{title}</h2> : title}
          {action}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/* ---------- Buttons ---------- */

const BTN = {
  primary: "bg-mountain text-white hover:bg-mountain-hover",
  dark: "bg-forest text-white hover:bg-deep",
  secondary: "border border-line-strong bg-white text-ink hover:border-ink/40",
  ghost: "text-ink/80 hover:bg-stone hover:text-ink",
  danger: "bg-urgent text-white hover:bg-[#7f3026]",
  "danger-soft": "border border-[#efcfc7] bg-white text-urgent hover:bg-urgent-wash",
  success: "bg-success text-white hover:bg-[#0f5c3f]",
} as const;

export type BtnTone = keyof typeof BTN;

export function Btn({
  tone = "secondary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: BtnTone; size?: "sm" | "md" }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
        size === "sm" ? "h-8 px-3 text-[12.5px] [&_svg]:size-3.5" : "h-10 px-4 text-[13.5px] [&_svg]:size-4",
        BTN[tone],
        className,
      )}
      {...props}
    />
  );
}

export const btnCls = (tone: BtnTone = "secondary", size: "sm" | "md" = "md") =>
  cn(
    "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition-colors [&_svg]:shrink-0",
    size === "sm" ? "h-8 px-3 text-[12.5px] [&_svg]:size-3.5" : "h-10 px-4 text-[13.5px] [&_svg]:size-4",
    BTN[tone],
  );

/* ---------- People & pictures ---------- */

const AVATAR_TINTS = ["bg-mint text-mountain", "bg-gold-wash text-gold-ink", "bg-[#eaf1fb] text-[#1d4e89]", "bg-stone text-ink/80", "bg-[#f3e8f4] text-[#6b2c73]"];

export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const initials = name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const tint = AVATAR_TINTS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % AVATAR_TINTS.length];
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className={cn("grid shrink-0 place-items-center rounded-full font-semibold", tint, className)}
    >
      {initials || "?"}
    </span>
  );
}

/** Plain <img> for admin thumbnails (already small from the CDN) */
export function Thumb({ src, alt = "", size = 48, className, fallback }: { src: string | null; alt?: string; size?: number; className?: string; fallback?: ReactNode }) {
  return (
    <span style={{ width: size, height: size }} className={cn("relative block shrink-0 overflow-hidden rounded-lg bg-stone", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" decoding="async" className="size-full object-cover" />
      ) : (
        <span className="grid size-full place-items-center text-[12px] font-semibold text-muted">{fallback}</span>
      )}
    </span>
  );
}

/* ---------- Empty ---------- */

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icon && <span className="grid size-12 place-items-center rounded-full bg-mint text-mountain [&_svg]:size-6">{icon}</span>}
      <p className="mt-3 text-[15px] font-semibold text-ink">{title}</p>
      {body && <p className="mt-1 max-w-sm text-[13.5px] text-muted">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------- Key / value list ---------- */

export function Facts({ items, className }: { items: [string, ReactNode][]; className?: string }) {
  return (
    <dl className={cn("divide-y divide-line rounded-xl border border-line", className)}>
      {items.map(([k, v]) => (
        <div key={k} className="flex items-start justify-between gap-4 px-4 py-2.5 text-[13.5px]">
          <dt className="shrink-0 text-muted">{k}</dt>
          <dd className="min-w-0 text-right font-medium text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- Switch ---------- */

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-mountain" : "bg-line-strong",
      )}
    >
      <span className={cn("inline-block size-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[22px]" : "translate-x-0.5")} />
    </button>
  );
}

/* ---------- Small helpers ---------- */

export function Muted({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("text-[12.5px] text-muted", className)}>{children}</span>;
}

export function Tag({ children, tone = "quiet" }: { children: ReactNode; tone?: "quiet" | "gold" | "green" | "red" }) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-md px-2 text-[11.5px] font-semibold [&_svg]:size-3.5",
        tone === "quiet" && "bg-stone text-ink/75",
        tone === "gold" && "bg-gold-wash text-gold-ink",
        tone === "green" && "bg-mint text-success",
        tone === "red" && "bg-urgent-wash text-urgent",
      )}
    >
      {children}
    </span>
  );
}
