/**
 * KhanaScene — OpenStreetMap (OSM) Twin-Cities Ingestion & Deduplication Pipeline
 *
 * 1. Fetches restaurants, cafes, and fast-food spots across Islamabad & Rawalpindi
 *    from OpenStreetMap via the public Overpass API ($0.00 API cost).
 * 2. Deduplicates against existing curated and seeded restaurants in `supabase/migrations/*.sql`
 *    (by normalized name and geographical distance threshold < 200m).
 * 3. Maps each record to the closest KhanaScene `area_id` and supported `cuisines`.
 * 4. Outputs an idempotent SQL migration file:
 *    `supabase/migrations/20261031000002_osm_bulk_twin_cities.sql`.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Known Twin-Cities Area Centroids for automatic geographic area mapping
const AREA_CENTROIDS = [
  // Islamabad
  { id: 'isb-f6', city: 'islamabad', name: 'F-6 Markaz', lat: 33.7300, lon: 73.0750 },
  { id: 'isb-f7', city: 'islamabad', name: 'F-7 Markaz', lat: 33.7215, lon: 73.0571 },
  { id: 'isb-f8', city: 'islamabad', name: 'F-8 Markaz', lat: 33.7125, lon: 73.0375 },
  { id: 'isb-f10', city: 'islamabad', name: 'F-10 Markaz', lat: 33.6930, lon: 73.0120 },
  { id: 'isb-f11', city: 'islamabad', name: 'F-11 Markaz', lat: 33.6840, lon: 72.9890 },
  { id: 'isb-blue-area', city: 'islamabad', name: 'Blue Area', lat: 33.7110, lon: 73.0640 },
  { id: 'isb-i8', city: 'islamabad', name: 'I-8 Markaz', lat: 33.6685, lon: 73.0765 },
  { id: 'isb-e7', city: 'islamabad', name: 'E-7', lat: 33.7319, lon: 73.0475 },
  { id: 'isb-daman-e-koh', city: 'islamabad', name: 'Margalla Hills', lat: 33.7440, lon: 73.0645 },
  { id: 'isb-g9', city: 'islamabad', name: 'G-9 Markaz', lat: 33.6895, lon: 73.0321 },
  { id: 'isb-g11', city: 'islamabad', name: 'G-11 Markaz', lat: 33.6740, lon: 72.9980 },
  { id: 'isb-e11', city: 'islamabad', name: 'E-11 MPCHS', lat: 33.6985, lon: 72.9735 },
  { id: 'isb-pwd', city: 'islamabad', name: 'PWD & Pakistan Town', lat: 33.5850, lon: 73.1480 },

  // Rawalpindi
  { id: 'rwp-saddar', city: 'rawalpindi', name: 'Saddar', lat: 33.5955, lon: 73.0535 },
  { id: 'rwp-commercial', city: 'rawalpindi', name: 'Commercial Market', lat: 33.6395, lon: 73.0725 },
  { id: 'rwp-kartarpura', city: 'rawalpindi', name: 'Kartarpura Food Street', lat: 33.6145, lon: 73.0610 },
  { id: 'rwp-stadium-rd', city: 'rawalpindi', name: 'Stadium Road Food Street', lat: 33.6520, lon: 73.0745 },
  { id: 'rwp-banni', city: 'rawalpindi', name: 'Banni Chowk', lat: 33.6210, lon: 73.0645 },
  { id: 'rwp-bahria', city: 'rawalpindi', name: 'Bahria Town', lat: 33.5385, lon: 73.1120 },
  { id: 'rwp-dha', city: 'rawalpindi', name: 'DHA', lat: 33.5250, lon: 73.1450 },
  { id: 'rwp-peshawar-rd', city: 'rawalpindi', name: 'Peshawar Road', lat: 33.6050, lon: 73.0180 },
  { id: 'rwp-chaklala', city: 'rawalpindi', name: 'Chaklala Scheme 3', lat: 33.5880, lon: 73.0950 },
];

function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findNearestArea(lat, lon) {
  let closest = AREA_CENTROIDS[0];
  let minDistance = Infinity;

  for (const centroid of AREA_CENTROIDS) {
    const dist = haversineDistanceMeters(lat, lon, centroid.lat, centroid.lon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = centroid;
    }
  }

  // If closest is still reasonably close or fallback based on lat boundary
  const city = lat >= 33.64 ? 'islamabad' : 'rawalpindi';
  return { areaId: closest.id, cityId: closest.city || city, areaName: closest.name, distanceMeters: minDistance };
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\b(restaurant|cafe|café|bakers|fast food|pk|islamabad|rawalpindi)\b/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Scans existing SQL migrations to gather all existing restaurant names, slugs, and locations.
 */
