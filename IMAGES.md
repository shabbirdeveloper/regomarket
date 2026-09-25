# REGO.pk — Photos

## Current state: interim Unsplash photography

Every listing, shop cover, district tile, bazaar card and the hero now use real photos from
**Unsplash** (free for commercial use under the Unsplash License, no attribution required).
They are loaded from `images.unsplash.com` through `next/image`, which resizes them and serves
AVIF/WebP. The IDs live in `/data` (`unsplash("photo-…", alt)` calls).

These are *illustrative* stock photos, not pictures of the actual GB places or products. Replace
them with real photography as it becomes available — ideally sellers' own photos, and
commissioned photos of Skardu, Gilgit, Aliabad, Khaplu and Shigar bazaars.

**To use your own photo instead:** save it under `public/images/...` and change that item's
`unsplash("…")` call back to `photo("/images/…", "alt text")` in `/data`. The planned file names
are listed below.

## No longer used

`public/images/categories/*.png` and `public/images/ui/*.png` (cut from an earlier mockup) are no longer shown —
categories now use line icons. You can delete those two folders.

## Hero (2400×1350, landscape)

| File | What it should show |
|---|---|
| `public/images/hero/attabad-lake-passu.jpg` | Turquoise Attabad Lake below the Passu Cones in Gojal, Hunza |

## Market banners (1600×1200)

| File | What it should show |
|---|---|
| `public/images/banners/dry-apricots.jpg` | Golden dried apricots laid out on a rooftop in Hunza |
| `public/images/banners/goats-alpine-pasture.jpg` | A herd of goats grazing on an alpine pasture in Astore |
| `public/images/banners/skardu-bazaar.jpg` | Shopfronts along the main bazaar in Skardu |

## Fresh From GB tiles (800×640)

| File | What it should show |
|---|---|
| `public/images/local/dried-apricot.jpg` | Dried apricots from Hunza |
| `public/images/local/walnut.jpg` | Hunza walnuts |
| `public/images/local/almond.jpg` | Kaghzi almonds |
| `public/images/local/mulberry.jpg` | Dried white mulberries |
| `public/images/local/honey.jpg` | Raw mountain honey |
| `public/images/local/cherries.jpg` | Fresh GB cherries |
| `public/images/local/apple.jpg` | Mountain apples |
| `public/images/local/sea-buckthorn.jpg` | Sea buckthorn berries |
| `public/images/local/herbs.jpg` | Dried mountain herbs |
| `public/images/local/handmade.jpg` | Handmade GB crafts |

## Listing photos (1200×900, 4:3)

| File | What it should show |
|---|---|
| `public/images/listings/dry-apricot-shigar.jpg` | Sun-dried premium apricots from Shigar in a woven basket |
| `public/images/listings/goat-skardu.jpg` | Healthy two-year-old local male goat in Skardu |
| `public/images/listings/land-hunza.jpg` | Five kanal terraced plot with orchard in Nasirabad, Hunza |
| `public/images/listings/walnut-hunza.jpg` | Thin-shell Hunza walnuts in a jute sack |
| `public/images/listings/prado-skardu.jpg` | White Toyota Land Cruiser Prado 2021 parked in Skardu |
| `public/images/listings/iphone-15-pro.jpg` | iPhone 15 Pro in natural titanium with box |
| `public/images/listings/honey-nagar.jpg` | Jars of raw wild honey from Hopar valley, Nagar |
| `public/images/listings/honda-125.jpg` | Red Honda CD 125 motorcycle, 2024 model |
| `public/images/listings/yak-hushe.jpg` | Black female yak on a high pasture near Hushe |
| `public/images/listings/sheep-astore.jpg` | Pair of local Astori sheep |
| `public/images/listings/camping-gear.jpg` | Four-season tent with sleeping bags and stove |
| `public/images/listings/house-jutial.jpg` | Three-bedroom house with lawn in Jutial, Gilgit |
| `public/images/listings/almond-kaghzi.jpg` | Paper-shell Kaghzi almonds from Baltistan |
| `public/images/listings/dried-mulberry.jpg` | Sun-dried white mulberries from Nagar |
| `public/images/listings/cow-danyore.jpg` | Jersey cross milking cow in Danyore |
| `public/images/listings/desi-hens.jpg` | Free-range desi hens in Astore |
| `public/images/listings/canon-r6.jpg` | Canon EOS R6 mirrorless camera with 24-105mm lens |
| `public/images/listings/hunza-cap.jpg` | Embroidered traditional Hunza cap and woollen shawl |
| `public/images/listings/mf-385.jpg` | Red Massey Ferguson 385 tractor in Chilas |
| `public/images/listings/seed-potatoes.jpg` | Sacks of Nagar seed potatoes |
| `public/images/listings/shop-rent-skardu.jpg` | Ground-floor commercial shop on Skardu main bazaar |
| `public/images/listings/pattu-shawl.jpg` | Hand-woven natural pattu woollen shawl |
| `public/images/listings/galaxy-s24.jpg` | Samsung Galaxy S24 in onyx black |
| `public/images/listings/jeep-deosai.jpg` | 4x4 jeep on the road to Deosai plains |
| `public/images/listings/goat-herd-astore.jpg` | Six local goats on a pasture in Rattu, Astore |
| `public/images/listings/hunza-cherries.jpg` | Freshly picked dark red cherries from Karimabad, Hunza |

