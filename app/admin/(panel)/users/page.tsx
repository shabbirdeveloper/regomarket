import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminUsers } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/ui/primitives";
import { UsersModule } from "@/components/admin/users/users-module";

export const metadata: Metadata = { title: "Users" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminUsersPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const rows = await getAdminUsers();
  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Everyone with an account: buyers, sellers and shop owners." />
      <UsersModule initial={rows} query={{ q: one(sp.q), tab: one(sp.tab) }} />
    </div>
  );
}
