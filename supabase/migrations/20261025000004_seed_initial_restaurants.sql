-- =============================================================================
-- KhanaScene — Seed Initial Curated Islamabad & Rawalpindi Restaurant Records
-- =============================================================================
-- Seeds KhanaScene-owned metadata (Layer 1: Supabase-First at $0.00/month cost)
-- including verified PKR price bands, cuisines, and verified menu items.
-- =============================================================================

insert into public.restaurant_records (
  id,
  google_place_id,
  name,
  slug,
  city_id,
  area_id,
  address,
  latitude,
  longitude,
  phone_number,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status
)
values
  (
    '11111111-1111-4111-8111-111111111101',
    'dev-place-isb-monal-ridge',
    'Kabul Restaurant F-7',
    'kabul-restaurant-f7',
    'islamabad',
    'isb-f7',
    'Jinnah Super Market, F-7 Markaz, Islamabad',
    33.7215,
    73.0571,
    '051-2650953',
    1400,
    2800,
    'PKR',
    '2026-10-01T00:00:00Z',
    true,
    'KhanaScene Pick: Long-standing F-7 staple for Kabuli Pulao & Namkeen Rosh.',
    true,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111102',
    'dev-place-isb-street1-cafe',
    'Street 1 Cafe',
    'street-1-cafe-f6',
    'islamabad',
    'isb-f6',
    'Street 1, Kohsar Market, F-6/3, Islamabad',
    33.7294,
    73.0758,
    '051-2828294',
    1800,
    3800,
    'PKR',
    '2026-10-05T00:00:00Z',
    true,
    'KhanaScene Pick: Shaded Kohsar courtyard dining and all-day brunch.',
    true,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111103',
    'dev-place-isb-butt-karahi-f8',
    'Butt Karahi Tikka F-8',
    'butt-karahi-tikka-f8',
    'islamabad',
    'isb-f8',
    'Ayub Market, F-8 Markaz, Islamabad',
    33.7102,
    73.0405,
    '051-2851555',
    1100,
    2400,
    'PKR',
    '2026-10-08T00:00:00Z',
    false,
    null,
    true,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111104',
    'dev-place-isb-rustic-f10',
    'Smokehouse Grill & Burgers F-10',
    'smokehouse-grill-f10',
    'islamabad',
    'isb-f10',
    'Tariq Market, F-10 Markaz, Islamabad',
    33.6911,
    73.0118,
    '051-2104488',
    950,
    2100,
    'PKR',
    '2026-10-10T00:00:00Z',
    false,
    null,
    true,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111105',
    'dev-place-isb-chatan-i8',
    'Quetta Tea & Paratha Lounge I-8',
    'quetta-tea-i8',
    'islamabad',
    'isb-i8',
    'I-8 Markaz, Islamabad',
    33.6682,
    73.0749,
    null,
    250,
    750,
    'PKR',
    '2026-10-12T00:00:00Z',
    false,
    null,
    false,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111106',
    'dev-place-isb-anatolia-blue',
    'Anatolia Turkish Grill Blue Area',
    'anatolia-turkish-grill-blue-area',
    'islamabad',
    'isb-blue-area',
    'Jinnah Avenue, Blue Area, Islamabad',
    33.7156,
    73.0652,
    '051-2348899',
    1900,
    4200,
    'PKR',
    '2026-10-14T00:00:00Z',
    true,
    'KhanaScene Pick: Wood-fired Adana kebabs, pides, and baklava in Blue Area.',
    true,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111107',
    'dev-place-rwp-savour-saddar',
    'Savour Foods Saddar',
    'savour-foods-saddar',
    'rawalpindi',
    'rwp-saddar',
    'Bank Road, Saddar, Rawalpindi',
    33.5968,
    73.0531,
    '051-5511000',
    450,
    950,
    'PKR',
    '2026-10-02T00:00:00Z',
    true,
    'KhanaScene Pick: Iconic Twin Cities Chicken Pulao Kabab at unbeatable value.',
    true,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111108',
    'dev-place-rwp-habibi-bahria',
    'Habibi Restaurant Bahria Phase 7',
    'habibi-restaurant-bahria-p7',
    'rawalpindi',
    'rwp-bahria',
    'Food Street, Phase 7, Bahria Town, Rawalpindi',
    33.5241,
    73.1065,
    '051-5707123',
    1300,
    2900,
    'PKR',
    '2026-10-06T00:00:00Z',
    true,
    'KhanaScene Pick: Massive family BBQ platters and Arabic Mandi in Bahria Phase 7.',
    true,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111109',
    'dev-place-rwp-melody-commercial',
    'Bannu Beef Pulao Commercial Market',
    'bannu-beef-pulao-commercial',
    'rawalpindi',
    'rwp-commercial',
    'B-Block Commercial Market, Satellite Town, Rawalpindi',
    33.6388,
    73.0714,
    '051-4429111',
    550,
    1200,
    'PKR',
    '2026-10-09T00:00:00Z',
    false,
    null,
    false,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111110',
    'dev-place-rwp-brew-dha',
    'Roast & Crumb Artisan Cafe DHA 2',
    'roast-and-crumb-dha2',
    'rawalpindi',
    'rwp-dha',
    'Central Park Avenue, DHA Phase 2, Rawalpindi',
    33.5328,
    73.1562,
    '051-5162200',
    1100,
    2400,
    'PKR',
    '2026-10-11T00:00:00Z',
    false,
    null,
    true,
    'verified'
  )
