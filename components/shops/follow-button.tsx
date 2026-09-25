"use client";

import { Check, Plus } from "lucide-react";
import { usePersistentSet } from "@/hooks/use-persistent-set";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FollowButton({ shopId, shopName, className }: { shopId: string; shopName: string; className?: string }) {
  const { has, toggle } = usePersistentSet("following");
  const on = has(shopId);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Unfollow ${shopName}` : `Follow ${shopName}`}
      onClick={() => toggle(shopId)}
      className={cn(buttonVariants({ variant: "secondary", size: "sm" }), on && "border-mountain bg-mint text-mountain", className)}
    >
      {on ? <Check aria-hidden strokeWidth={2.4} /> : <Plus aria-hidden strokeWidth={2.4} />}
      {on ? "Following" : "Follow"}
    </button>
  );
}
