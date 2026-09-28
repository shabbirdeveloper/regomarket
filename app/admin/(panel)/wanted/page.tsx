import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminWanted } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/ui/primitives";
import { WantedModule } from "@/components/admin/wanted/wanted-module";

export const metadata: Metadata = { title: "Wanted" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminWantedPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const rows = await getAdminWanted();
  return (
    <div className="space-y-6">
      <PageHeader title="Wanted" description="Buyer requests. Close old ones and remove spam." />
      <WantedModule initial={rows} query={{ q: one(sp.q), tab: one(sp.tab) }} />
    </div>
  );
}
