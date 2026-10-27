-- =============================================================================
-- KhanaScene — Phase 3 Database Schema & Row Level Security (RLS)
-- =============================================================================
-- Core Principles:
-- 1. Stores ONLY KhanaScene-owned metadata, verified menus, user profiles,
--    saved place references (google_place_id), original KhanaScene user reviews,
--    reports, and public submissions.
-- 2. NEVER stores restricted Google Places content (ratings, review text, photos)
--    permanently.
-- 3. Enforces strict Row Level Security (RLS) across all tables.
-- =============================================================================

create extension if not exists "pgcrypto";

-- Helper function to automatically update updated_at timestamps
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 1. Table: cities
-- -----------------------------------------------------------------------------
create table if not exists public.cities (
  id text primary key,
  name text not null unique,
  country_code char(2) not null default 'PK',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.cities enable row level security;

create policy "Public can read active cities"
  on public.cities
  for select
  using (is_active = true);

-- -----------------------------------------------------------------------------
-- 2. Table: areas
-- -----------------------------------------------------------------------------
create table if not exists public.areas (
  id text primary key,
  city_id text not null references public.cities(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (city_id, name)
);

create index if not exists idx_areas_city_id on public.areas(city_id);

alter table public.areas enable row level security;

create policy "Public can read active areas"
  on public.areas
  for select
  using (is_active = true);

-- -----------------------------------------------------------------------------
-- 3. Table: cuisines
-- -----------------------------------------------------------------------------
create table if not exists public.cuisines (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  is_active boolean not null default true
);

create index if not exists idx_cuisines_slug on public.cuisines(slug);

alter table public.cuisines enable row level security;

create policy "Public can read active cuisines"
  on public.cuisines
  for select
  using (is_active = true);

-- -----------------------------------------------------------------------------
-- 4. Table: restaurant_records
--    Contains ONLY KhanaScene-owned or independently sourced restaurant metadata.
--    Public users cannot insert arbitrary records directly; submissions go to
--    restaurant_submissions first.
-- -----------------------------------------------------------------------------
create table if not exists public.restaurant_records (
  id uuid primary key default gen_random_uuid(),
  google_place_id text unique,
  name text not null,
  slug text not null unique,
  city_id text not null references public.cities(id) on delete restrict,
  area_id text references public.areas(id) on delete set null,
  address text,
  latitude double precision check (latitude is null or (latitude between -90 and 90)),
  longitude double precision check (longitude is null or (longitude between -180 and 180)),
  official_website text,
  phone_number text,
  menu_url text,
  price_min integer check (price_min is null or price_min >= 0),
  price_max integer check (price_max is null or (price_max >= 0 and (price_min is null or price_max >= price_min))),
  currency_code char(3) not null default 'PKR',
  price_verified_at timestamptz,
  is_khanascene_pick boolean not null default false,
  pick_reason text,
  is_family_friendly boolean,
  verification_status text not null default 'verified'
    check (verification_status in ('pending', 'verified', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_restaurant_records_city_id on public.restaurant_records(city_id);
create index if not exists idx_restaurant_records_area_id on public.restaurant_records(area_id);
create index if not exists idx_restaurant_records_google_place_id on public.restaurant_records(google_place_id);

create trigger trg_restaurant_records_updated_at
  before update on public.restaurant_records
  for each row execute function public.set_updated_at();

alter table public.restaurant_records enable row level security;

create policy "Public can read verified restaurant_records"
  on public.restaurant_records
  for select
  using (verification_status = 'verified');

-- -----------------------------------------------------------------------------
-- 5. Table: restaurant_record_cuisines
-- -----------------------------------------------------------------------------
create table if not exists public.restaurant_record_cuisines (
  restaurant_record_id uuid not null references public.restaurant_records(id) on delete cascade,
  cuisine_id uuid not null references public.cuisines(id) on delete cascade,
  primary key (restaurant_record_id, cuisine_id)
);

create index if not exists idx_rrc_cuisine_id on public.restaurant_record_cuisines(cuisine_id);

alter table public.restaurant_record_cuisines enable row level security;

create policy "Public can read restaurant_record_cuisines"
  on public.restaurant_record_cuisines
  for select
  using (true);

-- -----------------------------------------------------------------------------
-- 6. Table: profiles
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_city_id text references public.cities(id) on delete set null default 'islamabad',
  preferred_language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Automatically create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, preferred_city_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    'islamabad'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 7. Table: saved_places
--    Stores ONLY permitted place references (google_place_id / restaurant_record_id).
--    Never stores restricted Google Places content.
-- -----------------------------------------------------------------------------
create table if not exists public.saved_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  google_place_id text not null,
  restaurant_record_id uuid references public.restaurant_records(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, google_place_id)
);

create index if not exists idx_saved_places_user_id on public.saved_places(user_id);

alter table public.saved_places enable row level security;

create policy "Users can view their own saved_places"
  on public.saved_places
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own saved_places"
  on public.saved_places
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own saved_places"
  on public.saved_places
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 8. Table: restaurant_menus
-- -----------------------------------------------------------------------------
create table if not exists public.restaurant_menus (
  id uuid primary key default gen_random_uuid(),
  restaurant_record_id uuid not null references public.restaurant_records(id) on delete cascade,
  name text not null,
  source_type text not null
    check (source_type in ('owner_submission', 'official_website', 'khana_scene_verified', 'licensed_source')),
  source_url text,
  last_verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_restaurant_menus_record_id on public.restaurant_menus(restaurant_record_id);

create trigger trg_restaurant_menus_updated_at
  before update on public.restaurant_menus
  for each row execute function public.set_updated_at();

alter table public.restaurant_menus enable row level security;

create policy "Public can read restaurant_menus"
  on public.restaurant_menus
  for select
  using (true);

-- -----------------------------------------------------------------------------
-- 9. Table: menu_items
-- -----------------------------------------------------------------------------
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_menu_id uuid not null references public.restaurant_menus(id) on delete cascade,
  name text not null,
  description text,
  price integer not null check (price >= 0),
  currency_code char(3) not null default 'PKR',
  category text not null,
  is_available boolean not null default true,
  last_verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_menu_items_menu_id on public.menu_items(restaurant_menu_id);

create trigger trg_menu_items_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

alter table public.menu_items enable row level security;

create policy "Public can read menu_items"
  on public.menu_items
  for select
  using (true);

-- -----------------------------------------------------------------------------
-- 10. Table: user_reviews
--     Original KhanaScene reviews (never copied from Google Reviews).
--     Users cannot approve their own moderation_status; inserts must start as 'pending'.
-- -----------------------------------------------------------------------------
create table if not exists public.user_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  restaurant_record_id uuid references public.restaurant_records(id) on delete set null,
  google_place_id text not null,
  overall_rating smallint not null check (overall_rating between 1 and 5),
  food_rating smallint check (food_rating is null or (food_rating between 1 and 5)),
  service_rating smallint check (service_rating is null or (service_rating between 1 and 5)),
  ambience_rating smallint check (ambience_rating is null or (ambience_rating between 1 and 5)),
  value_rating smallint check (value_rating is null or (value_rating between 1 and 5)),
  review_text text not null check (char_length(trim(review_text)) between 10 and 2000),
  visit_date date,
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_reviews_google_place_id on public.user_reviews(google_place_id);
create index if not exists idx_user_reviews_user_id on public.user_reviews(user_id);

create trigger trg_user_reviews_updated_at
  before update on public.user_reviews
  for each row execute function public.set_updated_at();

alter table public.user_reviews enable row level security;

create policy "Public can read approved user_reviews or own reviews"
  on public.user_reviews
  for select
  using (moderation_status = 'approved' or auth.uid() = user_id);

create policy "Authenticated users can submit pending user_reviews"
  on public.user_reviews
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and moderation_status = 'pending'
  );

create policy "Authenticated users can update their own review text and reset to pending"
  on public.user_reviews
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and moderation_status = 'pending'
  );

create policy "Authenticated users can delete their own user_reviews"
  on public.user_reviews
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 11. Table: review_reports
-- -----------------------------------------------------------------------------
create table if not exists public.review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.user_reviews(id) on delete cascade,
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (char_length(trim(reason)) between 5 and 500),
  status text not null default 'open'
    check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  unique (review_id, reporter_user_id)
);

alter table public.review_reports enable row level security;

create policy "Authenticated users can insert review_reports"
  on public.review_reports
  for insert
  to authenticated
  with check (
    auth.uid() = reporter_user_id
    and status = 'open'
  );

create policy "Authenticated users can view their own submitted review_reports"
  on public.review_reports
  for select
  to authenticated
  using (auth.uid() = reporter_user_id);

-- -----------------------------------------------------------------------------
-- 12. Table: restaurant_submissions
--     Public proposals are held in 'pending' status until moderated.
-- -----------------------------------------------------------------------------
create table if not exists public.restaurant_submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_by_user_id uuid not null references auth.users(id) on delete cascade,
  proposed_name text not null check (char_length(trim(proposed_name)) between 2 and 200),
  proposed_address text not null check (char_length(trim(proposed_address)) between 5 and 500),
  proposed_city_id text not null references public.cities(id) on delete restrict,
  proposed_website text,
  proposed_phone text,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.restaurant_submissions enable row level security;

create policy "Authenticated users can insert pending restaurant_submissions"
  on public.restaurant_submissions
  for insert
  to authenticated
  with check (
    auth.uid() = submitted_by_user_id
    and status = 'pending'
    and reviewed_at is null
  );

create policy "Authenticated users can view their own restaurant_submissions"
  on public.restaurant_submissions
  for select
  to authenticated
  using (auth.uid() = submitted_by_user_id);

-- -----------------------------------------------------------------------------
-- 13. Account Deletion RPC (`delete_my_account`)
--     Required by Apple App Store & Google Play Store when in-app account
--     creation is offered. Deletes the calling user's auth record and cascades
--     to profiles, saved_places, user_reviews, review_reports, and submissions.
-- -----------------------------------------------------------------------------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  calling_uid uuid := auth.uid();
begin
  if calling_uid is null then
    raise exception 'Not authenticated';
  end if;

  delete from auth.users where id = calling_uid;
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
