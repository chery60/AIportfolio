-- ============================================================
-- Portfolio Comments Table
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Create the comments table
create table if not exists public.portfolio_comments (
  id           uuid default gen_random_uuid() primary key,
  author       text not null check (char_length(author) >= 1 and char_length(author) <= 50),
  content      text not null check (char_length(content) >= 1 and char_length(content) <= 500),
  color        text not null default '#7C5CFC',
  initials     text not null,
  created_at   timestamp with time zone default now()
);

-- Index for fast queries (newest first)
create index if not exists portfolio_comments_created_at_idx
  on public.portfolio_comments (created_at desc);

-- Enable Row Level Security
alter table public.portfolio_comments enable row level security;

-- Policy: Anyone (including anonymous users) can read comments
create policy "Anyone can read comments"
  on public.portfolio_comments
  for select
  using (true);

-- Policy: Anyone (including anonymous users) can insert comments
create policy "Anyone can insert comments"
  on public.portfolio_comments
  for insert
  with check (true);

-- Policy: Anyone can delete comments (owner can restrict this later)
create policy "Anyone can delete comments"
  on public.portfolio_comments
  for delete
  using (true);

-- Enable realtime for this table
-- Go to Supabase > Database > Replication > Supabase Realtime and add portfolio_comments
