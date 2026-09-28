import type { ReactNode } from "react";
import { SiteShell } from "@/components/layout/site-shell";

/** Public marketplace pages: announcement bar, header, footer and mobile tab bar. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
