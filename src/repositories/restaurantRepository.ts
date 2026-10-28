import { APP_CONFIG } from '@/config';
import { supabaseMetadataRepository } from '@/repositories/supabaseMetadataRepository';
import { DEV_RESTAURANT_FIXTURES } from '@/services/google-places/devFixtures';
import {
  buildFreeGoogleMapsSearchUrl,
  googlePlacesService,
} from '@/services/google-places/placesService';
import {
  CitySlug,
  KhanaSceneRecord,
  RestaurantDiscoveryItem,
  SearchFilters,
  SortOption,
} from '@/types/restaurant';

export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function determineOpenNowFromHours(hoursText?: string[]): boolean | null {
  if (!hoursText || hoursText.length === 0) return null;
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  // Pakistan Standard Time is UTC+5
  const pktDate = new Date(utc + 3600000 * 5);
  const currentHour = pktDate.getHours() + pktDate.getMinutes() / 60;

  const combined = hoursText.join(' ').toLowerCase();
  if (combined.includes('8:00 am') || combined.includes('8:30 am')) {
    return currentHour >= 8.5 && currentHour <= 23.5;
  }
  return currentHour >= 12.0 && currentHour <= 23.75;
}

/**
 * Converts a KhanaScene-owned Supabase record into a `RestaurantDiscoveryItem`
 * so Layer 1 (Supabase-First $0 discovery) works even without calling Google Places.
 */
