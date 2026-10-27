-- =============================================================================
-- KhanaScene — Seed Data for Initial Launch Cities, Neighbourhoods & Cuisines
-- =============================================================================

insert into public.cities (id, name, country_code, is_active)
values
  ('islamabad', 'Islamabad', 'PK', true),
  ('rawalpindi', 'Rawalpindi', 'PK', true)
on conflict (id) do update
  set name = excluded.name,
      is_active = excluded.is_active;

insert into public.areas (id, city_id, name, is_active)
values
  ('isb-f6', 'islamabad', 'F-6 Markaz', true),
  ('isb-f7', 'islamabad', 'F-7 Markaz', true),
  ('isb-f8', 'islamabad', 'F-8 Markaz', true),
  ('isb-f10', 'islamabad', 'F-10 Markaz', true),
  ('isb-f11', 'islamabad', 'F-11 Markaz', true),
  ('isb-blue-area', 'islamabad', 'Blue Area', true),
  ('isb-i8', 'islamabad', 'I-8 Markaz', true),
  ('isb-e7', 'islamabad', 'E-7', true),
  ('isb-daman-e-koh', 'islamabad', 'Margalla Hills', true),
  ('rwp-saddar', 'rawalpindi', 'Saddar', true),
  ('rwp-bahria', 'rawalpindi', 'Bahria Town', true),
  ('rwp-dha', 'rawalpindi', 'DHA', true),
  ('rwp-commercial', 'rawalpindi', 'Commercial Market', true),
  ('rwp-peshawar-rd', 'rawalpindi', 'Peshawar Road', true),
  ('rwp-chaklala', 'rawalpindi', 'Chaklala Scheme 3', true)
on conflict (id) do update
  set name = excluded.name,
      is_active = excluded.is_active;

insert into public.cuisines (name, slug, is_active)
values
  ('Pakistani', 'pakistani', true),
  ('Biryani', 'biryani', true),
  ('Karahi', 'karahi', true),
  ('BBQ', 'bbq', true),
  ('Burgers', 'burgers', true),
  ('Pizza', 'pizza', true),
  ('Chinese', 'chinese', true),
  ('Turkish', 'turkish', true),
  ('Middle Eastern', 'middle-eastern', true),
  ('Cafés', 'cafes', true),
  ('Desserts', 'desserts', true),
  ('Breakfast & Brunch', 'breakfast-brunch', true),
  ('Street Food', 'street-food', true)
on conflict (slug) do update
  set name = excluded.name,
      is_active = excluded.is_active;
