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
        "glass-pill grid size-9 place-items-center rounded-full text-ink/75 transition-[color,transform] hover:scale-105 hover:text-urgent",
        saved && "text-urgent",
        className,
      )}
    >
      <Heart className={cn("size-[18px]", saved && "fill-current", pop && "animate-heart-pop")} strokeWidth={1.9} aria-hidden />
    </button>
  );
}
