import type { Category, Media } from "@/types";
import { unsplash } from "./media";

/**
 * 3D category icons from Microsoft Fluent Emoji (MIT licence), served from the
 * jsDelivr CDN. To self-host, download the PNGs into /public/images/icons and
 * point `src` there.
 */
function fluent3d(name: string): Media {
  const file = name.toLowerCase().replace(/ /g, "_");
  return {
    src: `https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/${encodeURIComponent(name)}/3D/${file}_3d.png`,
    alt: "",
    width: 256,
    height: 256,
  };
}

export const categories: Category[] = [
  {
    slug: "dry-fruits",
    image: unsplash("photo-1723110565328-9dbeef603d19", "", 400, 400),
    icon3d: fluent3d("Peach"),
    name: "Dry Fruits & Local Products",
    shortName: "Dry Fruits",
    icon: "apricot",
    description: "Apricots, walnuts, almonds, mulberries, honey and herbs from GB orchards.",
    activeListings: 1426,
    tint: "#F3E6CF",
  },
  {
    slug: "livestock",
    image: unsplash("photo-1588466585717-f8041aec7875", "", 400, 400),
    icon3d: fluent3d("Goat"),
    name: "Livestock",
    shortName: "Livestock",
    icon: "goat",
    description: "Goats, sheep, cows, yaks and poultry from local herders.",
    activeListings: 982,
    tint: "#E5ECE2",
  },
  {
    slug: "agriculture",
    image: unsplash("photo-1623428453655-44feea11454b", "", 400, 400),
    icon3d: fluent3d("Herb"),
    name: "Agriculture & Farm",
    shortName: "Agriculture",
    icon: "wheat",
    description: "Seed potatoes, fodder, saplings, fertiliser and farm supplies.",
    activeListings: 604,
    tint: "#ECE9D6",
  },
  {
    slug: "property",
    image: unsplash("photo-1616382120760-54c1f5bab434", "", 400, 400),
    icon3d: fluent3d("House"),
    name: "Property & Land",
    shortName: "Property",
    icon: "land",
    description: "Land, houses, shops and guest houses for sale or rent.",
    activeListings: 1318,
    tint: "#EAE5DA",
  },
  {
    slug: "vehicles",
    image: unsplash("photo-1610064095022-db1b488c05f1", "", 400, 400),
    icon3d: fluent3d("Sport utility vehicle"),
    name: "Vehicles",
    shortName: "Vehicles",
    icon: "car",
    description: "Jeeps, cars, motorcycles and mountain-ready 4x4s.",
    activeListings: 1157,
    tint: "#E4E7E3",
  },
  {
    slug: "electronics",
    image: unsplash("photo-1695822822491-d92cee704368", "", 400, 400),
    icon3d: fluent3d("Laptop"),
    name: "Electronics & Mobiles",
    shortName: "Electronics",
    icon: "phone",
    description: "Mobiles, laptops, solar kits and appliances.",
    activeListings: 1540,
    tint: "#E6E8E6",
  },
  {
    slug: "home",
    image: unsplash("photo-1608463123864-40a2961b7d00", "", 400, 400),
    icon3d: fluent3d("Couch and lamp"),
    name: "Home & Used Items",
    shortName: "Home",
    icon: "sofa",
    description: "Furniture, stoves, heaters and household goods.",
    activeListings: 873,
    tint: "#EEE8DF",
  },
  {
    slug: "cameras-gear",
    image: unsplash("photo-1571863533956-01c88e79957e", "", 400, 400),
    icon3d: fluent3d("Camping"),
    name: "Cameras & Outdoor Gear",
    shortName: "Outdoor Gear",
    icon: "tent",
    description: "Cameras, drones, camping and trekking equipment.",
    activeListings: 412,
    tint: "#E8E6E0",
  },
  {
    slug: "handicrafts",
    image: unsplash("photo-1550045178-5df4d0ae22d0", "", 400, 400),
    icon3d: fluent3d("Amphora"),
    name: "Handicrafts & Clothing",
    shortName: "Handicrafts",
    icon: "shirt",
    description: "Hunza caps, pattu shawls, embroidery and woodwork.",
    activeListings: 538,
    tint: "#F1E7DE",
  },
  {
    slug: "machinery",
    image: unsplash("photo-1683552515328-5a8d58755e9c", "", 400, 400),
    icon3d: fluent3d("Tractor"),
    name: "Machinery & Tools",
    shortName: "Machinery",
    icon: "tractor",
    description: "Tractors, generators, threshers and construction tools.",
    activeListings: 297,
    tint: "#E7E6DF",
  },
  {
    slug: "services",
    icon3d: fluent3d("Hammer and wrench"),
    name: "Local Services",
    shortName: "Services",
    icon: "handshake",
    description: "Jeep hire, guides, electricians, builders and tutors.",
    activeListings: 468,
    tint: "#E3ECE7",
  },
];

export const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c])) as Record<
  Category["slug"],
  Category
>;
