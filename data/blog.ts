import type { Media } from "@/types";
import { unsplash } from "./media";

export type Block = { h2: string } | { p: string } | { ul: string[] } | { tip: string };

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: "Guides" | "Selling tips" | "Safety" | "Local";
  date: string; // ISO
  readMins: number;
  cover: Media;
  body: Block[];
}

export const posts: Post[] = [
  {
    slug: "how-to-choose-good-dried-apricots",
    title: "How to choose good dried apricots (khubani)",
    excerpt: "Colour, smell, sulphur and grades: what to check before you buy by the KG or the maund.",
    category: "Guides",
    date: "2026-09-20",
    readMins: 4,
    cover: unsplash("photo-1784043436919-28fd8e17ff3c", "Golden dried apricots", 1400, 800),
    body: [
      { p: "Gilgit-Baltistan grows some of the best apricots in the world, and after the harvest most of them are dried on rooftops. Here is how to tell good khubani from average." },
      { h2: "1. Look at the colour" },
      { p: "Naturally sun-dried apricots are orange-brown, sometimes darker. Very bright orange often means they were treated with sulphur to keep the colour. Not harmful in small amounts, but not “organic”." },
      { h2: "2. Smell and taste" },
      { p: "Good khubani smells sweet, like fruit. A sharp or sour smell is a sign of sulphur or of fruit that was dried badly. Ask the seller for one to taste." },
      { h2: "3. Feel them" },
      { ul: ["Soft and slightly sticky: fresh, this year's crop.", "Very hard and dusty: old stock or dried too long.", "White powder on the skin can be natural sugar. Mould is green or grey and fluffy."] },
      { h2: "4. Know the grades" },
      { p: "Sellers usually sell Premium (large, even colour, whole), A Grade and Standard. Standard is fine for cooking and jam and costs much less." },
      { tip: "Buying in bulk? Ask for the harvest year and a 1 KG sample first. Good sellers on REGOMARKET show the grade and harvest on the ad." },
    ],
  },
  {
    slug: "buying-livestock-for-eid-safely",
    title: "Buying a goat or sheep for Eid: a checklist",
    excerpt: "Teeth, eyes, walk, weight and papers. Ten minutes of checks that save you trouble later.",
    category: "Safety",
    date: "2026-09-12",
    readMins: 5,
    cover: unsplash("photo-1602027438676-ad64751bdbc1", "Sheep on a green pasture", 1400, 800),
    body: [
      { p: "Every year thousands of animals change hands in Astore, Skardu and Gilgit before Eid. A few simple checks help you bring home a healthy animal at a fair price." },
      { h2: "Before you go" },
      { ul: ["Decide your budget and the size you need.", "Chat with the seller first: age, breed, weight, vaccination.", "Ask for a short video of the animal walking."] },
      { h2: "At the pen" },
      { ul: ["Eyes clear and bright, no discharge from the nose.", "Walks normally, no limping.", "Teeth: for Qurbani, check the animal has the right teeth for its age.", "Coat clean and shiny, belly not swollen."] },
      { h2: "Paying" },
      { p: "Pay only after you have checked the animal yourself, ideally in cash or by transfer while you are standing there. Never send an advance to reserve an animal you haven't seen." },
      { tip: "Shops like Astore Livestock Traders show vaccination on the ad. Look for “Vaccinated: Yes” in the details." },
    ],
  },
  {
    slug: "photos-that-sell-faster",
    title: "5 photo tips that sell your item faster",
    excerpt: "You don't need a new phone. Daylight, a clean background and the right angles do the work.",
    category: "Selling tips",
    date: "2026-09-02",
    readMins: 3,
    cover: unsplash("photo-1495707902641-75cac588d2e9", "Camera on a table", 1400, 800),
    body: [
      { p: "Ads with good photos get many more chats. Here's how to take them with the phone you already have." },
      { h2: "1. Use daylight" },
      { p: "Stand near a window or go outside. Avoid the flash; it makes colours look wrong." },
      { h2: "2. Clean background" },
      { p: "A plain wall, a clean floor, or a cloth. Remove other things from the photo." },
      { h2: "3. Show every side" },
      { p: "Front, back, sides and close-ups of any marks or damage. Honest photos bring serious buyers." },
      { h2: "4. Show the scale" },
      { p: "Put a hand or a common object next to small items so buyers understand the size." },
      { h2: "5. First photo is the cover" },
      { p: "Pick your best one as the cover. On REGOMARKET you can tap “Make cover” on any photo." },
      { tip: "Selling dry fruits or honey? Take one close-up in daylight: people buy with their eyes." },
    ],
  },
];
