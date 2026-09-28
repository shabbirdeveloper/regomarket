import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminVerifications } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/ui/primitives";
import { VerificationsModule } from "@/components/admin/verifications/verifications-module";

export const metadata: Metadata = { title: "Verifications" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminVerificationsPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const rows = await getAdminVerifications();
  return (
    <div className="space-y-6">
      <PageHeader title="Verifications" description="Check CNIC and business documents. Approved users get a verified badge." />
      <VerificationsModule initial={rows} query={{ q: one(sp.q), tab: one(sp.tab) }} />
    </div>
  );
}
