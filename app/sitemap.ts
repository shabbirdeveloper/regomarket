import type { MetadataRoute } from "next";
import { site, routes } from "@/lib/site";
import { getCategories, getDistricts, getListings, getShops, getBazaars } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, districts, listings, shops, bazaars] = await Promise.all([
    getCategories(),
    getDistricts(),
    getListings({ limit: 5000 }),
    getShops({ limit: 5000 }),
    getBazaars(),
  ]);
  const u = (p: string) => `${site.url}${p}`;
  const now = new Date();
  return [
    { url: u("/"), lastModified: now, changeFrequency: "hourly", priority: 1 },
    ...categories.map((c) => ({ url: u(routes.search({ category: c.slug })), changeFrequency: "hourly" as const, priority: 0.8 })),
    ...districts.map((d) => ({ url: u(routes.search({ district: d.slug })), changeFrequency: "hourly" as const, priority: 0.8 })),
    ...bazaars.map((b) => ({ url: u(routes.bazaar(b.slug)), changeFrequency: "daily" as const, priority: 0.7 })),
    ...shops.map((s) => ({ url: u(routes.shop(s.slug)), changeFrequency: "daily" as const, priority: 0.7 })),
    ...listings.map((l) => ({ url: u(routes.listing(l.slug)), lastModified: new Date(l.postedAt), priority: 0.6 })),
  ];
}
