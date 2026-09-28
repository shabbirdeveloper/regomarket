import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminShops } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/ui/primitives";
import { ShopsModule } from "@/components/admin/shops/shops-module";

export const metadata: Metadata = { title: "Shops" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminShopsPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const rows = await getAdminShops();
  return (
    <div className="space-y-6">
      <PageHeader title="Shops" description="Approve new shops, manage badges, orders and suspensions." />
      <ShopsModule initial={rows} query={{ q: one(sp.q), tab: one(sp.tab) }} />
    </div>
  );
}
