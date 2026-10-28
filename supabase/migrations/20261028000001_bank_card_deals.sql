-- =============================================================================
-- KhanaScene — Bank Card Deals & Discounts System
-- =============================================================================
-- Solves the "Kis card pe discount hai?" problem:
-- Provides structured, verified bank debit/credit card dining deals
-- (e.g. Meezan 20%, Alfalah 25-30%, HBL, Standard Chartered, Nayapay).
-- =============================================================================

create table if not exists public.restaurant_card_deals (
  id uuid primary key default gen_random_uuid(),
  restaurant_record_id uuid references public.restaurant_records(id) on delete cascade,
  google_place_id text not null,
  bank_name text not null,
  bank_code text not null,
  card_tier text not null default 'All Cards',
  discount_percentage integer not null check (discount_percentage > 0 and discount_percentage <= 70),
  applicable_days text[] not null default array['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  max_discount_pkr integer check (max_discount_pkr is null or max_discount_pkr > 0),
  min_spend_pkr integer check (min_spend_pkr is null or min_spend_pkr >= 0),
  terms text,
  is_active boolean not null default true,
  valid_from date default current_date,
  valid_until date,
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_rcd_place_id on public.restaurant_card_deals(google_place_id);
create index if not exists idx_rcd_restaurant_id on public.restaurant_card_deals(restaurant_record_id);
create index if not exists idx_rcd_bank_code on public.restaurant_card_deals(bank_code);
create index if not exists idx_rcd_is_active on public.restaurant_card_deals(is_active);

create trigger trg_restaurant_card_deals_updated_at
  before update on public.restaurant_card_deals
  for each row execute function public.set_updated_at();

alter table public.restaurant_card_deals enable row level security;

create policy "Public can read active card deals"
  on public.restaurant_card_deals
  for select
  using (is_active = true);

-- -----------------------------------------------------------------------------
-- Seed Initial Islamabad & Rawalpindi Bank Deals
-- -----------------------------------------------------------------------------

insert into public.restaurant_card_deals (
  restaurant_record_id,
  google_place_id,
  bank_name,
  bank_code,
  card_tier,
  discount_percentage,
  applicable_days,
  max_discount_pkr,
  min_spend_pkr,
  terms,
  is_active
)
values
  -- Tuscany Courtyard (Kohsar F-6)
  (
    '11111111-1111-4111-8111-111111111111',
    'isb-place-tuscany-courtyard-f6',
    'Bank Alfalah',
    'alfalah',
    'Visa & Mastercard Platinum / Signature',
    25,
    array['Tuesday', 'Wednesday'],
    3000,
    3000,
    'Valid on dine-in only. Maximum discount PKR 3,000 per card per visit.',
    true
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'isb-place-tuscany-courtyard-f6',
    'Meezan Bank',
    'meezan',
    'Titanium & Platinum Debit Cards',
    20,
    array['Friday', 'Saturday', 'Sunday'],
    2500,
    2500,
    'Valid on dine-in. One transaction per card per day.',
    true
  ),

  -- Asian Wok (Beverly / F-6)
  (
    '11111111-1111-4111-8111-111111111103',
    'dev-place-isb-asianwok-f6',
    'Meezan Bank',
    'meezan',
    'All Meezan Debit & Credit Cards',
    20,
    array['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    2500,
    2000,
    'Valid on à la carte dine-in. Excludes buffet.',
    true
  ),
  (
    '11111111-1111-4111-8111-111111111103',
    'dev-place-isb-asianwok-f6',
    'HBL',
    'hbl',
    'HBL Platinum & World Elite',
    25,
    array['Thursday', 'Friday'],
    3000,
    2500,
    'Valid for dine-in guests up to a party of 8.',
    true
  ),

  -- Roasters Coffee House & Grill (F-7)
  (
    '11111111-1111-4111-8111-111111111108',
    'dev-place-isb-roasters-f7',
    'Bank Alfalah',
    'alfalah',
    'Alfalah Credit Cards',
    30,
    array['Tuesday', 'Wednesday'],
    2500,
    1500,
    'Valid on full food menu. Dine-in only.',
    true
  ),
  (
    '11111111-1111-4111-8111-111111111108',
    'dev-place-isb-roasters-f7',
    'Nayapay',
    'nayapay',
    'Nayapay Visa Debit Card',
    15,
    array['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    1000,
    1000,
    'Instant discount when paying via Nayapay physical or virtual Visa card.',
    true
  ),

  -- Street 1 Cafe (Kohsar F-6)
  (
    '11111111-1111-4111-8111-111111111102',
    'dev-place-isb-street1-cafe',
    'Standard Chartered',
    'scb',
    'Priority Banking & Infinite Cards',
    20,
    array['Wednesday', 'Thursday'],
    2500,
    2500,
    'Valid on main kitchen and bakery items.',
    true
  ),
  (
    '11111111-1111-4111-8111-111111111102',
    'dev-place-isb-street1-cafe',
    'Bank Alfalah',
    'alfalah',
    'Alfalah Premier Cards',
    20,
    array['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    2500,
    2000,
    'Valid on dine-in only.',
    true
  ),

  -- Howdy (Beverly Centre Blue Area)
  (
    '11111111-1111-4111-8111-111111111112',
    'isb-place-howdy-beverly-centre',
    'HBL',
    'hbl',
    'All HBL Debit & Credit Cards',
    20,
    array['Friday', 'Saturday', 'Sunday'],
    1500,
    1200,
    'Valid on burgers and platters. Max discount PKR 1,500.',
    true
  ),
  (
    '11111111-1111-4111-8111-111111111112',
    'isb-place-howdy-beverly-centre',
    'Meezan Bank',
    'meezan',
    'All Meezan Cards',
    15,
    array['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    1500,
    1200,
    'Valid on all dine-in and takeaway orders.',
    true
  ),

  -- Mei Kong (Saddar Rawalpindi)
  (
    '11111111-1111-4111-8111-111111111106',
    'dev-place-rwp-meikong-saddar',
    'Meezan Bank',
    'meezan',
    'All Meezan Cards',
    20,
    array['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    2000,
    2000,
    'Valid on Chinese cuisine dine-in. Excludes event halls.',
    true
  ),
  (
    '11111111-1111-4111-8111-111111111106',
    'dev-place-rwp-meikong-saddar',
    'Bank Alfalah',
    'alfalah',
    'Alfalah Platinum Cards',
    25,
    array['Saturday', 'Sunday'],
    3000,
    2500,
    'Valid on weekend family dinners.',
    true
  ),

  -- Texas Steakhouse (Saddar Rawalpindi)
  (
    '11111111-1111-4111-8111-111111111109',
    'dev-place-rwp-texas-saddar',
    'Bank Alfalah',
    'alfalah',
    'All Alfalah Cards',
    30,
    array['Tuesday', 'Wednesday'],
    3000,
    2000,
    'Valid on all steaks and Mexican platters.',
    true
  ),
  (
    '11111111-1111-4111-8111-111111111109',
    'dev-place-rwp-texas-saddar',
    'UBL',
    'ubl',
    'UBL Signature & Platinum Cards',
    20,
    array['Thursday', 'Friday'],
    2500,
    2000,
    'Valid on dine-in bill.',
    true
  ),

  -- Chaaye Khana (F-6 Super Market)
  (
    '11111111-1111-4111-8111-111111111105',
    'dev-place-isb-chaaye-khana-f6',
    'Nayapay',
    'nayapay',
    'Nayapay Visa Debit Card',
    20,
    array['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    800,
    500,
    'Instant discount when paying via Nayapay physical or virtual Visa card.',
    true
  ),
  (
    '11111111-1111-4111-8111-111111111105',
    'dev-place-isb-chaaye-khana-f6',
    'Standard Chartered',
    'scb',
    'All SCB Cards',
    15,
    array['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    1500,
    1000,
    'Valid on bakery, snacks, and speciality teas.',
    true
  )
on conflict do nothing;
