-- ============================================================
-- Crewmate Dash — Game Scores Table
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Create the game_scores table
create table if not exists public.game_scores (
  id           uuid default gen_random_uuid() primary key,
  player_name  text not null check (char_length(player_name) >= 2 and char_length(player_name) <= 20),
  score        integer not null check (score >= 0),
  created_at   timestamp with time zone default now()
);

-- Index for fast leaderboard queries (top scores)
create index if not exists game_scores_score_idx
  on public.game_scores (score desc);

-- Enable Row Level Security
alter table public.game_scores enable row level security;

-- Policy: Anyone (including anonymous users) can read scores
create policy "Anyone can read scores"
  on public.game_scores
  for select
  using (true);

-- Policy: Anyone (including anonymous users) can insert scores
create policy "Anyone can insert scores"
  on public.game_scores
  for insert
  with check (true);

-- Enable anonymous sign-ins in Supabase Auth
-- (Go to Authentication > Settings > Enable Anonymous Sign-ins in your Supabase dashboard)

-- ============================================================
-- Optional: Seed some dummy scores to populate the leaderboard
-- ============================================================
-- insert into public.game_scores (player_name, score) values
--   ('Sai Charan', 420),
--   ('CrewmateX', 380),
--   ('DesignNerd', 310),
--   ('UXCrafter', 270),
--   ('Imposter', 190);
