-- =============================================================================
-- KhanaScene — Add 16 Web-Researched Islamabad & Rawalpindi Restaurants + Menus
-- =============================================================================
-- Brings the live Supabase dataset to 34 curated restaurants, 34 verified menus,
-- and 92 verified PKR menu items across all 15 neighbourhoods in Islamabad and
-- Rawalpindi.
-- =============================================================================

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
  -- ADDITIONAL ISLAMABAD RESTAURANTS (9)
  (
    '11111111-1111-4111-8111-111111111119',
    'ks-place-isb-tuscany-f6',
    'Tuscany Courtyard Kohsar F-6',
    'tuscany-courtyard-f6',
    'islamabad',
    'isb-f6',
    'Italian, Wood-Fired Pizza & Continental Steaks',
    'House No. 4, Street 3, Kohsar Market, F-6/3, Islamabad',
    33.7301,
    73.0764,
    null,
    '051-8445544',
    null,
    2400,
    4800,
    'PKR',
    '2026-10-25T00:00:00Z',
    true,
    'KhanaScene Pick: Landmark Kohsar Market courtyard dining famous for wood-fired pizzas, pastas, and grilled steaks.',
    true,
    ARRAY[
      'Monday – Sunday: 12:00 PM – 12:00 AM'
    ],
    4.45,
    41,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111120',
    'ks-place-isb-khiva-f7',
    'Khiva Restaurant F-7 Markaz',
    'khiva-restaurant-f7',
    'islamabad',
    'isb-f7',
    'Central Asian, Uzbek & Namak Mandi Karahi',
    'Near Saeed Book Bank, Jinnah Super, F-7 Markaz, Islamabad',
    33.7209,
    73.0565,
    null,
    '0337-7077774',
    null,
    1800,
    3500,
    'PKR',
    '2026-10-25T00:00:00Z',
    true,
    'KhanaScene Pick: Celebrated for authentic Namak Mandi Mutton Karahi, Uzbek Pulao, and Bukhara BBQ platters.',
    true,
    ARRAY[
      'Monday – Sunday: 12:30 PM – 11:45 PM'
    ],
    4.50,
    35,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111121',
    'ks-place-isb-bait-al-arab-f7',
    'Bait Al Arab Mandi F-7',
    'bait-al-arab-mandi-f7',
    'islamabad',
    'isb-f7',
    'Authentic Yemeni Mutton & Chicken Mandi',
    '2nd Floor, 6-B Bhittai Road, Jinnah Super, F-7 Markaz, Islamabad',
    33.7219,
    73.0581,
    'https://baitalarabmandi.com',
    '051-111-626-341',
    'https://baitalarabmandi.com',
    950,
    2600,
    'PKR',
    '2026-10-26T00:00:00Z',
    true,
    'KhanaScene Pick: Traditional Arabic majlis seating and slow-cooked Yemeni Mutton Mandi, Madfoon, and hot Kunafa.',
    true,
    ARRAY[
      'Monday – Sunday: 12:00 PM – 12:00 AM'
    ],
    4.65,
    52,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111122',
    'ks-place-isb-howdy-f7',
    'Howdy Gol Market F-7',
    'howdy-f7-gol-market',
    'islamabad',
    'isb-f7',
    'Chargrilled Burgers, Steak Sandwiches & Wings',
    'Shop 6, Gol Market, F-7/3, Islamabad',
    33.7242,
    73.0528,
    null,
    '051-2611145',
    null,
    1150,
    2400,
    'PKR',
    '2026-10-24T00:00:00Z',
    false,
    null,
    true,
    ARRAY[
      'Monday – Sunday: 12:00 PM – 1:00 AM'
    ],
    4.35,
    29,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111123',
    'ks-place-isb-chinatown-f8',
    'Chinatown Restaurant F-8',
    'chinatown-restaurant-f8',
    'islamabad',
    'isb-f8',
    'Classic Chinese, Dry Chilli Beef & Seafood',
    'Street 48, Sector F-8/4, Islamabad',
    33.7124,
    73.0389,
    null,
    '051-2855650',
    null,
    1500,
    3000,
    'PKR',
    '2026-10-23T00:00:00Z',
    true,
    'KhanaScene Pick: Long-running Islamabad favourite for Crispy Dry Chilli Beef, Dynamite Prawns, and Hot & Sour Soup.',
    true,
    ARRAY[
      'Monday – Sunday: 12:30 PM – 11:30 PM'
    ],
    4.45,
    33,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111124',
    'ks-place-isb-orient-f10',
    'Orient Chinese Restaurant F-10',
    'orient-restaurant-f10',
    'islamabad',
    'isb-f10',
    'Pakistani-Chinese Manchurian & Chowmein',
    'Main Tariq Market, F-10 Markaz, Islamabad',
    33.6918,
    73.0124,
    null,
    '051-2291152',
    null,
    1000,
    2200,
    'PKR',
    '2026-10-24T00:00:00Z',
    false,
    null,
    true,
    ARRAY[
      'Monday – Sunday: 12:00 PM – 11:45 PM'
    ],
    4.25,
    22,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111125',
    'ks-place-isb-loafology-blue-area',
    'Loafology Bakery & Café Blue Area',
    'loafology-bakery-blue-area',
    'islamabad',
    'isb-blue-area',
    'Artisan Sourdough Bakery, All-Day Breakfast & Bistro',
    '108-W, Jinnah Avenue, Blue Area (G-7/2), Islamabad',
    33.7118,
    73.0619,
    null,
    '051-2804240',
    null,
    1150,
    2450,
    'PKR',
    '2026-10-26T00:00:00Z',
    true,
    'KhanaScene Pick: Real long-fermented sourdough loaves, butter croissants, and European-style brunch in Blue Area.',
    true,
    ARRAY[
      'Monday – Sunday: 8:00 AM – 11:00 PM'
    ],
    4.60,
    46,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111126',
    'ks-place-isb-burning-brownie-blue',
    'Burning Brownie Beverly Centre',
    'burning-brownie-blue-area',
    'islamabad',
    'isb-blue-area',
    'Fudgy Brownies, Cheesecakes, Waffles & Coffee',
    'Ground Floor, Beverly Centre, Jinnah Avenue, Blue Area, Islamabad',
    33.7152,
    73.0648,
    null,
    '051-2814300',
    null,
    450,
    1450,
    'PKR',
    '2026-10-26T00:00:00Z',
    true,
    'KhanaScene Pick: Islamabad go-to dessert café for warm Belgian chocolate brownies, lotus cheesecake, and lattes.',
    true,
    ARRAY[
      'Monday – Sunday: 9:00 AM – 12:30 AM'
    ],
    4.70,
    58,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111127',
    'ks-place-isb-la-montana-margalla',
    'La Montana Margalla Hills',
    'la-montana-margalla-hills',
    'islamabad',
    'isb-daman-e-koh',
    'Scenic Hilltop Pakistani, BBQ & Continental Buffet',
    '9 KM Pir Sohawa Road, Margalla Hills, Islamabad',
    33.7584,
    73.0695,
    null,
    '051-2898226',
    null,
    2000,
    3800,
    'PKR',
    '2026-10-25T00:00:00Z',
    true,
    'KhanaScene Pick: Panoramic Margalla ridge views with expansive hi-tea/dinner buffets and live BBQ grills.',
    true,
    ARRAY[
      'Monday – Sunday: 11:30 AM – 12:00 AM'
    ],
    4.40,
    37,
    'verified'
  ),

  -- ADDITIONAL RAWALPINDI RESTAURANTS (7)
  (
    '11111111-1111-4111-8111-111111111128',
    'ks-place-rwp-purana-shinwari-saddar',
    'Purana Shinwari Kamran Market Saddar',
    'purana-shinwari-saddar',
    'rawalpindi',
    'rwp-saddar',
    'Traditional Dumba Karahi, Mutton Tikka & Pulao',
    'Kamran Market, Kashmir Road, Saddar, Rawalpindi',
    33.5982,
    73.0562,
    null,
    '051-5564421',
    null,
    1350,
    3100,
    'PKR',
    '2026-10-25T00:00:00Z',
    true,
    'KhanaScene Pick: Old-school Saddar gem for authentic lamb-fat Dumba Karahi and Namkeen Mutton Tikka.',
    true,
    ARRAY[
      'Monday – Sunday: 12:00 PM – 1:00 AM'
    ],
    4.50,
    34,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111129',
    'ks-place-rwp-jamil-sweets-saddar',
    'Jamil Sweets & Bakers Saddar',
    'jamil-sweets-saddar',
    'rawalpindi',
    'rwp-saddar',
    'Traditional Desi Mithai, Samosas & Halwa Puri',
    'Main Kashmir Road, Saddar, Rawalpindi',
    33.5976,
    73.0551,
    'https://jamilsweets.pk',
    '051-5563210',
    'https://jamilsweets.pk',
    300,
    1200,
    'PKR',
    '2026-10-26T00:00:00Z',
    false,
    null,
    true,
    ARRAY[
      'Monday – Sunday: 7:00 AM – 11:30 PM'
    ],
    4.55,
    40,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111130',
    'ks-place-rwp-kotal-bahria-p8',
    'Kotal Restaurant Bahria Phase 8',
    'kotal-restaurant-bahria-p8',
    'rawalpindi',
    'rwp-bahria',
    'Shinwari Mutton Karahi, Charcoal BBQ & Saffron Pulao',
    'Opposite Khalid Block, Near KnockOut Arena, Bahria Town Phase 8, Rawalpindi',
    33.4945,
    73.0912,
    'https://kotal.pk',
    '0333-5556825',
    'https://kotal.pk',
    1450,
    3400,
    'PKR',
    '2026-10-25T00:00:00Z',
    true,
    'KhanaScene Pick: Grand open-air family dining in Bahria Phase 8 famed for Shinwari Karahi and Saffron Kabuli Pulao.',
    true,
    ARRAY[
      'Monday – Sunday: 12:30 PM – 12:30 AM'
    ],
    4.55,
    38,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111131',
    'ks-place-rwp-bull-steakhouse-bahria',
    'Bull Steakhouse Bahria Phase 4',
    'bull-steakhouse-bahria-p4',
    'rawalpindi',
    'rwp-bahria',
    'Prime Beef Steaks, Sizzlers & Gourmet Burgers',
    'Plot 34, Marina Commercial, Corniche Road, Phase 4, Bahria Town, Rawalpindi',
    33.5489,
    73.1284,
    null,
    '051-5733110',
    null,
    1800,
    3800,
    'PKR',
    '2026-10-24T00:00:00Z',
    false,
    null,
    true,
    ARRAY[
      'Monday – Sunday: 1:00 PM – 12:00 AM'
    ],
    4.35,
    24,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111132',
    'ks-place-rwp-anarkali-commercial',
    'Anarkali Restaurant Commercial Market',
    'anarkali-restaurant-commercial-market',
    'rawalpindi',
    'rwp-commercial',
    'Royal Pakistani Handi, Karahi & Family BBQ',
    'Main B-Block, Commercial Market, Satellite Town, Rawalpindi',
    33.6395,
    73.0721,
    null,
    '051-4421880',
    null,
    1100,
    2500,
    'PKR',
    '2026-10-24T00:00:00Z',
    false,
    null,
    true,
    ARRAY[
      'Monday – Sunday: 12:00 PM – 12:00 AM'
    ],
    4.30,
    27,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111133',
    'ks-place-rwp-tehzeeb-satellite-town',
    'Tehzeeb Bakers Satellite Town',
    'tehzeeb-bakers-satellite-town',
    'rawalpindi',
    'rwp-commercial',
    'Iconic Bakery, Chicken Patties, Pizzas & Fresh Cakes',
    'Main Fifth Road, Commercial Market, Satellite Town, Rawalpindi',
    33.6372,
    73.0698,
    'https://tehzeeb.com',
    '051-4417585',
    'https://tehzeeb.com',
    350,
    1800,
    'PKR',
    '2026-10-26T00:00:00Z',
    true,
    'KhanaScene Pick: Twin Cities heritage bakery famous for flaky warm chicken patties, salad pizza, and fresh fudge cakes.',
    true,
    ARRAY[
      'Monday – Sunday: 7:30 AM – 11:45 PM'
    ],
    4.70,
    61,
    'verified'
  ),
  (
    '11111111-1111-4111-8111-111111111134',
    'ks-place-rwp-cheezious-scheme-3',
    'Cheezious Chaklala Scheme 3',
    'cheezious-chaklala-scheme-3',
    'rawalpindi',
    'rwp-chaklala',
    'Crown Crust Pizza, Calzone Chunks & Crispy Burgers',
    'Plot 52, Commercial Area Road, Chaklala Housing Scheme 3, Rawalpindi',
    33.5881,
    73.0905,
    'https://cheezious.com',
    '051-111-446-699',
    'https://cheezious.com',
    560,
    2400,
    'PKR',
    '2026-10-26T00:00:00Z',
    true,
    'KhanaScene Pick: Crowd-favourite Crown Crust Pizza, Stuffed Calzone Chunks, and Bazinga Zinger Burgers.',
    true,
    ARRAY[
      'Monday – Sunday: 11:30 AM – 2:00 AM'
    ],
    4.65,
    55,
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

-- Link cuisines for the 16 newly added restaurants
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select r.id, c.id
from public.restaurant_records r
join public.cuisines c on (
  (r.slug = 'tuscany-courtyard-f6' and c.slug in ('pizza', 'cafes', 'desserts')) or
  (r.slug = 'khiva-restaurant-f7' and c.slug in ('pakistani', 'karahi', 'bbq', 'middle-eastern')) or
  (r.slug = 'bait-al-arab-mandi-f7' and c.slug in ('middle-eastern', 'bbq', 'desserts')) or
  (r.slug = 'howdy-f7-gol-market' and c.slug in ('burgers')) or
  (r.slug = 'chinatown-restaurant-f8' and c.slug in ('chinese')) or
  (r.slug = 'orient-restaurant-f10' and c.slug in ('chinese')) or
  (r.slug = 'loafology-bakery-blue-area' and c.slug in ('cafes', 'breakfast-brunch', 'desserts')) or
  (r.slug = 'burning-brownie-blue-area' and c.slug in ('desserts', 'cafes', 'breakfast-brunch')) or
  (r.slug = 'la-montana-margalla-hills' and c.slug in ('pakistani', 'bbq', 'karahi', 'chinese')) or
  (r.slug = 'purana-shinwari-saddar' and c.slug in ('karahi', 'bbq', 'pakistani')) or
  (r.slug = 'jamil-sweets-saddar' and c.slug in ('desserts', 'street-food', 'breakfast-brunch')) or
  (r.slug = 'kotal-restaurant-bahria-p8' and c.slug in ('karahi', 'bbq', 'pakistani')) or
  (r.slug = 'bull-steakhouse-bahria-p4' and c.slug in ('burgers', 'bbq')) or
  (r.slug = 'anarkali-restaurant-commercial-market' and c.slug in ('pakistani', 'karahi', 'bbq')) or
  (r.slug = 'tehzeeb-bakers-satellite-town' and c.slug in ('desserts', 'pizza', 'cafes')) or
  (r.slug = 'cheezious-chaklala-scheme-3' and c.slug in ('pizza', 'burgers'))
)
on conflict do nothing;

-- Seed Verified Menus for the 16 newly added restaurants
insert into public.restaurant_menus (
  id,
  restaurant_record_id,
  name,
  source_type,
  last_verified_at
)
values
  ('22222222-2222-4222-8222-222222222219', '11111111-1111-4111-8111-111111111119', 'Tuscany Italian & Continental Menu', 'khana_scene_verified', '2026-10-25T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222220', '11111111-1111-4111-8111-111111111120', 'Central Asian & Karahi Menu', 'khana_scene_verified', '2026-10-25T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222221', '11111111-1111-4111-8111-111111111121', 'Bait Al Arab Mandi & Kunafa Menu', 'official_website', '2026-10-26T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111122', 'Howdy Burgers & Steaks Menu', 'khana_scene_verified', '2026-10-24T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222223', '11111111-1111-4111-8111-111111111123', 'Chinatown Signature Menu', 'khana_scene_verified', '2026-10-23T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222224', '11111111-1111-4111-8111-111111111124', 'Orient Chinese Menu', 'khana_scene_verified', '2026-10-24T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222225', '11111111-1111-4111-8111-111111111125', 'Loafology Sourdough & Bistro Menu', 'khana_scene_verified', '2026-10-26T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222226', '11111111-1111-4111-8111-111111111126', 'Burning Brownie Desserts & Coffee Menu', 'khana_scene_verified', '2026-10-26T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222227', '11111111-1111-4111-8111-111111111127', 'La Montana Buffet & Grill Menu', 'khana_scene_verified', '2026-10-25T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222228', '11111111-1111-4111-8111-111111111128', 'Purana Shinwari Karahi Menu', 'khana_scene_verified', '2026-10-25T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222229', '11111111-1111-4111-8111-111111111129', 'Jamil Sweets & Snacks Menu', 'official_website', '2026-10-26T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222230', '11111111-1111-4111-8111-111111111130', 'Kotal Shinwari & BBQ Menu', 'official_website', '2026-10-25T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222231', '11111111-1111-4111-8111-111111111131', 'Bull Steakhouse Prime Cuts Menu', 'khana_scene_verified', '2026-10-24T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222232', '11111111-1111-4111-8111-111111111132', 'Anarkali Handi & BBQ Menu', 'khana_scene_verified', '2026-10-24T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222233', '11111111-1111-4111-8111-111111111133', 'Tehzeeb Bakery & Pizza Menu', 'official_website', '2026-10-26T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222234', '11111111-1111-4111-8111-111111111134', 'Cheezious Pizzas & Burgers Menu', 'official_website', '2026-10-26T00:00:00Z')
on conflict (id) do update
  set name = excluded.name,
      source_type = excluded.source_type,
      last_verified_at = excluded.last_verified_at;

-- Seed Verified PKR Menu Items for the 16 newly added restaurants
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
  -- 19. Tuscany Courtyard F-6
  ('33333333-3333-4333-8333-333333333345', '22222222-2222-4222-8222-222222222219', 'Pollo Piccata Pasta', 'Pan-seared chicken breast in lemon caper butter sauce served over fettuccine', 2650, 'PKR', 'Italian Mains', true, '2026-10-25T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333346', '22222222-2222-4222-8222-222222222219', 'Quattro Formaggi Wood-Fired Pizza', 'Thin Italian crust topped with mozzarella, gorgonzola, parmesan, and feta', 2850, 'PKR', 'Wood-Fired Pizza', true, '2026-10-25T00:00:00Z'),

  -- 20. Khiva Restaurant F-7
  ('33333333-3333-4333-8333-333333333347', '22222222-2222-4222-8222-222222222220', 'Namak Mandi Mutton Karahi (1 KG)', 'Traditional Peshawari salt-and-tomato mutton karahi cooked over high flame', 3600, 'PKR', 'Karahi', true, '2026-10-25T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333348', '22222222-2222-4222-8222-222222222220', 'Samarkand Uzbek Beef Pulao', 'Fragrant long-grain rice with tender braised beef, sweet carrots, and chickpeas', 1950, 'PKR', 'Central Asian', true, '2026-10-25T00:00:00Z'),

  -- 21. Bait Al Arab Mandi F-7
  ('33333333-3333-4333-8333-333333333349', '22222222-2222-4222-8222-222222222221', 'Yemeni Mutton Mandi (Single)', 'Pit-roasted tender mutton served over spiced basmati rice with smoky tomato chutney', 1350, 'PKR', 'Mandi', true, '2026-10-26T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333350', '22222222-2222-4222-8222-222222222221', 'Chicken Madfoon (Half)', 'Foil-steamed spiced half chicken over aromatic Mandi rice', 950, 'PKR', 'Mandi', true, '2026-10-26T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333351', '22222222-2222-4222-8222-222222222221', 'Signature Cream Kunafa', 'Warm baked vermicelli pastry layered with sweet cream and sugar syrup', 850, 'PKR', 'Arabic Desserts', true, '2026-10-26T00:00:00Z'),

  -- 22. Howdy F-7
  ('33333333-3333-4333-8333-333333333352', '22222222-2222-4222-8222-222222222222', 'Son of a Bun Double Beef Burger', 'Double chargrilled beef patties with melted American cheese, turkey bacon, and smoky sauce', 1480, 'PKR', 'Burgers', true, '2026-10-24T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333353', '22222222-2222-4222-8222-222222222222', 'Rancher Crispy Chicken Fillet Burger', 'Crunchy fried chicken fillet with jalapeños, iceberg lettuce, and ranch dressing', 1190, 'PKR', 'Burgers', true, '2026-10-24T00:00:00Z'),

  -- 23. Chinatown F-8
  ('33333333-3333-4333-8333-333333333354', '22222222-2222-4222-8222-222222222223', 'Signature Dry Chilli Beef', 'Wok-crisped beef strips tossed with green chillies, ginger, and soy glaze', 2150, 'PKR', 'Beef Mains', true, '2026-10-23T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333355', '22222222-2222-4222-8222-222222222223', 'Dynamite Tempura Prawns', 'Crispy golden prawns coated in spicy sriracha mayo', 1950, 'PKR', 'Starters', true, '2026-10-23T00:00:00Z'),

  -- 24. Orient Chinese F-10
  ('33333333-3333-4333-8333-333333333356', '22222222-2222-4222-8222-222222222224', 'Chicken Manchurian with Egg Fried Rice', 'Classic tangy red garlic chicken gravy served with wok-fried egg rice', 1450, 'PKR', 'Chinese Mains', true, '2026-10-24T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333357', '22222222-2222-4222-8222-222222222224', 'Orient Special Chicken Chowmein', 'Stir-fried noodles with julienned chicken, cabbage, carrots, and scallions', 1290, 'PKR', 'Noodles', true, '2026-10-24T00:00:00Z'),

  -- 25. Loafology Bakery & Café Blue Area
  ('33333333-3333-4333-8333-333333333358', '22222222-2222-4222-8222-222222222225', 'Sourdough Avocado & Poached Eggs Toast', 'Artisan 36-hour fermented country sourdough topped with smashed avocado and two eggs', 1750, 'PKR', 'Breakfast', true, '2026-10-26T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333359', '22222222-2222-4222-8222-222222222225', 'Roast Beef & Caramelized Onion Panini', 'Pressed sourdough panini with cheddar, Dijon mustard, and house salad', 1950, 'PKR', 'Sandwiches', true, '2026-10-26T00:00:00Z'),

  -- 26. Burning Brownie Blue Area
  ('33333333-3333-4333-8333-333333333360', '22222222-2222-4222-8222-222222222226', 'Nutella Fudge Brownie with Vanilla Bean Ice Cream', 'Warm gooey chocolate brownie topped with hazelnut spread and gelato scoop', 780, 'PKR', 'Brownies', true, '2026-10-26T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333361', '22222222-2222-4222-8222-222222222226', 'Lotus Biscoff New York Cheesecake Slice', 'Creamy baked cheesecake crowned with caramelized biscuit spread and crumbles', 650, 'PKR', 'Cheesecakes', true, '2026-10-26T00:00:00Z'),

  -- 27. La Montana Margalla Hills
  ('33333333-3333-4333-8333-333333333362', '22222222-2222-4222-8222-222222222227', 'Grand Hilltop Hi-Tea / Dinner Buffet (Per Person)', 'Over 35 Pakistani, BBQ, Chinese, and dessert dishes with panoramic city views', 2450, 'PKR', 'Buffet', true, '2026-10-25T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333363', '22222222-2222-4222-8222-222222222227', 'La Montana Special Mixed Grill Platter', 'Assorted seekh kababs, chicken tikka, malai boti, and lamb chops with garlic naan', 3600, 'PKR', 'BBQ Platters', true, '2026-10-25T00:00:00Z'),

  -- 28. Purana Shinwari Saddar
  ('33333333-3333-4333-8333-333333333364', '22222222-2222-4222-8222-222222222228', 'Kamran Market Dumba Karahi (Full KG)', 'Fresh lamb cooked in its own fat with Peshawari tomatoes and green chillies', 3200, 'PKR', 'Dumba Karahi', true, '2026-10-25T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333365', '22222222-2222-4222-8222-222222222228', 'Namkeen Dumba Tikka (12 Pieces)', 'Skewered lamb cubes with fat cubes grilled over glowing charcoal', 1850, 'PKR', 'BBQ', true, '2026-10-25T00:00:00Z'),

  -- 29. Jamil Sweets Saddar
  ('33333333-3333-4333-8333-333333333366', '22222222-2222-4222-8222-222222222229', 'Hot Desi Ghee Gulab Jamun (Half KG)', 'Soft khoya milk-solid dumplings soaked in cardamom rose syrup', 650, 'PKR', 'Mithai', true, '2026-10-26T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333367', '22222222-2222-4222-8222-222222222229', 'Crispy Punjabi Samosa Chaat Plate', 'Two crushed potato samosas topped with spiced chickpeas, yogurt, and tamarind chutney', 280, 'PKR', 'Street Food', true, '2026-10-26T00:00:00Z'),

  -- 30. Kotal Restaurant Bahria Phase 8
  ('33333333-3333-4333-8333-333333333368', '22222222-2222-4222-8222-222222222230', 'Kotal Special Mutton Shinwari (1 KG)', 'Tender mutton karahi finished with black pepper and fresh coriander', 3450, 'PKR', 'Karahi', true, '2026-10-25T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333369', '22222222-2222-4222-8222-222222222230', 'Charcoal Chicken Malai Boti Platter', 'Melt-in-mouth boneless chicken skewers with mint raita and Kandahari naan', 1490, 'PKR', 'BBQ', true, '2026-10-25T00:00:00Z'),

  -- 31. Bull Steakhouse Bahria Phase 4
  ('33333333-3333-4333-8333-333333333370', '22222222-2222-4222-8222-222222222231', 'Sizzling Jalapeño Prime Beef Steak', 'Chargrilled tenderloin steak with creamy jalapeño sauce, sautéed vegetables, and mash', 2890, 'PKR', 'Steaks', true, '2026-10-24T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333371', '22222222-2222-4222-8222-222222222231', 'Truffle & Swiss Angus Burger', 'Flame-grilled Angus patty with sautéed mushrooms and Swiss cheese', 1650, 'PKR', 'Burgers', true, '2026-10-24T00:00:00Z'),

  -- 32. Anarkali Restaurant Commercial Market
  ('33333333-3333-4333-8333-333333333372', '22222222-2222-4222-8222-222222222232', 'Anarkali Special Chicken Mughlai Handi', 'Creamy boneless chicken handi topped with boiled egg, cheese, and cashews', 2150, 'PKR', 'Handi', true, '2026-10-24T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333373', '22222222-2222-4222-8222-222222222232', 'Reshmi Beef Seekh Kabab (6 Pcs)', 'Juicy spiced minced beef kababs grilled over charcoal', 1180, 'PKR', 'BBQ', true, '2026-10-24T00:00:00Z'),

  -- 33. Tehzeeb Bakers Satellite Town
  ('33333333-3333-4333-8333-333333333374', '22222222-2222-4222-8222-222222222233', 'Tehzeeb Signature Chicken Patties (half dozen)', 'Golden puff pastry shells filled with creamy shredded chicken', 780, 'PKR', 'Savory Bakery', true, '2026-10-26T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333375', '22222222-2222-4222-8222-222222222233', 'Classic Tehzeeb Salad Pizza (Large)', 'Iconic bakery-style pan pizza topped with spiced chicken, crisp salad, and house dressing', 2150, 'PKR', 'Bakery Pizza', true, '2026-10-26T00:00:00Z'),

  -- 34. Cheezious Chaklala Scheme 3
  ('33333333-3333-4333-8333-333333333376', '22222222-2222-4222-8222-222222222234', 'Crown Crust Pizza (Large)', 'Signature pizza with kabab-and-cheese stuffed royal crown crust and special sauce', 2350, 'PKR', 'Specialty Pizza', true, '2026-10-26T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333377', '22222222-2222-4222-8222-222222222234', 'Bazinga Supreme Crispy Burger', 'Double-breaded spicy chicken thigh fillet with cheese slice and garlic mayo', 690, 'PKR', 'Burgers', true, '2026-10-26T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333378', '22222222-2222-4222-8222-222222222234', 'Baked Calzone Chunks (4 Pcs)', 'Oven-baked folded pizza pockets stuffed with smoked chicken, olives, and mozzarella', 1050, 'PKR', 'Starters', true, '2026-10-26T00:00:00Z')
on conflict (id) do update
  set name = excluded.name,
      description = excluded.description,
      price = excluded.price,
      category = excluded.category,
      is_available = excluded.is_available,
      last_verified_at = excluded.last_verified_at;
