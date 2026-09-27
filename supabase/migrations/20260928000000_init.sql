-- =====================================================================
-- REGOMARKET — initial database schema (Supabase / Postgres)
-- Mirrors the TypeScript types in /types so lib/data can switch from the
-- mock files in /data to these tables without touching any page.
--
-- Run in the Supabase dashboard → SQL Editor (paste the whole file), or
-- with the CLI: `npx supabase db push`.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Reference data (public, read-only for users)
-- ---------------------------------------------------------------------

create table public.districts (
  slug            text primary key,
  name            text not null,
  headquarters    text not null,
  division        text not null check (division in ('Gilgit', 'Baltistan', 'Diamer')),
  sort            int  not null default 0
);

create table public.categories (
  slug            text primary key,
  name            text not null,
  short_name      text not null,
  icon            text not null,
  description     text not null default '',
  image_url       text,
  sort            int  not null default 0
);

create table public.bazaars (
  slug            text primary key,
  name            text not null,
  district        text not null references public.districts(slug),
  town            text not null,
  description     text not null default '',
  image_url       text,
  highlights      text[] not null default '{}',
  shop_count      int  not null default 0,
  product_count   int  not null default 0,
  new_today       int  not null default 0
);

-- ---------------------------------------------------------------------
-- Sellers (people and shops). Demo sellers have no user_id; real
-- accounts get a row automatically when they sign up (trigger below).
-- The full phone number lives in seller_contacts, never in this table.
-- ---------------------------------------------------------------------

create table public.sellers (
  id              text primary key default ('u-' || replace(gen_random_uuid()::text, '-', '')),
  user_id         uuid unique references auth.users(id) on delete cascade,
  type            text not null default 'individual' check (type in ('individual', 'shop')),
  name            text not null,
  shop_slug       text,
  verifications   text[] not null default '{phone}',
  member_since    date not null default current_date,
  district        text references public.districts(slug),
  tehsil          text,
  town            text,
  phone_masked    text not null default '',
  whatsapp        boolean not null default true,
  rating          numeric(2,1),
  review_count    int not null default 0,
  response_time   text,
  accepts_orders  boolean not null default false,
  delivery        boolean not null default false,
  deals           int not null default 0,
  created_at      timestamptz not null default now()
);

create table public.seller_contacts (
  seller_id       text primary key references public.sellers(id) on delete cascade,
  phone           text not null
);

-- ---------------------------------------------------------------------
-- Shops (digital storefronts)
-- ---------------------------------------------------------------------

create table public.shops (
  id              text primary key default ('shop-' || replace(gen_random_uuid()::text, '-', '')),
  slug            text not null unique,
  seller_id       text not null unique references public.sellers(id) on delete cascade,
  name            text not null,
  tagline         text not null default '',
  category        text not null references public.categories(slug),
  district        text not null references public.districts(slug),
  tehsil          text,
  town            text,
  bazaar          text references public.bazaars(slug),
  verifications   text[] not null default '{phone}',
  rating          numeric(2,1) not null default 0,
  review_count    int not null default 0,
  followers       int not null default 0,
  trade_mode      text not null default 'retail' check (trade_mode in ('retail', 'wholesale', 'both')),
  delivery        boolean not null default false,
  accepts_orders  boolean not null default false,
  hours           jsonb not null default '{"open":"09:00","close":"20:00","days":"Mon – Sat"}',
  cover_url       text,
  logo_url        text,
  monogram        text not null default '',
  -- storefront profile
  about           text[] not null default '{}',
  founded         int,
  payments        text[] not null default '{"Cash on delivery"}',
  delivery_note   text not null default '',
  highlights      text[] not null default '{}',
  address         text not null default '',
  status          text not null default 'pending' check (status in ('pending', 'active', 'suspended')),
  created_at      timestamptz not null default now()
);

alter table public.sellers
  add constraint sellers_shop_slug_fk foreign key (shop_slug) references public.shops(slug) deferrable initially deferred;

-- ---------------------------------------------------------------------
-- Listings (ads)
-- ---------------------------------------------------------------------

