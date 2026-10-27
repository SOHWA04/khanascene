import fs from 'fs';
import path from 'path';
import {
  buildFreeGoogleMapsSearchUrl,
  mapGooglePlaceV1ToSummary,
} from '@/services/google-places/placesService';
import {
  mapKhanaSceneRecordToDiscoveryItem,
  mergeAndDeduplicateDiscoveryItems,
} from '@/repositories/restaurantRepository';

describe('Phase 4 & 5 — 3-Layer Zero-Cost Circuit Breaker, Google Places Mapping & Deduplication', () => {
  const migrationPath = path.join(
    __dirname,
    '../../supabase/migrations/20261025000003_api_usage_circuit_breaker.sql'
  );
  const edgeFunctionPath = path.join(
    __dirname,
    '../../supabase/functions/places-proxy/index.ts'
  );

  it('defines the PostgreSQL free-tier circuit breaker (850 monthly hard cap) and Edge Function field masks', () => {
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    expect(sql).toContain('create table if not exists public.api_usage_counters');
    expect(sql).toContain('monthly_hard_limit integer not null default 850');
    expect(sql).toContain('create or replace function public.consume_places_quota');

    const edgeCode = fs.readFileSync(edgeFunctionPath, 'utf-8');
    expect(edgeCode).toContain('consume_places_quota');
    expect(edgeCode).toContain('X-Goog-FieldMask');
    expect(edgeCode).toContain('TEXT_SEARCH_FIELD_MASK');
    expect(edgeCode).toContain('PLACE_DETAILS_FIELD_MASK');
  });

  it('maps Google Places API (New) v1 payloads without fabricating missing fields', () => {
    const summary = mapGooglePlaceV1ToSummary({
      id: 'ChIJ_example_isb_1',
      displayName: { text: 'Desi Pardesi Restaurant' },
      formattedAddress: 'Saidpur Village, Islamabad, Pakistan',
      shortFormattedAddress: 'Saidpur Village, Islamabad',
      rating: 4.3,
      userRatingCount: 1950,
      // Intentionally omit priceLevel & currentOpeningHours
    });

    expect(summary.placeId).toBe('ChIJ_example_isb_1');
    expect(summary.name).toBe('Desi Pardesi Restaurant');
    expect(summary.cityId).toBe('islamabad');
    expect(summary.neighbourhood).toBe('Saidpur Village');
    expect(summary.googleRating).toBe(4.3);
    expect(summary.googleReviewCount).toBe(1950);
    expect(summary.priceLevel).toBeUndefined();
    expect(summary.openNow).toBeNull();
    expect(summary.googleMapsUri).toContain('query_place_id=ChIJ_example_isb_1');
  });

  it('deduplicates and merges Supabase records with Google Places results by placeId or normalized name', () => {
    const supabaseItem = mapKhanaSceneRecordToDiscoveryItem({
      id: 'rec-100',
      googlePlaceId: 'ChIJ_shared_id',
      name: 'Savour Foods Blue Area',
      slug: 'savour-foods-blue-area',
      cityId: 'islamabad',
      cuisines: ['pakistani', 'biryani'],
      priceMinPkr: 500,
      priceMaxPkr: 950,
      isKhanaScenePick: true,
    });

    const googleDuplicateById = {
      placeId: 'ChIJ_shared_id',
      googleData: {
        placeId: 'ChIJ_shared_id',
        name: 'Savour Foods Blue Area',
        cityId: 'islamabad' as const,
        googleRating: 4.5,
        googleReviewCount: 8200,
        googleMapsUri: 'https://maps.google.com/?cid=1',
      },
    };

    const googleDuplicateByName = {
      placeId: 'ChIJ_different_id_same_branch',
      googleData: {
        placeId: 'ChIJ_different_id_same_branch',
        name: '  savour foods blue area ',
        cityId: 'islamabad' as const,
        googleRating: 4.5,
        googleMapsUri: 'https://maps.google.com/?cid=2',
      },
    };

    const merged = mergeAndDeduplicateDiscoveryItems(
      [supabaseItem],
      [googleDuplicateById, googleDuplicateByName]
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].placeId).toBe('ChIJ_shared_id');
    // Preserves both KhanaScene PKR pricing and Google's rating
    expect(merged[0].khanaSceneData?.priceMinPkr).toBe(500);
    expect(merged[0].googleData.googleRating).toBe(4.5);
  });

  it('builds free, unlimited Layer 3 Google Maps deep link URLs', () => {
    const url = buildFreeGoogleMapsSearchUrl('Mutton Karahi', 'rawalpindi');
    expect(url).toBe(
      'https://www.google.com/maps/search/?api=1&query=Mutton%20Karahi%20in%20Rawalpindi%2C%20Pakistan'
    );
  });
});
