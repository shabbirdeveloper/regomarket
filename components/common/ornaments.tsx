import { cn } from "@/lib/utils";

/** Gold twin-peak mark used before section headings */
export function MountainMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 26" className={cn("h-[22px] w-12 text-gold", className)} fill="none" aria-hidden>
      <path d="M1.5 24.5 16 5.5l7.5 9.5L32 3l22.5 21.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <path d="m11 12 5-6.5 4 5.3M27.5 9.4 32 3l5.8 5.6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" opacity=".55" />
      <path d="M8 24.5c6-3 12-4.5 19-3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
    </svg>
  );
}

/** Long, very light ridge line for card and section footers */
export function RidgeLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 60" preserveAspectRatio="none" className={cn("w-full", className)} fill="none" aria-hidden>
      <path
        d="M0 58 40 38l22 10 38-30 26 16 30-22 44 34 24-12 40 22 30-26 36 20 28-12 42 22"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M0 60 30 48l30 8 44-22 30 12 40-16 36 20 34-8 36 14 40-18 30 12 50-8"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
        opacity=".5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Divider with a small centred diamond — used sparingly on dark sections */
export function GoldRule({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-gold/70", className)} aria-hidden>
      <span className="h-px flex-1 bg-current opacity-50" />
      <span className="size-1.5 rotate-45 bg-current" />
      <span className="h-px flex-1 bg-current opacity-50" />
    </div>
  );
}
