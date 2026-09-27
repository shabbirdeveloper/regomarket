/** Help centre questions, grouped by topic. */
export interface Faq {
  topic: "buying" | "selling" | "shops" | "account";
  q: string;
  a: string;
  /** Optional link shown under the answer */
  link?: { href: string; label: string };
}

export const helpTopics = [
  { id: "buying", title: "Buying", sub: "Finding items, chatting, orders" },
  { id: "selling", title: "Selling", sub: "Posting ads, photos, prices" },
  { id: "shops", title: "Shops", sub: "Opening a shop, orders, verification" },
  { id: "account", title: "Account & safety", sub: "Sign in, privacy, reporting" },
] as const;

export const faqs: Faq[] = [
  { topic: "buying", q: "How do I contact a seller?", a: "Open the ad and tap Chat, WhatsApp or Show phone. Chatting on REGOMARKET keeps your number private and keeps a record of what you agreed.", link: { href: "/messages", label: "Open messages" } },
  { topic: "buying", q: "Which items can I order online?", a: "Items with the green “Delivery” tag come from verified shops that deliver across GB. You can order them with Cash on delivery. Other items are bought in person after chatting with the seller.", link: { href: "/search?delivery=1", label: "See items with delivery" } },
  { topic: "buying", q: "How much is delivery and how long does it take?", a: "Inside the shop's own district it's usually Rs 150 and arrives the next day. Anywhere else in GB it's about Rs 250 and takes 1–3 days. You see the exact fee before you place the order." },
  { topic: "buying", q: "Can I cancel an order?", a: "Yes, for free until the shop confirms it. After that, message the shop from your order." },
  { topic: "buying", q: "I can't find what I need. What can I do?", a: "Post a Wanted request with what you need, your budget and your town. Sellers will send you offers.", link: { href: "/wanted/new", label: "Post a request" } },
  { topic: "selling", q: "Is posting an ad free?", a: "Yes. Posting ads is free for everyone in Gilgit-Baltistan." },
  { topic: "selling", q: "Why is my ad “In review”?", a: "New ads are checked for photos, category and prohibited items. Most go live within 2 hours." },
  { topic: "selling", q: "How do I take good photos?", a: "Use daylight, a clean background and show the item from 3–4 sides. For dry fruits, show a close-up. For livestock, show the whole animal standing." },
  { topic: "selling", q: "How do I mark an item as sold?", a: "Go to My account → My ads, tap the ••• menu on the ad and choose Mark as sold.", link: { href: "/dashboard", label: "Go to my ads" } },
  { topic: "shops", q: "Who can open a shop?", a: "Any business in GB: a shop in a bazaar, a farm, a trader, or a home business. It's free to start.", link: { href: "/create-shop", label: "Create your shop" } },
  { topic: "shops", q: "How do I get the verified badge?", a: "After you create your shop we call you and check the owner's CNIC and a photo of the shop or a trade licence. This usually takes one working day.", link: { href: "/help/verification", label: "About badges" } },
  { topic: "shops", q: "How do online orders work for shops?", a: "Turn on “Take orders” in your shop settings. You get a notification for each order, confirm it, deliver it, and collect cash on delivery or payment to your wallet." },
  { topic: "account", q: "How do I sign in?", a: "Enter your mobile number and the 6-digit code we send by SMS. There is no password to remember.", link: { href: "/login", label: "Sign in" } },
  { topic: "account", q: "Who can see my phone number?", a: "Only signed-in users who tap “Show phone” on your ad, and only if you allow it. You can also choose chat-only." },
  { topic: "account", q: "How do I report a scam or a fake ad?", a: "Use the report form with the ad link. Our team replies within a day and removes ads that break the rules.", link: { href: "/help/report", label: "Report a problem" } },
];
