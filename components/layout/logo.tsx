import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The "O" of REGOMARKET: a gold ring framing a snow-capped Karakoram peak.
 * Sized in `em` so it always matches the wordmark's cap height.
 */
function MountainO({ dark }: { dark?: boolean }) {
  const id = dark ? "rego-o-d" : "rego-o";
  return (
    <svg viewBox="0 0 40 40" aria-hidden className="mx-[0.02em] inline-block h-[0.72em] w-[0.72em] align-[-0.01em]">
      <circle cx="20" cy="20" r="17" fill="none" stroke="#C79A42" strokeWidth="5" />
      <clipPath id={id}>
        <circle cx="20" cy="20" r="14.5" />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <path d="M2 34 13.5 17l5 6 6.5-11L38 34Z" fill={dark ? "#E3C27E" : "#064E3B"} />
        <path d="m22.4 16.3 2.6-4.3 3.2 5.4-2.1-.9-1.6 1.6-1-1.8Z" fill="#FFFDF8" />
      </g>
    </svg>
  );
}

/** Compact square mark (favicon, avatars, app icon) */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-10", className)} aria-hidden>
      <rect width="40" height="40" rx="9" fill="#064E3B" />
      <circle cx="20" cy="20" r="12.5" fill="none" stroke="#C79A42" strokeWidth="3" />
      <path d="M10.5 28 17 19l3 3.5 4-6.5 5.5 12Z" fill="#E3C27E" />
    </svg>
  );
}

export function Logo({
  tone = "light",
  showTagline = true,
  className,
}: {
  tone?: "light" | "dark";
  showTagline?: boolean;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <Link href="/" className={cn("flex shrink-0 flex-col leading-none", className)} aria-label="REGOMARKET — home">
      <span
        className={cn(
          "whitespace-nowrap font-serif text-[21px] font-bold tracking-[-0.02em] sm:text-[23px] lg:text-[25px]",
          dark ? "text-white" : "text-mountain",
        )}
      >
        REG
        <MountainO dark={dark} />
        <span className={dark ? "text-gold-soft" : "text-gold"}>MARKET</span>
      </span>
      {showTagline && (
        <span
          className={cn(
            "mt-1 hidden text-[10.5px] font-medium uppercase tracking-[0.14em] sm:block",
            dark ? "text-white/60" : "text-muted",
          )}
        >
          Gilgit-Baltistan Marketplace
        </span>
      )}
    </Link>
  );
}
