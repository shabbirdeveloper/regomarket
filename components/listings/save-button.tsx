"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { usePersistentSet } from "@/hooks/use-persistent-set";
import { cn } from "@/lib/utils";

/** Floating favourite button (top-right of photos). */
export function SaveButton({ id, title, className }: { id: string; title: string; className?: string }) {
  const { has, toggle } = usePersistentSet("saved");
  const [pop, setPop] = useState(false);
  const saved = has(id);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!saved) setPop(true);
        toggle(id);
      }}
      onAnimationEnd={() => setPop(false)}
      className={cn(
        "grid size-9 place-items-center rounded-full bg-paper/95 text-ink/70 shadow-[0_1px_3px_rgb(0_0_0/0.15)] transition-colors hover:text-urgent",
        saved && "text-urgent",
        className,
      )}
    >
      <Heart className={cn("size-[18px]", saved && "fill-current", pop && "animate-heart-pop")} strokeWidth={1.9} aria-hidden />
    </button>
  );
}
