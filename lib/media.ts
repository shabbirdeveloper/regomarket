import type { Media } from "@/types";
import publicFiles from "./public-files.json";

const available = new Set<string>(publicFiles);

/**
 * Local photos (/images/...) are only used once the file has been added to
 * /public (see scripts/list-public.mjs, which runs before dev and build).
 * Remote URLs (Cloudinary / Supabase Storage) pass through as-is.
 * Missing files resolve to `src: null` so the UI shows a designed placeholder
 * rather than a broken image.
 */
export function resolveMedia(media: Media): Media {
  if (!media.src) return media;
  if (/^https?:\/\//.test(media.src)) return media;
  return available.has(media.src) ? media : { ...media, src: null };
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
