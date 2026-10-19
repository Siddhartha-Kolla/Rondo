-- Sternchenturnier: run this once in the Supabase SQL editor.
-- The browser only ever uses the public "anon" key. These policies are what protects the data.

create table public.tournaments (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  share_id    text not null unique default encode(gen_random_bytes(12), 'hex'), -- the unguessable display link
  name        text not null default 'Sternchenturnier' check (char_length(name) between 1 and 80),
  state       jsonb not null default '{}'::jsonb check (pg_column_size(state) < 500000),
  updated_at  timestamptz not null default now()
);

alter table public.tournaments enable row level security;

-- Table-level permission for logged-in users only (the policy below then limits them to their own rows).
-- The public "anon" role gets no table access at all.
grant select, insert, update, delete on public.tournaments to authenticated;

-- The organizer can do everything with their own tournaments, nothing with anyone else's.
create policy "owner full access" on public.tournaments
  for all to authenticated
  using (owner = auth.uid())
  with check (owner = auth.uid());

-- Display screens and players are NOT logged in. They cannot list or search tournaments;
-- they can only call this function with an exact share_id and get that one tournament back.
create function public.get_shared_tournament(p_share_id text)
returns table (name text, state jsonb, updated_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select name, state, updated_at from public.tournaments where share_id = p_share_id;
$$;

revoke all on function public.get_shared_tournament(text) from public;
grant execute on function public.get_shared_tournament(text) to anon, authenticated;
