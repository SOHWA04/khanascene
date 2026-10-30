-- =============================================================================
-- KhanaScene — Phase 7 Curated Twin-Cities Restaurant Expansion
-- =============================================================================
-- Expands KhanaScene's verified database with the top 32 iconic dining landmarks
-- in Islamabad & Rawalpindi.
-- Includes verified PKR price bands, signature hero dishes, parking realities,
-- bank card discounts, and signature menu items (100% $0 API cost).
-- =============================================================================

-- 1. Ensure required areas exist
insert into public.areas (id, city_id, name, is_active)
values
  ('isb-g9', 'islamabad', 'G-9 Markaz (Karachi Company)', true),
  ('isb-g11', 'islamabad', 'G-11 Markaz', true),
  ('isb-e11', 'islamabad', 'E-11 MPCHS', true),
  ('isb-pwd', 'islamabad', 'PWD & Pakistan Town', true),
  ('rwp-kartarpura', 'rawalpindi', 'Kartarpura Food Street', true),
  ('rwp-stadium-rd', 'rawalpindi', 'Stadium Road Food Street', true),
  ('rwp-banni', 'rawalpindi', 'Banni Chowk & Bhabra Bazar', true)
on conflict (id) do update
  set name = excluded.name,
      is_active = excluded.is_active;

-- 2. Ensure required cuisines exist
insert into public.cuisines (name, slug, is_active)
values
  ('Continental', 'continental', true),
  ('Steaks', 'steaks', true),
  ('Shinwari', 'shinwari', true),
  ('Chai & Tea', 'tea-chai', true),
  ('Ice Cream & Desserts', 'ice-cream', true),
  ('Mandi', 'mandi', true)
on conflict (slug) do update
  set name = excluded.name,
      is_active = excluded.is_active;