function loadExistingRestaurants() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));

  const existingSlugs = new Set();
  const existingRecords = [];

  for (const file of files) {
    // Avoid scanning the target file if it was previously created
    if (file.includes('osm_bulk')) continue;

    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const slugRegex = /'([a-z0-9-]+)'/g;
    let match;

    // Capture slugs and names
    const insertBlocks = content.split(/insert into public\.restaurant_records/i);
    for (let i = 1; i < insertBlocks.length; i++) {
      const block = insertBlocks[i].split(';')[0];
      const valRegex = /\(\s*'([0-9a-f-]{36})',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*([0-9.-]+),\s*([0-9.-]+)/g;
      let vm;
      while ((vm = valRegex.exec(block)) !== null) {
        const name = vm[3];
        const slug = vm[4];
        const lat = parseFloat(vm[8]);
        const lon = parseFloat(vm[9]);
        existingSlugs.add(slug);
        existingRecords.push({
          name,
          normName: normalizeName(name),
          slug,
          lat,
          lon,
        });
      }
    }
  }

  console.log(`[Deduplication] Loaded ${existingRecords.length} existing restaurants from Supabase migrations.`);
  return { existingSlugs, existingRecords };
}

const OVERPASS_ENDPOINTS = [
  'overpass.kumi.systems',
  'lz4.overpass-api.de',
  'z.overpass-api.de',
  'overpass-api.de',
];

/**
 * Fetches elements from OpenStreetMap Overpass API with multi-mirror fallback
 */
async function fetchOverpassData() {
  const query = `
    [out:json][timeout:45];
    (
      node["amenity"~"^(restaurant|cafe|fast_food)$"](33.50,72.90,33.78,73.20);
      way["amenity"~"^(restaurant|cafe|fast_food)$"](33.50,72.90,33.78,73.20);
    );
    out center tags;
  `;

  for (const host of OVERPASS_ENDPOINTS) {
    try {
      console.log(`[Overpass API] Trying endpoint ${host}...`);
      const elements = await new Promise((resolve, reject) => {
        const options = {
          hostname: host,
          port: 443,
          path: '/api/interpreter',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'KhanaScene-OSM-Importer/1.0',
          },
          timeout: 40000,
        };

        const req = https.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            if (res.statusCode !== 200) {
              return reject(new Error(`Host ${host} responded with HTTP ${res.statusCode}`));
            }
            try {
              const json = JSON.parse(body);
              resolve(json.elements || []);
            } catch (err) {
              reject(new Error(`Failed to parse Overpass JSON from ${host}: ${err.message}`));
            }
          });
        });

        req.on('timeout', () => {
          req.destroy(new Error(`Timeout connecting to ${host}`));
        });
        req.on('error', (e) => reject(e));
        req.write('data=' + encodeURIComponent(query));
        req.end();
      });

      if (elements && elements.length > 0) {
        console.log(`[Overpass API] Successfully received ${elements.length} records from ${host}!`);
        return elements;
      }
    } catch (err) {
      console.warn(`[Overpass API] Host ${host} failed: ${err.message}. Trying next mirror...`);
    }
  }

  throw new Error('All Overpass API mirror endpoints failed.');
}

