import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MountainMark } from "./ornaments";

/** Simple, friendly empty state — plain language, one clear action */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center rounded-xl border border-dashed border-line-strong bg-paper px-6 py-12 text-center", className)}>
      <MountainMark className="mb-4 h-5 w-10" />
      <p className="font-serif text-xl font-semibold text-ink">{title}</p>
      {description && <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Skeleton primitives for slow connections */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} aria-hidden />;
}

export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-paper" aria-hidden>
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-2.5 p-3.5">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-2/5" />
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-6" role="status" aria-label="Loading listings">
      {Array.from({ length: count }, (_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