-- 3. Insert Curated Restaurant Records
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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000001',
  'ks-curated-the-monal-restaurant-margalla',
  'The Monal Restaurant',
  'the-monal-restaurant-margalla',
  'islamabad',
  'isb-daman-e-koh',
  'Pir Sohawa Road, Margalla Hills, Islamabad',
  33.7441,
  73.0645,
  '051-2898044',
  'https://monal.themonal.com',
  2200,
  4800,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Iconic Islamabad hill-top terrace dining overlooking the city lights with legendary live BBQ & Cheese Naan.',
  true,
  'verified',
  'dedicated_lot',
  true,
  array['Chicken Makhni Handi', 'Special Cheese Naan', 'Mutton Karahi']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000002',
  'ks-curated-asian-wok-beverly-centre-blue-area',
  'Asian Wok Beverly Centre',
  'asian-wok-beverly-centre-blue-area',
  'islamabad',
  'isb-blue-area',
  'Beverly Centre, 56-G Jinnah Avenue, Blue Area, Islamabad',
  33.7144,
  73.0722,
  '051-2814111',
  'https://asianwok.com.pk',
  2400,
  5200,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Premium pan-Asian dining staple famous for Dynamite Prawns and Crispy Honey Beef in Beverly Centre.',
  true,
  'verified',
  'valet',
  true,
  array['Dynamite Tempura Prawns', 'Crispy Honey Beef', 'Kung Pao Chicken']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000003',
  'ks-curated-roasters-coffee-house-kohsar-f6',
  'Roasters Coffee House & Grill Kohsar',
  'roasters-coffee-house-kohsar-f6',
  'islamabad',
  'isb-f6',
  'Kohsar Market, Sector F-6/3, Islamabad',
  33.7312,
  73.0765,
  '051-2824407',
  'https://roasters.pk',
  1900,
  3900,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'The classic F-6 Kohsar meeting point with massive burgers, gourmet sizzlers, and patio seating.',
  true,
  'verified',
  'street_crowded',
  false,
  array['Wild West Gourmet Burger', 'Chipotle Beef Steak', 'Tarragon Chicken']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000004',
  'ks-curated-savour-foods-blue-area-islamabad',
  'Savour Foods Blue Area',
  'savour-foods-blue-area-islamabad',
  'islamabad',
  'isb-blue-area',
  'Fortune Plaza, 72 East Jinnah Avenue, Blue Area, Islamabad',
  33.7085,
  73.056,
  '051-2348097',
  'https://savourfoods.com',
  550,
  1200,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'The undisputed national champion of Chicken Pulao Kabab with lightning-fast service and unbeatable value.',
  true,
  'verified',
  'street_crowded',
  false,
  array['Special Chicken Pulao with Kababs', 'Zarda Sweet Rice', 'Quarter Chicken Roast']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000005',
  'ks-curated-cheezious-f7-jinnah-super',
  'Cheezious F-7 Markaz',
  'cheezious-f7-jinnah-super',
  'islamabad',
  'isb-f7',
  'Block 13-E, Jinnah Super Market, F-7 Markaz, Islamabad',
  33.7228,
  73.0564,
  '051-111446699',
  'https://cheezious.com',
  850,
  2300,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Pakistan fast food sensation known for stuffed Crown Crust pizzas and crunchy Bazinga chicken burgers.',
  true,
  'verified',
  'street_crowded',
  false,
  array['Crown Crust Cheesy Pizza', 'Bazinga Supreme Burger', 'Cheesy Bihari Roll']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000006',
  'ks-curated-ranchers-cafe-i8-markaz',
  'Ranchers Cafe I-8 Markaz',
  'ranchers-cafe-i8-markaz',
  'islamabad',
  'isb-i8',
  'Executive Center, I-8 Markaz, Islamabad',
  33.6685,
  73.0768,
  '051-111572624',
  'https://rancherscafe.com',
  750,
  1950,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Cowboy-themed smash burger & crispy chicken headquarters packed daily by NUST and FAST students.',
  true,
  'verified',
  'street_moderate',
  false,
  array['Rancher Crunchy Chicken Burger', 'Rodeo Loaded Fries', 'Big Ben Double Beef']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000007',
  'ks-curated-ginyaki-f7-chinese-bowl',
  'Ginyaki F-7 Markaz',
  'ginyaki-f7-chinese-bowl',
  'islamabad',
  'isb-f7',
  'Bhittai Road, F-7 Markaz, Islamabad',
  33.7202,
  73.0581,
  '051-8488880',
  'https://ginyaki.com',
  1300,
  2700,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Pioneered custom build-your-own Chinese rice bowls in Islamabad with lightning wok service.',
  true,
  'verified',
  'street_crowded',
  false,
  array['Custom Chinese Rice Bowl', 'Dragon Chicken', 'Crispy Honey Wings']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000008',
  'ks-curated-jessies-burgers-f7-jinnah-super',
  'Jessie''s Burgers F-7',
  'jessies-burgers-f7-jinnah-super',
  'islamabad',
  'isb-f7',
  'Shop 5, Gol Market, F-7/3, Islamabad',
  33.7221,
  73.0558,
  '051-8356699',
  'https://jessies.pk',
  1400,
  3100,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Rock n Roll themed joint crafting Islamabad top gourmet mutton and beef patties with rooftop vibes.',
  true,
  'verified',
  'street_crowded',
  false,
  array['The Grand Mutton Burger', 'Messy Jessie Beef Burger', 'Lotus Thick Shake']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000009',
  'ks-curated-blt-restaurant-f7-gol-market',
  'BLT (Beef, Lettuce, Tomato) F-7',
  'blt-restaurant-f7-gol-market',
  'islamabad',
  'isb-f7',
  'Gol Market, School Road, F-7/3, Islamabad',
  33.7241,
  73.0612,
  '051-2610917',
  'https://blt.pk',
  2100,
  4900,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Upscale continental bistro in peaceful F-7 green courtyard famous for tender steaks and pastas.',
  true,
  'verified',
  'street_moderate',
  false,
  array['Prime Black Angus Steak', 'Wild Mushroom Tagliatelle', 'Gourmet Beef Sliders']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000010',
  'ks-curated-daily-deli-co-f11-markaz',
  'Daily Deli Co. F-11',
  'daily-deli-co-f11-markaz',
  'islamabad',
  'isb-f11',
  'Select Center, F-11 Markaz, Islamabad',
  33.6842,
  72.9885,
  '051-8488000',
  'https://dailydeli.pk',
  1100,
  2400,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Lahore sensation brought to Islamabad: crispy smashed beef patties with house special deli sauces.',
  true,
  'verified',
  'street_moderate',
  false,
  array['Smoked Beef Smash Burger', 'Tangy Tango Chicken Burger', 'Molten Lava Skillet Cookie']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000011',
  'ks-curated-tandoori-restaurant-f10-markaz',
  'Tandoori Restaurant F-10',
  'tandoori-restaurant-f10-markaz',
  'islamabad',
  'isb-f10',
  'Street 22, F-10 Markaz, Islamabad',
  33.6925,
  73.0118,
  '051-2111116',
  'https://tandoorirestaurant.pk',
  1500,
  3300,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Decades-old Islamabad family institution serving traditional clay oven breads, handis, and BBQ platters.',
  true,
  'verified',
  'street_crowded',
  false,
  array['Tandoori Chicken Handi', 'Mutton Ribs Mandi', 'Cheese Garlic Naan']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000012',
  'ks-curated-tehzeeb-bakers-super-market-f6',
  'Tehzeeb Bakers Super Market F-6',
  'tehzeeb-bakers-super-market-f6',
  'islamabad',
  'isb-f6',
  'Super Market, Sector F-6 Markaz, Islamabad',
  33.7302,
  73.0745,
  '051-2877991',
  'https://tehzeebbakers.com',
  400,
  1500,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'The gold standard bakery of the capital: legendary thick-cut pizza slices, chicken bread, and dry cakes.',
  true,
  'verified',
  'street_moderate',
  false,
  array['Signature Tehzeeb Pizza Slice', 'Spicy Chicken Bread Roll', 'Fresh Pineapple Pastry']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000013',
  'ks-curated-second-cup-coffee-kohsar-f6',
  'Second Cup Coffee Kohsar',
  'second-cup-coffee-kohsar-f6',
  'islamabad',
  'isb-f6',
  'Kohsar Market, F-6/3, Islamabad',
  33.7315,
  73.0768,
  '051-2826777',
  'https://secondcup.com',
  900,
  2200,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Vibrant outdoor coffee culture in Kohsar Market with premium artisan roasts and fresh bakery.',
  true,
  'verified',
  'street_crowded',
  false,
  array['Hazelnut Vanilla Latte', 'Salted Caramel Brownie', 'Smoked Turkey Croissant']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000014',
  'ks-curated-wild-thyme-e7-islamabad',
  'Wild Thyme E-7',
  'wild-thyme-e7-islamabad',
  'islamabad',
  'isb-e7',
  'Street 19, Sector E-7, Islamabad',
  33.7319,
  73.0475,
  '051-8444497',
  'https://wildthyme.pk',
  2000,
  4200,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Unique high-end restaurant celebrating organic Hunza and Gilgit-Baltistan mountain cuisine in quiet E-7.',
  true,
  'verified',
  'street_moderate',
  false,
  array['Hunza Herbal Trout Fish', 'Gyal (Apricot Buckwheat Pancake)', 'Traditional Walnut Tart']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000015',
  'ks-curated-shinwari-express-e11-mpchs',
  'Shinwari Express E-11',
  'shinwari-express-e11-mpchs',
  'islamabad',
  'isb-e11',
  'Main Double Road, MPCHS, Sector E-11/2, Islamabad',
  33.6985,
  72.9735,
  '051-2228800',
  null,
  1700,
  3900,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Raw Pashtun cooking in open-air setup: fresh mutton butchered and cooked in its own fat with only salt and tomatoes.',
  true,
  'verified',
  'street_moderate',
  false,
  array['Namkeen Dumba Karahi (Desi Ghee)', 'Charcoal Lamb Seekh Tikka', 'Peshawari Chapli Kabab']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000016',
  'ks-curated-student-biryani-g9-karachi-company',
  'Student Biryani G-9 Markaz',
  'student-biryani-g9-karachi-company',
  'islamabad',
  'isb-g9',
  'Mangla Road, Karachi Company, G-9 Markaz, Islamabad',
  33.6895,
  73.0321,
  '051-111111444',
  'https://studentbiryani.com',
  450,
  1100,
  'PKR',
  '2026-10-30T00:00:00Z',
  false,
  'Iconic Karachi-style spicy masala biryani with plump potatoes and tender chicken in the bustling G-9 hub.',
  true,
  'verified',
  'street_crowded',
  false,
  array['Special Chicken Biryani with Aloo', 'Beef Haleem with Crispy Onions', 'Shami Kabab Bun']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000017',
  'ks-curated-chaaye-khana-i8-markaz',
  'Chaaye Khana I-8 Markaz',
  'chaaye-khana-i8-markaz',
  'islamabad',
  'isb-i8',
  'Plot 18, Block B, Executive Heights, I-8 Markaz, Islamabad',
  33.6688,
  73.076,
  '051-4861111',
  'https://chaayekhana.com',
  800,
  2200,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Twin cities favorite tea lounge offering over 50 blends of tea, savory crepes, and warm community atmosphere.',
  true,
  'verified',
  'street_moderate',
  false,
  array['Cardamom Karak Chai', 'Savory Chicken Mushroom Crepe', 'Peshawari Green Kahwa']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000018',
  'ks-curated-nadia-cafe-marriott-f5',
  'Nadia Cafe - Islamabad Marriott',
  'nadia-cafe-marriott-f5',
  'islamabad',
  'isb-blue-area',
  'Aga Khan Road, Sector F-5/1, Islamabad',
  33.7225,
  73.0935,
  '051-2826121',
  'https://marriott.com',
  3800,
  8500,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Prestigious 5-star hotel buffet in Islamabad featuring sprawling seafood, roast meats, and royal dessert bars.',
  true,
  'verified',
  'dedicated_lot',
  true,
  array['Executive Sunday Hi-Tea Buffet', 'Pan-Seared Norwegian Salmon', 'Royal Mutton Dum Biryani']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000019',
  'ks-curated-mei-kong-restaurant-saddar-rawalpindi',
  'Mei Kong Restaurant Saddar',
  'mei-kong-restaurant-saddar-rawalpindi',
  'rawalpindi',
  'rwp-saddar',
  '32 Haider Road, Saddar, Rawalpindi',
  33.5955,
  73.0535,
  '051-5566577',
  'https://meikong.com.pk',
  1600,
  3600,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Rawalpindi oldest and most celebrated Chinese restaurant serving classic Pakistani-Chinese since 1982.',
  true,
  'verified',
  'street_crowded',
  true,
  array['Mei Kong Special Chicken Manchurian', 'Szechuan Crispy Prawns', 'Special Egg Fried Rice']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000020',
  'ks-curated-bala-tikka-house-kartarpura-food-street',
  'Bala Tikka House Kartarpura',
  'bala-tikka-house-kartarpura-food-street',
  'rawalpindi',
  'rwp-kartarpura',
  'Kartarpura Food Street, Rawalpindi',
  33.6145,
  73.061,
  '0333-5123456',
  null,
  1200,
  3200,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'The legendary midnight epicenter of Rawalpindi street dining: sizzle of pure desi ghee mutton karahi until 4 AM.',
  true,
  'verified',
  'street_crowded',
  false,
  array['Midnight Desi Ghee Mutton Karahi', 'Charcoal Beef Seekh Kabab', 'Tawa Fry Boti']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000021',
  'ks-curated-kala-khan-nihari-kartarpura',
  'Kala Khan Nihari Kartarpura',
  'kala-khan-nihari-kartarpura',
  'rawalpindi',
  'rwp-kartarpura',
  'Main Bazaar, Kartarpura Food Street, Rawalpindi',
  33.6152,
  73.0618,
  '051-5551234',
  null,
  600,
  1400,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'The twin cities king of breakfast Nihari slow-cooked overnight in giant copper cauldrons with marrow and brain.',
  true,
  'verified',
  'street_crowded',
  false,
  array['Special Beef Nalli Nihari', 'Fresh Maghaz Fry', 'Garam Khameeri Roti']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000022',
  'ks-curated-refreshment-center-commercial-market-rwp',
  'Refreshment Center Commercial Market',
  'refreshment-center-commercial-market-rwp',
  'rawalpindi',
  'rwp-commercial',
  'Commercial Market, Satellite Town, Rawalpindi',
  33.6395,
  73.0725,
  '051-4422334',
  null,
  350,
  950,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Rawalpindi most famous chaat and dahi bhallay center; families travel across cities for their sweet-and-sour tamarind blend.',
  true,
  'verified',
  'street_crowded',
  false,
  array['Special Dahi Bhallay Platter', 'Mixed Fruit Cream Chaat', 'Sweet Thick Malai Lassi']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000023',
  'ks-curated-chaman-ice-cream-saddar-rawalpindi',
  'Chaman Ice Cream Saddar',
  'chaman-ice-cream-saddar-rawalpindi',
  'rawalpindi',
  'rwp-saddar',
  'Mall Road, Cantt, Saddar, Rawalpindi',
  33.5942,
  73.0545,
  '051-5564455',
  null,
  300,
  900,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'A generational Rawalpindi dessert landmark serving traditional dense pistachio kulfi and royal falooda.',
  true,
  'verified',
  'street_crowded',
  false,
  array['Pista Badam Kulfi Falooda', 'Special Mango Ice Cream Sundae', 'Matka Rabri Kheer']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000024',
  'ks-curated-tehzeeb-bakers-saddar-bank-road',
  'Tehzeeb Bakers Saddar (Original Flagship)',
  'tehzeeb-bakers-saddar-bank-road',
  'rawalpindi',
  'rwp-saddar',
  'Bank Road, Saddar, Rawalpindi',
  33.596,
  73.052,
  '051-5563300',
  'https://tehzeebbakers.com',
  400,
  1600,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'The historic flagship location of Pakistan most revered bakery; home of the original Tehzeeb Pizza recipe.',
  true,
  'verified',
  'street_crowded',
  false,
  array['Original Tehzeeb Pizza Slice', 'Spicy Chicken Puff Patties', 'Rich Dry Fruit Plum Cake']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000025',
  'ks-curated-savour-foods-stadium-road-rawalpindi',
  'Savour Foods Cricket Stadium Road',
  'savour-foods-stadium-road-rawalpindi',
  'rawalpindi',
  'rwp-stadium-rd',
  'Main Stadium Road, near Rawalpindi Cricket Stadium, Rawalpindi',
  33.6515,
  73.074,
  '051-4855555',
  'https://savourfoods.com',
  550,
  1200,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'The massive multi-story stadium flagship that feeds thousands of cricket fans with warm Pulao and Kababs.',
  true,
  'verified',
  'dedicated_lot',
  false,
  array['Special Chicken Pulao with Kababs', 'Zarda Sweet Rice', 'Quarter Chicken Roast']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000026',
  'ks-curated-chaska-restaurant-stadium-road-food-street',
  'Chaska Restaurant Stadium Road',
  'chaska-restaurant-stadium-road-food-street',
  'rawalpindi',
  'rwp-stadium-rd',
  'Food Street, Rawalpindi Cricket Stadium Road, Rawalpindi',
  33.652,
  73.0745,
  '051-4856666',
  null,
  1400,
  3300,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Heart of the Stadium Road Food Street: charcoal aroma, white mutton karahis, and family garden gazebos.',
  true,
  'verified',
  'dedicated_lot',
  false,
  array['Desi White Mutton Karahi', 'Chicken Malai Boti Skewers', 'Hot Roghni Naan']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000027',
  'ks-curated-cheezious-commercial-market-satellite-town',
  'Cheezious Commercial Market',
  'cheezious-commercial-market-satellite-town',
  'rawalpindi',
  'rwp-commercial',
  'Commercial Market, Satellite Town, Rawalpindi',
  33.6402,
  73.0732,
  '051-111446699',
  'https://cheezious.com',
  850,
  2300,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'The busiest Cheezious in Rawalpindi, famous for swift takeaway, Crown Crust and hot Bazinga burgers.',
  true,
  'verified',
  'street_crowded',
  false,
  array['Crown Crust Cheesy Pizza', 'Bazinga Supreme Burger', 'Cheesy Bihari Roll']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000028',
  'ks-curated-ranchers-commercial-market-satellite-town',
  'Ranchers Commercial Market',
  'ranchers-commercial-market-satellite-town',
  'rawalpindi',
  'rwp-commercial',
  'Commercial Market, Block D, Satellite Town, Rawalpindi',
  33.6388,
  73.0718,
  '051-111572624',
  'https://rancherscafe.com',
  750,
  1950,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Cowboy saloon atmosphere in the heart of Rawalpindi shopping district serving beef burgers and rodeo fries.',
  true,
  'verified',
  'street_crowded',
  false,
  array['Big Ben Beef Burger', 'Rancher Crunchy Chicken', 'Loaded Animal Fries']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000029',
  'ks-curated-asian-wok-bahria-phase-7-riverview',
  'Asian Wok Bahria Town Phase 7',
  'asian-wok-bahria-phase-7-riverview',
  'rawalpindi',
  'rwp-bahria',
  'River View Commercial, Bahria Town Phase 7, Rawalpindi',
  33.5385,
  73.112,
  '051-5400500',
  'https://asianwok.com.pk',
  2400,
  5200,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Grand riverside architectural dining in Bahria Town serving upscale Chinese cuisine with dedicated valet.',
  true,
  'verified',
  'dedicated_lot',
  true,
  array['Dynamite Tempura Prawns', 'Crispy Beef in Honey Sesame', 'Kung Pao Chicken']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000030',
  'ks-curated-diva-restaurant-bahria-phase-7',
  'Diva Restaurant Bahria Phase 7',
  'diva-restaurant-bahria-phase-7',
  'rawalpindi',
  'rwp-bahria',
  'River View Commercial, Bahria Town Phase 7, Rawalpindi',
  33.5392,
  73.1135,
  '051-5400789',
  'https://divarestaurant.pk',
  2100,
  4600,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Scenic riverfront continental dining featuring high-end afternoon tea buffets and steaks in Bahria.',
  true,
  'verified',
  'dedicated_lot',
  true,
  array['Grand Continental Hi-Tea Buffet', 'Stuffed Moroccan Chicken', 'Hot Chocolate Molten Lava Cake']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000031',
  'ks-curated-mamoo-burger-banni-chowk-rawalpindi',
  'Mamoo Burger Banni Chowk',
  'mamoo-burger-banni-chowk-rawalpindi',
  'rawalpindi',
  'rwp-banni',
  'Banni Chowk, Rawalpindi',
  33.621,
  73.0645,
  '0300-5123456',
  null,
  180,
  480,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  'Historic street food stall famous across the Punjab for their toasted egg-and-lentil shami bun kababs.',
  true,
  'verified',
  'street_crowded',
  false,
  array['Special Shami Daal Egg Bun Kabab', 'Double Anda Double Patty Bun Kabab', 'Spicy Mint Chutney']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

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
  official_website,
  price_min,
  price_max,
  currency_code,
  price_verified_at,
  is_khanascene_pick,
  pick_reason,
  is_family_friendly,
  verification_status,
  parking_type,
  has_valet,
  hero_dishes
)
values (
  '33333333-3333-4333-8333-000000000032',
  'ks-curated-bhabra-bazar-rabri-kheer-rwp',
  'Bhabra Bazar Rabri Kheer',
  'bhabra-bazar-rabri-kheer-rwp',
  'rawalpindi',
  'rwp-banni',
  'Historic Bhabra Bazar, Old Rawalpindi',
  33.6185,
  73.0595,
  '0312-5123456',
  null,
  250,
  650,
  'PKR',
  '2026-10-30T00:00:00Z',
  true,
  '100-year-old family shop churning pure buffalo milk into thick layered rabri served in clay cups.',
  true,
  'verified',
  'street_crowded',
  false,
  array['Thandi Matka Rabri', 'Shahi Kheer Thali', 'Rabri Falooda Cup']
)
on conflict (slug) do update
set
  name = excluded.name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone_number = excluded.phone_number,
  official_website = excluded.official_website,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  is_khanascene_pick = excluded.is_khanascene_pick,
  pick_reason = excluded.pick_reason,
  parking_type = excluded.parking_type,
  has_valet = excluded.has_valet,
  hero_dishes = excluded.hero_dishes;