create table public.listings (
  id              text primary key default ('l-' || replace(gen_random_uuid()::text, '-', '')),
  slug            text not null unique,
  seller_id       text not null references public.sellers(id) on delete cascade,
  title           text not null check (char_length(title) between 3 and 90),
  description     text not null default '',
  category        text not null references public.categories(slug),
  district        text not null references public.districts(slug),
  tehsil          text,
  town            text,
  price           bigint not null check (price >= 0),
  unit            text check (unit in ('kg', 'maund', 'piece', 'month', 'day', 'litre', 'dozen', 'kanal', 'bottle')),
  negotiable      boolean not null default false,
  images          jsonb not null default '[]',   -- [{ "src": "...", "alt": "..." }]
  badges          text[] not null default '{}',
  tag             text,
  condition       text check (condition in ('new', 'used', 'like-new', 'refurbished')),
  wholesale       boolean not null default false,
  delivery        boolean not null default false,
  livestock       jsonb,
  produce         jsonb,
  attributes      jsonb,
  views           int not null default 0,
  status          text not null default 'pending' check (status in ('pending', 'active', 'sold', 'expired', 'removed')),
  posted_at       timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index listings_feed_idx     on public.listings (status, posted_at desc);
create index listings_category_idx on public.listings (category, status);
create index listings_district_idx on public.listings (district, status);
create index listings_seller_idx   on public.listings (seller_id);
-- Simple full-text search on title (search page can use .textSearch('search', ...))
alter table public.listings add column search tsvector
  generated always as (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(tag, '') || ' ' || coalesce(town, ''))) stored;
create index listings_search_idx on public.listings using gin (search);

-- ---------------------------------------------------------------------
-- Wanted (buyer requests) and offers
-- ---------------------------------------------------------------------

create table public.wanted_requests (
  id              text primary key default ('w-' || replace(gen_random_uuid()::text, '-', '')),
  slug            text not null unique,
  buyer_id        text references public.sellers(id) on delete cascade,
  buyer_name      text not null,
  buyer_type      text not null default 'Individual' check (buyer_type in ('Business', 'Individual')),
  buyer_verified  boolean not null default false,
  title           text not null,
  category        text not null references public.categories(slug),
  district        text not null references public.districts(slug),
  town            text,
  budget_min      bigint,
  budget_max      bigint,
  unit            text,
  negotiable      boolean not null default false,
  mode            text not null check (mode in ('Wholesale', 'Retail', 'Bulk', 'Rent')),
  quantity        text,
  details         text,
  need_by         text,
  offers          int not null default 0,
  status          text not null default 'open' check (status in ('open', 'closed')),
  posted_at       timestamptz not null default now()
);

create table public.wanted_offers (
  id              uuid primary key default gen_random_uuid(),
  request_id      text not null references public.wanted_requests(id) on delete cascade,
  seller_id       text not null references public.sellers(id) on delete cascade,
  price           bigint not null check (price > 0),
  message         text not null default '',
  created_at      timestamptz not null default now(),
  unique (request_id, seller_id)
);

-- ---------------------------------------------------------------------
-- Reviews, saves, follows
-- ---------------------------------------------------------------------

create table public.shop_reviews (
  id              text primary key default ('r-' || replace(gen_random_uuid()::text, '-', '')),
  shop_id         text not null references public.shops(id) on delete cascade,
  author_id       text references public.sellers(id) on delete set null,
  author          text not null,
  from_place      text not null default '',
  rating          int not null check (rating between 1 and 5),
  text            text not null,
  item            text references public.listings(slug) on delete set null,
  reply           text,
  posted_at       timestamptz not null default now()
);