## Shop covers (1600×700) & logos (400×400 PNG)

| File | What it should show |
|---|---|
| `public/images/shops/hunza-dry-fruits-house-cover.jpg` | Dry fruit displays inside Hunza Dry Fruits House, Aliabad |
| `public/images/shops/hunza-dry-fruits-house-logo.png` | Hunza Dry Fruits House logo |
| `public/images/shops/shigar-organic-farms-cover.jpg` | Apricot orchards in Shigar valley |
| `public/images/shops/shigar-organic-farms-logo.png` | Shigar Organic Farms logo |
| `public/images/shops/baltistan-motors-cover.jpg` | Showroom of Baltistan Motors in Skardu |
| `public/images/shops/baltistan-motors-logo.png` | Baltistan Motors logo |
| `public/images/shops/karakoram-mobile-zone-cover.jpg` | Mobile phone counter at Karakoram Mobile Zone, Gilgit |
| `public/images/shops/karakoram-mobile-zone-logo.png` | Karakoram Mobile Zone logo |
| `public/images/shops/nagar-honey-herbs-cover.jpg` | Beehives above Hopar glacier, Nagar |
| `public/images/shops/nagar-honey-herbs-logo.png` | Nagar Honey & Herbs logo |
| `public/images/shops/khaplu-handicrafts-cover.jpg` | Hand-woven textiles at Khaplu Handicrafts Collective |
| `public/images/shops/khaplu-handicrafts-logo.png` | Khaplu Handicrafts Collective logo |
| `public/images/shops/deosai-outdoor-gear-cover.jpg` | Camping gear displayed at Deosai Outdoor Gear |
| `public/images/shops/deosai-outdoor-gear-logo.png` | Deosai Outdoor Gear logo |
| `public/images/shops/astore-livestock-cover.jpg` | Livestock pens at Astore Livestock Traders |
| `public/images/shops/astore-livestock-logo.png` | Astore Livestock Traders logo |

## Local Bazaar (1000×1250, portrait — shown in an arch)

| File | What it should show |
|---|---|
| `public/images/bazaars/skardu-bazaar.jpg` | Evening crowd on Skardu's main bazaar |
| `public/images/bazaars/gilgit-bazaar.jpg` | Shops along Raja Bazaar in Gilgit |
| `public/images/bazaars/aliabad-market.jpg` | Aliabad market on the Karakoram Highway, Hunza |
| `public/images/bazaars/khaplu-bazaar.jpg` | Traditional shopfronts in Khaplu bazaar |
| `public/images/bazaars/shigar-market.jpg` | Shigar market street with orchards behind |

