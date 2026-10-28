import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseClient } from '@/services/supabase/client';
import {
  CitySlug,
  GooglePlaceReview,
  GooglePlaceSummary,
  GooglePriceLevel,
} from '@/types/restaurant';

export interface RawGooglePlacesV1Item {
  id: string;
  displayName?: { text?: string; languageCode?: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: GooglePriceLevel;
  primaryTypeDisplayName?: { text?: string };
  currentOpeningHours?: { openNow?: boolean };
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  nationalPhoneNumber?: string;
  websiteUri?: string;
  location?: { latitude: number; longitude: number };
  googleMapsUri?: string;
  reviews?: GooglePlaceReview[];
}

export interface PlacesProxyQuotaStatus {
  allowed: boolean;
  current_count: number;
  hard_limit: number;
  year_month: string;
}

/**
 * Pure mapper converting a Google Places API (New) v1 Place resource into
 * KhanaScene's `GooglePlaceSummary` without inventing any missing fields.
 */
export function mapGooglePlaceV1ToSummary(
  raw: RawGooglePlacesV1Item,
  fallbackCityId?: CitySlug
): GooglePlaceSummary {
  const addressLower = (raw.formattedAddress ?? '').toLowerCase();
  const detectedCity: CitySlug | undefined = addressLower.includes('rawalpindi')
    ? 'rawalpindi'
    : addressLower.includes('islamabad')
      ? 'islamabad'
      : fallbackCityId;

  const encodedId = encodeURIComponent(raw.id);
  const defaultMapsUri = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    raw.displayName?.text ?? raw.id
  )}&query_place_id=${encodedId}`;

  return {
    placeId: raw.id,
    name: raw.displayName?.text ?? 'Unnamed Restaurant',
    formattedAddress: raw.formattedAddress,
    shortAddress: raw.shortFormattedAddress,
    cityId: detectedCity,
    neighbourhood: raw.shortFormattedAddress?.split(',')[0]?.trim(),
    googleRating: raw.rating,
    googleReviewCount: raw.userRatingCount,
    priceLevel: raw.priceLevel,
    primaryCategory: raw.primaryTypeDisplayName?.text,
    openNow:
      raw.currentOpeningHours?.openNow !== undefined
        ? raw.currentOpeningHours.openNow
        : null,
    regularOpeningHoursText: raw.regularOpeningHours?.weekdayDescriptions,
    nationalPhoneNumber: raw.nationalPhoneNumber,
    websiteUri: raw.websiteUri,
    location: raw.location,
    googleMapsUri: raw.googleMapsUri ?? defaultMapsUri,
    googleMapsDirectionsUri: raw.location
      ? `https://www.google.com/maps/dir/?api=1&destination=${raw.location.latitude},${raw.location.longitude}`
      : undefined,
    reviews: raw.reviews,
  };
}

export const TEXT_SEARCH_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.shortFormattedAddress',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.primaryTypeDisplayName',
  'places.currentOpeningHours.openNow',
  'places.location',
  'places.googleMapsUri',
].join(',');

export const PLACE_DETAILS_FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'shortFormattedAddress',
  'rating',
  'userRatingCount',
  'priceLevel',
  'primaryTypeDisplayName',
  'currentOpeningHours.openNow',
  'regularOpeningHours.weekdayDescriptions',
  'nationalPhoneNumber',
  'websiteUri',
  'location',
  'googleMapsUri',
  'reviews',
].join(',');

/**
 * Builds a 100% free, unlimited Google Maps search URL for Layer 3 fallback
 * when the user wants to open a query directly in Google Maps without using API quota.
 */
