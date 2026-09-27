import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { posts } from "@/data/blog";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { Prose } from "@/components/common/content-page";
import { Photo } from "@/components/media/photo";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  if (!p) return { title: "Post not found" };
  return { title: p.title, description: p.excerpt, alternates: { canonical: `/blog/${p.slug}` }, openGraph: p.cover.src ? { images: [{ url: p.cover.src }] } : undefined };
}

const dateFmt = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric" });

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((x) => x.slug === slug);
  if (!post) notFound();
  const more = posts.filter((p) => p.slug !== post.slug);

  return (
    <article className="bg-white">
      <div className="shell max-w-3xl pb-16 pt-4 md:pt-6">
        <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />
        <p className="mt-6 text-[13px] font-semibold text-gold-ink">
          {post.category} · {post.readMins} min read
        </p>
        <h1 className="mt-2 text-[30px] font-bold leading-tight tracking-[-0.02em] text-ink md:text-[40px]">{post.title}</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-muted">{post.excerpt}</p>
        <p className="mt-4 text-[13px] text-muted">REGOMARKET team · {dateFmt.format(new Date(post.date))}</p>
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-stone">
          <Photo media={post.cover} sizes="(min-width: 768px) 768px, 100vw" priority fallback={null} />
        </div>

        <Prose className="mt-10">
          {post.body.map((b, i) => {
            if ("h2" in b) return <h2 key={i}>{b.h2}</h2>;
            if ("ul" in b)
              return (
                <ul key={i}>
                  {b.ul.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              );
            if ("tip" in b)
              return (
                <div key={i} className="mt-8 flex gap-3 rounded-2xl bg-mint p-5 text-[15px] text-ink/85">
                  <Lightbulb className="mt-1 size-5 shrink-0 text-mountain" aria-hidden />
                  <span>{b.tip}</span>
                </div>
              );
            return <p key={i}>{b.p}</p>;
          })}
        </Prose>

        {more.length > 0 && (
          <aside className="mt-14 border-t border-line pt-8">
            <h2 className="text-[18px] font-semibold text-ink">Read next</h2>
            <ul className="mt-4 space-y-3">
              {more.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="group flex items-center gap-4">
                    <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-stone">
                      <Photo media={p.cover} sizes="80px" fallback={null} />
                    </span>
                    <span>
                      <span className="block text-[15.5px] font-semibold text-ink group-hover:text-mountain">{p.title}</span>
                      <span className="block text-[13px] text-muted">{p.readMins} min read</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </article>
  );
}
