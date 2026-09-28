-- =====================================================================
-- REGOMARKET — admin panel (roles, moderation, audit log, settings)
--
-- Run AFTER 20260928000000_init.sql (Supabase → SQL Editor → paste → Run).
--
-- Make yourself the first owner (after you have signed in once with your
-- phone on the site). In the SQL editor:
--
--   insert into public.admins (user_id, name, role)
--   select id, 'Shabbir Hussain', 'owner' from auth.users where phone = '92355XXXXXXX';
--
-- The SQL editor runs as the database owner, so this works even though
-- normal users can never write to `admins`.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------

create table public.admins (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  name            text not null,
  role            text not null check (role in ('owner', 'admin', 'moderator', 'support')),
  created_at      timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.admin_rank(r text) returns int
  language sql immutable
  as $$ select case r when 'owner' then 4 when 'admin' then 3 when 'moderator' then 2 when 'support' then 1 else 0 end $$;

-- True when the signed-in user is an admin with at least `min_role`.
create or replace function public.is_admin(min_role text default 'support') returns boolean
  language sql stable security definer set search_path = public
  as $$
    select exists (
      select 1 from public.admins a
      where a.user_id = auth.uid() and public.admin_rank(a.role) >= public.admin_rank(min_role)
    )
  $$;

create policy "team sees team"     on public.admins for select using (public.is_admin('support'));
create policy "owner manages team" on public.admins for all using (public.is_admin('owner')) with check (public.is_admin('owner'));

-- ---------------------------------------------------------------------
-- Moderation columns on existing tables
-- ---------------------------------------------------------------------

alter table public.listings
  drop constraint if exists listings_status_check,
  add constraint listings_status_check check (status in ('pending', 'active', 'rejected', 'sold', 'expired', 'removed')),
  add column if not exists moderation_reason text,
  add column if not exists flags text[] not null default '{}',
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

alter table public.shops
  drop constraint if exists shops_status_check,
  add constraint shops_status_check check (status in ('pending', 'active', 'suspended', 'rejected')),
  add column if not exists moderation_reason text,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

alter table public.sellers
  add column if not exists status text not null default 'active' check (status in ('active', 'suspended', 'banned'));

-- Why an account was suspended stays private (sellers rows are public).
create table public.seller_moderation (
  seller_id       text primary key references public.sellers(id) on delete cascade,
  reason          text,
  updated_by      uuid references auth.users(id) on delete set null,
  updated_at      timestamptz not null default now()
);
alter table public.seller_moderation enable row level security;
create policy "mods read seller notes" on public.seller_moderation for select using (public.is_admin('moderator'));

alter table public.wanted_requests
  drop constraint if exists wanted_requests_status_check,
  add constraint wanted_requests_status_check check (status in ('open', 'closed', 'removed'));

alter table public.shop_reviews
  add column if not exists status text not null default 'published' check (status in ('published', 'flagged', 'hidden')),
  add column if not exists flag_reason text;

alter table public.reports
  drop constraint if exists reports_target_kind_check,
  add constraint reports_target_kind_check check (target_kind in ('ad', 'user', 'shop', 'review')),
  add constraint reports_status_check check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  add column if not exists resolution text,
  add column if not exists handled_by uuid references auth.users(id) on delete set null,
  add column if not exists handled_at timestamptz;

alter table public.contact_messages
  add column if not exists status text not null default 'new' check (status in ('new', 'replied', 'closed')),
  add column if not exists reply text,
  add column if not exists replied_by uuid references auth.users(id) on delete set null,
  add column if not exists replied_at timestamptz;

alter table public.categories add column if not exists visible boolean not null default true;
alter table public.bazaars    add column if not exists visible boolean not null default true;

-- Suspended / banned sellers disappear from the public site with their ads and shop.
drop policy if exists "read listings" on public.listings;
create policy "read listings" on public.listings for select using (
  (status = 'active' and exists (select 1 from public.sellers s where s.id = seller_id and s.status = 'active'))
  or seller_id = public.my_seller_id()
);
drop policy if exists "read shops" on public.shops;
create policy "read shops" on public.shops for select using (
  (status = 'active' and exists (select 1 from public.sellers s where s.id = seller_id and s.status = 'active'))
  or seller_id = public.my_seller_id()
);
drop policy if exists "read reviews" on public.shop_reviews;
create policy "read reviews" on public.shop_reviews for select using (status <> 'hidden');
drop policy if exists "read categories" on public.categories;
create policy "read categories" on public.categories for select using (visible or public.is_admin('admin'));
drop policy if exists "read bazaars" on public.bazaars;
create policy "read bazaars" on public.bazaars for select using (visible or public.is_admin('admin'));

-- Owners can't approve their own ads or lift their own suspension by editing rows.
create or replace function public.guard_moderation() returns trigger
  language plpgsql security definer set search_path = public
  as $$
begin
  -- No signed-in user = SQL editor / service role (server). Admins may change anything.
  if auth.uid() is null or public.is_admin('moderator') then return new; end if;
  if tg_table_name = 'listings' then
    -- owners may mark their live ad sold / expired, or send a fixed ad back for review
    if new.status is distinct from old.status
       and not (old.status = 'active' and new.status in ('sold', 'expired'))
       and not (old.status in ('rejected', 'expired') and new.status = 'pending') then
      raise exception 'Only the REGOMARKET team can change this status';
    end if;
    new.moderation_reason := old.moderation_reason;
    new.flags := old.flags;
    new.reviewed_by := old.reviewed_by;
    new.reviewed_at := old.reviewed_at;
  elsif tg_table_name = 'shops' then
    if new.status is distinct from old.status then raise exception 'Only the REGOMARKET team can change this status'; end if;
    new.verifications := old.verifications;
    new.moderation_reason := old.moderation_reason;
  elsif tg_table_name = 'sellers' then
    new.status := old.status;
    new.verifications := old.verifications;
  end if;
  return new;
end $$;

create trigger guard_listing_moderation before update on public.listings for each row execute function public.guard_moderation();
create trigger guard_shop_moderation    before update on public.shops    for each row execute function public.guard_moderation();
create trigger guard_seller_moderation  before update on public.sellers  for each row execute function public.guard_moderation();

-- ---------------------------------------------------------------------
-- New tables
-- ---------------------------------------------------------------------

-- CNIC / business checks. Files live in the private `verification` bucket.
create table public.verification_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  seller_id       text not null references public.sellers(id) on delete cascade,
  level           text not null check (level in ('identity', 'business')),
  documents       text[] not null default '{}', -- storage paths: <user_id>/<file>
  business_name   text,
  status          text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reason          text,
  reviewed_by     uuid references auth.users(id) on delete set null,
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now()
);
create index verification_queue_idx on public.verification_requests (status, created_at);
alter table public.verification_requests enable row level security;
create policy "send own verification" on public.verification_requests for insert with check (user_id = auth.uid() and seller_id = public.my_seller_id() and status = 'pending');
create policy "read own verification" on public.verification_requests for select using (user_id = auth.uid() or public.is_admin('moderator'));

