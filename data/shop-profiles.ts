import type { ShopProfile, ShopReview } from "@/types";

/** Storefront details per shop id. Replaced by the Supabase `shops` columns later. */
export const shopProfiles: Record<string, ShopProfile> = {
  "shop-1": {
    about: [
      "A family shop on the Aliabad main road, selling dry fruits from our own and neighbours' orchards in central Hunza since 1998.",
      "Everything is sun-dried on rooftops and hand-sorted before packing. We sell by the KG for homes and by the sack for shops and hotels.",
    ],
    founded: 1998,
    payments: ["Cash on delivery", "Easypaisa", "JazzCash", "Bank transfer"],
    deliveryNote: "Delivers across Gilgit-Baltistan in 1–3 days. Same-day in Aliabad and Karimabad.",
    highlights: ["Sun-dried, hand-sorted", "Wholesale rates for shops", "Gift packing available"],
    address: "Main KKH Road, near Aliabad Chowk, Hunza",
  },
  "shop-2": {
    about: [
      "Three families farming apricot, walnut and almond orchards in Shigar valley. No chemical sprays, no sulphur on our apricots.",
      "Most of our trade is wholesale to shops in Skardu, Gilgit and down-country, but we also send small orders to homes.",
    ],
    founded: 2016,
    payments: ["Cash on delivery", "Easypaisa", "Bank transfer"],
    deliveryNote: "Delivers across GB. Wholesale orders go by cargo to Rawalpindi and Islamabad.",
    highlights: ["No sulphur", "Direct from the orchard", "Bulk from 40 KG"],
    address: "Shigar Fort Road, Shigar",
  },
  "shop-3": {
    about: [
      "Skardu's longest-running used-car showroom. Every vehicle is inspected by our mechanic before it goes on sale, and papers are checked at Excise.",
      "Come see any car at the showroom. Test drives on the Skardu–Shigar road are welcome.",
    ],
    founded: 2009,
    payments: ["Cash at shop", "Bank transfer"],
    deliveryNote: "No delivery. See and test drive at our Skardu showroom.",
    highlights: ["Mechanic-inspected", "Papers verified", "Test drive welcome"],
    address: "Hussaini Chowk, College Road, Skardu City",
  },
  "shop-4": {
    about: [
      "PTA-approved phones, laptops and accessories in Jutial, with a repair counter for screens, batteries and charging ports.",
      "Used devices come with a 7-day check warranty. New items carry the brand or shop warranty written on the bill.",
    ],
    founded: 2014,
    payments: ["Cash on delivery", "Easypaisa", "JazzCash", "Bank transfer", "Cash at shop"],
    deliveryNote: "Delivers across GB in 1–2 days. Same-day in Gilgit city.",
    highlights: ["PTA approved", "7-day check warranty", "Repairs in-house"],
    address: "Shop 12, Jutial Market, Gilgit",
  },
  "shop-5": {
    about: [
      "Wild honey from the hives of Hopar and Nagar valleys, plus sea buckthorn and mountain herbs picked each summer.",
      "Our honey is raw and unheated. We are happy to send a small sample jar before a large order.",
    ],
    founded: 2019,
    payments: ["Cash on delivery", "Easypaisa", "JazzCash"],
    deliveryNote: "Delivers across GB in 2–3 days.",
    highlights: ["Raw & unheated", "Sample jars on request", "Picked in Nagar"],
    address: "Hopar Road, Nagar",
  },
  "shop-6": {
    about: [
      "A collective of 30+ women weavers and woodworkers from villages around Khaplu. Every piece is made by hand in Ghanche.",
      "Buying here pays the maker directly. We take custom orders for rugs and embroidery.",
    ],
    founded: 2012,
    payments: ["Cash on delivery", "Easypaisa", "Bank transfer"],
    deliveryNote: "Delivers across GB and Pakistan. Custom pieces take 2–4 weeks.",
    highlights: ["Handmade in Ghanche", "Women-led", "Custom orders"],
    address: "Khaplu Bazaar, near Chaqchan Mosque, Khaplu",
  },
  "shop-7": {
    about: [
      "Trekking and camping kit for Deosai, K2 base camp and the Baltoro. Buy new or rent by the day.",
      "All rental gear is cleaned and checked after every trip. Ask us about the route, we trek it ourselves.",
    ],
    founded: 2015,
    payments: ["Cash at shop", "Easypaisa", "JazzCash"],
    deliveryNote: "Pickup from our Skardu shop. Rentals need a CNIC copy.",
    highlights: ["Sale & rental", "Cleaned after every trip", "Route advice"],
    address: "Yadgar Chowk, Main Bazaar, Skardu City",
  },
  "shop-8": {
    about: [
      "Goats, sheep, yaks and cattle from Astore pastures. We buy from local herders and sell healthy, vaccinated animals.",
      "Visit our pen in Eidgah to see the animals. We help arrange transport to Gilgit and Chilas.",
    ],
    founded: 2020,
    payments: ["Cash at shop", "Bank transfer"],
    deliveryNote: "See animals at our Eidgah pen. Transport to Gilgit can be arranged.",
    highlights: ["Vaccinated animals", "Vet records", "Transport help"],
    address: "Livestock Mandi, Eidgah, Astore",
  },
};

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

