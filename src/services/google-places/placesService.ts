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

class GooglePlacesService {
  /**
   * Calls the controlled `places-proxy` Supabase Edge Function for Text Search (New).
   * Respects the database monthly free-tier circuit breaker (850 calls/month).
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
    const client = getSupabaseClient();
    if (!client) {
      return {
        places: [],
        quotaPaused: false,
        message: 'Supabase Edge Function is not configured.',
      };
    }

    const { data, error } = await client.functions.invoke('places-proxy', {
      body: {
        action: 'textSearch',
        textQuery: params.textQuery,
        cityId: params.cityId,
        openNow: params.openNow,
      },
    });

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to reach places-proxy Edge Function.');
    }

    const rawPlaces: RawGooglePlacesV1Item[] = Array.isArray(data.places) ? data.places : [];
    return {
      places: rawPlaces.map((item) => mapGooglePlaceV1ToSummary(item, params.cityId)),
      quotaPaused: Boolean(data.quotaPaused),
      message: data.message,
      quota: data.quota,
    };
  }

  /**
   * Calls the controlled `places-proxy` Supabase Edge Function for Place Details (New).
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
    const client = getSupabaseClient();
    if (!client) {
      return {
        place: null,
        quotaPaused: false,
      };
    }

    const { data, error } = await client.functions.invoke('places-proxy', {
      body: {
        action: 'placeDetails',
        placeId,
      },
    });

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to fetch Place Details.');
    }

    return {
      place: data.place
        ? mapGooglePlaceV1ToSummary(data.place as RawGooglePlacesV1Item, fallbackCityId)
        : null,
      quotaPaused: Boolean(data.quotaPaused),
      message: data.message,
      quota: data.quota,
    };
  }
}

export const googlePlacesService = new GooglePlacesService();
