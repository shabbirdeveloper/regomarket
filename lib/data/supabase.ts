/**
 * Supabase integration point (not active yet).
 *
 * Planned tables — match the types in /types:
 *   districts(slug, name, headquarters, division)
 *   tehsils(slug, district_slug, name)
 *   towns(id, tehsil_slug, name)
 *   categories(slug, name, short_name, icon, sort)
 *   sellers(id, type, name, shop_slug, member_since, district, town, phone, whatsapp)
 *   seller_verifications(seller_id, level, verified_at)      -- never stores documents publicly
 *   shops(id, slug, seller_id, name, tagline, category, district, tehsil, town, trade_mode, delivery, hours jsonb, cover_url, logo_url)
 *   listings(id, slug, seller_id, category, title, price, unit, negotiable, district, tehsil, town, condition,
 *            wholesale, delivery, badges text[], attributes jsonb, livestock jsonb, produce jsonb, status, posted_at)
 *   listing_images(listing_id, url, alt, sort)
 *   wanted_requests(id, slug, buyer_id, category, title, quantity, budget_min, budget_max, unit, negotiable, mode, district, town)
 *   wanted_offers(id, request_id, seller_id, message, price)
 *   bazaars(slug, name, district, town, description)
 *   saved_listings(user_id, listing_id), shop_follows(user_id, shop_id)
 *   conversations / messages
 *
 * To activate: `npm i @supabase/supabase-js`, create a server client here and
 * re-implement the functions in ./index.ts with the same signatures.
 */
export const SUPABASE_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
