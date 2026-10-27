/**
 * KhanaScene Domain & API Types
 * Clearly separates Google Places API (New) fields from KhanaScene-owned metadata.
 */

export type CitySlug = 'islamabad' | 'rawalpindi';

export interface CityConfig {
  id: CitySlug;
  name: string;
  countryCode: 'PK';
  isActive: boolean;
  center: {
    latitude: number;
    longitude: number;
  };
  areas: AreaConfig[];
}

export interface AreaConfig {
  id: string;
  cityId: CitySlug;
  name: string;
  isActive: boolean;
}

export interface CuisineCategory {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  searchQuery: string;
  isActive: boolean;
}

export type GooglePriceLevel =
  | 'PRICE_LEVEL_FREE'
  | 'PRICE_LEVEL_INEXPENSIVE'
  | 'PRICE_LEVEL_MODERATE'
  | 'PRICE_LEVEL_EXPENSIVE'
  | 'PRICE_LEVEL_VERY_EXPENSIVE'
  | 'PRICE_LEVEL_UNSPECIFIED';

export interface GoogleReviewAttribution {
  displayName: string;
  uri?: string;
  photoUri?: string;
}

export interface GooglePlaceReview {
  name: string;
  relativePublishTimeDescription: string;
  rating: number;
  text?: {
    text: string;
    languageCode?: string;
  };
  authorAttribution: GoogleReviewAttribution;
  publishTime?: string;
  googleMapsUri?: string;
}

export interface KhanaSceneMenuItem {
  id: string;
  name: string;
  description?: string;
  pricePkr: number;
  currencyCode: 'PKR';
  category: string;
  isAvailable: boolean;
  lastVerifiedAt: string;
}

export interface KhanaSceneMenu {
  id: string;
  name: string;
  sourceType: 'owner_submission' | 'official_website' | 'khana_scene_verified';
  sourceUrl?: string;
  lastVerifiedAt: string;
  items: KhanaSceneMenuItem[];
}

export interface KhanaSceneUserReview {
  id: string;
  authorDisplayName: string;
  overallRating: number;
  foodRating?: number;
  serviceRating?: number;
  ambienceRating?: number;
  valueRating?: number;
  reviewText: string;
  visitDate?: string;
  createdAt: string;
}

/**
 * Data returned from Google Places API (New) — never stored permanently in Supabase.
 */
export interface GooglePlaceSummary {
  placeId: string;
  name: string;
  formattedAddress?: string;
  shortAddress?: string;
  cityId?: CitySlug;
  neighbourhood?: string;
  googleRating?: number;
  googleReviewCount?: number;
  priceLevel?: GooglePriceLevel;
  primaryCategory?: string;
  openNow?: boolean | null;
  regularOpeningHoursText?: string[];
  nationalPhoneNumber?: string;
  websiteUri?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  googleMapsUri: string;
  googleMapsReviewsUri?: string;
  googleMapsDirectionsUri?: string;
  photoUrl?: string;
  photoAttribution?: string;
  reviews?: GooglePlaceReview[];
}

/**
 * KhanaScene-owned verified metadata stored in Supabase (or dev seed).
 */
export interface KhanaSceneRecord {
  id: string;
  googlePlaceId?: string;
  name: string;
  slug: string;
  cityId: CitySlug;
  areaId?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
  cuisines: string[];
  priceMinPkr?: number;
  priceMaxPkr?: number;
  priceVerifiedAt?: string;
  isKhanaScenePick?: boolean;
  pickReason?: string;
  isFamilyFriendly?: boolean;
  hasVerifiedMenu?: boolean;
  khanaSceneRatingAvg?: number;
  khanaSceneReviewCount?: number;
  menus?: KhanaSceneMenu[];
  khanaSceneReviews?: KhanaSceneUserReview[];
}

/**
 * Combined view model for UI cards & comparison, keeping Google vs KhanaScene fields distinct.
 */
export interface RestaurantDiscoveryItem {
  placeId: string;
  googleData: GooglePlaceSummary;
  khanaSceneData?: KhanaSceneRecord;
  isFixtureData?: boolean;
}

export type SortOption =
  | 'relevance'
  | 'highest_rating'
  | 'most_reviewed'
  | 'nearest'
  | 'lowest_price';

export interface SearchFilters {
  query: string;
  cityId: CitySlug;
  areaId: string | null;
  cuisineSlug: string | null;
  minRating: number | null;
  minReviewCount: number | null;
  budgetOnly: boolean;
  openNowOnly: boolean;
  familyFriendlyOnly: boolean;
  nearMeOnly: boolean;
  sortBy: SortOption;
}
