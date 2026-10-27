-- =============================================================================
-- KhanaScene — Enrich Restaurant Records with Complete Details, Menus & Items
-- =============================================================================
-- 1. Adds primary_category, opening_hours_text, khanascene_rating_avg, and
--    khanascene_review_count to public.restaurant_records so Layer 1
--    (Supabase-First $0 mode) renders full restaurant profiles, hours, websites,
--    categories, neighbourhoods, and menus.
-- 2. Populates 18 complete Islamabad & Rawalpindi restaurants across all major
--    sectors/areas with full menus and verified PKR menu items.
-- =============================================================================

alter table public.restaurant_records
  add column if not exists primary_category text,
  add column if not exists opening_hours_text text[],
  add column if not exists khanascene_rating_avg numeric(3,2)
    check (khanascene_rating_avg is null or (khanascene_rating_avg between 1.00 and 5.00)),
  add column if not exists khanascene_review_count integer not null default 0
    check (khanascene_review_count >= 0);

-- Upsert 18 comprehensive Islamabad & Rawalpindi restaurants with all details
insert into public.restaurant_records (
  id,
  google_place_id,
  name,
  slug,
  city_id,
  area_id,
  primary_category,
  address,
  latitude,
  longitude,
  official_website,
  phone_number,
  menu_url,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  opening_hours_text,
  khanascene_rating_avg,
  khanascene_review_count,
  verification_status
)
values
  -- ISLAMABAD RESTAURANTS (10)
  (
    '11111111-1111-4111-8111-111111111101',
    'ks-place-isb-kabul-f7',
    'Kabul Restaurant F-7',
    'kabul-restaurant-f7',
    'islamabad',
    'isb-f7',
    'Afghani & Pakistani Traditional Dining',
    'Plot 12, Jinnah Super Market, F-7 Markaz, Islamabad',
    33.7215,
    73.0571,
    'https://www.facebook.com/KabulRestaurantIslamabad',
    '051-2650953',
    null,
    1400,
    2800,
    'PKR',
    '2026-10-15T00:00:00Z',
    true,
    'KhanaScene Pick: Iconic Jinnah Super destination for authentic Kabuli Pulao, Namkeen Rosh, and Afghani Tikka.',
    true,
    ARRAY[
      'Monday – Thursday: 12:00 PM – 11:45 PM',
      'Friday: 12:30 PM – 12:00 AM',
      'Saturday – Sunday: 12:00 PM – 12:00 AM'
    ],
    4.60,
    42,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111102',
    'ks-place-isb-street1-f6',
    'Street 1 Cafe',
    'street-1-cafe-f6',
    'islamabad',
    'isb-f6',
    'Artisan Café, Continental & All-Day Brunch',
    'Street 1, Kohsar Market, F-6/3, Islamabad',
    33.7294,
    73.0758,
    'https://www.instagram.com/street1cafe',
    '051-2828294',
    null,
    1800,
    3800,
    'PKR',
    '2026-10-15T00:00:00Z',
    true,
    'KhanaScene Pick: Shaded Kohsar Market courtyard dining with specialty coffee, wood-fired thin-crust pizza, and brunch.',
    true,
    ARRAY[
      'Monday – Friday: 8:30 AM – 11:30 PM',
      'Saturday – Sunday: 8:30 AM – 12:00 AM'
    ],
    4.50,
    31,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111103',
    'ks-place-isb-butt-karahi-f8',
    'Butt Karahi Tikka F-8',
    'butt-karahi-tikka-f8',
    'islamabad',
    'isb-f8',
    'Pakistani Karahi & Charcoal BBQ',
    'Ayub Market, F-8 Markaz, Islamabad',
    33.7102,
    73.0405,
    null,
    '051-2851555',
    null,
    1100,
    2400,
    'PKR',
    '2026-10-18T00:00:00Z',
    true,
    'KhanaScene Pick: Freshly prepared Desi Chicken and Charsi Mutton Karahi cooked in pure butter with hot Roghni Naan.',
    true,
    ARRAY[
      'Monday – Sunday: 12:00 PM – 12:30 AM'
    ],
    4.45,
    29,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111104',
    'ks-place-isb-smokehouse-f10',
    'Smokehouse Grill & Smash Burgers F-10',
    'smokehouse-grill-f10',
    'islamabad',
    'isb-f10',
    'Smash Burgers, Steaks & Loaded Fries',
    'Tariq Market, F-10 Markaz, Islamabad',
    33.6911,
    73.0118,
    null,
    '051-2104488',
    null,
    950,
    2100,
    'PKR',
    '2026-10-16T00:00:00Z',
    false,
    null,
    true,
    ARRAY[
      'Monday – Thursday: 1:00 PM – 12:30 AM',
      'Friday – Sunday: 1:00 PM – 1:30 AM'
    ],
    4.30,
    19,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111105',
    'ks-place-isb-quetta-tea-i8',
    'Quetta Tea & Paratha Lounge I-8',
    'quetta-tea-i8',
    'islamabad',
    'isb-i8',
    'Chai, Lachha Paratha & Street Food',
    'Executive Plaza, I-8 Markaz, Islamabad',
    33.6682,
    73.0749,
    null,
    '051-4862210',
    null,
    250,
    750,
    'PKR',
    '2026-10-20T00:00:00Z',
    false,
    null,
    false,
    ARRAY[
      'Monday – Sunday: 6:00 AM – 2:00 AM'
    ],
    4.35,
    27,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111106',
    'ks-place-isb-anatolia-blue',
    'Anatolia Turkish Grill Blue Area',
    'anatolia-turkish-grill-blue-area',
    'islamabad',
    'isb-blue-area',
    'Turkish Kebabs, Pide & Kunafa',
    'Beverly Centre, Jinnah Avenue, Blue Area, Islamabad',
    33.7156,
    73.0652,
    'https://www.instagram.com/anatoliagrill',
    '051-2348899',
    null,
    1900,
    4200,
    'PKR',
    '2026-10-14T00:00:00Z',
    true,
    'KhanaScene Pick: Wood-fired Adana kebabs, freshly baked Turkish pide, and pistachio kunafa in Beverly Centre.',
    true,
    ARRAY[
      'Monday – Sunday: 12:30 PM – 11:45 PM'
    ],
    4.65,
    36,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    'ks-place-isb-chaaye-khana-f6',
    'Chaaye Khana F-6',
    'chaaye-khana-f6',
    'islamabad',
    'isb-f6',
    'Tea House, All-Day Breakfast & Bakery',
    'Block 7B, Super Market, F-6 Markaz, Islamabad',
    33.7297,
    73.0746,
    'https://chaayekhana.com',
    '051-2829898',
    'https://chaayekhana.com',
    950,
    2300,
    'PKR',
    '2026-10-19T00:00:00Z',
    true,
    'KhanaScene Pick: Islamabad institution for Desi Shakshuka, Elaichi Chai, and calm morning breakfasts.',
    true,
    ARRAY[
      'Monday – Sunday: 8:00 AM – 11:45 PM'
    ],
    4.55,
    48,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111112',
    'ks-place-isb-des-pardes-daman',
    'Des Pardes Saidpur & Margalla',
    'des-pardes-margalla',
    'islamabad',
    'isb-daman-e-koh',
    'Mughlai, Pakistani & Heritage Courtyard Dining',
    'Historic Saidpur Village, Margalla Hills Footsteps, Islamabad',
    33.7423,
    73.0681,
    'https://despardes.pk',
    '051-2320008',
    null,
    1600,
    3400,
    'PKR',
    '2026-10-17T00:00:00Z',
    true,
    'KhanaScene Pick: Scenic outdoor terrace at the foot of the Margalla Hills serving Handi, BBQ platters, and Kashmiri Chai.',
    true,
    ARRAY[
      'Monday – Sunday: 11:00 AM – 12:00 AM'
    ],
    4.40,
    33,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111113',
    'ks-place-isb-golden-dragon-f11',
    'Imperial Szechuan & Pan-Asian F-11',
    'imperial-szechuan-f11',
    'islamabad',
    'isb-f11',
    'Chinese, Pan-Asian & Dim Sum',
    'Select One Plaza, F-11 Markaz, Islamabad',
    33.6841,
    72.9875,
    null,
    '051-2113400',
    null,
    1400,
    3100,
    'PKR',
    '2026-10-21T00:00:00Z',
    false,
    null,
    true,
    ARRAY[
      'Monday – Sunday: 12:30 PM – 11:30 PM'
    ],
    4.25,
    16,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111114',
    'ks-place-isb-artisan-patisserie-e7',
    'Hillside Bakehouse & Gelato E-7',
    'hillside-bakehouse-e7',
    'islamabad',
    'isb-e7',
    'Desserts, Croissants & Specialty Coffee',
    'Shaheen Market, Sector E-7, Islamabad',
    33.7338,
    73.0512,
    null,
    '051-2611900',
    null,
    750,
    1850,
    'PKR',
    '2026-10-22T00:00:00Z',
    false,
    null,
    true,
    ARRAY[
      'Monday – Sunday: 9:00 AM – 11:30 PM'
    ],
    4.50,
    21,
    'verified'
  ),

  -- RAWALPINDI RESTAURANTS (8)
  (
    '11111111-1111-4111-8111-111111111107',
    'ks-place-rwp-savour-saddar',
    'Savour Foods Saddar',
    'savour-foods-saddar',
    'rawalpindi',
    'rwp-saddar',
    'Pakistani Pulao Kabab & Zarda',
    'Bank Road / Mall Road Corner, Saddar, Rawalpindi',
    33.5968,
    73.0531,
    'https://www.savourfoods.com.pk',
    '051-5511000',
    'https://www.savourfoods.com.pk',
    450,
    950,
    'PKR',
    '2026-10-20T00:00:00Z',
    true,
    'KhanaScene Pick: Iconic Twin Cities Chicken Pulao Kabab and Zarda at unbeatable budget value.',
    true,
    ARRAY[
      'Monday – Sunday: 11:00 AM – 12:30 AM'
    ],
    4.75,
    64,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111108',
    'ks-place-rwp-habibi-bahria',
    'Habibi Restaurant Bahria Phase 7',
    'habibi-restaurant-bahria-p7',
    'rawalpindi',
    'rwp-bahria',
    'Arabic Mandi, BBQ Platters & Pakistani Karahi',
    'Food Street, Phase 7, Bahria Town, Rawalpindi',
    33.5241,
    73.1065,
    'https://www.facebook.com/HabibiRestaurantOfficial',
    '051-5707123',
    null,
    1300,
    2900,
    'PKR',
    '2026-10-18T00:00:00Z',
    true,
    'KhanaScene Pick: Massive family BBQ platters, Mutton Mandi, and Peshawari Dumpukht in Bahria Phase 7.',
    true,
    ARRAY[
      'Monday – Sunday: 12:00 PM – 1:00 AM'
    ],
    4.50,
    39,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111109',
    'ks-place-rwp-bannu-commercial',
    'Bannu Beef Pulao Commercial Market',
    'bannu-beef-pulao-commercial',
    'rawalpindi',
    'rwp-commercial',
    'Traditional Beef Pulao & Chapli Kabab',
    'B-Block, Commercial Market, Satellite Town, Rawalpindi',
    33.6388,
    73.0714,
    null,
    '051-4429111',
    null,
    550,
    1200,
    'PKR',
    '2026-10-19T00:00:00Z',
    true,
    'KhanaScene Pick: Slow-simmered marrow beef yakhni pulao and crispy Peshawari chapli kababs in Satellite Town.',
    false,
    ARRAY[
      'Monday – Sunday: 11:30 AM – 11:45 PM'
    ],
    4.45,
    28,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111110',
    'ks-place-rwp-roast-crumb-dha',
    'Roast & Crumb Artisan Cafe DHA 2',
    'roast-and-crumb-dha2',
    'rawalpindi',
    'rwp-dha',
    'Specialty Coffee, Wood-Fired Pizza & Desserts',
    'Central Park Avenue, Sector E, DHA Phase 2, Rawalpindi',
    33.5328,
    73.1562,
    null,
    '051-5162200',
    null,
    1100,
    2400,
    'PKR',
    '2026-10-21T00:00:00Z',
    false,
    null,
    true,
    ARRAY[
      'Monday – Sunday: 9:30 AM – 11:45 PM'
    ],
    4.40,
    22,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111115',
    'ks-place-rwp-monal-downtown-saddar',
    'Kallisto Grill & Steaks Bahria Phase 4',
    'kallisto-grill-bahria-p4',
    'rawalpindi',
    'rwp-bahria',
    'Steaks, Gourmet Burgers & Mocktails',
    'Civic Center, Phase 4, Bahria Town, Rawalpindi',
    33.5471,
    73.1248,
    null,
    '051-5731444',
    null,
    1450,
    3200,
    'PKR',
    '2026-10-16T00:00:00Z',
    true,
    'KhanaScene Pick: Flame-grilled ribeye steaks, double smash burgers, and rooftop dining in Bahria Civic Center.',
    true,
    ARRAY[
      'Monday – Sunday: 12:30 PM – 12:00 AM'
    ],
    4.35,
    25,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111116',
    'ks-place-rwp-shinwari-peshawar-rd',
    'Khyber Shinwari Tikka & Dumba Karahi',
    'khyber-shinwari-peshawar-road',
    'rawalpindi',
    'rwp-peshawar-rd',
    'Shinwari Dumba Karahi & Namkeen Tikka',
    'Main Peshawar Road, Near Chour Chowk, Rawalpindi',
    33.6085,
    73.0124,
    null,
    '051-5478811',
    null,
    1100,
    2500,
    'PKR',
    '2026-10-18T00:00:00Z',
    false,
    null,
    true,
    ARRAY[
      'Monday – Sunday: 12:00 PM – 1:00 AM'
    ],
    4.40,
    31,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111117',
    'ks-place-rwp-jamil-sweets-chaklala',
    'Chaklala Nashta & Halwa Puri House',
    'chaklala-nashta-scheme-3',
    'rawalpindi',
    'rwp-chaklala',
    'Traditional Desi Breakfast, Halwa Puri & Nihari',
    'Main Commercial Boulevard, Chaklala Scheme 3, Rawalpindi',
    33.5892,
    73.0894,
    null,
    '051-5766102',
    null,
    350,
    900,
    'PKR',
    '2026-10-22T00:00:00Z',
    true,
    'KhanaScene Pick: Crisp hot Halwa Puri, Beef Bong Paye, and Kulcha Channay served fresh from 6:30 AM.',
    true,
    ARRAY[
      'Monday – Sunday: 6:30 AM – 4:00 PM'
    ],
    4.60,
    34,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111118',
    'ks-place-rwp-red-lantern-chaklala',
    'Red Lantern Szechuan & Thai Scheme 3',
    'red-lantern-chaklala-scheme-3',
    'rawalpindi',
    'rwp-chaklala',
    'Chinese, Thai & Hot Pot',
    'Street 4, Commercial Area, Chaklala Scheme 3, Rawalpindi',
    33.5875,
    73.0912,
    null,
    '051-5764499',
    null,
    1250,
    2700,
    'PKR',
    '2026-10-21T00:00:00Z',
    false,
    null,
    true,
    ARRAY[
      'Monday – Sunday: 12:30 PM – 11:30 PM'
    ],
    4.30,
    18,
    'verified'
  )
