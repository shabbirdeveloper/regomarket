import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminPosts } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/ui/primitives";
import { BlogModule } from "@/components/admin/blog/blog-module";

export const metadata: Metadata = { title: "Blog" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminBlogPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const rows = await getAdminPosts();
  return (
    <div className="space-y-6">
      <PageHeader title="Blog" description="Guides, safety tips and local news. Helpful posts bring buyers from Google." />
      <BlogModule initial={rows} startNew={sp.new === "1"} />
    </div>
  );
}
