import type { ReactNode } from "react";
import { SiteShell } from "@/components/layout/site-shell";

// Static pages (e.g. /bazaar, /about, /categories) re-read the database every 5 minutes
// instead of keeping the data from build time forever. Pages with their own value keep it.
export const revalidate = 300;

/** Public marketplace pages: announcement bar, header, footer and mobile tab bar. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
