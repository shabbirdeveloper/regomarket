-- =====================================================================
-- TEST ONLY — try the shop side with your own account.
--
-- Makes your account the owner of the demo shop "Hunza Dry Fruits House",
-- so /shop-orders shows its orders. Your personal profile is parked (not
-- deleted) and comes back with the UNDO block below.
--
-- 1. Replace YOUR-EMAIL below, then run this in Supabase → SQL Editor.
-- 2. Sign out and in again on the site.
-- =====================================================================

-- Kept outside the public API schema so nobody can read it from the site
create schema if not exists test_tools;
create table if not exists test_tools.parked (user_id uuid primary key, seller_id text not null);

do $$
declare
  me uuid := (select id from auth.users where email = lower('YOUR-EMAIL@gmail.com'));
begin
  if me is null then raise exception 'No account with that email. Sign in on the site once first.'; end if;
  insert into test_tools.parked (user_id, seller_id)
    select me, id from public.sellers where user_id = me and id <> 's-hunza-dfh'
    on conflict (user_id) do nothing;
  update public.sellers set user_id = null where user_id = me and id <> 's-hunza-dfh';
  update public.sellers set user_id = me where id = 's-hunza-dfh';
end $$;

-- ---------------------------------------------------------------------
-- UNDO (run when you are done testing):
--
-- do $$
-- declare p record;
-- begin
--   for p in select * from test_tools.parked loop
--     update public.sellers set user_id = null where user_id = p.user_id;
--     update public.sellers set user_id = p.user_id where id = p.seller_id;
--   end loop;
--   delete from test_tools.parked;
-- end $$;
-- ---------------------------------------------------------------------
