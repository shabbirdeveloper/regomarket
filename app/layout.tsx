import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { site } from "@/lib/site";
import { organizationLd } from "@/lib/seo";
import { JsonLd } from "@/components/common/json-ld";
import { SiteShell } from "@/components/layout/site-shell";
import "./globals.css";

// Google Fonts, self-hosted at build time by next/font (no layout shift, no third-party request).
// Poppins everywhere: headings, body, navigation, buttons and product text.
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-text",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: "%s | REGO.pk" },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "Gilgit-Baltistan marketplace",
    "buy and sell Gilgit",
    "Skardu",
    "Hunza",
    "dry fruits",
    "dried apricot",
    "walnut",
    "livestock",
    "property GB",
    "REGO.pk",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: site.url,
    title: site.title,
    description: site.description,
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#064E3B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-PK" className={`${poppins.variable}`}>
      <body>
        <JsonLd data={organizationLd()} />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