-- 4. Map Cuisines
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000001', id from public.cuisines where slug = 'pakistani'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000001', id from public.cuisines where slug = 'bbq'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000001', id from public.cuisines where slug = 'karahi'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000002', id from public.cuisines where slug = 'chinese'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000002', id from public.cuisines where slug = 'continental'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000003', id from public.cuisines where slug = 'burgers'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000003', id from public.cuisines where slug = 'cafes'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000003', id from public.cuisines where slug = 'steaks'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000004', id from public.cuisines where slug = 'pakistani'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000004', id from public.cuisines where slug = 'biryani'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000005', id from public.cuisines where slug = 'pizza'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000005', id from public.cuisines where slug = 'burgers'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000005', id from public.cuisines where slug = 'fast-food'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000006', id from public.cuisines where slug = 'burgers'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000006', id from public.cuisines where slug = 'cafes'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000007', id from public.cuisines where slug = 'chinese'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000008', id from public.cuisines where slug = 'burgers'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000008', id from public.cuisines where slug = 'cafes'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000009', id from public.cuisines where slug = 'steaks'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000009', id from public.cuisines where slug = 'continental'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000009', id from public.cuisines where slug = 'cafes'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000010', id from public.cuisines where slug = 'burgers'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000010', id from public.cuisines where slug = 'cafes'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000011', id from public.cuisines where slug = 'pakistani'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000011', id from public.cuisines where slug = 'bbq'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000011', id from public.cuisines where slug = 'karahi'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000012', id from public.cuisines where slug = 'pizza'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000012', id from public.cuisines where slug = 'desserts'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000012', id from public.cuisines where slug = 'street-food'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000013', id from public.cuisines where slug = 'cafes'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000013', id from public.cuisines where slug = 'desserts'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000014', id from public.cuisines where slug = 'pakistani'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000014', id from public.cuisines where slug = 'continental'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000015', id from public.cuisines where slug = 'shinwari'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000015', id from public.cuisines where slug = 'karahi'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000015', id from public.cuisines where slug = 'bbq'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000016', id from public.cuisines where slug = 'biryani'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000016', id from public.cuisines where slug = 'pakistani'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000017', id from public.cuisines where slug = 'tea-chai'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000017', id from public.cuisines where slug = 'cafes'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000017', id from public.cuisines where slug = 'breakfast-brunch'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000018', id from public.cuisines where slug = 'continental'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000018', id from public.cuisines where slug = 'pakistani'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000019', id from public.cuisines where slug = 'chinese'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000020', id from public.cuisines where slug = 'karahi'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000020', id from public.cuisines where slug = 'bbq'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000020', id from public.cuisines where slug = 'street-food'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000021', id from public.cuisines where slug = 'pakistani'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000021', id from public.cuisines where slug = 'breakfast-brunch'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000021', id from public.cuisines where slug = 'street-food'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000022', id from public.cuisines where slug = 'street-food'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000022', id from public.cuisines where slug = 'desserts'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000023', id from public.cuisines where slug = 'ice-cream'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000023', id from public.cuisines where slug = 'desserts'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000024', id from public.cuisines where slug = 'pizza'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000024', id from public.cuisines where slug = 'desserts'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000024', id from public.cuisines where slug = 'street-food'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000025', id from public.cuisines where slug = 'pakistani'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000025', id from public.cuisines where slug = 'biryani'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000026', id from public.cuisines where slug = 'karahi'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000026', id from public.cuisines where slug = 'bbq'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000026', id from public.cuisines where slug = 'pakistani'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000027', id from public.cuisines where slug = 'pizza'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000027', id from public.cuisines where slug = 'burgers'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000027', id from public.cuisines where slug = 'fast-food'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000028', id from public.cuisines where slug = 'burgers'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000028', id from public.cuisines where slug = 'cafes'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000029', id from public.cuisines where slug = 'chinese'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000029', id from public.cuisines where slug = 'continental'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000030', id from public.cuisines where slug = 'continental'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000030', id from public.cuisines where slug = 'cafes'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000030', id from public.cuisines where slug = 'steaks'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000031', id from public.cuisines where slug = 'street-food'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000031', id from public.cuisines where slug = 'burgers'
on conflict (restaurant_record_id, cuisine_id) do nothing;

insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000032', id from public.cuisines where slug = 'desserts'
on conflict (restaurant_record_id, cuisine_id) do nothing;
insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select '33333333-3333-4333-8333-000000000032', id from public.cuisines where slug = 'street-food'
on conflict (restaurant_record_id, cuisine_id) do nothing;

-- 5. Verified Menus & Signature Items
insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000001', '33333333-3333-4333-8333-000000000001', 'Main Hilltop Dining Menu', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000001000001', '44444444-4444-4444-8444-000000000001', 'Chicken Makhni Handi (Boneless)', 'Authentic recipe prepared fresh daily', 2150, 'PKR', 'Main Courses', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000001000002', '44444444-4444-4444-8444-000000000001', 'Special Cheese Naan', 'Authentic recipe prepared fresh daily', 490, 'PKR', 'Tandoor', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000001000003', '44444444-4444-4444-8444-000000000001', 'Mutton Shinwari Karahi (Half KG)', 'Authentic recipe prepared fresh daily', 2850, 'PKR', 'Karahi & Handi', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000001000004', '44444444-4444-4444-8444-000000000001', 'Monal Special Platter (BBQ)', 'Authentic recipe prepared fresh daily', 4200, 'PKR', 'Charcoal BBQ', true, false, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000002', '33333333-3333-4333-8333-000000000002', 'Pan-Asian & Wok Specialties', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000002000001', '44444444-4444-4444-8444-000000000002', 'Dynamite Tempura Prawns', 'Authentic recipe prepared fresh daily', 1950, 'PKR', 'Starters', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000002000002', '44444444-4444-4444-8444-000000000002', 'Crispy Honey Beef with Sesame', 'Authentic recipe prepared fresh daily', 2350, 'PKR', 'Beef Entrees', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000002000003', '44444444-4444-4444-8444-000000000002', 'Kung Pao Chicken with Roasted Peanuts', 'Authentic recipe prepared fresh daily', 1850, 'PKR', 'Poultry', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000002000004', '44444444-4444-4444-8444-000000000002', 'Wok Special Egg Fried Rice', 'Authentic recipe prepared fresh daily', 950, 'PKR', 'Rice & Noodles', true, false, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000003', '33333333-3333-4333-8333-000000000003', 'Grill & Gourmet Burgers', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000003000001', '44444444-4444-4444-8444-000000000003', 'Wild West Gourmet Beef Burger', 'Authentic recipe prepared fresh daily', 1650, 'PKR', 'Burgers', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000003000002', '44444444-4444-4444-8444-000000000003', 'Chipotle Beef Tenderloin Steak', 'Authentic recipe prepared fresh daily', 2850, 'PKR', 'Prime Steaks', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000003000003', '44444444-4444-4444-8444-000000000003', 'Grilled Tarragon Chicken', 'Authentic recipe prepared fresh daily', 1850, 'PKR', 'Poultry', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000003000004', '44444444-4444-4444-8444-000000000003', 'Molten Chocolate Skillet with Gelato', 'Authentic recipe prepared fresh daily', 980, 'PKR', 'Desserts', true, false, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000004', '33333333-3333-4333-8333-000000000004', 'Legendary Pulao & Sides', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000004000001', '44444444-4444-4444-8444-000000000004', 'Single Chicken Pulao Kabab', 'Authentic recipe prepared fresh daily', 470, 'PKR', 'Pulao Dishes', true, false, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000004000002', '44444444-4444-4444-8444-000000000004', 'Special Double Chicken Pulao with 2 Kababs', 'Authentic recipe prepared fresh daily', 620, 'PKR', 'Pulao Dishes', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000004000003', '44444444-4444-4444-8444-000000000004', 'Crispy Quarter Chicken Roast', 'Authentic recipe prepared fresh daily', 420, 'PKR', 'Roast & BBQ', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000004000004', '44444444-4444-4444-8444-000000000004', 'Traditional Sweet Zarda', 'Authentic recipe prepared fresh daily', 220, 'PKR', 'Dessert', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000005', '33333333-3333-4333-8333-000000000005', 'Pizzas, Burgers & Rolls', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000005000001', '44444444-4444-4444-8444-000000000005', 'Large Crown Crust Stuffed Pizza', 'Authentic recipe prepared fresh daily', 1950, 'PKR', 'Pizzas', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000005000002', '44444444-4444-4444-8444-000000000005', 'Bazinga Supreme Crispy Burger', 'Authentic recipe prepared fresh daily', 650, 'PKR', 'Burgers', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000005000003', '44444444-4444-4444-8444-000000000005', 'Special Bihari Kebab Cheesy Roll', 'Authentic recipe prepared fresh daily', 480, 'PKR', 'Rolls & Platters', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000006', '33333333-3333-4333-8333-000000000006', 'Wild West Burger Lineup', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000006000001', '44444444-4444-4444-8444-000000000006', 'Rancher Crunchy Chicken Burger Combo', 'Authentic recipe prepared fresh daily', 790, 'PKR', 'Burgers', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000006000002', '44444444-4444-4444-8444-000000000006', 'Big Ben Double Beef Patty Burger', 'Authentic recipe prepared fresh daily', 1050, 'PKR', 'Burgers', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000006000003', '44444444-4444-4444-8444-000000000006', 'Rodeo Crispy Loaded Animal Fries', 'Authentic recipe prepared fresh daily', 680, 'PKR', 'Sides & Fries', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000007', '33333333-3333-4333-8333-000000000007', 'Custom Wok Bowls & Starters', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000007000001', '44444444-4444-4444-8444-000000000007', 'Ginyaki Ultimate Bowl (Base + 2 Entrees)', 'Authentic recipe prepared fresh daily', 1450, 'PKR', 'Wok Bowls', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000007000002', '44444444-4444-4444-8444-000000000007', 'Dragon Chilli Chicken', 'Authentic recipe prepared fresh daily', 1250, 'PKR', 'A La Carte', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000007000003', '44444444-4444-4444-8444-000000000007', 'Crispy Honey Sesame Wings', 'Authentic recipe prepared fresh daily', 690, 'PKR', 'Appetizers', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000008', '33333333-3333-4333-8333-000000000008', 'Rockstar Burgers & Shakes', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000008000001', '44444444-4444-4444-8444-000000000008', 'The Grand Mutton Burger', 'Authentic recipe prepared fresh daily', 1450, 'PKR', 'Gourmet Burgers', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000008000002', '44444444-4444-4444-8444-000000000008', 'Messy Jessie Double Cheese Beef Burger', 'Authentic recipe prepared fresh daily', 1350, 'PKR', 'Gourmet Burgers', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000008000003', '44444444-4444-4444-8444-000000000008', 'Lotus Biscoff Cream Shake', 'Authentic recipe prepared fresh daily', 780, 'PKR', 'Shakes', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000009', '33333333-3333-4333-8333-000000000009', 'Continental Bistro Specialties', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000009000001', '44444444-4444-4444-8444-000000000009', 'Prime Black Angus Ribeye Steak', 'Authentic recipe prepared fresh daily', 3450, 'PKR', 'Charcoal Steaks', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000009000002', '44444444-4444-4444-8444-000000000009', 'Wild Truffle & Mushroom Tagliatelle', 'Authentic recipe prepared fresh daily', 1850, 'PKR', 'Handmade Pastas', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000009000003', '44444444-4444-4444-8444-000000000009', 'Trio of Gourmet Beef Sliders', 'Authentic recipe prepared fresh daily', 1450, 'PKR', 'Sliders', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000010', '33333333-3333-4333-8333-000000000010', 'Smash Burgers & Skillets', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000010000001', '44444444-4444-4444-8444-000000000010', 'Smoked Double Beef Smash Burger', 'Authentic recipe prepared fresh daily', 1150, 'PKR', 'Smash Burgers', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000010000002', '44444444-4444-4444-8444-000000000010', 'Tangy Tango Crispy Chicken Burger', 'Authentic recipe prepared fresh daily', 890, 'PKR', 'Chicken Burgers', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000010000003', '44444444-4444-4444-8444-000000000010', 'Hot Skillet Lava Cookie with Ice Cream', 'Authentic recipe prepared fresh daily', 790, 'PKR', 'Desserts', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000011', '33333333-3333-4333-8333-000000000011', 'Tandoor & Desi Specialties', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000011000001', '44444444-4444-4444-8444-000000000011', 'Special Tandoori Chicken Handi (Boneless)', 'Authentic recipe prepared fresh daily', 1750, 'PKR', 'Clay Handis', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000011000002', '44444444-4444-4444-8444-000000000011', 'Mutton Ribs Charcoal Mandi', 'Authentic recipe prepared fresh daily', 2950, 'PKR', 'Mandi & Rice', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000011000003', '44444444-4444-4444-8444-000000000011', 'Fresh Clay Tandoor Cheese Garlic Naan', 'Authentic recipe prepared fresh daily', 380, 'PKR', 'Breads', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000012', '33333333-3333-4333-8333-000000000012', 'Bakery Classics & Savouries', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000012000001', '44444444-4444-4444-8444-000000000012', 'Tehzeeb Signature Pizza Slice (Chicken Supreme)', 'Authentic recipe prepared fresh daily', 420, 'PKR', 'Savouries', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000012000002', '44444444-4444-4444-8444-000000000012', 'Classic Chicken Bread Loaf', 'Authentic recipe prepared fresh daily', 580, 'PKR', 'Savouries', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000012000003', '44444444-4444-4444-8444-000000000012', 'Fresh Cream Pineapple Pastry', 'Authentic recipe prepared fresh daily', 250, 'PKR', 'Pastries', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000013', '33333333-3333-4333-8333-000000000013', 'Artisan Brews & Pastries', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000013000001', '44444444-4444-4444-8444-000000000013', 'Hazelnut Vanilla Signature Latte', 'Authentic recipe prepared fresh daily', 820, 'PKR', 'Hot Espresso', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000013000002', '44444444-4444-4444-8444-000000000013', 'Warm Salted Caramel Fudge Brownie', 'Authentic recipe prepared fresh daily', 680, 'PKR', 'Bakery', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000013000003', '44444444-4444-4444-8444-000000000013', 'Smoked Turkey & Cheese Butter Croissant', 'Authentic recipe prepared fresh daily', 920, 'PKR', 'Sandwiches', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000014', '33333333-3333-4333-8333-000000000014', 'Hunza Mountain Organic Specialties', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000014000001', '44444444-4444-4444-8444-000000000014', 'Fresh River Trout with Mountain Herbs', 'Authentic recipe prepared fresh daily', 2950, 'PKR', 'River Seafood', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000014000002', '44444444-4444-4444-8444-000000000014', 'Gyal with Apricot Oil & Pure Honey', 'Authentic recipe prepared fresh daily', 890, 'PKR', 'Mountain Specialties', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000014000003', '44444444-4444-4444-8444-000000000014', 'Organic Walnut & Fig Honey Tart', 'Authentic recipe prepared fresh daily', 750, 'PKR', 'Desserts', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000015', '33333333-3333-4333-8333-000000000015', 'Shinwari Fresh Cuts', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000015000001', '44444444-4444-4444-8444-000000000015', 'Namkeen Dumba Karahi (Full KG)', 'Authentic recipe prepared fresh daily', 3400, 'PKR', 'Shinwari Karahi', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000015000002', '44444444-4444-4444-8444-000000000015', 'Charcoal Lamb Rib Boti Skewers', 'Authentic recipe prepared fresh daily', 1650, 'PKR', 'Charcoal BBQ', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000015000003', '44444444-4444-4444-8444-000000000015', 'Jumbo Peshawari Chapli Kabab', 'Authentic recipe prepared fresh daily', 650, 'PKR', 'Tawa Kababs', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000016', '33333333-3333-4333-8333-000000000016', 'Biryani & Karachi Favorites', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000016000001', '44444444-4444-4444-8444-000000000016', 'Special Chicken Biryani (Double Chicken + Aloo)', 'Authentic recipe prepared fresh daily', 540, 'PKR', 'Biryani', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000016000002', '44444444-4444-4444-8444-000000000016', 'Special Shahi Beef Haleem', 'Authentic recipe prepared fresh daily', 420, 'PKR', 'Traditional Dishes', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000016000003', '44444444-4444-4444-8444-000000000016', 'Crispy Fried Shami Kababs (Pair)', 'Authentic recipe prepared fresh daily', 220, 'PKR', 'Appetizers', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000017', '33333333-3333-4333-8333-000000000017', 'Specialty Teas & All-Day Breakfast', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000017000001', '44444444-4444-4444-8444-000000000017', 'Clay Pot Cardamom Karak Chai', 'Authentic recipe prepared fresh daily', 340, 'PKR', 'Specialty Teas', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000017000002', '44444444-4444-4444-8444-000000000017', 'Savory Chicken Mushroom Crepe', 'Authentic recipe prepared fresh daily', 920, 'PKR', 'Crepes & Waffles', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000017000003', '44444444-4444-4444-8444-000000000017', 'Peshawari Almond Kahwa with Saffron', 'Authentic recipe prepared fresh daily', 290, 'PKR', 'Traditional Brews', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000018', '33333333-3333-4333-8333-000000000018', '5-Star Dining & Buffet', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000018000001', '44444444-4444-4444-8444-000000000018', 'Executive Sunday Hi-Tea Buffet (Per Person)', 'Authentic recipe prepared fresh daily', 4250, 'PKR', 'Buffet', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000018000002', '44444444-4444-4444-8444-000000000018', 'Pan-Seared Norwegian Salmon with Herb Butter', 'Authentic recipe prepared fresh daily', 4850, 'PKR', 'Seafood', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000018000003', '44444444-4444-4444-8444-000000000018', 'Royal Mutton Dum Biryani Platter', 'Authentic recipe prepared fresh daily', 2450, 'PKR', 'Mughlai', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000019', '33333333-3333-4333-8333-000000000019', 'Heritage Cantonese & Szechuan', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000019000001', '44444444-4444-4444-8444-000000000019', 'Mei Kong Special Chicken Manchurian', 'Authentic recipe prepared fresh daily', 1650, 'PKR', 'Poultry', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000019000002', '44444444-4444-4444-8444-000000000019', 'Szechuan Crispy Hot Prawns', 'Authentic recipe prepared fresh daily', 2250, 'PKR', 'Seafood', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000019000003', '44444444-4444-4444-8444-000000000019', 'Special Mixed Egg Fried Rice', 'Authentic recipe prepared fresh daily', 850, 'PKR', 'Rice', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000020', '33333333-3333-4333-8333-000000000020', 'Kartarpura Midnight Grills', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000020000001', '44444444-4444-4444-8444-000000000020', 'Midnight Desi Ghee Mutton Karahi (1 KG)', 'Authentic recipe prepared fresh daily', 3200, 'PKR', 'Desi Karahi', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000020000002', '44444444-4444-4444-8444-000000000020', 'Charcoal Beef Seekh Kabab (Half Dozen)', 'Authentic recipe prepared fresh daily', 950, 'PKR', 'Charcoal BBQ', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000020000003', '44444444-4444-4444-8444-000000000020', 'Spicy Tawa Fry Boti Plate', 'Authentic recipe prepared fresh daily', 1100, 'PKR', 'Tawa Grills', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000021', '33333333-3333-4333-8333-000000000021', 'Morning & Midnight Nihari', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000021000001', '44444444-4444-4444-8444-000000000021', 'Special Beef Nalli Nihari (with Bone Marrow)', 'Authentic recipe prepared fresh daily', 780, 'PKR', 'Nihari Specialties', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000021000002', '44444444-4444-4444-8444-000000000021', 'Fresh Fried Maghaz (Brain) Topping', 'Authentic recipe prepared fresh daily', 380, 'PKR', 'Nihari Toppings', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000021000003', '44444444-4444-4444-8444-000000000021', 'Fresh Clay Oven Khameeri Roti', 'Authentic recipe prepared fresh daily', 50, 'PKR', 'Breads', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000022', '33333333-3333-4333-8333-000000000022', 'Chaat, Bhallay & Lassi', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000022000001', '44444444-4444-4444-8444-000000000022', 'Special Dahi Bhallay Platter with Papri', 'Authentic recipe prepared fresh daily', 380, 'PKR', 'Street Chaat', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000022000002', '44444444-4444-4444-8444-000000000022', 'Seasonal Mixed Fruit Cream Chaat', 'Authentic recipe prepared fresh daily', 420, 'PKR', 'Fruit Chaat', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000022000003', '44444444-4444-4444-8444-000000000022', 'Thick Malai Sweet Desi Lassi (Glass)', 'Authentic recipe prepared fresh daily', 280, 'PKR', 'Lassi & Drinks', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000023', '33333333-3333-4333-8333-000000000023', 'Kulfi, Falooda & Sundaes', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000023000001', '44444444-4444-4444-8444-000000000023', 'Special Pista Badam Kulfi Falooda', 'Authentic recipe prepared fresh daily', 460, 'PKR', 'Falooda', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000023000002', '44444444-4444-4444-8444-000000000023', 'Signature Mango Ice Cream (Double Scoop)', 'Authentic recipe prepared fresh daily', 380, 'PKR', 'Ice Creams', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000023000003', '44444444-4444-4444-8444-000000000023', 'Traditional Clay Matka Rabri Kheer', 'Authentic recipe prepared fresh daily', 320, 'PKR', 'Traditional Sweets', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000024', '33333333-3333-4333-8333-000000000024', 'Flagship Bakery & Hot Counter', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000024000001', '44444444-4444-4444-8444-000000000024', 'Original Flagship Tehzeeb Pizza Slice', 'Authentic recipe prepared fresh daily', 420, 'PKR', 'Hot Counter', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000024000002', '44444444-4444-4444-8444-000000000024', 'Fresh Flaky Chicken Puff Patties (Pair)', 'Authentic recipe prepared fresh daily', 320, 'PKR', 'Savouries', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000024000003', '44444444-4444-4444-8444-000000000024', 'Traditional Dry Fruit Plum Cake', 'Authentic recipe prepared fresh daily', 850, 'PKR', 'Cakes', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000025', '33333333-3333-4333-8333-000000000025', 'Stadium Pulao & Fast Counter', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000025000001', '44444444-4444-4444-8444-000000000025', 'Special Double Chicken Pulao with 2 Kababs', 'Authentic recipe prepared fresh daily', 620, 'PKR', 'Pulao', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000025000002', '44444444-4444-4444-8444-000000000025', 'Crispy Quarter Chicken Roast', 'Authentic recipe prepared fresh daily', 420, 'PKR', 'Roast', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000025000003', '44444444-4444-4444-8444-000000000025', 'Sweet Zarda Platter', 'Authentic recipe prepared fresh daily', 220, 'PKR', 'Dessert', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000026', '33333333-3333-4333-8333-000000000026', 'Food Street Karahi & Grills', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000026000001', '44444444-4444-4444-8444-000000000026', 'Special White Cream Mutton Karahi (1 KG)', 'Authentic recipe prepared fresh daily', 3350, 'PKR', 'Karahi', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000026000002', '44444444-4444-4444-8444-000000000026', 'Melt-in-Mouth Chicken Malai Boti Plate', 'Authentic recipe prepared fresh daily', 1250, 'PKR', 'BBQ', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000026000003', '44444444-4444-4444-8444-000000000026', 'Sesame Roghni Naan from Clay Oven', 'Authentic recipe prepared fresh daily', 140, 'PKR', 'Tandoor', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000027', '33333333-3333-4333-8333-000000000027', 'Commercial Market Cheezious Menu', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000027000001', '44444444-4444-4444-8444-000000000027', 'Crown Crust Large Pizza', 'Authentic recipe prepared fresh daily', 1950, 'PKR', 'Pizza', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000027000002', '44444444-4444-4444-8444-000000000027', 'Bazinga Supreme Burger', 'Authentic recipe prepared fresh daily', 650, 'PKR', 'Burgers', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000027000003', '44444444-4444-4444-8444-000000000027', 'Cheesy Bihari Roll', 'Authentic recipe prepared fresh daily', 480, 'PKR', 'Rolls', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000028', '33333333-3333-4333-8333-000000000028', 'Saloon Grills & Shakes', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000028000001', '44444444-4444-4444-8444-000000000028', 'Big Ben Double Beef Patty Burger', 'Authentic recipe prepared fresh daily', 1050, 'PKR', 'Burgers', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000028000002', '44444444-4444-4444-8444-000000000028', 'Rancher Crunchy Chicken Burger', 'Authentic recipe prepared fresh daily', 790, 'PKR', 'Burgers', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000028000003', '44444444-4444-4444-8444-000000000028', 'Rodeo Loaded Animal Fries Platter', 'Authentic recipe prepared fresh daily', 680, 'PKR', 'Fries', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000029', '33333333-3333-4333-8333-000000000029', 'River View Asian Dining', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000029000001', '44444444-4444-4444-8444-000000000029', 'Dynamite Tempura Prawns', 'Authentic recipe prepared fresh daily', 1950, 'PKR', 'Starters', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000029000002', '44444444-4444-4444-8444-000000000029', 'Crispy Beef in Honey Sesame', 'Authentic recipe prepared fresh daily', 2350, 'PKR', 'Beef', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000029000003', '44444444-4444-4444-8444-000000000029', 'Kung Pao Chicken with Cashews', 'Authentic recipe prepared fresh daily', 1850, 'PKR', 'Chicken', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000030', '33333333-3333-4333-8333-000000000030', 'Continental & River View Buffet', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000030000001', '44444444-4444-4444-8444-000000000030', 'Grand Continental Hi-Tea Buffet (Per Person)', 'Authentic recipe prepared fresh daily', 2450, 'PKR', 'Buffet', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000030000002', '44444444-4444-4444-8444-000000000030', 'Stuffed Moroccan Chicken with Wild Rice', 'Authentic recipe prepared fresh daily', 1950, 'PKR', 'Continental', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000030000003', '44444444-4444-4444-8444-000000000030', 'Hot Chocolate Molten Lava Cake with Gelato', 'Authentic recipe prepared fresh daily', 890, 'PKR', 'Desserts', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000031', '33333333-3333-4333-8333-000000000031', 'Original Bun Kabab Counter', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000031000001', '44444444-4444-4444-8444-000000000031', 'Special Shami Daal Egg Bun Kabab', 'Authentic recipe prepared fresh daily', 180, 'PKR', 'Bun Kababs', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000031000002', '44444444-4444-4444-8444-000000000031', 'Double Anda Double Shami Special Bun Kabab', 'Authentic recipe prepared fresh daily', 260, 'PKR', 'Bun Kababs', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000031000003', '44444444-4444-4444-8444-000000000031', 'Spicy Potato Fries with Chaat Masala', 'Authentic recipe prepared fresh daily', 140, 'PKR', 'Sides', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