on conflict (slug) do update
  set name = excluded.name,
      area_id = excluded.area_id,
      price_min = excluded.price_min,
      price_max = excluded.price_max,
      price_verified_at = excluded.price_verified_at,
      is_khanascene_pick = excluded.is_khanascene_pick,
      pick_reason = excluded.pick_reason,
      is_family_friendly = excluded.is_family_friendly,
      verification_status = excluded.verification_status;

-- Link cuisines to seeded restaurant records
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select r.id, c.id
from public.restaurant_records r
join public.cuisines c on (
  (r.slug = 'kabul-restaurant-f7' and c.slug in ('pakistani', 'bbq', 'middle-eastern')) or
  (r.slug = 'street-1-cafe-f6' and c.slug in ('cafes', 'breakfast-brunch', 'desserts', 'pizza')) or
  (r.slug = 'butt-karahi-tikka-f8' and c.slug in ('karahi', 'bbq', 'pakistani')) or
  (r.slug = 'smokehouse-grill-f10' and c.slug in ('burgers', 'pizza')) or
  (r.slug = 'quetta-tea-i8' and c.slug in ('street-food', 'breakfast-brunch', 'cafes')) or
  (r.slug = 'anatolia-turkish-grill-blue-area' and c.slug in ('turkish', 'middle-eastern', 'bbq', 'desserts')) or
  (r.slug = 'savour-foods-saddar' and c.slug in ('pakistani', 'biryani', 'street-food')) or
  (r.slug = 'habibi-restaurant-bahria-p7' and c.slug in ('pakistani', 'bbq', 'karahi', 'middle-eastern')) or
  (r.slug = 'bannu-beef-pulao-commercial' and c.slug in ('pakistani', 'biryani', 'street-food')) or
  (r.slug = 'roast-and-crumb-dha2' and c.slug in ('cafes', 'desserts', 'breakfast-brunch'))
)
on conflict do nothing;

