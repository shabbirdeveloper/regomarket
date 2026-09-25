import { BadgeCheck, Building2, IdCard, Phone, ShieldCheck } from "lucide-react";
import type { VerificationLevel } from "@/types";
import { cn } from "@/lib/utils";

const META: Record<VerificationLevel, { label: string; short: string; Icon: typeof BadgeCheck }> = {
  rego: { label: "REGO Verified", short: "REGO Verified", Icon: ShieldCheck },
  business: { label: "Business Verified", short: "Verified Business", Icon: Building2 },
  identity: { label: "Identity Verified", short: "ID Verified", Icon: IdCard },
  phone: { label: "Phone Verified", short: "Phone Verified", Icon: Phone },
};

const RANK: VerificationLevel[] = ["rego", "business", "identity", "phone"];

/** Highest verification a seller holds, or null */
export function topVerification(levels: VerificationLevel[]): VerificationLevel | null {
  return RANK.find((l) => levels.includes(l)) ?? null;
}

interface Props {
  level: VerificationLevel;
  /** inline: icon + text, no chip. chip: subtle mint chip. icon: icon only with accessible label */
  variant?: "inline" | "chip" | "icon";
  className?: string;
}

/**
 * Verification badges are green (never social-media blue). Documents are never
 * shown publicly — only the status.
 */
export function VerificationBadge({ level, variant = "inline", className }: Props) {
  const { label, Icon } = META[level];
  const isRego = level === "rego";

  if (variant === "icon") {
    return (
      <span className={cn("inline-flex text-success", isRego && "text-gold", className)} title={label}>
        <BadgeCheck className="size-4" aria-hidden />
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  if (variant === "chip") {
    return (
      <span
        className={cn(
          "inline-flex h-6 items-center gap-1 rounded-[6px] px-2 text-[11.5px] font-semibold",
          isRego ? "bg-gold-wash text-gold-ink ring-1 ring-inset ring-gold/35" : "bg-mint text-mountain",
          className,
        )}
      >
        <Icon className="size-3.5" aria-hidden />
        {label}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1 text-[12px] font-semibold text-success", className)}>
      <BadgeCheck className="size-[15px]" aria-hidden />
      {META[level].short}
    </span>
  );
}
