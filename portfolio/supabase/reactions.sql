-- ============================================================
-- Portfolio Reactions Table
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Create the reactions table (one row per emoji)
create table if not exists public.portfolio_reactions (
  emoji      text primary key,
  count      integer not null default 0 check (count >= 0),
  updated_at timestamp with time zone default now()
);

-- Seed the four reaction emojis with a starting count of 0
insert into public.portfolio_reactions (emoji, count) values
  ('❤️', 0),
  ('🔥', 0),
  ('🎯', 0),
  ('💡', 0)
on conflict (emoji) do nothing;

-- Enable Row Level Security
alter table public.portfolio_reactions enable row level security;

-- Policy: Anyone can read reactions
create policy "Anyone can read reactions"
  on public.portfolio_reactions
  for select
  using (true);

-- Policy: Anyone can update reactions (increment count)
create policy "Anyone can update reactions"
  on public.portfolio_reactions
  for update
  using (true)
  with check (true);

-- RPC function to atomically increment a reaction count
create or replace function public.increment_reaction(reaction_emoji text)
returns void
language sql
security definer
as $$
  update public.portfolio_reactions
  set count = count + 1,
      updated_at = now()
  where emoji = reaction_emoji;
$$;

-- Enable realtime for this table
-- Go to Supabase > Database > Replication > Supabase Realtime and add portfolio_reactions
