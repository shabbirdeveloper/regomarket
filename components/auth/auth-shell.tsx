import type { ReactNode } from "react";
import { BadgeCheck, MessageSquareText, Truck } from "lucide-react";
import { Photo } from "@/components/media/photo";
import { unsplash } from "@/data/media";

/** Split layout for sign-in pages: form on the left, a quiet brand panel on the right (desktop). */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white">
      <div className="shell grid min-h-[calc(100dvh-160px)] grid-cols-1 gap-10 py-10 md:py-14 lg:grid-cols-2 lg:items-center">
        <div className="flex justify-center lg:justify-start lg:pl-8">{children}</div>
        <aside className="relative isolate hidden h-full min-h-[520px] overflow-hidden rounded-3xl bg-forest text-white lg:block">
          <div className="absolute inset-0 -z-10 opacity-60">
            <Photo media={unsplash("photo-1583440772344-edd2e043742c", "", 1200, 1400)} sizes="50vw" fallback={null} />
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#021d16] via-[#021d16]/70 to-[#021d16]/20" />
          <div className="flex h-full flex-col justify-end p-10">
            <p className="text-[13px] font-medium text-gold-soft">Gilgit-Baltistan&apos;s marketplace</p>
            <h2 className="mt-2 max-w-md text-[32px] font-bold leading-tight tracking-[-0.02em]">Buy and sell with people you can trust.</h2>
            <ul className="mt-6 space-y-3 text-[14.5px] text-white/85">
              <li className="flex items-center gap-2.5">
                <BadgeCheck className="size-5 text-gold-soft" aria-hidden /> Phone-verified buyers and sellers
              </li>
              <li className="flex items-center gap-2.5">
                <MessageSquareText className="size-5 text-gold-soft" aria-hidden /> Chat and make offers safely
              </li>
              <li className="flex items-center gap-2.5">
                <Truck className="size-5 text-gold-soft" aria-hidden /> Order from verified shops across GB
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Only allow same-site paths as a post-login destination. */
export function safeNext(v?: string) {
  return v && v.startsWith("/") && !v.startsWith("//") ? v : "/dashboard";
}