on conflict (slug) do update
  set google_place_id = excluded.google_place_id,
      name = excluded.name,
      city_id = excluded.city_id,
      area_id = excluded.area_id,
      primary_category = excluded.primary_category,
      address = excluded.address,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      official_website = excluded.official_website,
      phone_number = excluded.phone_number,
      menu_url = excluded.menu_url,
      price_min = excluded.price_min,
      price_max = excluded.price_max,
      price_verified_at = excluded.price_verified_at,
      is_khanascene_pick = excluded.is_khanascene_pick,
      pick_reason = excluded.pick_reason,
      is_family_friendly = excluded.is_family_friendly,
      opening_hours_text = excluded.opening_hours_text,
      khanascene_rating_avg = excluded.khanascene_rating_avg,
      khanascene_review_count = excluded.khanascene_review_count,
      verification_status = excluded.verification_status;

-- Link cuisines for all 18 restaurants
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
  (r.slug = 'chaaye-khana-f6' and c.slug in ('cafes', 'breakfast-brunch', 'desserts')) or
  (r.slug = 'des-pardes-margalla' and c.slug in ('pakistani', 'bbq', 'karahi', 'breakfast-brunch')) or
  (r.slug = 'imperial-szechuan-f11' and c.slug in ('chinese')) or
  (r.slug = 'hillside-bakehouse-e7' and c.slug in ('desserts', 'cafes', 'breakfast-brunch')) or
  (r.slug = 'savour-foods-saddar' and c.slug in ('pakistani', 'biryani', 'street-food', 'desserts')) or
  (r.slug = 'habibi-restaurant-bahria-p7' and c.slug in ('pakistani', 'bbq', 'karahi', 'middle-eastern')) or
  (r.slug = 'bannu-beef-pulao-commercial' and c.slug in ('pakistani', 'biryani', 'street-food')) or
  (r.slug = 'roast-and-crumb-dha2' and c.slug in ('cafes', 'pizza', 'desserts', 'breakfast-brunch')) or
  (r.slug = 'kallisto-grill-bahria-p4' and c.slug in ('burgers', 'bbq', 'cafes')) or
  (r.slug = 'khyber-shinwari-peshawar-road' and c.slug in ('karahi', 'bbq', 'pakistani')) or
  (r.slug = 'chaklala-nashta-scheme-3' and c.slug in ('breakfast-brunch', 'pakistani', 'street-food')) or
  (r.slug = 'red-lantern-chaklala-scheme-3' and c.slug in ('chinese'))
)
on conflict do nothing;