export function mapKhanaSceneRecordToDiscoveryItem(
  record: KhanaSceneRecord
): RestaurantDiscoveryItem {
  const placeId = record.googlePlaceId ?? `ks-${record.id}`;
  const freeMapsUrl = buildFreeGoogleMapsSearchUrl(record.name, record.cityId);
  const location =
    record.latitude != null && record.longitude != null
      ? { latitude: record.latitude, longitude: record.longitude }
      : undefined;

  const calculatedOpenNow = determineOpenNowFromHours(record.openingHoursText);

  return {
    placeId,
    googleData: {
      placeId,
      name: record.name,
      formattedAddress: record.address,
      shortAddress: record.areaName
        ? `${record.areaName}, ${record.cityId === 'rawalpindi' ? 'Rawalpindi' : 'Islamabad'}`
        : record.address,
      cityId: record.cityId,
      neighbourhood: record.areaName,
      primaryCategory:
        record.primaryCategory ?? (record.cuisines.join(', ') || 'Restaurant'),
      regularOpeningHoursText: record.openingHoursText,
      openNow: calculatedOpenNow,
      nationalPhoneNumber: record.phoneNumber,
      websiteUri: record.officialWebsite,
      location,
      googleMapsUri: freeMapsUrl,
      googleMapsDirectionsUri: location
        ? `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
        : undefined,
    },
    khanaSceneData: record,
    isFixtureData: false,
  };
}

/**
 * Deduplicates and merges Google Places summaries with KhanaScene-owned records
 * by matching `google_place_id` or normalized name + city.
 */
export function mergeAndDeduplicateDiscoveryItems(
  primaryItems: RestaurantDiscoveryItem[],
  secondaryItems: RestaurantDiscoveryItem[]
): RestaurantDiscoveryItem[] {
  const mapByPlaceId = new Map<string, RestaurantDiscoveryItem>();
  const seenNormalizedNames = new Set<string>();

  for (const item of primaryItems) {
    mapByPlaceId.set(item.placeId, item);
    const normKey = `${(item.googleData.cityId ?? '').toLowerCase()}::${item.googleData.name
      .trim()
      .toLowerCase()}`;
    seenNormalizedNames.add(normKey);
  }

  for (const candidate of secondaryItems) {
    const existingById = mapByPlaceId.get(candidate.placeId);
    if (existingById) {
      mapByPlaceId.set(candidate.placeId, {
        ...existingById,
        googleData: {
          ...existingById.googleData,
          ...candidate.googleData,
        },
        khanaSceneData: existingById.khanaSceneData ?? candidate.khanaSceneData,
      });
      continue;
    }

    const normKey = `${(
      candidate.googleData.cityId ?? ''
    ).toLowerCase()}::${candidate.googleData.name.trim().toLowerCase()}`;
    if (seenNormalizedNames.has(normKey)) {
      continue;
    }

    mapByPlaceId.set(candidate.placeId, candidate);
    seenNormalizedNames.add(normKey);
  }

  return Array.from(mapByPlaceId.values());
}

export function filterAndSortRestaurants(
  items: RestaurantDiscoveryItem[],
  filters: SearchFilters,
  userCoordinates?: { latitude: number; longitude: number } | null
): RestaurantDiscoveryItem[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  const filtered = items.filter((item) => {
    const city = item.googleData.cityId ?? item.khanaSceneData?.cityId;
    if (filters.cityId && city && city !== filters.cityId) {
      return false;
    }

    if (filters.areaId && item.khanaSceneData?.areaId !== filters.areaId) {
      return false;
    }

    if (filters.cuisineSlug) {
      const cuisines = item.khanaSceneData?.cuisines ?? [];
      const catMatch = item.googleData.primaryCategory
        ?.toLowerCase()
        .includes(filters.cuisineSlug.toLowerCase());
      if (!cuisines.includes(filters.cuisineSlug) && !catMatch) {
        return false;
      }
    }

    if (filters.minRating != null) {
      const effectiveRating =
        item.googleData.googleRating ?? item.khanaSceneData?.khanaSceneRatingAvg ?? 0;
      if (effectiveRating < filters.minRating) {
        return false;
      }
    }

    if (filters.minReviewCount != null) {
      const effectiveCount =
        item.googleData.googleReviewCount ?? item.khanaSceneData?.khanaSceneReviewCount ?? 0;
      if (effectiveCount < filters.minReviewCount) {
        return false;
      }
    }

    if (filters.openNowOnly) {
      if (item.googleData.openNow !== true) {
        return false;
      }
    }

    if (filters.budgetOnly) {
      const isGoogleInexpensive = item.googleData.priceLevel === 'PRICE_LEVEL_INEXPENSIVE';
      const isPkrBudget =
        item.khanaSceneData?.priceMaxPkr != null && item.khanaSceneData.priceMaxPkr <= 1500;
      if (!isGoogleInexpensive && !isPkrBudget) {
        return false;
      }
    }

    if (filters.familyFriendlyOnly) {
      if (item.khanaSceneData?.isFamilyFriendly !== true) {
        return false;
      }
    }

    if (normalizedQuery.length > 0) {
      const searchableChunks = [
        item.googleData.name,
        item.googleData.primaryCategory,
        item.googleData.neighbourhood,
        item.googleData.formattedAddress,
        ...(item.khanaSceneData?.cuisines ?? []),
        ...(item.khanaSceneData?.menus?.flatMap((m) => m.items.map((i) => i.name)) ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const tokens = normalizedQuery
        .split(/\s+/)
        .filter(
          (t) =>
            ![
              'in',
              'near',
              'me',
              'under',
              'rs',
              'restaurants',
              'restaurant',
              'food',
              'islamabad',
              'rawalpindi',
            ].includes(t)
        );

      if (tokens.length > 0) {
        const matchesAnyToken = tokens.some((token) => searchableChunks.includes(token));
        if (!matchesAnyToken) {
          return false;
        }
      }
    }

    return true;
  });

  return sortRestaurants(filtered, filters.sortBy, userCoordinates);
}

export function sortRestaurants(
  items: RestaurantDiscoveryItem[],
  sortBy: SortOption,
  userCoordinates?: { latitude: number; longitude: number } | null
): RestaurantDiscoveryItem[] {
  const copy = [...items];

  switch (sortBy) {
    case 'highest_rating':
      return copy.sort(
        (a, b) =>
          (b.googleData.googleRating ?? b.khanaSceneData?.khanaSceneRatingAvg ?? -1) -
          (a.googleData.googleRating ?? a.khanaSceneData?.khanaSceneRatingAvg ?? -1)
      );
    case 'most_reviewed':
      return copy.sort(
        (a, b) =>
          (b.googleData.googleReviewCount ?? b.khanaSceneData?.khanaSceneReviewCount ?? -1) -
          (a.googleData.googleReviewCount ?? a.khanaSceneData?.khanaSceneReviewCount ?? -1)
      );
    case 'lowest_price':
      return copy.sort((a, b) => {
        const priceA = a.khanaSceneData?.priceMinPkr ?? Number.MAX_SAFE_INTEGER;
        const priceB = b.khanaSceneData?.priceMinPkr ?? Number.MAX_SAFE_INTEGER;
        return priceA - priceB;
      });
    case 'nearest':
      if (!userCoordinates) {
        return copy;
      }
      return copy.sort((a, b) => {
        const locA = a.googleData.location;
        const locB = b.googleData.location;
        if (!locA) return 1;
        if (!locB) return -1;
        const distA = calculateHaversineDistanceKm(
          userCoordinates.latitude,
          userCoordinates.longitude,
          locA.latitude,
          locA.longitude
        );
        const distB = calculateHaversineDistanceKm(
          userCoordinates.latitude,
          userCoordinates.longitude,
          locB.latitude,
          locB.longitude
        );
        return distA - distB;
      });
    case 'relevance':
    default:
      return copy;
  }
}

class RestaurantRepository {
  private async getBaseDatasetForCity(cityId: CitySlug): Promise<RestaurantDiscoveryItem[]> {
    if (APP_CONFIG.dataMode === 'mock') {
      return DEV_RESTAURANT_FIXTURES.filter(
        (item) => (item.googleData.cityId ?? item.khanaSceneData?.cityId) === cityId
      );
    }

    // Layer 1 (Live Mode): Query Supabase PostgreSQL first ($0 cost, zero background Google calls)
    const supabaseRecords = await supabaseMetadataRepository.getVerifiedRecordsByCity(cityId);
    return supabaseRecords.map(mapKhanaSceneRecordToDiscoveryItem);
  }

  /**
   * Layer 1: Home screen sections NEVER trigger background Google Places searches.
   * Uses Supabase records in live mode, or clearly marked fixtures in mock mode.
   */
  async getExploreSections(cityId: CitySlug): Promise<{
    khanaScenePicks: RestaurantDiscoveryItem[];
    nearbyOrCityPlaces: RestaurantDiscoveryItem[];
    budgetFriendly: RestaurantDiscoveryItem[];
    isMockMode: boolean;
  }> {
    const allForCity = await this.getBaseDatasetForCity(cityId);

    return {
      khanaScenePicks: allForCity.filter((i) => i.khanaSceneData?.isKhanaScenePick === true),
      nearbyOrCityPlaces: allForCity,
      budgetFriendly: allForCity.filter(
        (i) =>
          i.googleData.priceLevel === 'PRICE_LEVEL_INEXPENSIVE' ||
          (i.khanaSceneData?.priceMaxPkr != null && i.khanaSceneData.priceMaxPkr <= 1500)
      ),
      isMockMode: APP_CONFIG.dataMode === 'mock',
    };
  }

  /**
   * Layer 1 + Layer 2 Search:
   * 1. Queries local/Supabase records first ($0 cost).
   * 2. If in `live` mode and either `includeLiveGooglePlaces` is requested or Supabase has 0 matches
   *    for a non-empty query, calls the hard-capped `places-proxy` Edge Function.
   */
  async searchRestaurants(
    filters: SearchFilters,
    userCoordinates?: { latitude: number; longitude: number } | null,
    options?: { includeLiveGooglePlaces?: boolean }
  ): Promise<{
    items: RestaurantDiscoveryItem[];
    quotaPaused: boolean;
    quotaMessage?: string;
  }> {
    const base = await this.getBaseDatasetForCity(filters.cityId);
    const localMatches = filterAndSortRestaurants(base, filters, userCoordinates);

    if (APP_CONFIG.dataMode === 'mock') {
      return {
        items: localMatches,
        quotaPaused: false,
      };
    }

    const shouldCallGoogle =
      Boolean(options?.includeLiveGooglePlaces) ||
      (localMatches.length === 0 && filters.query.trim().length >= 2);

    if (!shouldCallGoogle) {
      return {
        items: localMatches,
        quotaPaused: false,
      };
    }

    try {
      const queryText =
        filters.query.trim() ||
        filters.cuisineSlug ||
        `Restaurants in ${filters.cityId === 'rawalpindi' ? 'Rawalpindi' : 'Islamabad'}`;

      const googleRes = await googlePlacesService.textSearch({
        textQuery: queryText,
        cityId: filters.cityId,
        openNow: filters.openNowOnly,
      });

      const googleItems: RestaurantDiscoveryItem[] = googleRes.places.map((g) => ({
        placeId: g.placeId,
        googleData: g,
        isFixtureData: false,
      }));

      const merged = mergeAndDeduplicateDiscoveryItems(localMatches, googleItems);
      return {
        items: filterAndSortRestaurants(merged, filters, userCoordinates),
        quotaPaused: googleRes.quotaPaused,
        quotaMessage: googleRes.message,
      };
    } catch {
      return {
        items: localMatches,
        quotaPaused: false,
      };
    }
  }

  async getRestaurantByPlaceId(placeId: string): Promise<RestaurantDiscoveryItem | null> {
    if (APP_CONFIG.dataMode === 'mock') {
      const found = DEV_RESTAURANT_FIXTURES.find(
        (item) =>
          item.placeId === placeId ||
          item.khanaSceneData?.googlePlaceId === placeId ||
          (placeId === 'dev-place-isb-butt-karahi-f8' &&
            item.placeId === 'dev-place-isb-chattah-karahi') ||
          (placeId === 'dev-place-rwp-savour-saddar' &&
            item.placeId === 'dev-place-rwp-savour-foods') ||
          (placeId === 'dev-place-rwp-habibi-bahria' &&
            item.placeId === 'dev-place-rwp-bahria-grill')
      );
      if (found) {
        return {
          ...found,
          placeId,
          googleData: { ...found.googleData, placeId },
        };
      }
      return null;
    }

    // Check Supabase records first ($0 cost)
    const isbRecords = await supabaseMetadataRepository.getVerifiedRecordsByCity('islamabad');
    const rwpRecords = await supabaseMetadataRepository.getVerifiedRecordsByCity('rawalpindi');
    const allSupabase = [...isbRecords, ...rwpRecords];
    const matchedRecord = allSupabase.find(
      (r) => r.googlePlaceId === placeId || `ks-${r.id}` === placeId
    );

    // If it's a Google Place ID, fetch fresh details through the hard-capped Edge Function
    if (!placeId.startsWith('ks-')) {
      try {
        const detailRes = await googlePlacesService.getPlaceDetails(
          placeId,
          matchedRecord?.cityId
        );
        if (detailRes.place) {
          return {
            placeId,
            googleData: detailRes.place,
            khanaSceneData: matchedRecord,
            isFixtureData: false,
          };
        }
      } catch {
        // Fall through to Supabase record if offline or quota paused
      }
    }

    if (matchedRecord) {
      return mapKhanaSceneRecordToDiscoveryItem(matchedRecord);
    }

    return null;
  }

  async getRestaurantsByPlaceIds(placeIds: string[]): Promise<RestaurantDiscoveryItem[]> {
    if (placeIds.length === 0) return [];
    const results = await Promise.all(
      placeIds.map((id) => this.getRestaurantByPlaceId(id))
    );
    return results.filter((item): item is RestaurantDiscoveryItem => item != null);
  }
}

export const restaurantRepository = new RestaurantRepository();
