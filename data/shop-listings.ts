import type { Listing, Place } from "@/types";
import { unsplash } from "./media";

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const pic = (id: string, alt: string) => unsplash(`photo-${id}`, alt);

/** Shop places (kept in one spot so every item of a shop shows the same town). */
const AT: Record<string, Place> = {
  hunza: { district: "hunza", tehsil: "aliabad", town: "Aliabad" },
  shigar: { district: "shigar", town: "Shigar" },
  skardu: { district: "skardu", town: "Skardu City" },
  jutial: { district: "gilgit", town: "Jutial" },
  hopar: { district: "nagar", town: "Hopar" },
  khaplu: { district: "ghanche", town: "Khaplu" },
  astore: { district: "astore", town: "Eidgah" },
};

/**
 * The fuller catalogue of each verified shop (Screen 05 — shop page).
 * Same shape as data/listings.ts; merged into `listings` there.
 */
export const shopListings: Listing[] = [
  /* ---------------- Hunza Dry Fruits House ---------------- */
  {
    id: "l-2001", slug: "hunza-dried-apricots-whole-sun-dried", title: "Hunza Dried Apricots (Whole, Sun-dried)",
    category: "dry-fruits", place: AT.hunza, price: { amount: 900, unit: "kg" },
    images: [pic("1784043436919-28fd8e17ff3c", "Golden whole sun-dried Hunza apricots"), pic("1763140877786-5dc3287a6629", "Dried fruit on display at the shop")],
    badges: ["featured"], delivery: true, sellerId: "s-hunza-dfh", postedAt: hoursAgo(9), views: 1840,
    produce: { grade: "A Grade", harvestYear: 2026, quantityAvailable: "300 KG" },
  },
  {
    id: "l-2002", slug: "apricot-kernels-sweet-giri-hunza", title: "Apricot Kernels (Sweet Giri)",
    category: "dry-fruits", place: AT.hunza, price: { amount: 1800, unit: "kg" },
    images: [pic("1784015560266-d33c59a47651", "Apricot pits and sweet kernels on a board")],
    badges: [], delivery: true, sellerId: "s-hunza-dfh", postedAt: hoursAgo(30), views: 612,
    produce: { grade: "Premium", harvestYear: 2026, quantityAvailable: "60 KG" },
  },
  {
    id: "l-2003", slug: "kishmish-green-raisins", title: "Kishmish (Green Raisins)",
    category: "dry-fruits", place: AT.hunza, price: { amount: 1400, unit: "kg" },
    images: [pic("1642102903918-b97c37955bbf", "A pile of green raisins")],
    badges: [], delivery: true, sellerId: "s-hunza-dfh", postedAt: hoursAgo(52), views: 488,
    produce: { grade: "A Grade", harvestYear: 2026, quantityAvailable: "80 KG" },
  },
  {
    id: "l-2004", slug: "dry-fruit-gift-box-1kg-mix", title: "Dry Fruit Gift Box (1 KG Mix)",
    category: "dry-fruits", place: AT.hunza, price: { amount: 3500, unit: "piece" },
    images: [pic("1781773338966-373f0b949645", "Bowls of almonds, pistachios and dried apricots"), pic("1693812879904-b8161644ce5a", "Mixed nuts in a bowl")],
    badges: ["featured"], delivery: true, sellerId: "s-hunza-dfh", postedAt: hoursAgo(14), views: 2320,
    attributes: { contains: "Apricot, walnut, almond, kishmish, mulberry", weight: "1 KG", packing: "Gift box" },
  },
  {
    id: "l-2005", slug: "walnut-kernels-maghz-hunza", title: "Walnut Kernels (Maghz)",
    category: "dry-fruits", place: AT.hunza, price: { amount: 2800, unit: "kg" },
    images: [pic("1524593000379-d4729b2c4f99", "Shelled walnut kernels close up")],
    badges: ["wholesale"], tag: "Wholesale", wholesale: true, delivery: true, sellerId: "s-hunza-dfh", postedAt: hoursAgo(76), views: 930,
    produce: { grade: "Premium", harvestYear: 2026, quantityAvailable: "45 KG" },
  },
  {
    id: "l-2006", slug: "pure-apricot-oil-chuli-tel", title: "Pure Apricot Oil (Chuli Tel)",
    category: "dry-fruits", place: AT.hunza, price: { amount: 1500, unit: "bottle" },
    images: [pic("1671493234254-15fc6c91aa87", "Amber bottle of cold-pressed apricot kernel oil")],
    badges: [], delivery: true, sellerId: "s-hunza-dfh", postedAt: hoursAgo(120), views: 705,
    attributes: { size: "250 ml", pressing: "Cold-pressed" },
  },

  /* ---------------- Shigar Organic Farms ---------------- */
  {
    id: "l-2007", slug: "organic-walnuts-shigar", title: "Organic Walnuts (Shigar)",
    category: "dry-fruits", place: AT.shigar, price: { amount: 1500, unit: "kg" },
    images: [pic("1524593656068-fbac72624bb0", "Whole organic walnuts from Shigar")],
    badges: [], delivery: true, sellerId: "s-shigar-organic", postedAt: hoursAgo(20), views: 540,
    produce: { grade: "A Grade", harvestYear: 2026, quantityAvailable: "150 KG" },
  },
  {
    id: "l-2008", slug: "dried-apricots-wholesale-maund-shigar", title: "Dried Apricots — Wholesale (40 KG)",
    category: "dry-fruits", place: AT.shigar, price: { amount: 34000, unit: "maund", negotiable: true },
    images: [pic("1768284952322-58905fef0f16", "Sacks of dried apricots and nuts at a stall")],
    badges: ["wholesale"], tag: "Wholesale", wholesale: true, delivery: true, sellerId: "s-shigar-organic", postedAt: hoursAgo(44), views: 1190,
    produce: { grade: "Standard", harvestYear: 2026, quantityAvailable: "25 maunds" },
  },
  {
    id: "l-2009", slug: "almond-apricot-trail-mix-shigar", title: "Almond & Apricot Mix",
    category: "dry-fruits", place: AT.shigar, price: { amount: 1600, unit: "kg" },
    images: [pic("1776188590471-db74f543cf52", "Bowls of dried fruit and nuts")],
    badges: [], delivery: true, sellerId: "s-shigar-organic", postedAt: hoursAgo(96), views: 402,
    produce: { grade: "A Grade", harvestYear: 2026, quantityAvailable: "40 KG" },
  },
  {
    id: "l-2010", slug: "buckwheat-brow-flour-shigar", title: "Buckwheat (Brow) Flour",
    category: "agriculture", place: AT.shigar, price: { amount: 600, unit: "kg" },
    images: [pic("1719060038791-012d4a471d91", "Buckwheat grain from Shigar")],
    badges: [], delivery: true, sellerId: "s-shigar-organic", postedAt: hoursAgo(150), views: 318,
    attributes: { milling: "Stone-ground", pack: "1 KG and 5 KG" },
  },

  /* ---------------- Baltistan Motors ---------------- */
  {
    id: "l-2011", slug: "toyota-land-cruiser-v8-2016-skardu", title: "Toyota Land Cruiser V8 2016",
    category: "vehicles", place: AT.skardu, price: { amount: 28_500_000, negotiable: true },
    images: [pic("1650530579355-7ad9d4766043", "Black Toyota Land Cruiser V8")],
    badges: ["featured"], condition: "used", sellerId: "s-baltistan-motors", postedAt: hoursAgo(18), views: 3120,
    attributes: { year: 2016, mileage: "96,000 km", fuel: "Petrol", transmission: "Automatic", registered: "Islamabad" },
  },
  {
    id: "l-2012", slug: "toyota-hilux-revo-2020-skardu", title: "Toyota Hilux Revo 2020",
    category: "vehicles", place: AT.skardu, price: { amount: 9_800_000, negotiable: true },
    images: [pic("1631377875413-b1e3e660bfa2", "Silver Toyota Hilux pickup on a dirt road")],
    badges: [], condition: "used", sellerId: "s-baltistan-motors", postedAt: hoursAgo(40), views: 1640,
    attributes: { year: 2020, mileage: "58,000 km", fuel: "Diesel", transmission: "Manual", registered: "Gilgit" },
  },
  {
    id: "l-2013", slug: "toyota-corolla-gli-2018-skardu", title: "Toyota Corolla GLi 2018",
    category: "vehicles", place: AT.skardu, price: { amount: 4_150_000 },
    images: [pic("1623869675781-80aa31012a5a", "White Toyota Corolla sedan")],
    badges: [], condition: "used", sellerId: "s-baltistan-motors", postedAt: hoursAgo(70), views: 980,
    attributes: { year: 2018, mileage: "84,000 km", fuel: "Petrol", transmission: "Manual", registered: "Lahore" },
  },
  {
    id: "l-2014", slug: "honda-civic-oriel-2019-skardu", title: "Honda Civic Oriel 2019",
    category: "vehicles", place: AT.skardu, price: { amount: 6_300_000, negotiable: true },
    images: [pic("1594070319944-7c0cbebb6f58", "Black Honda Civic parked outside")],
    badges: [], condition: "used", sellerId: "s-baltistan-motors", postedAt: hoursAgo(110), views: 1205,
    attributes: { year: 2019, mileage: "61,000 km", fuel: "Petrol", transmission: "Automatic", registered: "Islamabad" },
  },
  {
    id: "l-2015", slug: "suzuki-jeep-4x4-potohar-skardu", title: "Suzuki Jeep 4x4 (Potohar)",
    category: "vehicles", place: AT.skardu, price: { amount: 1_650_000, negotiable: true },
    images: [pic("1699862379433-3d5c817a16a7", "Blue 4x4 jeep on a dirt road")],
    badges: ["urgent"], tag: "Urgent", condition: "used", sellerId: "s-baltistan-motors", postedAt: hoursAgo(6), views: 870,
    attributes: { year: 2004, mileage: "140,000 km", fuel: "Petrol", transmission: "Manual", drive: "4x4" },
  },

  /* ---------------- Karakoram Mobile Zone ---------------- */
  {
    id: "l-2016", slug: "iphone-13-128gb-pta-gilgit", title: "iPhone 13 128GB (PTA Approved)",
    category: "electronics", place: AT.jutial, price: { amount: 145_000 },
    images: [pic("1632518192421-56aba73eae55", "iPhone 13 in its box")],
    badges: ["featured"], condition: "like-new", delivery: true, sellerId: "s-karakoram-mobile", postedAt: hoursAgo(4), views: 2410,
    attributes: { storage: "128 GB", batteryHealth: "89%", warranty: "7-day check warranty" },
  },
  {
    id: "l-2017", slug: "airpods-pro-2nd-gen-gilgit", title: "AirPods Pro (2nd Gen)",
    category: "electronics", place: AT.jutial, price: { amount: 42_000 },
    images: [pic("1606841837239-c5a1a4a07af7", "White AirPods Pro charging case")],
    badges: [], condition: "new", delivery: true, sellerId: "s-karakoram-mobile", postedAt: hoursAgo(26), views: 760,
    attributes: { box: "Sealed", warranty: "1-year shop warranty" },
  },
  {
    id: "l-2018", slug: "power-bank-20000mah-gilgit", title: "20,000 mAh Power Bank",
    category: "electronics", place: AT.jutial, price: { amount: 6500 },
    images: [pic("1566554738544-d962991c3fee", "Power bank charging a smartphone")],
    badges: [], condition: "new", delivery: true, sellerId: "s-karakoram-mobile", postedAt: hoursAgo(60), views: 540,
    attributes: { output: "22.5W fast charge", ports: "USB-C + 2× USB-A" },
  },
  {
    id: "l-2019", slug: "apple-watch-series-8-45mm-gilgit", title: "Apple Watch Series 8 (45mm)",
    category: "electronics", place: AT.jutial, price: { amount: 68_000 },
    images: [pic("1546868871-7041f2a55e12", "Space grey Apple Watch with black band")],
    badges: [], condition: "used", delivery: true, sellerId: "s-karakoram-mobile", postedAt: hoursAgo(84), views: 690,
    attributes: { batteryHealth: "92%", box: "With charger" },
  },
  {
    id: "l-2020", slug: "fast-charger-25w-cable-gilgit", title: "25W Fast Charger + USB-C Cable",
    category: "electronics", place: AT.jutial, price: { amount: 3200 },
    images: [pic("1583863788434-e58a36330cf0", "White fast charging adapter")],
    badges: [], condition: "new", delivery: true, sellerId: "s-karakoram-mobile", postedAt: hoursAgo(130), views: 410,
    attributes: { compatibility: "Samsung, iPhone 15, Pixel" },
  },
  {
    id: "l-2021", slug: "macbook-air-m1-8-256-gilgit", title: "MacBook Air M1 (8GB / 256GB)",
    category: "electronics", place: AT.jutial, price: { amount: 185_000, negotiable: true },
    images: [pic("1541807084-5c52b6b3adef", "Open MacBook Air on a wooden desk")],
    badges: [], condition: "used", delivery: true, sellerId: "s-karakoram-mobile", postedAt: hoursAgo(36), views: 1320,
    attributes: { batteryCycles: 212, body: "No scratches", charger: "Original" },
  },

  /* ---------------- Nagar Honey & Herbs ---------------- */
  {
    id: "l-2023", slug: "raw-honeycomb-chhatta-nagar", title: "Raw Honeycomb (Chhatta)",
    category: "dry-fruits", place: AT.hopar, price: { amount: 4500, unit: "kg" },
    images: [pic("1623018697148-8350cf18e64e", "Golden honeycomb filled with raw honey")],
    badges: ["featured"], delivery: true, sellerId: "s-nagar-honey", postedAt: hoursAgo(12), views: 980,
    produce: { grade: "Premium", harvestYear: 2026, quantityAvailable: "18 KG" },
  },
  {
    id: "l-2024", slug: "sea-buckthorn-juice-pure-nagar", title: "Sea Buckthorn Juice (Pure)",
    category: "dry-fruits", place: AT.hopar, price: { amount: 900, unit: "litre" },
    images: [pic("1599580782029-3f71e2988c45", "Orange sea buckthorn berries")],
    badges: [], delivery: true, sellerId: "s-nagar-honey", postedAt: hoursAgo(48), views: 620,
    attributes: { sugar: "No added sugar", bottle: "1 litre glass" },
  },
  {
    id: "l-2025", slug: "mountain-herbal-tea-mix-nagar", title: "Mountain Herbal Tea Mix (250g)",
    category: "dry-fruits", place: AT.hopar, price: { amount: 700, unit: "piece" },
    images: [pic("1563822249366-3efb23b8e0c9", "Spoons of loose-leaf herbal teas")],
    badges: [], delivery: true, sellerId: "s-nagar-honey", postedAt: hoursAgo(90), views: 355,
    attributes: { contains: "Tumuru, mint, rose petals, sea buckthorn leaf" },
  },
  {
    id: "l-2026", slug: "dried-tumuru-wild-thyme-nagar", title: "Dried Tumuru (Wild Thyme)",
    category: "dry-fruits", place: AT.hopar, price: { amount: 800, unit: "piece" },
    images: [pic("1725823934061-7a2529cf3d7a", "Bunches of dried mountain herbs hanging")],
    badges: [], delivery: true, sellerId: "s-nagar-honey", postedAt: hoursAgo(160), views: 290,
    attributes: { pack: "100 g", picked: "Hopar valley, summer 2026" },
  },

  /* ---------------- Khaplu Handicrafts Collective ---------------- */
  {
    id: "l-2027", slug: "hand-woven-balti-rug-4x6-khaplu", title: "Hand-woven Balti Rug (4×6 ft)",
    category: "handicrafts", place: AT.khaplu, price: { amount: 38_000 },
    images: [pic("1745905308908-25f35bacd146", "Colourful hand-woven round rug with fringe")],
    badges: ["featured"], delivery: true, sellerId: "s-khaplu-crafts", postedAt: hoursAgo(22), views: 870,
    attributes: { material: "Local sheep wool", size: "4 × 6 ft", madeIn: "Khaplu, Ghanche" },
  },
  {
    id: "l-2028", slug: "hand-knitted-woollen-socks-khaplu", title: "Hand-knitted Woollen Socks",
    category: "handicrafts", place: AT.khaplu, price: { amount: 1200, unit: "piece" },
    images: [pic("1641399050826-9616c90427bb", "Stack of hand-knitted woollen socks")],
    badges: [], delivery: true, sellerId: "s-khaplu-crafts", postedAt: hoursAgo(58), views: 640,
    attributes: { material: "Pure wool", sizes: "S, M, L" },
  },
  {
    id: "l-2029", slug: "carved-walnut-wood-bowl-khaplu", title: "Carved Walnut-wood Bowl",
    category: "handicrafts", place: AT.khaplu, price: { amount: 2800, unit: "piece" },
    images: [pic("1609688538023-2090aa8e874e", "Hand-carved round wooden bowl")],
    badges: [], delivery: true, sellerId: "s-khaplu-crafts", postedAt: hoursAgo(100), views: 410,
    attributes: { wood: "Walnut", finish: "Food-safe oil" },
  },
  {
    id: "l-2030", slug: "woven-willow-basket-khaplu", title: "Woven Willow Basket",
    category: "handicrafts", place: AT.khaplu, price: { amount: 1800, unit: "piece" },
    images: [pic("1601330862030-1e08c703ac04", "Brown hand-woven baskets")],
    badges: [], delivery: true, sellerId: "s-khaplu-crafts", postedAt: hoursAgo(140), views: 330,
    attributes: { material: "Willow", sizes: "Small, medium, large" },
  },
  {
    id: "l-2031", slug: "embroidered-table-runner-khaplu", title: "Embroidered Table Runner",
    category: "handicrafts", place: AT.khaplu, price: { amount: 3500, unit: "piece" },
    images: [pic("1671535108620-d169ce916f09", "Hand embroidery on black cloth")],
    badges: [], delivery: true, sellerId: "s-khaplu-crafts", postedAt: hoursAgo(190), views: 280,
    attributes: { length: "6 ft", work: "Hand embroidery" },
  },

  /* ---------------- Deosai Outdoor Gear ---------------- */
  {
    id: "l-2032", slug: "down-sleeping-bag-minus-10-skardu", title: "Down Sleeping Bag (−10°C)",
    category: "cameras-gear", place: AT.skardu, price: { amount: 18_500 },
    images: [pic("1558477280-1bfed08ea5db", "Blue sleeping bag on a mountain")],
    badges: ["featured"], condition: "new", sellerId: "s-deosai-outdoor", postedAt: hoursAgo(16), views: 720,
    attributes: { comfort: "−10°C", rent: "Rs 800 / day" },
  },
  {
    id: "l-2033", slug: "70l-trekking-backpack-skardu", title: "70L Trekking Backpack",
    category: "cameras-gear", place: AT.skardu, price: { amount: 14_000 },
    images: [pic("1509762774605-f07235a08f1f", "Grey hiking backpack on a rock")],
    badges: [], condition: "new", sellerId: "s-deosai-outdoor", postedAt: hoursAgo(50), views: 510,
    attributes: { capacity: "70 L", rainCover: true, rent: "Rs 500 / day" },
  },
  {
    id: "l-2034", slug: "trekking-poles-pair-skardu", title: "Trekking Poles (Pair)",
    category: "cameras-gear", place: AT.skardu, price: { amount: 4500 },
    images: [pic("1632411316785-33d395035a3c", "Pair of trekking poles in the grass")],
    badges: [], condition: "new", sellerId: "s-deosai-outdoor", postedAt: hoursAgo(80), views: 300,
    attributes: { material: "Aluminium", rent: "Rs 200 / day" },
  },
  {
    id: "l-2035", slug: "down-puffer-jacket-skardu", title: "Down Puffer Jacket",
    category: "cameras-gear", place: AT.skardu, price: { amount: 16_000 },
    images: [pic("1532704102644-883111bdf82d", "Yellow and red down puffer jacket")],
    badges: [], condition: "new", sellerId: "s-deosai-outdoor", postedAt: hoursAgo(115), views: 450,
    attributes: { sizes: "M, L, XL", fill: "Duck down" },
  },
  {
    id: "l-2036", slug: "camping-gas-stove-cook-set-skardu", title: "Camping Gas Stove + Cook Set",
    category: "cameras-gear", place: AT.skardu, price: { amount: 5500 },
    images: [pic("1522041350204-22285237eeca", "Camping gas burner with cook pot")],
    badges: [], condition: "new", sellerId: "s-deosai-outdoor", postedAt: hoursAgo(170), views: 260,
    attributes: { includes: "Burner, 2 pots, gas canister", rent: "Rs 300 / day" },
  },

  /* ---------------- Astore Livestock Traders ---------------- */
  {
    id: "l-2037", slug: "astori-sheep-flock-12-astore", title: "Astori Sheep Flock (12)",
    category: "livestock", place: AT.astore, price: { amount: 420_000, negotiable: true },
    images: [pic("1602027438676-ad64751bdbc1", "Flock of sheep on a green pasture")],
    badges: ["wholesale"], tag: "Bulk", wholesale: true, sellerId: "s-astore-livestock", postedAt: hoursAgo(10), views: 690,
    livestock: { animal: "sheep", breed: "Local (Astori)", age: "1–2 Years", gender: "Mixed", weightKg: 30, vaccinated: true, count: 12 },
  },
  {
    id: "l-2038", slug: "young-yak-bull-3-years-astore", title: "Young Yak Bull (3 Years)",
    category: "livestock", place: AT.astore, price: { amount: 280_000, negotiable: true },
    images: [pic("1603104147308-73891c6be078", "Brown yak on a green pasture")],
    badges: [], sellerId: "s-astore-livestock", postedAt: hoursAgo(46), views: 520,
    livestock: { animal: "yak", breed: "Himalayan yak", age: "3 Years", gender: "Male", weightKg: 260, vaccinated: true },
  },
  {
    id: "l-2039", slug: "milking-cow-local-cross-astore", title: "Milking Cow (Local Cross)",
    category: "livestock", place: AT.astore, price: { amount: 210_000, negotiable: true },
    images: [pic("1620123357390-86c161acbb7e", "Brown and white cow on a pasture")],
    badges: [], sellerId: "s-astore-livestock", postedAt: hoursAgo(88), views: 410,
    livestock: { animal: "cow", breed: "Local cross", age: "5 Years", gender: "Female", weightKg: 320, vaccinated: true },
    attributes: { milk: "8–10 litres a day" },
  },
  {
    id: "l-2040", slug: "goat-kids-pair-4-months-astore", title: "Goat Kids (Pair, 4 Months)",
    category: "livestock", place: AT.astore, price: { amount: 38_000 },
    images: [pic("1514753910521-3dc1645aa97e", "Two goat kids eating grass")],
    badges: [], sellerId: "s-astore-livestock", postedAt: hoursAgo(126), views: 360,
    livestock: { animal: "goat", breed: "Local (Astori)", age: "4 Months", gender: "Mixed", vaccinated: false, count: 2 },
  },
];
