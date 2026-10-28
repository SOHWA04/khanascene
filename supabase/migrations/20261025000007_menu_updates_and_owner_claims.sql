-- =============================================================================
-- KhanaScene — Menu Update Suggestions & Restaurant Owner Claims
-- =============================================================================
-- Solves the "outdated Google menu" problem and generates B2B partner leads:
-- 1. menu_update_suggestions: Diners can report price changes or dish updates.
-- 2. restaurant_claims: Restaurant owners/managers can claim their listing,
--    request verified menu badges, and update prices directly.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Table: menu_update_suggestions
-- -----------------------------------------------------------------------------
create table if not exists public.menu_update_suggestions (
  id uuid primary key default gen_random_uuid(),
  submitted_by_user_id uuid references auth.users(id) on delete set null,
  restaurant_record_id uuid references public.restaurant_records(id) on delete set null,
  google_place_id text not null,
  dish_name text not null check (char_length(trim(dish_name)) between 2 and 200),
  suggested_price_pkr integer check (suggested_price_pkr is null or suggested_price_pkr >= 0),
  notes text check (notes is null or char_length(trim(notes)) <= 1000),
  photo_url text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists idx_menu_update_suggestions_place_id
  on public.menu_update_suggestions(google_place_id);
create index if not exists idx_menu_update_suggestions_status
  on public.menu_update_suggestions(status);

alter table public.menu_update_suggestions enable row level security;

create policy "Anyone can submit a menu update suggestion"
  on public.menu_update_suggestions
  for insert
  to authenticated, anon
  with check (
    status = 'pending'
    and reviewed_at is null
  );

create policy "Users can view their own menu update suggestions"
  on public.menu_update_suggestions
  for select
  to authenticated
  using (auth.uid() = submitted_by_user_id);

-- -----------------------------------------------------------------------------
-- 2. Table: restaurant_claims (Owner Verification & B2B Lead Generation)
-- -----------------------------------------------------------------------------
create table if not exists public.restaurant_claims (
  id uuid primary key default gen_random_uuid(),
  claimed_by_user_id uuid references auth.users(id) on delete set null,
  restaurant_record_id uuid references public.restaurant_records(id) on delete set null,
  google_place_id text not null,
  restaurant_name text not null check (char_length(trim(restaurant_name)) between 2 and 200),
  claimant_name text not null check (char_length(trim(claimant_name)) between 2 and 150),
  claimant_phone text not null check (char_length(trim(claimant_phone)) between 7 and 30),
  claimant_email text check (claimant_email is null or char_length(trim(claimant_email)) <= 254),
  claimant_role text not null check (char_length(trim(claimant_role)) between 2 and 50),
  verification_notes text check (verification_notes is null or char_length(trim(verification_notes)) <= 1000),
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists idx_restaurant_claims_place_id
  on public.restaurant_claims(google_place_id);
create index if not exists idx_restaurant_claims_status
  on public.restaurant_claims(status);

alter table public.restaurant_claims enable row level security;

create policy "Anyone can submit a restaurant claim"
  on public.restaurant_claims
  for insert
  to authenticated, anon
  with check (
    status = 'pending'
    and reviewed_at is null
  );

create policy "Users can view their own restaurant claims"
  on public.restaurant_claims
  for select
  to authenticated
  using (auth.uid() = claimed_by_user_id);
