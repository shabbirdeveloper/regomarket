import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin | REGOMARKET" },
  robots: { index: false, follow: false, nocache: true },
};

/** Everything under /admin: never indexed, never cached, no public header/footer. */
export default function AdminRoot({ children }: { children: ReactNode }) {
  return children;
}