-- Seed Verified Menus
insert into public.restaurant_menus (
  id,
  restaurant_record_id,
  name,
  source_type,
  last_verified_at
)
values
  (
    '22222222-2222-4222-8222-222222222201',
    '11111111-1111-4111-8111-111111111101',
    'Main Dining Menu',
    'khana_scene_verified',
    '2026-10-01T00:00:00Z'
  ),
  (
    '22222222-2222-4222-8222-222222222202',
    '11111111-1111-4111-8111-111111111102',
    'All-Day Café Menu',
    'official_website',
    '2026-10-05T00:00:00Z'
  ),
  (
    '22222222-2222-4222-8222-222222222203',
    '11111111-1111-4111-8111-111111111103',
    'Karahi & BBQ Menu',
    'khana_scene_verified',
    '2026-10-08T00:00:00Z'
  ),
  (
    '22222222-2222-4222-8222-222222222206',
    '11111111-1111-4111-8111-111111111106',
    'Turkish Grill Menu',
    'khana_scene_verified',
    '2026-10-14T00:00:00Z'
  ),
  (
    '22222222-2222-4222-8222-222222222207',
    '11111111-1111-4111-8111-111111111107',
    'Savour Counter Menu',
    'khana_scene_verified',
    '2026-10-02T00:00:00Z'
  ),
  (
    '22222222-2222-4222-8222-222222222208',
    '11111111-1111-4111-8111-111111111108',
    'Family Platters & Mandi Menu',
    'khana_scene_verified',
    '2026-10-06T00:00:00Z'
  )
on conflict (id) do nothing;

-- Seed Verified Menu Items
insert into public.menu_items (
  id,
  restaurant_menu_id,
  name,
  description,
  price,
  currency_code,
  category,
  is_available,
  last_verified_at
)
values
  (
    '33333333-3333-4333-8333-333333333301',
    '22222222-2222-4222-8222-222222222201',
    'Kabuli Pulao (Mutton)',
    'Slow-cooked mutton shank under seasoned rice with raisins and carrots',
    2150,
    'PKR',
    'Rice & Pulao',
    true,
    '2026-10-01T00:00:00Z'
  ),
  (
    '33333333-3333-4333-8333-333333333302',
    '22222222-2222-4222-8222-222222222201',
    'Afghani Chicken Tikka',
    'Mildly spiced charcoal-grilled chicken skewers',
    1550,
    'PKR',
    'BBQ',
    true,
    '2026-10-01T00:00:00Z'
  ),
  (
    '33333333-3333-4333-8333-333333333303',
    '22222222-2222-4222-8222-222222222202',
    'Smoked Salmon Eggs Benedict',
    'Poached eggs, toasted brioche, hollandaise, and mixed greens',
    2350,
    'PKR',
    'Breakfast & Brunch',
    true,
    '2026-10-05T00:00:00Z'
  ),
  (
    '33333333-3333-4333-8333-333333333304',
    '22222222-2222-4222-8222-222222222203',
    'Desi Chicken Karahi (Full)',
    'Prepared fresh in desi ghee with tomatoes, ginger, and green chillies',
    2950,
    'PKR',
    'Karahi',
    true,
    '2026-10-08T00:00:00Z'
  ),
  (
    '33333333-3333-4333-8333-333333333305',
    '22222222-2222-4222-8222-222222222206',
    'Adana Lamb Kebab Platter',
    'Hand-minced spiced lamb kebab served with lavash, sumac onions, and bulgur',
    2750,
    'PKR',
    'Turkish BBQ',
    true,
    '2026-10-14T00:00:00Z'
  ),
  (
    '33333333-3333-4333-8333-333333333306',
    '22222222-2222-4222-8222-222222222207',
    'Single Chicken Pulao Kabab',
    'Aromatic basmati rice with roasted chicken piece and two shami kababs',
    620,
    'PKR',
    'Pulao',
    true,
    '2026-10-02T00:00:00Z'
  ),
  (
    '33333333-3333-4333-8333-333333333307',
    '22222222-2222-4222-8222-222222222208',
    'Habibi Special BBQ Family Platter (4 Persons)',
    'Mutton ribs, malai boti, seekh kabab, fish tikka, and Bukhari rice',
    6450,
    'PKR',
    'Platters',
    true,
    '2026-10-06T00:00:00Z'
  )
on conflict (id) do nothing;
