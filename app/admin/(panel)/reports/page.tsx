import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminReports } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/ui/primitives";
import { ReportsModule } from "@/components/admin/reports/reports-module";

export const metadata: Metadata = { title: "Reports" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminReportsPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const rows = await getAdminReports();
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Complaints from buyers and sellers. Scam reports first." />
      <ReportsModule initial={rows} query={{ q: one(sp.q), tab: one(sp.tab) }} />
    </div>
  );
}