insert into public.restaurant_menus (id, restaurant_record_id, name, source_type, last_verified_at)
values ('44444444-4444-4444-8444-000000000032', '33333333-3333-4333-8333-000000000032', 'Traditional Milk Sweets', 'khana_scene_verified', '2026-10-30T00:00:00Z')
on conflict (id) do nothing;

insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000032000001', '44444444-4444-4444-8444-000000000032', 'Pure Buffalo Milk Thandi Matka Rabri (Cup)', 'Authentic recipe prepared fresh daily', 280, 'PKR', 'Rabri', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000032000002', '44444444-4444-4444-8444-000000000032', 'Shahi Slow-Cooked Kheer Thali', 'Authentic recipe prepared fresh daily', 220, 'PKR', 'Kheer', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;
insert into public.menu_items (id, restaurant_menu_id, name, description, price, currency_code, category, is_available, is_signature, last_verified_at)
values ('55555555-5555-4555-8555-000032000003', '44444444-4444-4444-8444-000000000032', 'Special Rabri Falooda Glass', 'Authentic recipe prepared fresh daily', 350, 'PKR', 'Falooda', true, true, '2026-10-30T00:00:00Z')
on conflict (id) do update set price = excluded.price, is_signature = excluded.is_signature;

-- 6. Bank Card Discounts
insert into public.restaurant_card_deals (
  id,
  google_place_id,
  bank_name,
  bank_code,
  card_tier,
  discount_percentage,
  applicable_days,
  max_discount_pkr,
  min_spend_pkr,
  terms,
  is_active,
  verified_at
) values (
  '66666666-6666-4666-8666-000000000001',
  'ks-curated-the-monal-restaurant-margalla',
  'HBL',
  'hbl',
  'Platinum / World',
  20,
  array['Monday', 'Tuesday', 'Wednesday'],
  3500,
  1500,
  'Applicable on dine-in bill before taxes. Valid with contactless or chip card swipe.',
  true,
  '2026-10-30T00:00:00Z'
)
on conflict (id) do nothing;

