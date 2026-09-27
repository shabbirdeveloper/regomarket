import type { Metadata } from "next";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { WantedForm } from "@/components/wanted/wanted-form";

export const metadata: Metadata = {
  title: "Post a Wanted request",
  description: "Tell sellers in Gilgit-Baltistan what you need and get offers.",
  robots: { index: false },
};

export default async function NewWantedPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <div className="min-h-[70vh] bg-cream">
      <div className="shell pb-16 pt-4 md:pt-6">
        <Breadcrumb items={[{ label: "Wanted", href: "/wanted" }, { label: "Post a request" }]} />
        <h1 className="mt-4 text-[26px] font-bold tracking-[-0.02em] text-ink md:text-[32px]">Post a Wanted request</h1>
        <p className="mt-1 text-[14.5px] text-muted">Tell sellers across GB what you need. It takes a minute.</p>
        <div className="mt-6">
          <WantedForm initialTitle={q?.slice(0, 70) ?? ""} />
        </div>
      </div>
    </div>
  );
}
