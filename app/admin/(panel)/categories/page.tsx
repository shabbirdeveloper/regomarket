import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminCategories } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/ui/primitives";
import { CategoriesModule } from "@/components/admin/categories/categories-module";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const rows = await getAdminCategories();
  return (
    <div className="space-y-6">
      <PageHeader title="Categories" description="Names, order and visibility of the main categories." />
      <CategoriesModule initial={rows} />
    </div>
  );
}