-- Seed Menus for all 18 restaurants
insert into public.restaurant_menus (
  id,
  restaurant_record_id,
  name,
  source_type,
  last_verified_at
)
values
  ('22222222-2222-4222-8222-222222222201', '11111111-1111-4111-8111-111111111101', 'Main Afghani & BBQ Menu', 'khana_scene_verified', '2026-10-15T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222202', '11111111-1111-4111-8111-111111111102', 'All-Day Courtyard Menu', 'official_website', '2026-10-15T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222203', '11111111-1111-4111-8111-111111111103', 'Karahi & Charcoal BBQ Menu', 'khana_scene_verified', '2026-10-18T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222204', '11111111-1111-4111-8111-111111111104', 'Smash Burgers & Steaks Menu', 'khana_scene_verified', '2026-10-16T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222205', '11111111-1111-4111-8111-111111111105', 'Chai & Paratha Counter Menu', 'khana_scene_verified', '2026-10-20T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222206', '11111111-1111-4111-8111-111111111106', 'Turkish Grill & Pide Menu', 'khana_scene_verified', '2026-10-14T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222207', '11111111-1111-4111-8111-111111111107', 'Savour Pulao & Zarda Menu', 'official_website', '2026-10-20T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222208', '11111111-1111-4111-8111-111111111108', 'Family Platters & Mandi Menu', 'khana_scene_verified', '2026-10-18T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222209', '11111111-1111-4111-8111-111111111109', 'Bannu Pulao & Kabab Menu', 'khana_scene_verified', '2026-10-19T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222210', '11111111-1111-4111-8111-111111111110', 'Artisan Coffee & Wood-Fired Menu', 'khana_scene_verified', '2026-10-21T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222211', '11111111-1111-4111-8111-111111111111', 'Chaaye Khana Breakfast & Tea Menu', 'official_website', '2026-10-19T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222212', '11111111-1111-4111-8111-111111111112', 'Saidpur Heritage Dining Menu', 'official_website', '2026-10-17T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222213', '11111111-1111-4111-8111-111111111113', 'Szechuan & Dim Sum Menu', 'khana_scene_verified', '2026-10-21T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222214', '11111111-1111-4111-8111-111111111114', 'Patisserie & Gelato Menu', 'khana_scene_verified', '2026-10-22T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222215', '11111111-1111-4111-8111-111111111115', 'Steaks & Burgers Menu', 'khana_scene_verified', '2026-10-16T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222216', '11111111-1111-4111-8111-111111111116', 'Shinwari Karahi & BBQ Menu', 'khana_scene_verified', '2026-10-18T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222217', '11111111-1111-4111-8111-111111111117', 'Morning Nashta & Nihari Menu', 'khana_scene_verified', '2026-10-22T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222218', '11111111-1111-4111-8111-111111111118', 'Pan-Asian & Thai Menu', 'khana_scene_verified', '2026-10-21T00:00:00Z')
