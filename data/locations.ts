import type { District } from "@/types";
import { unsplash } from "./media";

/**
 * Gilgit-Baltistan location hierarchy: District → Tehsil → Town/Village.
 * REGO.pk is GB-only, so no Pakistan-wide locations exist anywhere in the UI.
 * In production this is seeded into the `districts`, `tehsils` and `towns`
 * tables; components only consume it through lib/data.
 */
export const districts: District[] = [
  {
    slug: "gilgit",
    name: "Gilgit",
    image: unsplash("photo-1638295516986-5b9ffeeb45fd", "", 1200, 900),
    headquarters: "Gilgit City",
    division: "Gilgit",
    activeListings: 3184,
    art: { seed: 11, palette: "dawn" },
    tehsils: [
      { slug: "gilgit", name: "Gilgit", towns: ["Jutial", "Konodas", "Kashrote", "Sonikot", "Khomer", "Nagral", "Jalalabad"] },
      { slug: "danyore", name: "Danyore", towns: ["Danyore", "Sultanabad", "Oshikhandass", "Nomal"] },
      { slug: "juglot", name: "Juglot", towns: ["Juglot", "Sai", "Bunji Road"] },
    ],
  },
  {
    slug: "skardu",
    name: "Skardu",
    image: unsplash("photo-1614703185698-5bb9810638af", "", 1200, 900),
    headquarters: "Skardu City",
    division: "Baltistan",
    activeListings: 2641,
    art: { seed: 23, palette: "stone" },
    tehsils: [
      { slug: "skardu", name: "Skardu", towns: ["Skardu City", "Hussainabad", "Sadpara", "Sundus", "Kachura", "Shigri"] },
      { slug: "gultari", name: "Gultari", towns: ["Gultari", "Olding"] },
      { slug: "gamba", name: "Gamba", towns: ["Gamba", "Thorgo"] },
    ],
  },
  {
    slug: "hunza",
    name: "Hunza",
    image: unsplash("photo-1632309378201-14f05412c697", "", 1200, 900),
    headquarters: "Aliabad",
    division: "Gilgit",
    activeListings: 1872,
    art: { seed: 37, palette: "glacier" },
    tehsils: [
      { slug: "aliabad", name: "Aliabad", towns: ["Aliabad", "Karimabad", "Altit", "Ganish", "Nasirabad", "Murtazaabad"] },
      { slug: "gojal", name: "Gojal", towns: ["Gulmit", "Passu", "Hussaini", "Sost", "Shimshal", "Chipursan"] },
    ],
  },
  {
    slug: "nagar",
    name: "Nagar",
    image: unsplash("photo-1654116001918-2ed4250cf9db", "", 1200, 900),
    headquarters: "Nagar Khas",
    division: "Gilgit",
    activeListings: 964,
    art: { seed: 41, palette: "meadow" },
    tehsils: [
      { slug: "nagar-1", name: "Nagar-I", towns: ["Nagar Khas", "Hopar", "Hakuchar", "Sumayar"] },
      { slug: "nagar-2", name: "Nagar-II", towns: ["Chalt", "Minapin", "Sikandarabad", "Ghulmet"] },
    ],
  },
  {
    slug: "shigar",
    name: "Shigar",
    image: unsplash("photo-1656105745434-ec8dc6b40f2b", "", 1200, 900),
    headquarters: "Shigar",
    division: "Baltistan",
    activeListings: 812,
    art: { seed: 53, palette: "apricot" },
    tehsils: [{ slug: "shigar", name: "Shigar", towns: ["Shigar", "Alchori", "Tisar", "Hashupi", "Chutron", "Askole"] }],
  },
  {
    slug: "ghanche",
    name: "Ghanche",
    image: unsplash("photo-1701240068416-2c276d1531f8", "", 1200, 900),
    headquarters: "Khaplu",
    division: "Baltistan",
    activeListings: 745,
    art: { seed: 61, palette: "glacier" },
    tehsils: [
      { slug: "khaplu", name: "Khaplu", towns: ["Khaplu", "Saling", "Ghowari", "Surmo"] },
      { slug: "mashabrum", name: "Mashabrum", towns: ["Machulu", "Hushe", "Kande", "Balghar"] },
      { slug: "keris", name: "Keris", towns: ["Keris", "Kuwas", "Yugo"] },
    ],
  },
  {
    slug: "kharmang",
    name: "Kharmang",
    image: unsplash("photo-1592875146220-b769961ebe54", "", 1200, 900),
    headquarters: "Tolti",
    division: "Baltistan",
    activeListings: 318,
    art: { seed: 71, palette: "stone" },
    tehsils: [{ slug: "kharmang", name: "Kharmang", towns: ["Tolti", "Mehdiabad", "Ghandus", "Kharmang", "Manthokha"] }],
  },
  {
    slug: "roundu",
    name: "Roundu",
    image: unsplash("photo-1574088394043-6ff958fe8419", "", 1200, 900),
    headquarters: "Dambudas",
    division: "Baltistan",
    activeListings: 276,
    art: { seed: 83, palette: "dusk" },
    tehsils: [{ slug: "roundu", name: "Roundu", towns: ["Dambudas", "Tormik", "Harpo", "Mendi", "Stak"] }],
  },
  {
    slug: "astore",
    name: "Astore",
    image: unsplash("photo-1664872745799-a68029e60a96", "", 1200, 900),
    headquarters: "Eidgah",
    division: "Diamer",
    activeListings: 534,
    art: { seed: 97, palette: "meadow" },
    tehsils: [
      { slug: "astore", name: "Astore", towns: ["Eidgah", "Gorikot", "Rattu", "Rama", "Minimarg"] },
      { slug: "shounter", name: "Shounter", towns: ["Shounter", "Chilim"] },
    ],
  },
  {
    slug: "ghizer",
    name: "Ghizer",
    image: unsplash("photo-1596464148416-e0916276a9f5", "", 1200, 900),
    headquarters: "Gahkuch",
    division: "Gilgit",
    activeListings: 689,
    art: { seed: 103, palette: "dawn" },
    tehsils: [
      { slug: "punial", name: "Punial", towns: ["Gahkuch", "Sherqilla", "Singal", "Gich"] },
      { slug: "ishkoman", name: "Ishkoman", towns: ["Chatorkhand", "Imit", "Ishkoman"] },
      { slug: "gupis", name: "Gupis", towns: ["Gupis", "Phander", "Yasin", "Teru"] },
    ],
  },
  {
    slug: "diamer",
    name: "Diamer",
    image: unsplash("photo-1760366371766-1feff5bf14be", "", 1200, 900),
    headquarters: "Chilas",
    division: "Diamer",
    activeListings: 587,
    art: { seed: 113, palette: "dusk" },
    tehsils: [
      { slug: "chilas", name: "Chilas", towns: ["Chilas", "Thor", "Goner Farm", "Babusar"] },
      { slug: "darel", name: "Darel", towns: ["Darel", "Gumari"] },
      { slug: "tangir", name: "Tangir", towns: ["Tangir", "Jaglot Tangir"] },
    ],
  },
];

export const districtBySlug = Object.fromEntries(districts.map((d) => [d.slug, d])) as Record<
  District["slug"],
  District
>;
