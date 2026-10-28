-- =============================================================================
-- KhanaScene — Parking Reality & Signature Hero Dishes System
-- =============================================================================
-- Solves two key diner pain points in Pakistan:
-- 1. "Gaari kahan khari karein?" (Parking reality: Valet, Dedicated, Street, Crowded).
-- 2. "Yahan ka kya famous hai?" (Top 2-3 signature hero dishes diners must try).
-- =============================================================================

-- 1. Add parking_type, has_valet, and hero_dishes to restaurant_records
alter table public.restaurant_records
  add column if not exists parking_type text default 'unknown'
    check (parking_type in ('valet', 'dedicated_lot', 'street_moderate', 'street_crowded', 'unknown')),
  add column if not exists has_valet boolean default false,
  add column if not exists hero_dishes text[] default '{}';

-- 2. Add is_signature to menu_items
alter table public.menu_items
  add column if not exists is_signature boolean not null default false;

create index if not exists idx_rr_parking_type on public.restaurant_records(parking_type);
create index if not exists idx_rr_has_valet on public.restaurant_records(has_valet);
create index if not exists idx_mi_is_signature on public.menu_items(is_signature);

-- 3. Seed real-world parking info and signature hero dishes for curated Islamabad & Rawalpindi spots

update public.restaurant_records
set
  parking_type = 'street_crowded',
  has_valet = false,
  hero_dishes = array['Namkeen Lamb Rosh', 'Kabuli Pulao', 'Chopin Kabab']
where slug = 'kabul-restaurant-f7' or name ilike '%Kabul Restaurant%';

update public.restaurant_records
set
  parking_type = 'street_moderate',
  has_valet = true,
  hero_dishes = array['Wood-Fired Burrata Pizza', 'Eggs Benedict', 'French Toast']
where slug = 'street-1-cafe-f6' or name ilike '%Street 1 Cafe%';

update public.restaurant_records
set
  parking_type = 'valet',
  has_valet = true,
  hero_dishes = array['Crispy Beef', 'Dynamite Prawns', 'Kung Pao Chicken']
where slug = 'asian-wok-f6' or name ilike '%Asian Wok%';

update public.restaurant_records
set
  parking_type = 'dedicated_lot',
  has_valet = true,
  hero_dishes = array['Mutton Karahi', 'Chicken Tikka', 'Brain Masala']
where slug = 'monal-pir-sohawa' or name ilike '%Monal%';

update public.restaurant_records
set
  parking_type = 'valet',
  has_valet = true,
  hero_dishes = array['Pollo Tuscan', 'Beef Carpaccio', 'Wild Mushroom Soup']
where slug = 'tuscany-courtyard-f6' or name ilike '%Tuscany Courtyard%';

update public.restaurant_records
set
  parking_type = 'dedicated_lot',
  has_valet = true,
  hero_dishes = array['Wrangler Burger', 'Son of a Bun', 'Curly Fries']
where slug = 'howdy-beverly-centre' or name ilike '%Howdy%';

update public.restaurant_records
set
  parking_type = 'street_moderate',
  has_valet = false,
  hero_dishes = array['Nutella French Toast', 'Salted Caramel Cheesecake', 'Molten Lava']
where slug = 'burning-brownie-beverly' or name ilike '%Burning Brownie%';

update public.restaurant_records
set
  parking_type = 'street_crowded',
  has_valet = false,
  hero_dishes = array['Chicken Pulao with Kabab', 'Special Zarda']
where slug = 'savour-foods-blue-area' or name ilike '%Savour Foods%';

update public.restaurant_records
set
  parking_type = 'dedicated_lot',
  has_valet = true,
  hero_dishes = array['Peking Duck', 'Szechuan Chicken', 'Hot & Sour Soup']
where slug = 'mei-kong-saddar' or name ilike '%Mei Kong%';

update public.restaurant_records
set
  parking_type = 'street_moderate',
  has_valet = true,
  hero_dishes = array['Prime Ribeye Steak', 'Chicken Parmesan', 'Gourmet Burgers']
where slug = 'roasters-f7' or name ilike '%Roasters%';

update public.restaurant_records
set
  parking_type = 'street_moderate',
  has_valet = false,
  hero_dishes = array['Texas Special Steak', 'Fajita Sizzler', 'Buffalo Wings']
where slug = 'texas-steakhouse-saddar' or name ilike '%Texas Steakhouse%';

update public.restaurant_records
set
  parking_type = 'street_moderate',
  has_valet = false,
  hero_dishes = array['Peshawari Kahwa', 'Chicken Paratha Roll', 'Club Sandwich']
where slug = 'chaaye-khana-f6' or name ilike '%Chaaye Khana%';

update public.restaurant_records
set
  parking_type = 'street_crowded',
  has_valet = false,
  hero_dishes = array['Halwa Puri Thali', 'Chana Masala', 'Sweet Lassi']
where slug = 'refreshment-center-kartarpura' or name ilike '%Refreshment Center%';

-- Flag signature dishes in menu_items
update public.menu_items
set is_signature = true
where name ilike '%Kabuli Pulao%'
   or name ilike '%Rosh%'
   or name ilike '%Burrata%'
   or name ilike '%Crispy Beef%'
   or name ilike '%Pollo Tuscan%'
   or name ilike '%Wrangler%'
   or name ilike '%Steak%';