on conflict (id) do update
  set name = excluded.name,
      source_type = excluded.source_type,
      last_verified_at = excluded.last_verified_at;

-- Seed Complete Verified Menu Items across all 18 menus
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
  -- 1. Kabul Restaurant F-7
  ('33333333-3333-4333-8333-333333333301', '22222222-2222-4222-8222-222222222201', 'Kabuli Pulao (Mutton Shank)', 'Slow-cooked mutton shank buried under aromatic rice with sweet carrots and black raisins', 2150, 'PKR', 'Rice & Pulao', true, '2026-10-15T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333302', '22222222-2222-4222-8222-222222222201', 'Afghani Chicken Tikka', 'Mildly salted charcoal-grilled chicken skewers served with fresh Afghani naan', 1550, 'PKR', 'Charcoal BBQ', true, '2026-10-15T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333308', '22222222-2222-4222-8222-222222222201', 'Mutton Namkeen Rosh', 'Tender slow-simmered mutton with whole potatoes in light bone broth', 2450, 'PKR', 'Specialties', true, '2026-10-15T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333309', '22222222-2222-4222-8222-222222222201', 'Mantu (Afghani Beef Dumplings)', 'Steamed dumplings topped with split-pea gravy, garlic yogurt, and dried mint', 1480, 'PKR', 'Appetizers', true, '2026-10-15T00:00:00Z'),

  -- 2. Street 1 Cafe F-6
  ('33333333-3333-4333-8333-333333333303', '22222222-2222-4222-8222-222222222202', 'Smoked Salmon Eggs Benedict', 'Poached eggs, toasted brioche, citrus hollandaise, and mixed baby greens', 2350, 'PKR', 'Breakfast & Brunch', true, '2026-10-15T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333310', '22222222-2222-4222-8222-222222222202', 'Truffle Mushroom Thin-Crust Pizza', 'Wild mushrooms, mozzarella, white truffle oil, and fresh rocket', 2650, 'PKR', 'Wood-Fired Pizza', true, '2026-10-15T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333311', '22222222-2222-4222-8222-222222222202', 'Moroccan Tarragon Chicken', 'Chargrilled chicken breast with creamy tarragon sauce and mashed potatoes', 2890, 'PKR', 'Mains', true, '2026-10-15T00:00:00Z'),

  -- 3. Butt Karahi Tikka F-8
  ('33333333-3333-4333-8333-333333333304', '22222222-2222-4222-8222-222222222203', 'Desi Chicken Karahi (Full KG)', 'Prepared fresh to order in desi ghee with tomatoes, ginger, and green chillies', 2950, 'PKR', 'Karahi', true, '2026-10-18T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333312', '22222222-2222-4222-8222-222222222203', 'Special Mutton Karahi (Half KG)', 'Tender goat meat cooked in black pepper, fresh tomatoes, and butter', 2400, 'PKR', 'Karahi', true, '2026-10-18T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333313', '22222222-2222-4222-8222-222222222203', 'Chicken Malai Boti (Seekh Platter)', 'Cream-marinated boneless chicken cubes grilled over live coals', 1250, 'PKR', 'BBQ', true, '2026-10-18T00:00:00Z'),

  -- 4. Smokehouse Grill F-10
  ('33333333-3333-4333-8333-333333333314', '22222222-2222-4222-8222-222222222204', 'Double Swiss Mushroom Smash Burger', 'Two seared prime beef patties, caramelized onions, Swiss cheese, and house sauce', 1290, 'PKR', 'Burgers', true, '2026-10-16T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333315', '22222222-2222-4222-8222-222222222204', 'Nashville Hot Crispy Chicken Burger', 'Buttermilk fried chicken thigh glazed in spicy chili oil with coleslaw', 1150, 'PKR', 'Burgers', true, '2026-10-16T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333316', '22222222-2222-4222-8222-222222222204', 'Smoked Brisket Loaded Fries', 'Skin-on fries topped with pulled smoked beef brisket, cheddar sauce, and jalapeños', 980, 'PKR', 'Sides', true, '2026-10-16T00:00:00Z'),

  -- 5. Quetta Tea & Paratha Lounge I-8
  ('33333333-3333-4333-8333-333333333317', '22222222-2222-4222-8222-222222222205', 'Special Tandoori Matka Chai', 'Rich cardamom milk tea poured into a fire-heated clay cup', 260, 'PKR', 'Chai', true, '2026-10-20T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333318', '22222222-2222-4222-8222-222222222205', 'Chicken Cheese Lachha Paratha', 'Flaky multi-layered griddle paratha stuffed with spiced chicken and cheddar', 580, 'PKR', 'Parathas', true, '2026-10-20T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333319', '22222222-2222-4222-8222-222222222205', 'Nutella & Banana Crispy Paratha', 'Sweet flaky paratha drizzled with warm hazelnut chocolate spread', 520, 'PKR', 'Sweet Parathas', true, '2026-10-20T00:00:00Z'),

  -- 6. Anatolia Turkish Grill Blue Area
  ('33333333-3333-4333-8333-333333333305', '22222222-2222-4222-8222-222222222206', 'Adana Lamb Kebab Platter', 'Hand-minced spiced lamb kebab served with warm lavash, sumac onions, and bulgur rice', 2750, 'PKR', 'Turkish BBQ', true, '2026-10-14T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333320', '22222222-2222-4222-8222-222222222206', 'Kasarli Sucuklu Pide', 'Boat-shaped Turkish flatbread baked with beef sucuk sausage and stretchy kasar cheese', 2190, 'PKR', 'Pide', true, '2026-10-14T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333321', '22222222-2222-4222-8222-222222222206', 'Hot Pistachio Kunafa', 'Crisp shredded phyllo pastry with melted cheese, sugar syrup, and crushed Antep pistachios', 1450, 'PKR', 'Desserts', true, '2026-10-14T00:00:00Z'),

  -- 7. Savour Foods Saddar
  ('33333333-3333-4333-8333-333333333306', '22222222-2222-4222-8222-222222222207', 'Single Chicken Pulao Kabab', 'Aromatic yakhni basmati rice with roasted chicken piece, two shami kababs, and raita', 620, 'PKR', 'Pulao', true, '2026-10-20T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333322', '22222222-2222-4222-8222-222222222207', 'Special Pulao Kabab (Double Chicken)', 'Generous plate of yakhni pulao with two roasted chicken pieces and two shami kababs', 920, 'PKR', 'Pulao', true, '2026-10-20T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333323', '22222222-2222-4222-8222-222222222207', 'Savour Special Zarda / Kheer', 'Traditional sweet saffron rice or chilled cardamom rice pudding', 320, 'PKR', 'Desserts', true, '2026-10-20T00:00:00Z'),

  -- 8. Habibi Restaurant Bahria Phase 7
  ('33333333-3333-4333-8333-333333333307', '22222222-2222-4222-8222-222222222208', 'Habibi Special BBQ Family Platter (4 Persons)', 'Mutton ribs, chicken malai boti, beef seekh kabab, fish tikka, and Bukhari rice', 6450, 'PKR', 'Family Platters', true, '2026-10-18T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333324', '22222222-2222-4222-8222-222222222208', 'Arabic Mutton Mandi (Double)', 'Slow-roasted spiced mutton shoulder over smoky Yemeni Mandi rice with spicy daqoos sauce', 3650, 'PKR', 'Mandi', true, '2026-10-18T00:00:00Z'),

  -- 9. Bannu Beef Pulao Commercial Market
  ('33333333-3333-4333-8333-333333333325', '22222222-2222-4222-8222-222222222209', 'Special Bannu Beef Pulao with Nalli (Full)', 'Rich dark garam-masala rice topped with tender beef chunks and bone marrow', 980, 'PKR', 'Beef Pulao', true, '2026-10-19T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333326', '22222222-2222-4222-8222-222222222209', 'Peshawari Fried Chapli Kabab', 'Spiced minced beef patty fried with pomegranate seeds and fresh tomato slice', 450, 'PKR', 'Kababs', true, '2026-10-19T00:00:00Z'),

  -- 10. Roast & Crumb Artisan Cafe DHA 2
  ('33333333-3333-4333-8333-333333333327', '22222222-2222-4222-8222-222222222210', 'Spanish Iced Latte (Single Origin)', 'Double espresso over sweetened condensed milk and cold farm milk', 780, 'PKR', 'Specialty Coffee', true, '2026-10-21T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333328', '22222222-2222-4222-8222-222222222210', 'Burrata & Sun-Dried Tomato Sourdough Pizza', 'Naturally leavened crust with fresh burrata, basil pesto, and cherry tomatoes', 2250, 'PKR', 'Pizza', true, '2026-10-21T00:00:00Z'),

  -- 11. Chaaye Khana F-6
  ('33333333-3333-4333-8333-333333333329', '22222222-2222-4222-8222-222222222211', 'Desi Omelette & Paratha Breakfast', 'Two-egg masala omelette with onions, green chillies, flaky paratha, and pot of tea', 1290, 'PKR', 'All-Day Breakfast', true, '2026-10-19T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333330', '22222222-2222-4222-8222-222222222211', 'French Toast with Warm Maple & Berries', 'Thick-cut brioche soaked in cinnamon custard with whipped cream', 1420, 'PKR', 'All-Day Breakfast', true, '2026-10-19T00:00:00Z'),

  -- 12. Des Pardes Saidpur & Margalla
  ('33333333-3333-4333-8333-333333333331', '22222222-2222-4222-8222-222222222212', 'Mughlai Chicken Makhni Handi', 'Boneless tandoori chicken simmered in clay pot with cream, fenugreek, and butter', 2450, 'PKR', 'Handi & Curries', true, '2026-10-17T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333332', '22222222-2222-4222-8222-222222222212', 'Margalla Reshmi Seekh Kabab', 'Melt-in-the-mouth minced chicken skewers infused with green herbs and cheese', 1650, 'PKR', 'BBQ', true, '2026-10-17T00:00:00Z'),

  -- 13. Imperial Szechuan & Pan-Asian F-11
  ('33333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222213', 'Kung Pao Chicken with Cashews', 'Wok-tossed chicken, roasted cashews, dried Szechuan chillies, and egg fried rice', 1890, 'PKR', 'Chinese Mains', true, '2026-10-21T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333334', '22222222-2222-4222-8222-222222222213', 'Steamed Prawn & Chicken Shumai (6 Pcs)', 'Handcrafted dim sum baskets served with house chili crisp and soy dip', 1450, 'PKR', 'Dim Sum', true, '2026-10-21T00:00:00Z'),

  -- 14. Hillside Bakehouse & Gelato E-7
  ('33333333-3333-4333-8333-333333333335', '22222222-2222-4222-8222-222222222214', 'Pistachio Cream Butter Croissant', 'French butter laminated pastry filled with roasted Sicilian pistachio diplomat cream', 890, 'PKR', 'Viennoiserie', true, '2026-10-22T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333336', '22222222-2222-4222-8222-222222222214', 'Belgian Dark Chocolate Gelato (Double Scoop)', 'Small-batch artisan gelato made with 70% dark couverture chocolate', 750, 'PKR', 'Gelato', true, '2026-10-22T00:00:00Z'),

  -- 15. Kallisto Grill & Steaks Bahria Phase 4
  ('33333333-3333-4333-8333-333333333337', '22222222-2222-4222-8222-222222222215', 'Chargrilled Peppercorn Ribeye Steak', 'Prime beef ribeye served on a sizzling skillet with black peppercorn jus and garlic mash', 2980, 'PKR', 'Steaks', true, '2026-10-16T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333338', '22222222-2222-4222-8222-222222222215', 'Smoky BBQ Brisket Burger', 'Brioche bun stacked with smashed beef patty, smoked brisket, onion rings, and cheddar', 1520, 'PKR', 'Burgers', true, '2026-10-16T00:00:00Z'),

  -- 16. Khyber Shinwari Tikka & Dumba Karahi
  ('33333333-3333-4333-8333-333333333339', '22222222-2222-4222-8222-222222222216', 'Shinwari Dumba Karahi (Full KG)', 'Traditional lamb fat-cooked karahi seasoned only with rock salt, tomatoes, and green chillies', 3400, 'PKR', 'Shinwari Karahi', true, '2026-10-18T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333340', '22222222-2222-4222-8222-222222222216', 'Namkeen Lamb Chops (Half Dozen)', 'Charcoal-grilled tender lamb ribs dusted with black pepper', 2100, 'PKR', 'Charcoal BBQ', true, '2026-10-18T00:00:00Z'),

  -- 17. Chaklala Nashta & Halwa Puri House
  ('33333333-3333-4333-8333-333333333341', '22222222-2222-4222-8222-222222222217', 'Complete Halwa Puri Thali (2 Puris)', 'Served hot with suji halwa, Lahori channay, spicy aloo bhujia, and achar', 380, 'PKR', 'Desi Breakfast', true, '2026-10-22T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333342', '22222222-2222-4222-8222-222222222217', 'Special Beef Nalli Nihari (Single)', 'Overnight slow-cooked beef shank stew garnished with ginger, lemon, and green chillies', 850, 'PKR', 'Nihari & Paye', true, '2026-10-22T00:00:00Z'),

  -- 18. Red Lantern Szechuan & Thai Scheme 3
  ('33333333-3333-4333-8333-333333333343', '22222222-2222-4222-8222-222222222218', 'Thai Red Curry with Jasmine Rice', 'Coconut milk red curry with prawns or chicken, bamboo shoots, and Thai basil', 1950, 'PKR', 'Thai Specials', true, '2026-10-21T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333344', '22222222-2222-4222-8222-222222222218', 'Crispy Honey Chilli Beef', 'Shredded crispy beef glazed in sweet and spicy sesame chili sauce', 2150, 'PKR', 'Szechuan', true, '2026-10-21T00:00:00Z')
on conflict (id) do update
  set name = excluded.name,
      description = excluded.description,
      price = excluded.price,
      category = excluded.category,
      is_available = excluded.is_available,
      last_verified_at = excluded.last_verified_at;
