import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminOrders } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/ui/primitives";
import { OrdersModule } from "@/components/admin/orders/orders-module";

export const metadata: Metadata = { title: "Orders" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminOrdersPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const rows = await getAdminOrders();
  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Orders placed with verified shops. Help when a buyer or shop needs it." />
      <OrdersModule initial={rows} query={{ q: one(sp.q), tab: one(sp.tab) }} />
    </div>
  );
}
