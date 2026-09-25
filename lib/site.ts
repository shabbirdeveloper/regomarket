export const site = {
  name: "REGO.pk",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://rego.pk",
  tagline: "Buy & Sell in Gilgit-Baltistan",
  positioning: "Gilgit-Baltistan's Local Buy & Sell Marketplace",
  title: "REGO.pk | Buy & Sell in Gilgit-Baltistan",
  description:
    "Buy and sell dry fruits, livestock, property, vehicles, electronics, local products and more across Gilgit-Baltistan. Discover verified local shops and sellers on REGO.pk.",
  locale: "en_PK",
  social: {
    facebook: "https://facebook.com/rego.pk",
    instagram: "https://instagram.com/rego.pk",
    youtube: "https://youtube.com/@rego.pk",
  },
} as const;

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/search" },
  { label: "Shops", href: "/shops" },
  { label: "Local Bazaar", href: "/bazaar" },
  { label: "Wanted", href: "/wanted" },
  { label: "Sell", href: "/sell" },
];

export const footerNav = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse Listings", href: "/search" },
      { label: "Categories", href: "/categories" },
      { label: "Local Bazaar", href: "/bazaar" },
      { label: "Wanted", href: "/wanted" },
      { label: "Shops", href: "/shops" },
    ],
  },
  {
    title: "Sell",
    links: [
      { label: "Post Free Ad", href: "/sell" },
      { label: "Create Shop", href: "/create-shop" },
      { label: "Seller Dashboard", href: "/dashboard" },
      { label: "Business Verification", href: "/help/verification" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Safety Tips", href: "/help/safety" },
      { label: "Report Listing", href: "/help/report" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About REGO.pk", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

export const popularSearches = [
  "Dry Apricot",
  "Walnut",
  "Goat",
  "Land",
  "iPhone",
  "Honda 125",
  "House for Rent",
  "Camping Gear",
] as const;

/** Route builders — one place to change URL shapes. */
export const routes = {
  listing: (slug: string) => `/listing/${slug}`,
  shop: (slug: string) => `/shop/${slug}`,
  bazaar: (slug: string) => `/bazaar/${slug}`,
  wanted: (slug: string) => `/wanted/${slug}`,
  search: (params: Record<string, string | number | boolean | undefined> = {}) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") qs.set(k, String(v));
    const s = qs.toString();
    return s ? `/search?${s}` : "/search";
  },
};