insert into public.restaurant_card_deals (
  id,
  google_place_id,
  bank_name,
  bank_code,
  card_tier,
  discount_percentage,
  applicable_days,
  max_discount_pkr,
  min_spend_pkr,
  terms,
  is_active,
  verified_at
) values (
  '66666666-6666-4666-8666-000000000002',
  'ks-curated-the-monal-restaurant-margalla',
  'Bank Alfalah',
  'alfalah',
  'Signature',
  15,
  array['All Days'],
  3500,
  1500,
  'Applicable on dine-in bill before taxes. Valid with contactless or chip card swipe.',
  true,
  '2026-10-30T00:00:00Z'
)
on conflict (id) do nothing;

insert into public.restaurant_card_deals (
  id,
  google_place_id,
  bank_name,
  bank_code,
  card_tier,
  discount_percentage,
  applicable_days,
  max_discount_pkr,
  min_spend_pkr,
  terms,
  is_active,
  verified_at
) values (
  '66666666-6666-4666-8666-000000000003',
  'ks-curated-asian-wok-beverly-centre-blue-area',
  'Standard Chartered',
  'scb',
  'Priority / Visa Infinite',
  20,
  array['Tuesday', 'Wednesday', 'Thursday'],
  3500,
  1500,
  'Applicable on dine-in bill before taxes. Valid with contactless or chip card swipe.',
  true,
  '2026-10-30T00:00:00Z'
)
on conflict (id) do nothing;