export function buildFreeGoogleMapsSearchUrl(query: string, cityId: CitySlug): string {
  const cityName = cityId === 'rawalpindi' ? 'Rawalpindi' : 'Islamabad';
  const full = query.trim()
    ? `${query.trim()} in ${cityName}, Pakistan`
    : `Restaurants in ${cityName}, Pakistan`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(full)}`;
}

export const LOCAL_DEV_DAILY_QUOTA_LIMIT = 50;

/**
 * Checks and increments the local daily call counter in AsyncStorage.
 * Prevents laptop testing from ever exceeding 50 calls per day ($0 cost protection).
 */
export async function checkAndIncrementLocalQuota(): Promise<{ allowed: boolean; currentCount: number }> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `@khanascene_dev_places_quota_${today}`;
    const raw = await AsyncStorage.getItem(storageKey);
    const count = raw ? parseInt(raw, 10) : 0;

    if (count >= LOCAL_DEV_DAILY_QUOTA_LIMIT) {
      return { allowed: false, currentCount: count };
    }

    await AsyncStorage.setItem(storageKey, (count + 1).toString());
    return { allowed: true, currentCount: count + 1 };
  } catch {
    return { allowed: true, currentCount: 1 };
  }
}

/**
 * Returns today's local dev request count and remaining allowance.
 */
export async function getTodayLocalPlacesUsage(): Promise<{ count: number; limit: number; remaining: number }> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `@khanascene_dev_places_quota_${today}`;
    const raw = await AsyncStorage.getItem(storageKey);
    const count = raw ? parseInt(raw, 10) : 0;
    return {
      count,
      limit: LOCAL_DEV_DAILY_QUOTA_LIMIT,
      remaining: Math.max(0, LOCAL_DEV_DAILY_QUOTA_LIMIT - count),
    };
  } catch {
    return {
      count: 0,
      limit: LOCAL_DEV_DAILY_QUOTA_LIMIT,
      remaining: LOCAL_DEV_DAILY_QUOTA_LIMIT,
    };
  }
}

class GooglePlacesService {
  /**
   * Calls the controlled `places-proxy` Supabase Edge Function for Text Search (New).
   * Respects the database monthly free-tier circuit breaker (850 calls/month).
   * Falls back to EXPO_PUBLIC_GOOGLE_PLACES_DEV_KEY for local development if proxy is unconfigured.
   */
  async textSearch(params: {
    textQuery: string;
    cityId: CitySlug;
    openNow?: boolean;
  }): Promise<{
    places: GooglePlaceSummary[];
    quotaPaused: boolean;
    message?: string;
    quota?: PlacesProxyQuotaStatus;
  }> {
    const devKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_DEV_KEY;

    // 1. Try Supabase Edge Function proxy first (enforces database monthly quota & rate limit)
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.functions.invoke('places-proxy', {
          body: {
            action: 'textSearch',
            textQuery: params.textQuery,
            cityId: params.cityId,
            openNow: params.openNow,
          },
        });

        if (!error && data && !data.unconfigured) {
          const rawPlaces: RawGooglePlacesV1Item[] = Array.isArray(data.places) ? data.places : [];
          return {
            places: rawPlaces.map((item) => mapGooglePlaceV1ToSummary(item, params.cityId)),
            quotaPaused: Boolean(data.quotaPaused),
            message: data.message,
            quota: data.quota,
          };
        }
      } catch {
        // Continue to dev key fallback if available
      }
    }

    // 2. Local dev fallback if EXPO_PUBLIC_GOOGLE_PLACES_DEV_KEY is present
    if (devKey && devKey.trim().length > 0) {
      const quotaCheck = await checkAndIncrementLocalQuota();
      if (!quotaCheck.allowed) {
        return {
          places: [],
          quotaPaused: true,
          message: `$0 Cost Guardrail Active: Local daily cap of ${LOCAL_DEV_DAILY_QUOTA_LIMIT} Google Places calls reached for today. Testing paused until tomorrow.`,
        };
      }

      const cityName = params.cityId === 'rawalpindi' ? 'Rawalpindi' : 'Islamabad';
      const fullQuery = params.textQuery.toLowerCase().includes(cityName.toLowerCase())
        ? `${params.textQuery}, Pakistan`
        : `${params.textQuery} in ${cityName}, Pakistan`;

      const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': devKey.trim(),
          'X-Goog-FieldMask': TEXT_SEARCH_FIELD_MASK,
        },
        body: JSON.stringify({
          textQuery: fullQuery,
          regionCode: 'PK',
          languageCode: 'en',
          maxResultCount: 10,
          ...(params.openNow ? { openNow: true } : {}),
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Google Places API error (${response.status}): ${errText}`);
      }

      const resJson = await response.json();
      const rawPlaces: RawGooglePlacesV1Item[] = Array.isArray(resJson.places) ? resJson.places : [];
      return {
        places: rawPlaces.map((item) => mapGooglePlaceV1ToSummary(item, params.cityId)),
        quotaPaused: false,
      };
    }

    return {
      places: [],
      quotaPaused: false,
      message: 'Google Places API key is not configured.',
    };
  }

  /**
   * Calls the controlled `places-proxy` Supabase Edge Function for Place Details (New).
   * Falls back to EXPO_PUBLIC_GOOGLE_PLACES_DEV_KEY for local development if proxy is unconfigured.
   */
  async getPlaceDetails(
    placeId: string,
    fallbackCityId?: CitySlug
  ): Promise<{
    place: GooglePlaceSummary | null;
    quotaPaused: boolean;
    message?: string;
    quota?: PlacesProxyQuotaStatus;
  }> {
    const devKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_DEV_KEY;

    // 1. Try Supabase Edge Function proxy first
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.functions.invoke('places-proxy', {
          body: {
            action: 'placeDetails',
            placeId,
          },
        });

        if (!error && data && !data.unconfigured) {
          return {
            place: data.place
              ? mapGooglePlaceV1ToSummary(data.place as RawGooglePlacesV1Item, fallbackCityId)
              : null,
            quotaPaused: Boolean(data.quotaPaused),
            message: data.message,
            quota: data.quota,
          };
        }
      } catch {
        // Continue to dev key fallback if available
      }
    }

    // 2. Local dev fallback if EXPO_PUBLIC_GOOGLE_PLACES_DEV_KEY is present
    if (devKey && devKey.trim().length > 0) {
      const quotaCheck = await checkAndIncrementLocalQuota();
      if (!quotaCheck.allowed) {
        return {
          place: null,
          quotaPaused: true,
          message: `$0 Cost Guardrail Active: Local daily cap of ${LOCAL_DEV_DAILY_QUOTA_LIMIT} Google Places calls reached for today.`,
        };
      }

      const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': devKey.trim(),
          'X-Goog-FieldMask': PLACE_DETAILS_FIELD_MASK,
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Google Place Details API error (${response.status}): ${errText}`);
      }

      const rawPlace: RawGooglePlacesV1Item = await response.json();
      return {
        place: mapGooglePlaceV1ToSummary(rawPlace, fallbackCityId),
        quotaPaused: false,
      };
    }

    return {
      place: null,
      quotaPaused: false,
    };
  }
}

export const googlePlacesService = new GooglePlacesService();
