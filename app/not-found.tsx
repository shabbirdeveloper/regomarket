import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LandscapeArt } from "@/components/media/landscape-art";

export default function NotFound() {
  return (
    <section className="shell grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
      <div>
        <p className="eyebrow text-gold-ink">Page not found</p>
        <h1 className="mt-3 font-serif text-[34px] font-semibold leading-tight md:text-[44px]">
          This path leads off the map.
        </h1>
        <p className="mt-3 max-w-md text-muted">
          The page may have moved, or this part of REGO.pk is still being built. Try searching, or head back home.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants({ variant: "primary" })}>
            Back to Home
          </Link>
          <Link href="/search" className={buttonVariants({ variant: "outline" })}>
            Search listings
          </Link>
        </div>
      </div>
      <div className="aspect-[4/3] overflow-hidden rounded-2xl">
        <LandscapeArt art={{ seed: 404, palette: "glacier", motif: "lake" }} />
      </div>
    </section>
  );
}
