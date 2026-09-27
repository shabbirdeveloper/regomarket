import type { Metadata } from "next";
import { ContentPage } from "@/components/common/content-page";
import { ReportForm } from "@/components/help/report-form";

export const metadata: Metadata = { title: "Report a problem", robots: { index: false } };

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ ad?: string }> }) {
  const { ad } = await searchParams;
  return (
    <ContentPage
      crumbs={[{ label: "Help", href: "/help" }, { label: "Report a problem" }]}
      title="Report a problem"
      intro="Seen a fake ad, a scam, or someone being abusive? Tell us. Reports are private: the other person never sees who reported them."
    >
      <ReportForm initialLink={ad ?? ""} />
    </ContentPage>
  );
}
