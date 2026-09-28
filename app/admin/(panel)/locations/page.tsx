import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminDistricts } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/ui/primitives";
import { LocationsModule } from "@/components/admin/locations/locations-module";

export const metadata: Metadata = { title: "Locations" };

export default async function AdminLocationsPage() {
  await requireAdmin();
  const rows = await getAdminDistricts();
  return (
    <div className="space-y-6">
      <PageHeader title="Locations" description="Districts, tehsils and towns of Gilgit-Baltistan used in every location picker." />
      <LocationsModule initial={rows} />
    </div>
  );
}