create table public.saved_listings (
  user_id         uuid not null references auth.users(id) on delete cascade,
  listing_id      text not null references public.listings(id) on delete cascade,
  created_at      timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table public.shop_follows (
  user_id         uuid not null references auth.users(id) on delete cascade,
  shop_id         text not null references public.shops(id) on delete cascade,
  created_at      timestamptz not null default now(),
  primary key (user_id, shop_id)
);

-- ---------------------------------------------------------------------
-- Messages
-- ---------------------------------------------------------------------

create table public.conversations (
  id              uuid primary key default gen_random_uuid(),
  listing_id      text not null references public.listings(id) on delete cascade,
  buyer_user_id   uuid not null references auth.users(id) on delete cascade,
  seller_id       text not null references public.sellers(id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  unique (listing_id, buyer_user_id)
);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_user_id  uuid not null references auth.users(id) on delete cascade,
  body            text not null default '' check (char_length(body) <= 2000),
  offer           bigint check (offer > 0),
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- ---------------------------------------------------------------------
-- Orders (verified shops only)
-- ---------------------------------------------------------------------

create table public.orders (
  id              text primary key default ('RM-' || lpad((floor(random() * 1000000))::text, 6, '0')),
  buyer_user_id   uuid not null references auth.users(id) on delete restrict,
  shop_id         text not null references public.shops(id) on delete restrict,
  listing_id      text not null references public.listings(id) on delete restrict,
  qty             int not null check (qty between 1 and 999),
  unit_price      bigint not null,
  delivery_fee    bigint not null default 0,
  total           bigint not null,
  payment         text not null check (payment in ('cod', 'easypaisa', 'jazzcash', 'bank')),
  ship_name       text not null,
  ship_phone      text not null,
  ship_district   text not null references public.districts(slug),
  ship_town       text,
  ship_address    text not null,
  note            text,
  status          text not null default 'placed' check (status in ('placed', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Notifications, reports, contact
-- ---------------------------------------------------------------------

create table public.notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  kind            text not null check (kind in ('message', 'offer', 'price', 'follow', 'wanted', 'system', 'review')),
  title           text not null,
  body            text not null default '',
  href            text not null default '/',
  read            boolean not null default false,
  created_at      timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

create table public.reports (
  id              uuid primary key default gen_random_uuid(),
  reporter_id     uuid references auth.users(id) on delete set null,
  target_kind     text not null check (target_kind in ('ad', 'user', 'shop')),
  target          text not null,
  reason          text not null,
  details         text,
  status          text not null default 'open',
  created_at      timestamptz not null default now()
);

create table public.contact_messages (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  reach           text not null,
  topic           text not null,
  message         text not null check (char_length(message) <= 3000),
  created_at      timestamptz not null default now()
);

-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table public.districts        enable row level security;
alter table public.categories       enable row level security;
alter table public.bazaars          enable row level security;
alter table public.sellers          enable row level security;
alter table public.seller_contacts  enable row level security;
alter table public.shops            enable row level security;
alter table public.listings         enable row level security;
alter table public.wanted_requests  enable row level security;
alter table public.wanted_offers    enable row level security;
alter table public.shop_reviews     enable row level security;
alter table public.saved_listings   enable row level security;
alter table public.shop_follows     enable row level security;
alter table public.conversations    enable row level security;
alter table public.messages         enable row level security;
alter table public.orders           enable row level security;
alter table public.notifications    enable row level security;
alter table public.reports          enable row level security;
alter table public.contact_messages enable row level security;

-- helper: the seller row of the signed-in user
create or replace function public.my_seller_id() returns text
  language sql stable security definer set search_path = public
  as $$ select id from public.sellers where user_id = auth.uid() $$;

-- Public reference data
create policy "read districts"  on public.districts  for select using (true);
create policy "read categories" on public.categories for select using (true);
create policy "read bazaars"    on public.bazaars    for select using (true);

-- Sellers: public profile; owners edit their own
create policy "read sellers"       on public.sellers for select using (true);
create policy "update own seller"  on public.sellers for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Phone numbers: owners manage their own; everyone else gets one number at a
-- time through reveal_phone() (signed-in only), so the list can't be scraped.
create policy "own contact" on public.seller_contacts for all
  using (seller_id = public.my_seller_id()) with check (seller_id = public.my_seller_id());

create or replace function public.reveal_phone(p_seller_id text) returns text
  language plpgsql stable security definer set search_path = public
  as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in to see phone numbers';
  end if;
  return (select phone from public.seller_contacts where seller_id = p_seller_id);
end $$;
revoke all on function public.reveal_phone(text) from public, anon;
grant execute on function public.reveal_phone(text) to authenticated;

-- Shops: active shops are public; owners see and edit theirs
create policy "read shops"      on public.shops for select using (status = 'active' or seller_id = public.my_seller_id());
create policy "create own shop" on public.shops for insert with check (seller_id = public.my_seller_id() and status = 'pending');
create policy "update own shop" on public.shops for update using (seller_id = public.my_seller_id()) with check (seller_id = public.my_seller_id());

-- Listings: live ads are public; owners see all of theirs and manage them
create policy "read listings"      on public.listings for select using (status = 'active' or seller_id = public.my_seller_id());
create policy "create own listing" on public.listings for insert with check (seller_id = public.my_seller_id() and status = 'pending');
create policy "update own listing" on public.listings for update using (seller_id = public.my_seller_id()) with check (seller_id = public.my_seller_id());
create policy "delete own listing" on public.listings for delete using (seller_id = public.my_seller_id());

-- Wanted
create policy "read wanted"       on public.wanted_requests for select using (status = 'open' or buyer_id = public.my_seller_id());
create policy "create own wanted" on public.wanted_requests for insert with check (buyer_id = public.my_seller_id());
create policy "update own wanted" on public.wanted_requests for update using (buyer_id = public.my_seller_id());

create policy "send offer"  on public.wanted_offers for insert with check (seller_id = public.my_seller_id());
create policy "read offers" on public.wanted_offers for select using (
  seller_id = public.my_seller_id()
  or exists (select 1 from public.wanted_requests w where w.id = request_id and w.buyer_id = public.my_seller_id())
);

-- Reviews: public; signed-in users write their own
create policy "read reviews"  on public.shop_reviews for select using (true);
create policy "write review"  on public.shop_reviews for insert with check (author_id = public.my_seller_id());
create policy "shop replies"  on public.shop_reviews for update using (
  exists (select 1 from public.shops s where s.id = shop_id and s.seller_id = public.my_seller_id())
);

-- Saves and follows: private to the user
create policy "own saves"   on public.saved_listings for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own follows" on public.shop_follows   for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Conversations: only the buyer and the seller
create policy "read own conversations" on public.conversations for select using (
  buyer_user_id = auth.uid() or seller_id = public.my_seller_id()
);
create policy "start conversation" on public.conversations for insert with check (buyer_user_id = auth.uid());

create policy "read own messages" on public.messages for select using (
  exists (select 1 from public.conversations c where c.id = conversation_id
          and (c.buyer_user_id = auth.uid() or c.seller_id = public.my_seller_id()))
);
create policy "send message" on public.messages for insert with check (
  sender_user_id = auth.uid()
  and exists (select 1 from public.conversations c where c.id = conversation_id
              and (c.buyer_user_id = auth.uid() or c.seller_id = public.my_seller_id()))
);

-- Orders: buyer and the shop
create policy "read own orders" on public.orders for select using (
  buyer_user_id = auth.uid()
  or exists (select 1 from public.shops s where s.id = shop_id and s.seller_id = public.my_seller_id())
);
create policy "place order" on public.orders for insert with check (buyer_user_id = auth.uid() and status = 'placed');
create policy "shop updates order" on public.orders for update using (
  exists (select 1 from public.shops s where s.id = shop_id and s.seller_id = public.my_seller_id())
  or (buyer_user_id = auth.uid() and status = 'placed')
);

-- Notifications: own only
create policy "own notifications"        on public.notifications for select using (user_id = auth.uid());
create policy "mark own notifications"   on public.notifications for update using (user_id = auth.uid());

-- Reports and contact: anyone can send, nobody can read through the API
create policy "send report"  on public.reports          for insert with check (true);
create policy "send contact" on public.contact_messages for insert with check (true);

-- =====================================================================
-- Triggers
-- =====================================================================

-- New auth user (phone OTP sign-up) → seller row with a masked number
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public
  as $$
declare
  p text := coalesce(new.phone, '');
begin
  insert into public.sellers (user_id, name, phone_masked, verifications)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), 'New user'),
    case when length(p) >= 7 then '0' || substr(p, length(p) - 9, 3) || ' •••• ' || right(p, 3) else '' end,
    '{phone}'
  );
  if p <> '' then
    insert into public.seller_contacts (seller_id, phone)
    select id, '+' || ltrim(p, '+') from public.sellers where user_id = new.id;
  end if;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep counters in sync
create or replace function public.bump_offer_count() returns trigger
  language plpgsql security definer set search_path = public
  as $$ begin
    update public.wanted_requests set offers = offers + 1 where id = new.request_id;
    return new;
  end $$;
create trigger on_offer_created after insert on public.wanted_offers
  for each row execute function public.bump_offer_count();

create or replace function public.touch_conversation() returns trigger
  language plpgsql security definer set search_path = public
  as $$ begin
    update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
    return new;
  end $$;
create trigger on_message_created after insert on public.messages
  for each row execute function public.touch_conversation();

create or replace function public.follow_count() returns trigger
  language plpgsql security definer set search_path = public
  as $$ begin
    if tg_op = 'INSERT' then update public.shops set followers = followers + 1 where id = new.shop_id;
    else update public.shops set followers = greatest(0, followers - 1) where id = old.shop_id; end if;
    return null;
  end $$;
create trigger on_follow_change after insert or delete on public.shop_follows
  for each row execute function public.follow_count();

create or replace function public.touch_listing() returns trigger
  language plpgsql as $$ begin new.updated_at := now(); return new; end $$;
create trigger on_listing_update before update on public.listings
  for each row execute function public.touch_listing();

-- Realtime for chat
alter publication supabase_realtime add table public.messages;

-- =====================================================================
-- Storage: public listing photos; users upload only into their own folder
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('listing-images', 'listing-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('shop-media',     'shop-media',     true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('verification',   'verification',   false, 10485760, array['image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do nothing;

create policy "public read photos" on storage.objects for select
  using (bucket_id in ('listing-images', 'shop-media'));
create policy "upload own photos" on storage.objects for insert to authenticated
  with check (bucket_id in ('listing-images', 'shop-media', 'verification') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "delete own photos" on storage.objects for delete to authenticated
  using (bucket_id in ('listing-images', 'shop-media') and (storage.foldername(name))[1] = auth.uid()::text);
