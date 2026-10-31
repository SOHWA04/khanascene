-- =============================================================================
-- KhanaScene — Group Voting Polls ("Scene Decider")
-- =============================================================================

create table if not exists public.group_polls (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  creator_name text not null default 'Organizer',
  status text not null default 'active' check (status in ('active', 'closed')),
  candidate_place_ids text[] not null default '{}',
  winner_place_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.group_polls(id) on delete cascade,
  voter_name text not null,
  selected_place_id text not null,
  created_at timestamptz not null default now(),
  constraint unique_poll_voter unique (poll_id, voter_name)
);

alter table public.group_polls enable row level security;
alter table public.poll_votes enable row level security;

-- Policies for group_polls
create policy "Anyone can read group polls"
  on public.group_polls
  for select
  using (true);

create policy "Anyone can create a group poll"
  on public.group_polls
  for insert
  with check (true);

create policy "Anyone can update a group poll status"
  on public.group_polls
  for update
  using (true);

-- Policies for poll_votes
create policy "Anyone can read poll votes"
  on public.poll_votes
  for select
  using (true);

create policy "Anyone can cast or change a vote"
  on public.poll_votes
  for insert
  with check (true);

create policy "Anyone can update their vote"
  on public.poll_votes
  for update
  using (true);

-- Indexes for performant lookup
create index if not exists idx_poll_votes_poll_id on public.poll_votes(poll_id);
create index if not exists idx_group_polls_status on public.group_polls(status);
