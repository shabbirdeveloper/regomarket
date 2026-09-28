import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminReviews } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/ui/primitives";
import { ReviewsModule } from "@/components/admin/reviews/reviews-module";

export const metadata: Metadata = { title: "Reviews" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminReviewsPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const rows = await getAdminReviews();
  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" description="Shop reviews. Hide abuse, links and fake reviews." />
      <ReviewsModule initial={rows} query={{ q: one(sp.q), tab: one(sp.tab) }} />
    </div>
  );
}
