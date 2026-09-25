# REGO.pk

Gilgit-Baltistan's local buy & sell marketplace. **Discover → Contact → Negotiate → Deal.**

Built with Next.js (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui conventions · Lucide icons.
Supabase- and Cloudinary-ready; deploys to Vercel as-is.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck
```

Requires Node 20.9+. Copy `.env.example` to `.env.local` when you're ready to wire Supabase / Cloudinary.

## Status

| Screen | Status |
|---|---|
| 01 Homepage (desktop) | ✅ Built — v3 "Classic Mountain Commerce" refinement |
| 02 Mobile homepage | ✅ Built (same route, mobile-specific layout + bottom nav) |
| 03 Search results · 04 Product details · 05 Shop · 06 Create shop · 07 Post listing · 08 Messages · 09 Dashboard · 10 Wanted · 11 Local Bazaar · 12 Seller profile · 13 Saved · 14 Notifications · 15 Settings | Next |

Links to screens that aren't built yet show the branded 404 page.

## Project structure

```
app/                 routes, layout, metadata, sitemap, robots, OG image
components/
  ui/                shadcn-style primitives (button, badge)
  layout/            Header, MainNav, MobileMenu, MobileNav, Footer, Logo, SiteShell
  home/              one component per homepage section
  listings/          ListingCard, LivestockCard, SaveButton, ListingBadge
  shops/             ShopCard, ShopLogo, FollowButton
  wanted/            WantedCard
  bazaar/            BazaarCard
  search/            SearchBar, LocationSelector
  common/            SectionHeader, VerificationBadge, CategoryIcon, EmptyState, Skeletons, JsonLd, ornaments
  media/             Photo (next/image wrapper), LandscapeArt, ProductPlaceholder
  forms/ dashboard/  (next screens)
data/                GB-specific mock data (districts → tehsils → towns, categories, listings, shops…)
lib/
  data/              async data-access layer — the only way pages read data (swap for Supabase here)
  services/          interfaces for future AI / voice / trust / deal features (not implemented, flagged off)
  format.ts          prices (Rs, lakh/crore), locations, relative time
  media.ts           local-photo resolution + Cloudinary URL helper
  seo.ts site.ts     JSON-LD, site config, nav, route builders
hooks/               usePersistentSet (saved listings, followed shops)
types/               domain model mirroring planned Supabase tables
```

## Design system — "Classic Mountain Commerce"

Tokens live in `app/globals.css` (`@theme`); component variants in `components/ui/`.

- **Colour** — Mountain Green `#064E3B` leads (brand + primary actions), Deep Forest `#04382C` for the footer and CTA band, Ink `#17211B`. Gold `#C79A42` is a small accent only (marks, featured, one highlighted phrase); `gold-ink #7E5C1C` for gold text on light. Surfaces: Cream `#FAF8F3` page, Warm White `#FFFDF8` cards, Oat `#F5EFE4` signature band. Border `#E7E2D8`, secondary text `#6B716C`, light green `#EEF5F1`.
- **Type** — Poppins site-wide: headings (`heading-display`, `heading-section`, `heading-card`), body, navigation, buttons, labels and product text. `eyebrow` for small uppercase labels, `lead` for section intros.
- **Buttons** (`components/ui/button.tsx`) — primary (green), secondary (warm white + green keyline), premium (forest + gold keyline), ghost, light / outline-light (on dark), danger (muted red). Heights 36 / 44 / 52, radius 10.
- **Cards** (`components/ui/card.tsx`) — `plain`, `interactive` (-2px lift, image scale 1.02), `muted`, `notice` (Wanted), `media` (photo cards). Border-first; no resting shadows.
- **Badges** (`components/ui/badge.tsx`) — verified, featured, wholesale, urgent, delivery, wanted. One badge per photo.
- **Radius** — buttons 8–10, inputs 10, cards 12, large image blocks 16.
- **Elevation** — only the search bar, dropdowns, sticky header and modals float.
- **Spacing** — `shell` container (max 1440, 16/24/32/40 gutters); `section-y` 56 / 80 / 104px; grid gaps 16 mobile, 24 desktop.
- **Commerce rule** — "Order now" and delivery badges appear only for verified shops with ordering enabled (`seller.acceptsOrders`) on shippable categories. Livestock, property, vehicles and services are always contact-the-seller.

## Data & backend

Pages call `lib/data` (`getListings`, `getShops`, `getWantedRequests`, …). Replace those function bodies with Supabase queries — signatures and types stay the same. Table plan is in `lib/data/supabase.ts`.

Locations are data, not hard-coded UI: add a district/tehsil/town in `data/locations.ts` (later a table) and every selector picks it up.

## Photos

See **IMAGES.md** for the full shot list. Drop a photo at its path and it appears; until then a designed placeholder is shown.

## Performance notes

- Homepage is server-rendered; client JS only for tabs, filters, save/follow, menu and bottom nav.
- Search is a plain GET form (`/search?q=…&category=…&district=…`) — works without JavaScript.
- `next/image` with AVIF/WebP, responsive `sizes`, lazy-loading below the fold; hero is the only priority image.
- No autoplay media, no animation libraries, no icon fonts.
