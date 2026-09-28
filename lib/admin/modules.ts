import {
  Activity,
  BadgeCheck,
  BookOpenText,
  Flag,
  FolderTree,
  Inbox,
  LayoutDashboard,
  Map,
  Megaphone,
  MessageSquareQuote,
  Package,
  Search,
  Settings,
  Store,
  Tag,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import type { AdminRole } from "./types";

/**
 * The admin panel is a set of independent modules. Each one owns:
 *   app/admin/(panel)/<key>/page.tsx      the route
 *   components/admin/<key>/*              its UI
 *   lib/admin/data.ts → get<Key>()        its data
 * This registry drives the sidebar, the command palette, the badges and the
 * role check, so adding a module is one entry here plus its folder.
 */

export type ModuleKey =
  | "overview"
  | "listings"
  | "shops"
  | "users"
  | "verifications"
  | "reports"
  | "reviews"
  | "wanted"
  | "orders"
  | "inbox"
  | "announcements"
  | "categories"
  | "bazaars"
  | "locations"
  | "blog"
  | "settings"
  | "activity";

export interface AdminModule {
  key: ModuleKey;
  label: string;
  href: string;
  icon: LucideIcon;
  group: "Main" | "Marketplace" | "People" | "Trust & safety" | "Business" | "Content" | "System";
  description: string;
  /** Lowest role that can open it */
  minRole: AdminRole;
  /** Shows a live count of items waiting for action */
  queue?: boolean;
  keywords?: string;
}

export const ADMIN_MODULES: AdminModule[] = [
  { key: "overview", label: "Overview", href: "/admin", icon: LayoutDashboard, group: "Main", minRole: "support", description: "Numbers, trends and what needs attention", keywords: "dashboard home stats" },

  { key: "listings", label: "Ads", href: "/admin/listings", icon: Tag, group: "Marketplace", minRole: "moderator", queue: true, description: "Approve, reject and manage every ad", keywords: "listings products approve reject" },
  { key: "shops", label: "Shops", href: "/admin/shops", icon: Store, group: "Marketplace", minRole: "moderator", queue: true, description: "Shop applications, suspensions and ordering", keywords: "stores storefront" },
  { key: "wanted", label: "Wanted", href: "/admin/wanted", icon: Search, group: "Marketplace", minRole: "moderator", description: "Buyer requests and offers", keywords: "requests buyers" },

  { key: "users", label: "Users", href: "/admin/users", icon: Users, group: "People", minRole: "moderator", description: "Buyers and sellers, suspend or ban", keywords: "people sellers buyers ban" },
  { key: "verifications", label: "Verifications", href: "/admin/verifications", icon: BadgeCheck, group: "People", minRole: "moderator", queue: true, description: "CNIC and business checks", keywords: "cnic id kyc business verify" },

  { key: "reports", label: "Reports", href: "/admin/reports", icon: Flag, group: "Trust & safety", minRole: "moderator", queue: true, description: "Complaints about ads, users and shops", keywords: "complaints flags scam fraud" },
  { key: "reviews", label: "Reviews", href: "/admin/reviews", icon: MessageSquareQuote, group: "Trust & safety", minRole: "moderator", queue: true, description: "Shop reviews and flagged content", keywords: "ratings feedback" },

  { key: "orders", label: "Orders", href: "/admin/orders", icon: Package, group: "Business", minRole: "support", queue: true, description: "Orders placed with verified shops", keywords: "checkout cod delivery" },
  { key: "inbox", label: "Inbox", href: "/admin/inbox", icon: Inbox, group: "Business", minRole: "support", queue: true, description: "Messages from the contact form", keywords: "contact support messages" },
  { key: "announcements", label: "Announcements", href: "/admin/announcements", icon: Megaphone, group: "Business", minRole: "admin", description: "Site banner and notifications to users", keywords: "broadcast notify banner push" },

  { key: "categories", label: "Categories", href: "/admin/categories", icon: FolderTree, group: "Content", minRole: "admin", description: "Order, names and visibility", keywords: "taxonomy" },
  { key: "bazaars", label: "Bazaars", href: "/admin/bazaars", icon: Warehouse, group: "Content", minRole: "admin", description: "Local bazaars and markets", keywords: "markets" },
  { key: "locations", label: "Locations", href: "/admin/locations", icon: Map, group: "Content", minRole: "admin", description: "Districts, tehsils and towns", keywords: "districts towns tehsil" },
  { key: "blog", label: "Blog", href: "/admin/blog", icon: BookOpenText, group: "Content", minRole: "admin", description: "Guides and news posts", keywords: "posts articles" },

  { key: "settings", label: "Settings", href: "/admin/settings", icon: Settings, group: "System", minRole: "admin", description: "Site details, rules and admin team", keywords: "config team roles" },
  { key: "activity", label: "Activity log", href: "/admin/activity", icon: Activity, group: "System", minRole: "admin", description: "Every admin action, who and when", keywords: "audit history" },
];

export const MODULE_GROUPS = ["Main", "Marketplace", "People", "Trust & safety", "Business", "Content", "System"] as const;

export const moduleByKey = Object.fromEntries(ADMIN_MODULES.map((m) => [m.key, m])) as Record<ModuleKey, AdminModule>;

const RANK: Record<AdminRole, number> = { support: 1, moderator: 2, admin: 3, owner: 4 };
export const canOpen = (role: AdminRole, m: AdminModule) => RANK[role] >= RANK[m.minRole];

export const ROLE_LABEL: Record<AdminRole, string> = {
  owner: "Owner",
  admin: "Admin",
  moderator: "Moderator",
  support: "Support",
};

export const ROLE_NOTE: Record<AdminRole, string> = {
  owner: "Everything, including the admin team",
  admin: "Everything except the admin team",
  moderator: "Ads, shops, users, verifications, reports, reviews",
  support: "Overview, orders and the inbox",
};
