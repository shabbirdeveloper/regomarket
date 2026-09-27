import Link from "next/link";
import { ChevronRight } from "lucide-react";

/** Home › … › Current. The last item is the current page. */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
        </li>
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-1">
            <ChevronRight className="size-3.5" aria-hidden />
            {i === items.length - 1 ? (
              <span aria-current="page" className="max-w-[40ch] truncate text-ink/80">
                {it.label}
              </span>
            ) : it.href ? (
              <Link href={it.href} className="hover:text-ink">
                {it.label}
              </Link>
            ) : (
              <span>{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