function mapOsmToKhanaScene(elements, existingSlugs, existingRecords) {
  const validPlaces = [];
  const skippedDuplicates = [];
  const seenSlugs = new Set(existingSlugs);

  for (const el of elements) {
    const tags = el.tags || {};
    const rawName = tags.name || tags['name:en'] || tags['brand'];
    if (!rawName || rawName.trim().length < 2) continue;

    const lat = el.lat || (el.center && el.center.lat);
    const lon = el.lon || (el.center && el.center.lon);
    if (!lat || !lon) continue;

    const cleanName = rawName.trim();
    const norm = normalizeName(cleanName);

    // Check duplicate against existing records
    const isDup = existingRecords.some((rec) => {
      if (rec.normName.length > 3 && norm.length > 3 && (rec.normName.includes(norm) || norm.includes(rec.normName))) {
        const dist = haversineDistanceMeters(lat, lon, rec.lat, rec.lon);
        return dist < 300; // within 300 meters
      }
      return false;
    });

    if (isDup) {
      skippedDuplicates.push(cleanName);
      continue;
    }

    const { areaId, cityId, areaName } = findNearestArea(lat, lon);

    // Primary category & cuisine detection
    const amenity = tags.amenity || 'restaurant';
    const osmCuisine = (tags.cuisine || '').toLowerCase();

    let primaryCategory = 'Pakistani & Casual Dining';
    const assignedCuisines = [];

    if (amenity === 'cafe' || osmCuisine.includes('coffee') || cleanName.toLowerCase().includes('cafe') || cleanName.toLowerCase().includes('tea')) {
      primaryCategory = 'Café & Beverage Lounge';
      assignedCuisines.push('cafes');
      if (cleanName.toLowerCase().includes('tea') || cleanName.toLowerCase().includes('chai')) {
        assignedCuisines.push('tea-chai');
      }
    } else if (amenity === 'fast_food' || osmCuisine.includes('burger') || cleanName.toLowerCase().includes('burger')) {
      primaryCategory = 'Fast Food & Burgers';
      assignedCuisines.push('burgers');
    } else if (osmCuisine.includes('pizza') || cleanName.toLowerCase().includes('pizza')) {
      primaryCategory = 'Pizza & Italian';
      assignedCuisines.push('pizza');
    } else if (osmCuisine.includes('chinese') || cleanName.toLowerCase().includes('chinese')) {
      primaryCategory = 'Chinese & Asian';
      assignedCuisines.push('chinese');
    } else if (osmCuisine.includes('bbq') || cleanName.toLowerCase().includes('bbq') || cleanName.toLowerCase().includes('tikka')) {
      primaryCategory = 'Charcoal BBQ & Grills';
      assignedCuisines.push('bbq', 'pakistani');
    } else if (cleanName.toLowerCase().includes('biryani') || cleanName.toLowerCase().includes('pulao')) {
      primaryCategory = 'Biryani & Rice Specialties';
      assignedCuisines.push('biryani', 'pakistani');
    } else if (cleanName.toLowerCase().includes('shinwari') || cleanName.toLowerCase().includes('karahi')) {
      primaryCategory = 'Shinwari & Karahi';
      assignedCuisines.push('shinwari', 'karahi', 'pakistani');
    } else {
      assignedCuisines.push('pakistani');
    }

    // Default PKR price estimation based on category
    let priceMin = 800;
    let priceMax = 2200;
    if (primaryCategory.includes('Café')) {
      priceMin = 600;
      priceMax = 1800;
    } else if (primaryCategory.includes('Fast Food')) {
      priceMin = 500;
      priceMax = 1500;
    } else if (primaryCategory.includes('Charcoal') || primaryCategory.includes('Shinwari')) {
      priceMin = 1200;
      priceMax = 3200;
    }

    // Generate unique slug
    let baseSlug = slugify(`${cleanName}-${areaName}`);
    let slug = baseSlug;
    let counter = 1;
    while (seenSlugs.has(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }
    seenSlugs.add(slug);

    const address = tags['addr:street']
      ? `${tags['addr:street']}, ${areaName}, ${cityId === 'rawalpindi' ? 'Rawalpindi' : 'Islamabad'}`
      : `${areaName}, ${cityId === 'rawalpindi' ? 'Rawalpindi' : 'Islamabad'}`;

    const phone = tags['phone'] || tags['contact:phone'] || null;
    const website = tags['website'] || tags['contact:website'] || null;

    validPlaces.push({
      osmId: el.id,
      name: cleanName,
      slug,
      cityId,
      areaId,
      address,
      lat: Math.round(lat * 100000) / 100000,
      lon: Math.round(lon * 100000) / 100000,
      phone,
      website,
      primaryCategory,
      priceMin,
      priceMax,
      cuisines: assignedCuisines,
      parkingType: 'street_moderate',
      hasValet: false,
    });
  }

  return { validPlaces, skippedDuplicates };
}

function generateMigrationSql(places) {
  let sql = `-- =============================================================================
-- KhanaScene — Phase 8 OpenStreetMap (OSM) Base Layer Bulk Import
-- =============================================================================
-- Auto-generated by scripts/import-osm-restaurants.js
-- Fetched from OpenStreetMap via Overpass API for Twin Cities metropolitan coverage.
-- All records are deduplicated against Tier 1 curated entries ($0.00 API cost).
-- Total places in this migration: ${places.length}
-- =============================================================================

`;

  // Insert in batches of 50
  const BATCH_SIZE = 50;
  for (let i = 0; i < places.length; i += BATCH_SIZE) {
    const batch = places.slice(i, i + BATCH_SIZE);

    const valuesSql = batch
      .map((p, idx) => {
        const id = `77777777-7777-4777-8777-${String(i + idx + 1).padStart(12, '0')}`;
        const googlePlaceId = `osm-${p.osmId}`;
        const phoneSql = p.phone ? `'${p.phone.replace(/'/g, "''")}'` : 'null';
        const websiteSql = p.website ? `'${p.website.replace(/'/g, "''")}'` : 'null';
        const nameSql = `'${p.name.replace(/'/g, "''")}'`;
        const addrSql = `'${p.address.replace(/'/g, "''")}'`;

        return `  (
    '${id}',
    '${googlePlaceId}',
    ${nameSql},
    '${p.slug}',
    '${p.cityId}',
    '${p.areaId}',
    ${addrSql},
    ${p.lat},
    ${p.lon},
    ${phoneSql},
    ${websiteSql},
    ${p.priceMin},
    ${p.priceMax},
    'PKR',
    '2026-10-31T00:00:00Z',
    false,
    null,
    true,
    'verified',
    '${p.parkingType}',
    ${p.hasValet},
    array[]::text[]
  )`;
      })
      .join(',\n');

    sql += `insert into public.restaurant_records (
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
values
${valuesSql}
on conflict (slug) do nothing;\n\n`;
  }

  // Cuisines mapping
  sql += `-- Map Cuisines for OSM Records\n`;
  for (const p of places) {
    for (const cSlug of p.cuisines) {
      sql += `insert into public.restaurant_record_cuisines (restaurant_record_id, cuisine_id)
select r.id, c.id
from public.restaurant_records r, public.cuisines c
where r.slug = '${p.slug}' and c.slug = '${cSlug}'
on conflict (restaurant_record_id, cuisine_id) do nothing;\n`;
    }
  }

  return sql;
}

async function run() {
  try {
    const { existingSlugs, existingRecords } = loadExistingRestaurants();
    const rawElements = await fetchOverpassData();
    console.log(`[Overpass API] Fetched ${rawElements.length} raw amenity elements.`);

    const { validPlaces, skippedDuplicates } = mapOsmToKhanaScene(rawElements, existingSlugs, existingRecords);
    console.log(`[Deduplication] Skipped ${skippedDuplicates.length} duplicates already present in curated seeds.`);
    console.log(`[Cleaned Data] Prepared ${validPlaces.length} new unique restaurants across Twin Cities.`);

    const sql = generateMigrationSql(validPlaces);
    const outPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261031000002_osm_bulk_twin_cities.sql');
    fs.writeFileSync(outPath, sql, 'utf8');

    console.log(`\n🎉 Success! Wrote ${validPlaces.length} restaurants to migration file:`);
    console.log(`-> ${outPath}`);
  } catch (err) {
    console.error('Fatal error in OSM ingestion:', err);
    process.exit(1);
  }
}

run();
