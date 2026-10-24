import { APP_CONFIG } from '@/config';
import { DEV_RESTAURANT_FIXTURES } from '@/services/google-places/devFixtures';
import {
  CitySlug,
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
      if ((item.googleData.googleRating ?? 0) < filters.minRating) {
        return false;
      }
    }

    if (filters.minReviewCount != null) {
      if ((item.googleData.googleReviewCount ?? 0) < filters.minReviewCount) {
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

      // Match tokens (ignoring common stop words like "in", "islamabad", "rawalpindi", "restaurants")
      const tokens = normalizedQuery
        .split(/\s+/)
        .filter(
          (t) =>
            !['in', 'near', 'me', 'under', 'rs', 'restaurants', 'restaurant', 'food', 'islamabad', 'rawalpindi'].includes(
              t
            )
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
        (a, b) => (b.googleData.googleRating ?? -1) - (a.googleData.googleRating ?? -1)
      );
    case 'most_reviewed':
      return copy.sort(
        (a, b) => (b.googleData.googleReviewCount ?? -1) - (a.googleData.googleReviewCount ?? -1)
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
  private getBaseDataset(): RestaurantDiscoveryItem[] {
    if (APP_CONFIG.dataMode === 'mock') {
      return DEV_RESTAURANT_FIXTURES;
    }
    // Live mode will query Supabase Edge Function in Phase 4.
    // Never return fake fixtures when live mode is configured.
    return [];
  }

  async getExploreSections(cityId: CitySlug): Promise<{
    khanaScenePicks: RestaurantDiscoveryItem[];
    nearbyOrCityPlaces: RestaurantDiscoveryItem[];
    budgetFriendly: RestaurantDiscoveryItem[];
    isMockMode: boolean;
  }> {
    const allForCity = this.getBaseDataset().filter(
      (item) => (item.googleData.cityId ?? item.khanaSceneData?.cityId) === cityId
    );

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

  async searchRestaurants(
    filters: SearchFilters,
    userCoordinates?: { latitude: number; longitude: number } | null
  ): Promise<RestaurantDiscoveryItem[]> {
    const base = this.getBaseDataset();
    return filterAndSortRestaurants(base, filters, userCoordinates);
  }

  async getRestaurantByPlaceId(placeId: string): Promise<RestaurantDiscoveryItem | null> {
    const found = this.getBaseDataset().find((item) => item.placeId === placeId);
    return found ?? null;
  }

  async getRestaurantsByPlaceIds(placeIds: string[]): Promise<RestaurantDiscoveryItem[]> {
    if (placeIds.length === 0) return [];
    const base = this.getBaseDataset();
    return placeIds
      .map((id) => base.find((item) => item.placeId === id))
      .filter((item): item is RestaurantDiscoveryItem => item != null);
  }
}

export const restaurantRepository = new RestaurantRepository();
