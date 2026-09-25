import type { LocalProduct } from "@/types";
import { photo } from "./media";

/** "Fresh From Gilgit-Baltistan" — the region's signature produce. */
export const localProducts: LocalProduct[] = [
  { slug: "dried-apricot", name: "Dried Apricot", localName: "Khubani / Chuli", fromPrice: { amount: 900, unit: "kg" }, wholesale: true, listings: 412, origin: "Hunza · Shigar", tint: "#F1DDB7", image: photo("/images/local/dried-apricot.jpg", "Dried apricots from Hunza") },
  { slug: "walnut", name: "Walnut", localName: "Akhrot", fromPrice: { amount: 1600, unit: "kg" }, wholesale: true, listings: 268, origin: "Hunza · Nagar", tint: "#E8DCC8", image: photo("/images/local/walnut.jpg", "Hunza walnuts") },
  { slug: "almond", name: "Almond", localName: "Badam", fromPrice: { amount: 2400, unit: "kg" }, wholesale: true, listings: 143, origin: "Skardu · Shigar", tint: "#EEDFCB", image: photo("/images/local/almond.jpg", "Kaghzi almonds") },
  { slug: "mulberry", name: "Mulberry", localName: "Toot", fromPrice: { amount: 1200, unit: "kg" }, wholesale: false, listings: 96, origin: "Nagar · Ghizer", tint: "#E9E1D2", image: photo("/images/local/mulberry.jpg", "Dried white mulberries") },
  { slug: "honey", name: "Honey", localName: "Shehad", fromPrice: { amount: 3200, unit: "kg" }, wholesale: false, listings: 118, origin: "Nagar · Astore", tint: "#F0DDB0", image: photo("/images/local/honey.jpg", "Raw mountain honey") },
  { slug: "cherries", name: "Cherries", fromPrice: { amount: 600, unit: "kg" }, wholesale: true, listings: 74, origin: "Hunza · Skardu", tint: "#EFD6CF", image: photo("/images/local/cherries.jpg", "Fresh GB cherries") },
  { slug: "apple", name: "Apple", localName: "Kushu", fromPrice: { amount: 220, unit: "kg" }, wholesale: true, listings: 132, origin: "Ghizer · Nagar", tint: "#EADBCF", image: photo("/images/local/apple.jpg", "Mountain apples") },
  { slug: "sea-buckthorn", name: "Sea Buckthorn", localName: "Buru", fromPrice: { amount: 950, unit: "litre" }, wholesale: false, listings: 41, origin: "Ghanche · Skardu", tint: "#F2DCB2", image: photo("/images/local/sea-buckthorn.jpg", "Sea buckthorn berries") },
  { slug: "local-herbs", name: "Local Herbs", localName: "Tumuro · Shukpa", fromPrice: { amount: 400, unit: "piece" }, wholesale: false, listings: 67, origin: "Hunza · Ghanche", tint: "#E1E6D6", image: photo("/images/local/herbs.jpg", "Dried mountain herbs") },
  { slug: "handmade", name: "Handmade Products", localName: "Crafts", fromPrice: { amount: 1500, unit: "piece" }, wholesale: false, listings: 205, origin: "Khaplu · Hunza", tint: "#EADFD3", image: photo("/images/local/handmade.jpg", "Handmade GB crafts") },
];
