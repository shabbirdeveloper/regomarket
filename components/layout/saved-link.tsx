"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { usePersistentSet } from "@/hooks/use-persistent-set";
import { cn } from "@/lib/utils";
import { headerCountCls, headerIconCls } from "./header-styles";

/** Header "Saved" icon with a live count of saved listings */
export function SavedLink({ className }: { className?: string }) {
  const { count } = usePersistentSet("saved");
  return (
    <Link href="/saved" data-tip="Saved" className={cn(headerIconCls, className)}>
      <Heart className="size-5" strokeWidth={1.75} aria-hidden />
      <span className="sr-only">Saved listings{count ? ` (${count})` : ""}</span>
      {count > 0 && (
        <span aria-hidden className={cn(headerCountCls, "bg-gold text-forest")}>
          {count}
        </span>
      )}
    </Link>
  );
}
