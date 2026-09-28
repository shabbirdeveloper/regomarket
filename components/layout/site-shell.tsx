import type { ReactNode } from "react";
import { AnnouncementBar } from "./announcement-bar";
import { Header } from "./header";
import { Footer } from "./footer";
import { MobileNav } from "./mobile-nav";
import { AuthProvider } from "@/components/auth/auth-provider";

/** Global chrome shared by every public page */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <a
        href="#main"
        className="sr-only z-[100] rounded-md bg-mountain px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <Header />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </AuthProvider>
  );
}