/** Buyer reviews shown on the shop page. */
export const shopReviews: ShopReview[] = [
  { id: "r-101", shopId: "shop-1", author: "Nadia Karim", from: "Jutial, Gilgit", rating: 5, postedAt: daysAgo(3), item: "walnut-akhrot-hunza", text: "Walnuts came in a clean jute bag, thin shell and fresh. Delivery to Gilgit took two days. Will order again before winter.", reply: "Shukriya Nadia! New crop apricots arrive next week." },
  { id: "r-102", shopId: "shop-1", author: "Asif Ali", from: "Skardu City, Skardu", rating: 5, postedAt: daysAgo(9), item: "dry-fruit-gift-box-1kg-mix", text: "Ordered three gift boxes for Eid. Nicely packed and everything was the same quality as the photo." },
  { id: "r-103", shopId: "shop-1", author: "Farhan Baig", from: "Karimabad, Hunza", rating: 4, postedAt: daysAgo(16), item: "almond-kaghzi-skardu", text: "Good almonds, a few broken ones in the bag. Price is fair for Kaghzi." },
  { id: "r-104", shopId: "shop-1", author: "Sana Hussain", from: "Danyore, Gilgit", rating: 5, postedAt: daysAgo(27), text: "Very honest shop. They told me which apricots were this year's crop and which were last year's." },

  { id: "r-201", shopId: "shop-2", author: "Imtiaz Hotel & Café", from: "Skardu City, Skardu", rating: 5, postedAt: daysAgo(5), item: "dried-apricots-wholesale-maund-shigar", text: "We buy apricots by the maund for the café. Consistent quality every time and they deliver on time." },
  { id: "r-202", shopId: "shop-2", author: "Rukhsana Bibi", from: "Shigar", rating: 5, postedAt: daysAgo(12), item: "organic-dry-apricot-premium-shigar", text: "Real Shigar apricots, no sulphur smell. My children love them." },
  { id: "r-203", shopId: "shop-2", author: "Kamran Shah", from: "Rawalpindi", rating: 4, postedAt: daysAgo(21), text: "Cargo took five days to Pindi, but the walnuts were excellent." },

  { id: "r-301", shopId: "shop-3", author: "Zulfiqar Ali", from: "Khaplu, Ghanche", rating: 5, postedAt: daysAgo(8), item: "toyota-prado-2021-skardu", text: "Bought a Prado. Their mechanic showed me the inspection sheet and the papers were clean. Smooth deal." },
  { id: "r-302", shopId: "shop-3", author: "Hassan Raza", from: "Skardu City, Skardu", rating: 4, postedAt: daysAgo(19), text: "Good showroom, prices are a little high but the cars are in good condition." },
  { id: "r-303", shopId: "shop-3", author: "Mehdi Abbas", from: "Shigar", rating: 5, postedAt: daysAgo(33), item: "suzuki-jeep-4x4-potohar-skardu", text: "They let me take the jeep to Shigar for a test drive. Honest people." },

  { id: "r-401", shopId: "shop-4", author: "Ali Madad", from: "Aliabad, Hunza", rating: 5, postedAt: daysAgo(2), item: "iphone-13-128gb-pta-gilgit", text: "iPhone 13 came to Hunza the next day. Battery health same as written. PTA approved, checked it myself." },
  { id: "r-402", shopId: "shop-4", author: "Saima Noor", from: "Jutial, Gilgit", rating: 4, postedAt: daysAgo(7), text: "Screen replaced in one hour. A bit crowded in the evening, go in the morning." },
  { id: "r-403", shopId: "shop-4", author: "Waqar Ahmed", from: "Chilas, Diamer", rating: 5, postedAt: daysAgo(14), item: "airpods-pro-2nd-gen-gilgit", text: "Sealed box, original. Cash on delivery worked fine to Chilas.", reply: "Thank you Waqar bhai, enjoy the AirPods." },
  { id: "r-404", shopId: "shop-4", author: "Iqbal Hussain", from: "Konodas, Gilgit", rating: 3, postedAt: daysAgo(30), text: "Charger was good but delivery was one day late." },

  { id: "r-501", shopId: "shop-5", author: "Tahira Batool", from: "Gilgit", rating: 5, postedAt: daysAgo(4), item: "wild-mountain-honey-nagar", text: "Pure honey, it crystallises in the cold like real honey should. They sent a sample first." },
  { id: "r-502", shopId: "shop-5", author: "Shafqat Ali", from: "Islamabad", rating: 5, postedAt: daysAgo(18), item: "raw-honeycomb-chhatta-nagar", text: "Honeycomb arrived well packed all the way to Islamabad." },

  { id: "r-601", shopId: "shop-6", author: "Maria Khan", from: "Lahore", rating: 5, postedAt: daysAgo(6), item: "pattu-woollen-shawl-ghizer", text: "Beautiful pattu shawl, warm and soft. You can tell it is handmade." },
  { id: "r-602", shopId: "shop-6", author: "Zainab Ali", from: "Skardu City, Skardu", rating: 5, postedAt: daysAgo(20), item: "hand-woven-balti-rug-4x6-khaplu", text: "Ordered a custom rug in our colours. Took three weeks and was worth the wait." },
  { id: "r-603", shopId: "shop-6", author: "Ahmed Raza", from: "Gilgit", rating: 4, postedAt: daysAgo(35), text: "Nice caps and socks. Would like more sizes." },

  { id: "r-701", shopId: "shop-7", author: "Usman Tariq", from: "Karachi", rating: 5, postedAt: daysAgo(10), item: "4-person-camping-tent-set-skardu", text: "Rented a tent and sleeping bags for Deosai. Clean, warm and the owner explained the route." },
  { id: "r-702", shopId: "shop-7", author: "Bilal Hussain", from: "Skardu City, Skardu", rating: 4, postedAt: daysAgo(24), text: "Good gear, rental rates are fair. Book early in July." },

  { id: "r-801", shopId: "shop-8", author: "Gul Muhammad", from: "Gorikot, Astore", rating: 5, postedAt: daysAgo(11), item: "astore-sheep-pair", text: "Healthy sheep, vaccination card was given. Fair price for Eid." },
  { id: "r-802", shopId: "shop-8", author: "Sher Khan", from: "Chilas, Diamer", rating: 4, postedAt: daysAgo(40), text: "They helped arrange a pickup to Chilas. Animals arrived fine." },
];
