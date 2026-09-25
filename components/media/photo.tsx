import Image from "next/image";
import type { ReactNode } from "react";
import type { Media } from "@/types";
import { cn } from "@/lib/utils";

interface PhotoProps {
  media: Media;
  /** Responsive sizes hint — always pass for correct srcset selection */
  sizes: string;
  /** Above-the-fold only (hero). Everything else lazy-loads. */
  priority?: boolean;
  className?: string;
  /** Rendered when no photo has been supplied yet */
  fallback: ReactNode;
}

/**
 * Fills its (relative, sized) parent. Uses next/image → AVIF/WebP, responsive
 * srcset and native lazy-loading. Falls back to a designed placeholder when a
 * photo has not been uploaded yet.
 */
export function Photo({ media, sizes, priority, className, fallback }: PhotoProps) {
  if (!media.src) return <>{fallback}</>;
  return (
    <Image
      src={media.src}
      alt={media.alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={72}
      className={cn("object-cover", className)}
    />
  );
}
