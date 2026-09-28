-- =====================================================================
-- REGOMARKET — online store: orders with many items, checkout, payments
--
-- Run AFTER 20260928000000_init.sql and 20261001000000_admin.sql.
-- (Supabase → SQL Editor → paste → Run.)
--
-- Buyers never write orders directly: everything goes through the
-- functions below, which read prices from the database (never from the
-- browser), check the shop can take orders, and notify the shop.
-- =====================================================================

-- The first version stored one item per order; no real orders exist yet,
-- so it is replaced by orders (one per shop) + order_items.
drop table if exists public.orders cascade;

create sequence if not exists public.order_no start 100001;

create table public.orders (
  id              text primary key default ('RM-' || nextval('public.order_no')::text),
  checkout_id     uuid not null,                       -- orders placed together (one per shop)
  buyer_user_id   uuid not null references auth.users(id) on delete restrict,
  shop_id         text not null references public.shops(id) on delete restrict,
  status          text not null default 'placed' check (status in ('placed', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment         text not null check (payment in ('cod', 'easypaisa', 'jazzcash', 'bank')),
  payment_status  text not null default 'unpaid' check (payment_status in ('unpaid', 'submitted', 'paid')),
  payment_ref     text check (char_length(payment_ref) <= 60), -- wallet / bank transaction ID sent by the buyer
  subtotal        bigint not null check (subtotal >= 0),
  delivery_fee    bigint not null default 0 check (delivery_fee >= 0),
  total           bigint not null check (total >= 0),
  ship_name       text not null check (char_length(ship_name) between 2 and 80),
  ship_phone      text not null check (char_length(ship_phone) between 10 and 16),
  ship_district   text not null references public.districts(slug),
  ship_town       text check (char_length(ship_town) <= 80),
  ship_address    text not null check (char_length(ship_address) between 8 and 300),
  note            text check (char_length(note) <= 500),
  cancel_reason   text,
  cancelled_by    text check (cancelled_by in ('buyer', 'shop', 'admin')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  confirmed_at    timestamptz,
  shipped_at      timestamptz,
  delivered_at    timestamptz,
  cancelled_at    timestamptz
);
create index orders_buyer_idx on public.orders (buyer_user_id, created_at desc);
create index orders_shop_idx  on public.orders (shop_id, status, created_at desc);

create table public.order_items (
  id              bigint generated always as identity primary key,
  order_id        text not null references public.orders(id) on delete cascade,
  listing_id      text references public.listings(id) on delete set null,
  listing_slug    text,
  title           text not null,
  image           text,
  unit            text,
  unit_price      bigint not null check (unit_price >= 0),
  qty             int not null check (qty between 1 and 999),
  line_total      bigint not null check (line_total >= 0)
);
create index order_items_order_idx on public.order_items (order_id);

-- Where a shop wants wallet / bank payments sent. Shown only to its buyers.
create table public.shop_payment_accounts (
  id              bigint generated always as identity primary key,
  shop_id         text not null references public.shops(id) on delete cascade,
  method          text not null check (method in ('easypaisa', 'jazzcash', 'bank')),
  account_title   text not null check (char_length(account_title) between 2 and 80),
  account_number  text not null check (char_length(account_number) between 6 and 40),
  bank_name       text check (char_length(bank_name) <= 60),
  unique (shop_id, method)
);

alter table public.orders                enable row level security;
alter table public.order_items           enable row level security;
alter table public.shop_payment_accounts enable row level security;

-- helper: the shop owned by the signed-in user
create or replace function public.my_shop_id() returns text
  language sql stable security definer set search_path = public
  as $$ select id from public.shops where seller_id = public.my_seller_id() $$;

create policy "buyer reads own orders" on public.orders for select using (buyer_user_id = auth.uid());
create policy "shop reads its orders"  on public.orders for select using (shop_id = public.my_shop_id());
create policy "support reads orders"   on public.orders for select using (public.is_admin('support'));

create policy "read items of visible orders" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id
          and (o.buyer_user_id = auth.uid() or o.shop_id = public.my_shop_id() or public.is_admin('support')))
);

create policy "shop manages payment accounts" on public.shop_payment_accounts for all
  using (shop_id = public.my_shop_id()) with check (shop_id = public.my_shop_id());
create policy "buyers see accounts of shops they ordered from" on public.shop_payment_accounts for select using (
  exists (select 1 from public.orders o where o.shop_id = shop_payment_accounts.shop_id and o.buyer_user_id = auth.uid())
  or public.is_admin('support')
);

-- ---------------------------------------------------------------------
-- Delivery fee: one simple, visible rule (same as the checkout page shows)
-- ---------------------------------------------------------------------
create or replace function public.delivery_fee(p_shop_district text, p_ship_district text) returns bigint
  language sql immutable
  as $$ select case when p_shop_district = p_ship_district then 150 else 250 end::bigint $$;

-- ---------------------------------------------------------------------
-- place_order: the only way to create orders
--   p_items:  [{ "listing_id": "l-1001", "qty": 2 }, …]
--   p_ship:   { "name", "phone", "district", "town", "address", "note" }
--   returns:  [{ "id": "RM-100001", "shop": "…", "total": 1234 }, …]  (one per shop)
-- ---------------------------------------------------------------------
create or replace function public.place_order(p_items jsonb, p_ship jsonb, p_payment text)
  returns jsonb language plpgsql security definer set search_path = public
  as $$
declare
  v_user      uuid := auth.uid();
  v_me        text := public.my_seller_id();
  v_checkout  uuid := gen_random_uuid();
  v_district  text := p_ship ->> 'district';
  v_result    jsonb := '[]'::jsonb;
  v_bad       text;
  s           record;
  v_order     text;
  v_sub       bigint;
  v_fee       bigint;
begin
  if v_user is null then raise exception 'Please sign in to order' using errcode = '42501'; end if;
  if p_payment not in ('cod', 'easypaisa', 'jazzcash', 'bank') then raise exception 'Choose a payment method'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Your cart is empty'; end if;
  if jsonb_array_length(p_items) > 50 then raise exception 'Too many items in one order'; end if;
  if not exists (select 1 from public.districts where slug = v_district) then raise exception 'Choose your district'; end if;

  -- Normalise the cart: one line per listing, qty 1..999
  create temp table _cart on commit drop as
    select i.listing_id, least(999, greatest(1, sum(i.qty)))::int as qty
    from jsonb_to_recordset(p_items) as i(listing_id text, qty int)
    where i.listing_id is not null and coalesce(i.qty, 0) > 0
    group by i.listing_id;

  -- Everything must be orderable right now
  select c.listing_id into v_bad
  from _cart c
  left join public.listings l on l.id = c.listing_id
  left join public.sellers  se on se.id = l.seller_id
  left join public.shops    sh on sh.seller_id = l.seller_id
  where l.id is null
     or l.status <> 'active'
     or se.status <> 'active'
     or sh.id is null or sh.status <> 'active' or not sh.accepts_orders
     or l.category not in ('dry-fruits', 'agriculture', 'electronics', 'home', 'cameras-gear', 'handicrafts')
     or (v_me is not null and l.seller_id = v_me)
  limit 1;
  if v_bad is not null then
    raise exception 'An item in your cart can''t be ordered any more (%). Remove it and try again.', v_bad;
  end if;

  -- One order per shop
  for s in
    select sh.id as shop_id, sh.name, sh.district, se.user_id as owner
    from _cart c
    join public.listings l on l.id = c.listing_id
    join public.shops sh on sh.seller_id = l.seller_id
    join public.sellers se on se.id = sh.seller_id
    group by sh.id, sh.name, sh.district, se.user_id
  loop
    select coalesce(sum(l.price * c.qty), 0) into v_sub
    from _cart c join public.listings l on l.id = c.listing_id join public.shops sh on sh.seller_id = l.seller_id
    where sh.id = s.shop_id;
    v_fee := public.delivery_fee(s.district, v_district);

    insert into public.orders (checkout_id, buyer_user_id, shop_id, payment, subtotal, delivery_fee, total,
                               ship_name, ship_phone, ship_district, ship_town, ship_address, note)
    values (v_checkout, v_user, s.shop_id, p_payment, v_sub, v_fee, v_sub + v_fee,
            trim(p_ship ->> 'name'), regexp_replace(p_ship ->> 'phone', '[^0-9+]', '', 'g'), v_district,
            nullif(trim(p_ship ->> 'town'), ''), trim(p_ship ->> 'address'), nullif(trim(p_ship ->> 'note'), ''))
    returning id into v_order;

    insert into public.order_items (order_id, listing_id, listing_slug, title, image, unit, unit_price, qty, line_total)
    select v_order, l.id, l.slug, l.title, l.images -> 0 ->> 'src', l.unit, l.price, c.qty, l.price * c.qty
    from _cart c join public.listings l on l.id = c.listing_id join public.shops sh on sh.seller_id = l.seller_id
    where sh.id = s.shop_id;

    if s.owner is not null then
      insert into public.notifications (user_id, kind, title, body, href)
      values (s.owner, 'system', 'New order ' || v_order, 'Rs ' || (v_sub + v_fee) || ' · ' || (p_ship ->> 'name') || ', ' || v_district, '/shop-orders/' || v_order);
    end if;

    v_result := v_result || jsonb_build_object('id', v_order, 'shop', s.name, 'total', v_sub + v_fee);
  end loop;

  return v_result;
end $$;

-- Buyer: cancel while the shop hasn't confirmed yet
create or replace function public.cancel_my_order(p_order text, p_reason text default null)
  returns void language plpgsql security definer set search_path = public
  as $$
declare o public.orders%rowtype;
begin
  select * into o from public.orders where id = p_order and buyer_user_id = auth.uid() for update;
  if not found then raise exception 'Order not found'; end if;
  if o.status <> 'placed' then raise exception 'The shop already confirmed this order. Message them to cancel.'; end if;
  update public.orders set status = 'cancelled', cancel_reason = left(p_reason, 200), cancelled_by = 'buyer', cancelled_at = now(), updated_at = now() where id = p_order;
  insert into public.notifications (user_id, kind, title, body, href)
  select se.user_id, 'system', 'Order ' || p_order || ' cancelled', coalesce(p_reason, 'Cancelled by the buyer'), '/shop-orders/' || p_order
  from public.shops sh join public.sellers se on se.id = sh.seller_id where sh.id = o.shop_id and se.user_id is not null;
end $$;

-- Buyer: "I sent the money" with the wallet / bank transaction ID
create or replace function public.submit_payment_ref(p_order text, p_ref text)
  returns void language plpgsql security definer set search_path = public
  as $$
declare o public.orders%rowtype;
begin
  select * into o from public.orders where id = p_order and buyer_user_id = auth.uid() for update;
  if not found then raise exception 'Order not found'; end if;
  if o.payment = 'cod' then raise exception 'This order is cash on delivery'; end if;
  if o.status = 'cancelled' then raise exception 'This order was cancelled'; end if;
  if char_length(trim(coalesce(p_ref, ''))) < 4 then raise exception 'Enter the transaction ID from your receipt'; end if;
  update public.orders set payment_ref = left(trim(p_ref), 60), payment_status = 'submitted', updated_at = now() where id = p_order;
  insert into public.notifications (user_id, kind, title, body, href)
  select se.user_id, 'system', 'Payment sent for ' || p_order, 'Transaction ID ' || left(trim(p_ref), 60) || ' — please check and confirm', '/shop-orders/' || p_order
  from public.shops sh join public.sellers se on se.id = sh.seller_id where sh.id = o.shop_id and se.user_id is not null;
end $$;

-- Shop (or support admin): move an order forward, mark paid, or cancel
create or replace function public.update_order(p_order text, p_status text default null, p_paid boolean default null, p_reason text default null)
  returns void language plpgsql security definer set search_path = public
  as $$
declare
  o       public.orders%rowtype;
  v_admin boolean := public.is_admin('support');
  v_next  text;
  v_msg   text;
begin
  select * into o from public.orders where id = p_order for update;
  if not found then raise exception 'Order not found'; end if;
  -- coalesce: my_shop_id() is null for people without a shop (null would skip this check)
  if not (coalesce(o.shop_id = public.my_shop_id(), false) or v_admin) then raise exception 'Not allowed' using errcode = '42501'; end if;

  if p_paid is not null then
    if o.payment = 'cod' and o.status <> 'delivered' and p_paid then raise exception 'Cash orders are paid on delivery'; end if;
    update public.orders set payment_status = case when p_paid then 'paid' else 'unpaid' end, updated_at = now() where id = p_order;
  end if;

  if p_status is not null and p_status <> o.status then
    v_next := case o.status when 'placed' then 'confirmed' when 'confirmed' then 'shipped' when 'shipped' then 'delivered' end;
    if p_status = 'cancelled' then
      if o.status in ('delivered', 'cancelled') then raise exception 'This order can''t be cancelled now'; end if;
      update public.orders set status = 'cancelled', cancel_reason = left(p_reason, 200), cancelled_by = case when v_admin and o.shop_id is distinct from public.my_shop_id() then 'admin' else 'shop' end,
        cancelled_at = now(), updated_at = now() where id = p_order;
      v_msg := 'Your order ' || p_order || ' was cancelled';
    elsif p_status = v_next then
      update public.orders set status = p_status, updated_at = now(),
        confirmed_at = case when p_status = 'confirmed' then now() else confirmed_at end,
        shipped_at   = case when p_status = 'shipped'   then now() else shipped_at end,
        delivered_at = case when p_status = 'delivered' then now() else delivered_at end,
        payment_status = case when p_status = 'delivered' and o.payment = 'cod' then 'paid' else payment_status end
      where id = p_order;
      v_msg := case p_status when 'confirmed' then 'Your order ' || p_order || ' is confirmed'
                             when 'shipped'   then 'Your order ' || p_order || ' is on the way'
                             else 'Your order ' || p_order || ' was delivered' end;
    else
      raise exception 'Can''t go from % to %', o.status, p_status;
    end if;
    insert into public.notifications (user_id, kind, title, body, href)
    values (o.buyer_user_id, 'system', v_msg, coalesce(p_reason, ''), '/orders/' || p_order);
    if v_admin and o.shop_id is distinct from public.my_shop_id() then
      perform public.admin_log('Order ' || p_status, 'orders', p_order, p_order, p_reason);
    end if;
  end if;
end $$;

revoke all on function public.place_order(jsonb, jsonb, text)            from public, anon;
revoke all on function public.cancel_my_order(text, text)                from public, anon;
revoke all on function public.submit_payment_ref(text, text)             from public, anon;
revoke all on function public.update_order(text, text, boolean, text)    from public, anon;
grant execute on function public.place_order(jsonb, jsonb, text)          to authenticated;
grant execute on function public.cancel_my_order(text, text)              to authenticated;
grant execute on function public.submit_payment_ref(text, text)           to authenticated;
grant execute on function public.update_order(text, text, boolean, text)  to authenticated;

-- Realtime: order status updates show up without a refresh
alter publication supabase_realtime add table public.orders;
