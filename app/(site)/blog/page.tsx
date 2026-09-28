import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/data/blog";
import { ContentPage } from "@/components/common/content-page";
import { Photo } from "@/components/media/photo";

export const metadata: Metadata = { title: "Blog — guides for buying and selling in GB", alternates: { canonical: "/blog" } };

const dateFmt = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" });

export default function BlogPage() {
  const [first, ...rest] = posts;
  return (
    <ContentPage crumbs={[{ label: "Blog" }]} title="Guides & stories" intro="Practical tips for buying and selling in Gilgit-Baltistan, from our team." wide>
      <Link href={`/blog/${first.slug}`} className="group grid grid-cols-1 overflow-hidden rounded-2xl border border-line md:grid-cols-2">
        <div className="relative aspect-[16/10] overflow-hidden bg-stone md:aspect-auto md:min-h-[320px]">
          <Photo media={first.cover} sizes="(min-width: 768px) 50vw, 100vw" priority className="transition-transform duration-700 group-hover:scale-[1.04]" fallback={null} />
        </div>
        <div className="flex flex-col justify-center p-6 md:p-10">
          <p className="text-[12.5px] font-semibold text-gold-ink">
            {first.category} · {first.readMins} min read
          </p>
          <h2 className="mt-2 text-[24px] font-bold leading-tight tracking-[-0.02em] text-ink group-hover:text-mountain md:text-[30px]">{first.title}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{first.excerpt}</p>
          <p className="mt-4 text-[13px] text-muted">{dateFmt.format(new Date(first.date))}</p>
        </div>
      </Link>

      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-stone">
                <Photo media={p.cover} sizes="(min-width: 1024px) 33vw, 50vw" className="transition-transform duration-700 group-hover:scale-[1.04]" fallback={null} />
              </div>
              <p className="mt-4 text-[12.5px] font-semibold text-gold-ink">
                {p.category} · {p.readMins} min read
              </p>
              <h2 className="mt-1 text-[18px] font-semibold leading-snug text-ink group-hover:text-mountain">{p.title}</h2>
              <p className="mt-1.5 text-[14px] text-muted">{p.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </ContentPage>
  );
}
