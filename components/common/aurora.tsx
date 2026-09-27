type AuroraTone = "mint-gold" | "gold" | "sky" | "mint";

/**
 * Retired: the "real bazaar" direction dropped decorative background glows.
 * Kept as a no-op so existing imports compile; safe to delete call sites.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Aurora(_props: { tone?: AuroraTone; className?: string }) {
  return null;
}
