// Server-only: uses the filesystem to check whether a declared photo exists.
import { existsSync } from "node:fs";
import path from "node:path";
import type { Media } from "@/types";

const cache = new Map<string, boolean>();

/**
 * Local photos (/images/...) are only used once the file has been added to
 * /public. Remote URLs (Cloudinary / Supabase Storage) pass through as-is.
 * Missing files resolve to `src: null` so the UI shows a designed placeholder
 * rather than a broken image.
 */
export function resolveMedia(media: Media): Media {
  if (!media.src) return media;
  if (/^https?:\/\//.test(media.src)) return media;
  let exists = cache.get(media.src);
  if (exists === undefined) {
    exists = existsSync(path.join(process.cwd(), "public", media.src));
    cache.set(media.src, exists);
  }
  return exists ? media : { ...media, src: null };
}

/**
 * Cloudinary-ready: build a transformed delivery URL from a public ID.
 * Use with next/image once NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set.
 */
export function cloudinaryUrl(publicId: string, opts: { w?: number; q?: string } = {}) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) return null;
  const t = ["f_auto", `q_${opts.q ?? "auto"}`, opts.w ? `w_${opts.w}` : null, "c_limit"].filter(Boolean).join(",");
  return `https://res.cloudinary.com/${cloud}/image/upload/${t}/${publicId}`;
}
