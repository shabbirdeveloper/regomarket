import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminBazaars } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/ui/primitives";
import { BazaarsModule } from "@/components/admin/bazaars/bazaars-module";

export const metadata: Metadata = { title: "Bazaars" };

export default async function AdminBazaarsPage() {
  await requireAdmin();
  const rows = await getAdminBazaars();
  return (
    <div className="space-y-6">
      <PageHeader title="Bazaars" description="Local markets shown on the Local Bazaar page. Shops pick their bazaar when they sign up." />
      <BazaarsModule initial={rows} />
    </div>
  );
}
