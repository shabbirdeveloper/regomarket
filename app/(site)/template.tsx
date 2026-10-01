import type { ReactNode } from "react";

/**
 * Re-mounts on every navigation, so each page fades in. Opacity only:
 * a transform here would break the fixed buy and checkout bars inside pages.
 */
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