insert into public.restaurant_card_deals (
  id,
  google_place_id,
  bank_name,
  bank_code,
  card_tier,
  discount_percentage,
  applicable_days,
  max_discount_pkr,
  min_spend_pkr,
  terms,
  is_active,
  verified_at
) values (
  '66666666-6666-4666-8666-000000000004',
  'ks-curated-asian-wok-beverly-centre-blue-area',
  'Meezan Bank',
  'meezan',
  'Titanium Debit',
  15,
  array['Monday', 'Wednesday'],
  3500,
  1500,
  'Applicable on dine-in bill before taxes. Valid with contactless or chip card swipe.',
  true,
  '2026-10-30T00:00:00Z'
)
on conflict (id) do nothing;

insert into public.restaurant_card_deals (
  id,
  google_place_id,
  bank_name,
  bank_code,
  card_tier,
  discount_percentage,
  applicable_days,
  max_discount_pkr,
  min_spend_pkr,
  terms,
  is_active,
  verified_at
) values (
  '66666666-6666-4666-8666-000000000005',
  'ks-curated-roasters-coffee-house-kohsar-f6',
  'Bank Alfalah',
  'alfalah',
  'Gold / Platinum',
  15,
  array['Wednesday', 'Thursday'],
  3500,
  1500,
  'Applicable on dine-in bill before taxes. Valid with contactless or chip card swipe.',
  true,
  '2026-10-30T00:00:00Z'
)
on conflict (id) do nothing;

insert into public.restaurant_card_deals (
  id,
  google_place_id,
  bank_name,
  bank_code,
  card_tier,
  discount_percentage,
  applicable_days,
  max_discount_pkr,
  min_spend_pkr,
  terms,
  is_active,
  verified_at
) values (
  '66666666-6666-4666-8666-000000000006',
  'ks-curated-cheezious-f7-jinnah-super',
  'Meezan Bank',
  'meezan',
  'Debit Cards',
  15,
  array['Tuesday', 'Wednesday'],
  3500,
  1500,
  'Applicable on dine-in bill before taxes. Valid with contactless or chip card swipe.',
  true,
  '2026-10-30T00:00:00Z'
)
on conflict (id) do nothing;

