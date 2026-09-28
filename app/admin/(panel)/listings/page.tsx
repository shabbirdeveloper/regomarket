import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminListings } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/ui/primitives";
import { ListingsModule } from "@/components/admin/listings/listings-module";

export const metadata: Metadata = { title: "Ads" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminListingsPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const rows = await getAdminListings();
  return (
    <div className="space-y-6">
      <PageHeader title="Ads" description="Every ad on REGOMARKET. New ads wait here until someone approves them." />
      <ListingsModule
        initial={rows}
        query={{ q: one(sp.q), tab: one(sp.tab), open: one(sp.open), category: one(sp.category), district: one(sp.district) }}
      />
    </div>
  );
}
