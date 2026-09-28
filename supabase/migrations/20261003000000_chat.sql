-- =====================================================================
-- REGOMARKET — buyer ↔ seller chat
--
-- Run AFTER the init, admin and store SQL files (SQL Editor → paste → Run).
-- Tables `conversations` and `messages` already exist (init). This adds the
-- two functions the site uses, so a chat is created on the first message,
-- the other person is notified, and "read" ticks work.
-- =====================================================================

-- Send a message. Pass p_conversation for an existing chat, or p_listing to
-- start one about an ad. Returns { conversation_id, id, created_at }.
create or replace function public.send_message(p_conversation uuid, p_listing text, p_body text, p_offer bigint default null)
  returns jsonb language plpgsql security definer set search_path = public
  as $$
declare
  v_me     uuid := auth.uid();
  v_conv   uuid := p_conversation;
  v_seller text;
  v_owner  uuid;
  v_buyer  uuid;
  v_to     uuid;
  v_name   text;
  v_id     uuid;
  v_at     timestamptz;
begin
  if v_me is null then raise exception 'Please sign in to send messages' using errcode = '42501'; end if;
  if coalesce(trim(p_body), '') = '' and p_offer is null then raise exception 'Write a message first'; end if;
  if p_offer is not null and p_offer <= 0 then raise exception 'Enter a valid offer'; end if;

  if v_conv is null then
    select l.seller_id, s.user_id into v_seller, v_owner
    from public.listings l join public.sellers s on s.id = l.seller_id
    where l.id = p_listing and l.status = 'active';
    if v_seller is null then raise exception 'This ad is no longer available'; end if;
    if v_owner is null then raise exception 'This seller isn''t on REGOMARKET chat yet. Please call them instead.'; end if;
    if v_owner = v_me then raise exception 'This is your own ad'; end if;
    insert into public.conversations (listing_id, buyer_user_id, seller_id)
    values (p_listing, v_me, v_seller)
    on conflict (listing_id, buyer_user_id) do update set seller_id = excluded.seller_id
    returning id into v_conv;
  end if;

  select cv.buyer_user_id, s.user_id into v_buyer, v_owner
  from public.conversations cv join public.sellers s on s.id = cv.seller_id
  where cv.id = v_conv;
  -- coalesce: a NULL here must mean "not allowed", never "skip the check"
  if not coalesce(v_buyer = v_me or v_owner = v_me, false) then raise exception 'Chat not found'; end if;

  insert into public.messages (conversation_id, sender_user_id, body, offer)
  values (v_conv, v_me, left(trim(coalesce(p_body, '')), 2000), p_offer)
  returning id, created_at into v_id, v_at;

  -- Tell the other person (one notification per chat until they open it)
  v_to := case when v_buyer = v_me then v_owner else v_buyer end;
  if v_to is not null and not exists (
    select 1 from public.notifications n
    where n.user_id = v_to and n.kind = 'message' and not n.read and n.href = '/messages?c=' || v_conv
  ) then
    select name into v_name from public.sellers where user_id = v_me;
    insert into public.notifications (user_id, kind, title, body, href)
    values (v_to, 'message', 'New message from ' || coalesce(nullif(v_name, 'New user'), 'a buyer'),
            left(coalesce(nullif(trim(p_body), ''), 'Offer: Rs ' || p_offer), 120), '/messages?c=' || v_conv);
  end if;

  return jsonb_build_object('conversation_id', v_conv, 'id', v_id, 'created_at', v_at);
end $$;

-- Mark the other person's messages in a chat as read (and its notification).
create or replace function public.mark_conversation_read(p_conversation uuid)
  returns void language plpgsql security definer set search_path = public
  as $$
declare v_me uuid := auth.uid();
begin
  if v_me is null then return; end if;
  if not exists (
    select 1 from public.conversations cv join public.sellers s on s.id = cv.seller_id
    where cv.id = p_conversation and (cv.buyer_user_id = v_me or s.user_id = v_me)
  ) then return; end if;
  update public.messages set read_at = now()
  where conversation_id = p_conversation and sender_user_id <> v_me and read_at is null;
  update public.notifications set read = true
  where user_id = v_me and kind = 'message' and href = '/messages?c=' || p_conversation and not read;
end $$;

revoke all on function public.send_message(uuid, text, text, bigint)   from public, anon;
revoke all on function public.mark_conversation_read(uuid)             from public, anon;
grant execute on function public.send_message(uuid, text, text, bigint) to authenticated;
grant execute on function public.mark_conversation_read(uuid)           to authenticated;

-- Realtime: read ticks update live
alter table public.messages replica identity full;