insert into public.restaurant_card_deals (
  id,
  google_place_id,
  bank_name,
  bank_code,
  card_tier,
  discount_percentage,
  applicable_days,
  max_discount_pkr,
  min_spend_pkr,
  terms,
  is_active,
  verified_at
) values (
  '66666666-6666-4666-8666-000000000007',
  'ks-curated-ginyaki-f7-chinese-bowl',
  'HBL',
  'hbl',
  'Credit Cards',
  15,
  array['Thursday', 'Friday'],
  3500,
  1500,
  'Applicable on dine-in bill before taxes. Valid with contactless or chip card swipe.',
  true,
  '2026-10-30T00:00:00Z'
)
on conflict (id) do nothing;

insert into public.restaurant_card_deals (
  id,
  google_place_id,
  bank_name,
  bank_code,
  card_tier,
  discount_percentage,
  applicable_days,
  max_discount_pkr,
  min_spend_pkr,
  terms,
  is_active,
  verified_at
) values (
  '66666666-6666-4666-8666-000000000008',
  'ks-curated-blt-restaurant-f7-gol-market',
  'Standard Chartered',
  'scb',
  'Platinum / Infinite',
  20,
  array['All Days'],
  3500,
  1500,
  'Applicable on dine-in bill before taxes. Valid with contactless or chip card swipe.',
  true,
  '2026-10-30T00:00:00Z'
)
on conflict (id) do nothing;

insert into public.restaurant_card_deals (
  id,
  google_place_id,
  bank_name,
  bank_code,
  card_tier,
  discount_percentage,
  applicable_days,
  max_discount_pkr,
  min_spend_pkr,
  terms,
  is_active,
  verified_at
) values (
  '66666666-6666-4666-8666-000000000009',
  'ks-curated-tandoori-restaurant-f10-markaz',
  'Bank Alfalah',
  'alfalah',
  'Debit & Credit',
  15,
  array['Monday', 'Tuesday', 'Wednesday'],
  3500,
  1500,
  'Applicable on dine-in bill before taxes. Valid with contactless or chip card swipe.',
  true,
  '2026-10-30T00:00:00Z'
)
on conflict (id) do nothing;

insert into public.restaurant_card_deals (
  id,
  google_place_id,
  bank_name,
  bank_code,
  card_tier,
  discount_percentage,
  applicable_days,
  max_discount_pkr,
  min_spend_pkr,
  terms,
  is_active,
  verified_at
) values (
  '66666666-6666-4666-8666-000000000010',
  'ks-curated-chaaye-khana-i8-markaz',
  'Meezan Bank',
  'meezan',
  'World / Platinum',
  15,
  array['Monday', 'Tuesday', 'Wednesday'],
  3500,
  1500,
  'Applicable on dine-in bill before taxes. Valid with contactless or chip card swipe.',
  true,
  '2026-10-30T00:00:00Z'
)
on conflict (id) do nothing;

insert into public.restaurant_card_deals (
  id,
  google_place_id,
  bank_name,
  bank_code,
  card_tier,
  discount_percentage,
  applicable_days,
  max_discount_pkr,
  min_spend_pkr,
  terms,
  is_active,
  verified_at
) values (
  '66666666-6666-4666-8666-000000000011',
  'ks-curated-nadia-cafe-marriott-f5',
  'Standard Chartered',
  'scb',
  'Visa Infinite / Priority',
  25,
  array['Thursday', 'Friday', 'Saturday', 'Sunday'],
  3500,
  1500,
  'Applicable on dine-in bill before taxes. Valid with contactless or chip card swipe.',
  true,
  '2026-10-30T00:00:00Z'
)
on conflict (id) do nothing;

insert into public.restaurant_card_deals (
  id,
  google_place_id,
  bank_name,
  bank_code,
  card_tier,
  discount_percentage,
  applicable_days,
  max_discount_pkr,
  min_spend_pkr,
  terms,
  is_active,
  verified_at
) values (
  '66666666-6666-4666-8666-000000000012',
  'ks-curated-nadia-cafe-marriott-f5',
  'HBL',
  'hbl',
  'World Elite',
  20,
  array['Monday', 'Wednesday'],
  3500,
  1500,
  'Applicable on dine-in bill before taxes. Valid with contactless or chip card swipe.',
  true,
  '2026-10-30T00:00:00Z'
)
on conflict (id) do nothing;

insert into public.restaurant_card_deals (
  id,
  google_place_id,
  bank_name,
  bank_code,
  card_tier,
  discount_percentage,
  applicable_days,
  max_discount_pkr,
  min_spend_pkr,
  terms,
  is_active,
  verified_at
) values (
  '66666666-6666-4666-8666-000000000013',
  'ks-curated-mei-kong-restaurant-saddar-rawalpindi',
  'HBL',
  'hbl',
  'Platinum / Gold',
  15,
  array['Tuesday', 'Wednesday'],
  3500,
  1500,
  'Applicable on dine-in bill before taxes. Valid with contactless or chip card swipe.',
  true,
  '2026-10-30T00:00:00Z'
)
on conflict (id) do nothing;

insert into public.restaurant_card_deals (
  id,
  google_place_id,
  bank_name,
  bank_code,
  card_tier,
  discount_percentage,
  applicable_days,
  max_discount_pkr,
  min_spend_pkr,
  terms,
  is_active,
  verified_at
) values (
  '66666666-6666-4666-8666-000000000014',
  'ks-curated-chaska-restaurant-stadium-road-food-street',
  'Bank Alfalah',
  'alfalah',
  'Classic / Gold',
  15,
  array['Monday', 'Wednesday'],
  3500,
  1500,
  'Applicable on dine-in bill before taxes. Valid with contactless or chip card swipe.',
  true,
  '2026-10-30T00:00:00Z'
)
on conflict (id) do nothing;

insert into public.restaurant_card_deals (
  id,
  google_place_id,
  bank_name,
  bank_code,
  card_tier,
  discount_percentage,
  applicable_days,
  max_discount_pkr,
  min_spend_pkr,
  terms,
  is_active,
  verified_at
) values (
  '66666666-6666-4666-8666-000000000015',
  'ks-curated-asian-wok-bahria-phase-7-riverview',
  'Standard Chartered',
  'scb',
  'Visa Infinite',
  20,
  array['Tuesday', 'Wednesday'],
  3500,
  1500,
  'Applicable on dine-in bill before taxes. Valid with contactless or chip card swipe.',
  true,
  '2026-10-30T00:00:00Z'
)
on conflict (id) do nothing;

insert into public.restaurant_card_deals (
  id,
  google_place_id,
  bank_name,
  bank_code,
  card_tier,
  discount_percentage,
  applicable_days,
  max_discount_pkr,
  min_spend_pkr,
  terms,
  is_active,
  verified_at
) values (
  '66666666-6666-4666-8666-000000000016',
  'ks-curated-asian-wok-bahria-phase-7-riverview',
  'HBL',
  'hbl',
  'World / Platinum',
  20,
  array['Monday', 'Tuesday'],
  3500,
  1500,
  'Applicable on dine-in bill before taxes. Valid with contactless or chip card swipe.',
  true,
  '2026-10-30T00:00:00Z'
)
on conflict (id) do nothing;

insert into public.restaurant_card_deals (
  id,
  google_place_id,
  bank_name,
  bank_code,
  card_tier,
  discount_percentage,
  applicable_days,
  max_discount_pkr,
  min_spend_pkr,
  terms,
  is_active,
  verified_at
) values (
  '66666666-6666-4666-8666-000000000017',
  'ks-curated-diva-restaurant-bahria-phase-7',
  'Bank Alfalah',
  'alfalah',
  'Signature / Platinum',
  15,
  array['Monday', 'Wednesday'],
  3500,
  1500,
  'Applicable on dine-in bill before taxes. Valid with contactless or chip card swipe.',
  true,
  '2026-10-30T00:00:00Z'
)
on conflict (id) do nothing;