-- Every admin action. Insert-only: no update or delete policy exists.
create table public.admin_audit_log (
  id              bigint generated always as identity primary key,
  admin_id        uuid references auth.users(id) on delete set null,
  admin_name      text not null,
  action          text not null,
  module          text not null,
  target          text not null default '',
  target_id       text,
  detail          text,
  created_at      timestamptz not null default now()
);
create index admin_audit_recent_idx on public.admin_audit_log (created_at desc);
alter table public.admin_audit_log enable row level security;
create policy "admins read log" on public.admin_audit_log for select using (public.is_admin('admin'));

-- Small key/value settings (site banner, contact details, rules). Not secret.
create table public.site_settings (
  key             text primary key,
  value           jsonb not null,
  updated_by      uuid references auth.users(id) on delete set null,
  updated_at      timestamptz not null default now()
);
alter table public.site_settings enable row level security;
create policy "read settings"   on public.site_settings for select using (true);
create policy "admins settings" on public.site_settings for all using (public.is_admin('admin')) with check (public.is_admin('admin'));

-- Notifications sent to many users at once
create table public.broadcasts (
  id              uuid primary key default gen_random_uuid(),
  title           text not null check (char_length(title) between 4 and 60),
  body            text not null check (char_length(body) between 8 and 160),
  audience        text not null check (audience in ('everyone', 'sellers', 'shops', 'buyers')),
  district        text references public.districts(slug),
  reach           int not null default 0,
  sent_by         uuid references auth.users(id) on delete set null,
  sent_by_name    text not null,
  created_at      timestamptz not null default now()
);
alter table public.broadcasts enable row level security;
create policy "admins read broadcasts" on public.broadcasts for select using (public.is_admin('admin'));

