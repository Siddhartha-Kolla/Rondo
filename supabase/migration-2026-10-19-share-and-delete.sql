-- Run this ONCE in the Supabase SQL editor if you already ran schema.sql earlier.
-- (A fresh install gets the same changes from schema.sql.)

-- 1) Display links can be switched off
alter table public.tournaments
  add column if not exists share_enabled boolean not null default true;

create or replace function public.get_shared_tournament(p_share_id text)
returns table (name text, state jsonb, updated_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select name, state, updated_at
  from public.tournaments
  where share_id = p_share_id and share_enabled;
$$;

revoke all on function public.get_shared_tournament(text) from public;
grant execute on function public.get_shared_tournament(text) to anon, authenticated;

-- 2) A logged-in user can delete their own account (tournaments go with it: on delete cascade)
create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = public, auth
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