-- Blog (was in code; now editable from the admin)
create table public.blog_posts (
  slug            text primary key,
  title           text not null,
  excerpt         text not null default '',
  category        text not null default 'Guides',
  cover_url       text,
  body            text not null default '',
  status          text not null default 'draft' check (status in ('draft', 'published')),
  author          text not null default 'REGOMARKET team',
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table public.blog_posts enable row level security;
create policy "read published posts" on public.blog_posts for select using (status = 'published' or public.is_admin('admin'));
create policy "admins write posts"   on public.blog_posts for all using (public.is_admin('admin')) with check (public.is_admin('admin'));

-- Towns added by the team (the base list ships in code: data/locations.ts)
create table public.towns (
  id              bigint generated always as identity primary key,
  district        text not null references public.districts(slug),
  tehsil          text not null,
  name            text not null,
  created_at      timestamptz not null default now(),
  unique (district, tehsil, name)
);
alter table public.towns enable row level security;
create policy "read towns"   on public.towns for select using (true);
create policy "admins towns" on public.towns for all using (public.is_admin('admin')) with check (public.is_admin('admin'));

-- ---------------------------------------------------------------------
-- What each admin role can read and change directly
-- (status changes go through admin_moderate() so they are always logged)
-- ---------------------------------------------------------------------

create policy "mods read all listings"   on public.listings        for select using (public.is_admin('moderator'));
create policy "mods read all shops"      on public.shops           for select using (public.is_admin('moderator'));
create policy "mods edit shops"          on public.shops           for update using (public.is_admin('moderator')) with check (public.is_admin('moderator'));
create policy "mods read all wanted"     on public.wanted_requests for select using (public.is_admin('moderator'));
create policy "mods read offers"         on public.wanted_offers   for select using (public.is_admin('moderator'));
create policy "mods read all reviews"    on public.shop_reviews    for select using (public.is_admin('moderator'));
create policy "mods read reports"        on public.reports         for select using (public.is_admin('moderator'));
create policy "support reads orders"     on public.orders          for select using (public.is_admin('support'));
create policy "support updates orders"   on public.orders          for update using (public.is_admin('support')) with check (public.is_admin('support'));
create policy "support reads inbox"      on public.contact_messages for select using (public.is_admin('support'));
create policy "support answers inbox"    on public.contact_messages for update using (public.is_admin('support')) with check (public.is_admin('support'));
create policy "admins edit categories"   on public.categories      for all using (public.is_admin('admin')) with check (public.is_admin('admin'));
create policy "admins edit bazaars"      on public.bazaars         for all using (public.is_admin('admin')) with check (public.is_admin('admin'));
-- Private chats stay private: no admin policy on conversations / messages.

-- Verification documents: only moderators can open them (short signed URLs)
create policy "mods read verification files" on storage.objects for select to authenticated
  using (bucket_id = 'verification' and public.is_admin('moderator'));

-- ---------------------------------------------------------------------
-- Admin functions (all check the role and write the audit log)
-- ---------------------------------------------------------------------

create or replace function public.admin_log(p_action text, p_module text, p_target text, p_target_id text default null, p_detail text default null)
  returns void language plpgsql security definer set search_path = public
  as $$
begin
  if not public.is_admin('support') then raise exception 'Not allowed' using errcode = '42501'; end if;
  insert into public.admin_audit_log (admin_id, admin_name, action, module, target, target_id, detail)
  values (auth.uid(), (select name from public.admins where user_id = auth.uid()), p_action, p_module, coalesce(p_target, ''), p_target_id, p_detail);
end $$;

-- Approve / reject / suspend / hide … one entry point for every status change.
create or replace function public.admin_moderate(p_entity text, p_id text, p_status text, p_reason text default null)
  returns void language plpgsql security definer set search_path = public
  as $$
declare
  v_title text;
  v_user  uuid;
  v_msg   text;
  v_href  text := '/dashboard';
begin
  if not public.is_admin('moderator') then raise exception 'Not allowed' using errcode = '42501'; end if;

  case p_entity
    when 'listing' then
      if p_status not in ('active', 'rejected', 'removed', 'pending') then raise exception 'Bad status %', p_status; end if;
      -- live ads carry no internal notes (rows are public once active)
      update public.listings l set status = p_status,
          moderation_reason = case when p_status = 'active' then null else p_reason end,
          flags = case when p_status = 'active' then '{}' else l.flags end,
          reviewed_by = auth.uid(), reviewed_at = now()
        where l.id = p_id
        returning l.title, (select s.user_id from public.sellers s where s.id = l.seller_id), '/listing/' || l.slug into v_title, v_user, v_href;
      v_msg := case p_status when 'active' then 'Your ad is live' when 'rejected' then 'Your ad needs changes' when 'removed' then 'Your ad was removed' else 'Your ad is being checked' end;
    when 'shop' then
      if p_status not in ('active', 'rejected', 'suspended') then raise exception 'Bad status %', p_status; end if;
      update public.shops sh set status = p_status,
          moderation_reason = case when p_status = 'active' then null else p_reason end,
          reviewed_by = auth.uid(), reviewed_at = now()
        where sh.id = p_id
        returning sh.name, (select s.user_id from public.sellers s where s.id = sh.seller_id), '/shop/' || sh.slug into v_title, v_user, v_href;
      if p_status = 'active' then
        update public.sellers s set type = 'shop', shop_slug = (select slug from public.shops where id = p_id)
          where s.id = (select seller_id from public.shops where id = p_id);
      end if;
      v_msg := case p_status when 'active' then 'Your shop is live' when 'rejected' then 'Your shop application needs changes' else 'Your shop is paused' end;
    when 'seller' then
      if p_status not in ('active', 'suspended', 'banned') then raise exception 'Bad status %', p_status; end if;
      update public.sellers s set status = p_status where s.id = p_id returning s.name, s.user_id into v_title, v_user;
      if found then
        insert into public.seller_moderation (seller_id, reason, updated_by) values (p_id, p_reason, auth.uid())
        on conflict (seller_id) do update set reason = excluded.reason, updated_by = excluded.updated_by, updated_at = now();
      end if;
      v_msg := case p_status when 'active' then 'Your account is active again' when 'suspended' then 'Your account is suspended' else 'Your account is banned' end;
    when 'wanted' then
      if p_status not in ('open', 'closed', 'removed') then raise exception 'Bad status %', p_status; end if;
      update public.wanted_requests w set status = p_status where w.id = p_id
        returning w.title, (select s.user_id from public.sellers s where s.id = w.buyer_id) into v_title, v_user;
      v_msg := case p_status when 'removed' then 'Your request was removed' else null end;
    when 'review' then
      if p_status not in ('published', 'flagged', 'hidden') then raise exception 'Bad status %', p_status; end if;
      update public.shop_reviews r set status = p_status, flag_reason = p_reason where r.id = p_id returning left(r.text, 60) into v_title;
    when 'report' then
      if p_status not in ('open', 'reviewing', 'resolved', 'dismissed') then raise exception 'Bad status %', p_status; end if;
      update public.reports r set status = p_status, resolution = p_reason, handled_by = auth.uid(), handled_at = now()
        where r.id = p_id::uuid returning r.reason, r.reporter_id into v_title, v_user;
      v_msg := case when p_status in ('resolved', 'dismissed') then 'Thanks — we looked at your report' else null end;
      v_href := '/help/report';
    else
      raise exception 'Unknown entity %', p_entity;
  end case;

  if not found then raise exception '% % not found', p_entity, p_id; end if;

  insert into public.admin_audit_log (admin_id, admin_name, action, module, target, target_id, detail)
  values (auth.uid(), (select name from public.admins where user_id = auth.uid()), p_entity || ': ' || p_status, p_entity, coalesce(v_title, p_id), p_id, p_reason);

  if v_user is not null and v_msg is not null then
    insert into public.notifications (user_id, kind, title, body, href)
    values (v_user, 'system', v_msg, coalesce(p_reason, coalesce(v_title, '')), coalesce(v_href, '/dashboard'));
  end if;
end $$;

-- Approve or reject a CNIC / business check; approval adds the badge.
create or replace function public.admin_verify(p_request uuid, p_approve boolean, p_reason text default null)
  returns void language plpgsql security definer set search_path = public
  as $$
declare r public.verification_requests%rowtype;
begin
  if not public.is_admin('moderator') then raise exception 'Not allowed' using errcode = '42501'; end if;
  select * into r from public.verification_requests where id = p_request for update;
  if not found then raise exception 'Request not found'; end if;
  if r.status <> 'pending' then raise exception 'Already %', r.status; end if;

  update public.verification_requests
    set status = case when p_approve then 'approved' else 'rejected' end, reason = p_reason, reviewed_by = auth.uid(), reviewed_at = now()
    where id = p_request;

  if p_approve then
    update public.sellers set verifications = array(select distinct unnest(verifications || array[r.level])) where id = r.seller_id;
    if r.level = 'business' then
      update public.shops set verifications = array(select distinct unnest(verifications || array['business'])) where seller_id = r.seller_id;
    end if;
  end if;

  insert into public.admin_audit_log (admin_id, admin_name, action, module, target, target_id, detail)
  values (auth.uid(), (select name from public.admins where user_id = auth.uid()),
          case when p_approve then 'Verified ' else 'Rejected ' end || r.level, 'verifications',
          (select name from public.sellers where id = r.seller_id), p_request::text, p_reason);

  insert into public.notifications (user_id, kind, title, body, href)
  values (r.user_id, 'system',
          case when p_approve then 'You are verified' else 'Please send your documents again' end,
          coalesce(p_reason, case when p_approve then 'A verified badge now shows on your profile.' else '' end), '/dashboard');
end $$;

-- Full phone number for the team; every look is logged.
create or replace function public.admin_reveal_phone(p_seller_id text) returns text
  language plpgsql security definer set search_path = public
  as $$
begin
  if not public.is_admin('moderator') then raise exception 'Not allowed' using errcode = '42501'; end if;
  insert into public.admin_audit_log (admin_id, admin_name, action, module, target, target_id)
  values (auth.uid(), (select name from public.admins where user_id = auth.uid()), 'Viewed phone number', 'users',
          (select name from public.sellers where id = p_seller_id), p_seller_id);
  return (select phone from public.seller_contacts where seller_id = p_seller_id);
end $$;

-- Send one notification to a group of users. Returns how many got it.
create or replace function public.admin_broadcast(p_title text, p_body text, p_audience text, p_district text default null)
  returns int language plpgsql security definer set search_path = public
  as $$
declare n int;
begin
  if not public.is_admin('admin') then raise exception 'Not allowed' using errcode = '42501'; end if;
  if p_audience not in ('everyone', 'sellers', 'shops', 'buyers') then raise exception 'Bad audience'; end if;

  insert into public.notifications (user_id, kind, title, body, href)
  select s.user_id, 'system', p_title, p_body, '/notifications'
  from public.sellers s
  where s.user_id is not null
    and s.status = 'active'
    and (p_district is null or s.district = p_district)
    and case p_audience
          when 'everyone' then true
          when 'shops'    then s.type = 'shop'
          when 'sellers'  then exists (select 1 from public.listings l where l.seller_id = s.id)
          when 'buyers'   then not exists (select 1 from public.listings l where l.seller_id = s.id)
        end;
  get diagnostics n = row_count;

  insert into public.broadcasts (title, body, audience, district, reach, sent_by, sent_by_name)
  values (p_title, p_body, p_audience, p_district, n, auth.uid(), (select name from public.admins where user_id = auth.uid()));

  perform public.admin_log('Sent notification', 'announcements', p_title, null, p_audience || ' · ' || n || ' people');
  return n;
end $$;

-- Numbers for the Overview page in one call.
create or replace function public.admin_stats() returns jsonb
  language plpgsql stable security definer set search_path = public
  as $$
begin
  if not public.is_admin('support') then raise exception 'Not allowed' using errcode = '42501'; end if;
  return jsonb_build_object(
    'live_ads',        (select count(*) from public.listings where status = 'active'),
    'pending_ads',     (select count(*) from public.listings where status = 'pending'),
    'users',           (select count(*) from public.sellers where user_id is not null),
    'shops',           (select count(*) from public.shops where status = 'active'),
    'pending_shops',   (select count(*) from public.shops where status = 'pending'),
    'verifications',   (select count(*) from public.verification_requests where status = 'pending'),
    'open_reports',    (select count(*) from public.reports where status in ('open', 'reviewing')),
    'flagged_reviews', (select count(*) from public.shop_reviews where status = 'flagged'),
    'new_orders',      (select count(*) from public.orders where status = 'placed'),
    'new_messages',    (select count(*) from public.contact_messages where status = 'new'),
    'ads_per_day',     (select coalesce(jsonb_agg(jsonb_build_object('day', d, 'n', n) order by d), '[]'::jsonb)
                          from (select date_trunc('day', posted_at)::date d, count(*) n from public.listings
                                where posted_at > now() - interval '30 days' group by 1) x)
  );
end $$;

-- Only signed-in users may call admin functions (each one checks the role again).
revoke all on function public.admin_log(text, text, text, text, text)   from public, anon;
revoke all on function public.admin_moderate(text, text, text, text)    from public, anon;
revoke all on function public.admin_verify(uuid, boolean, text)         from public, anon;
revoke all on function public.admin_reveal_phone(text)                  from public, anon;
revoke all on function public.admin_broadcast(text, text, text, text)   from public, anon;
revoke all on function public.admin_stats()                             from public, anon;
grant execute on function public.admin_log(text, text, text, text, text)  to authenticated;
grant execute on function public.admin_moderate(text, text, text, text)   to authenticated;
grant execute on function public.admin_verify(uuid, boolean, text)        to authenticated;
grant execute on function public.admin_reveal_phone(text)                 to authenticated;
grant execute on function public.admin_broadcast(text, text, text, text)  to authenticated;
grant execute on function public.admin_stats()                            to authenticated;
