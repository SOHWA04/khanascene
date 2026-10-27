import { getSupabaseClient } from '@/services/supabase/client';
import { CitySlug, KhanaSceneRecord } from '@/types/restaurant';

interface SupabaseRestaurantRow {
  id: string;
  google_place_id: string | null;
  name: string;
  slug: string;
  city_id: CitySlug;
  area_id: string | null;
  primary_category: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  official_website: string | null;
  phone_number: string | null;
  opening_hours_text: string[] | null;
  price_min: number | null;
  price_max: number | null;
  price_verified_at: string | null;
  is_khanascene_pick: boolean;
  pick_reason: string | null;
  is_family_friendly: boolean | null;
  khanascene_rating_avg: number | null;
  khanascene_review_count: number | null;
  areas?: {
    name: string;
  } | null;
  restaurant_record_cuisines?: {
    cuisines?: { slug: string } | null;
  }[];
  restaurant_menus?: {
    id: string;
    name: string;
    source_type: 'owner_submission' | 'official_website' | 'khana_scene_verified';
    source_url: string | null;
    last_verified_at: string;
    menu_items?: {
      id: string;
      name: string;
      description: string | null;
      price: number;
      currency_code: 'PKR';
      category: string;
      is_available: boolean;
      last_verified_at: string;
    }[];
  }[];
}

/**
 * Queries KhanaScene-owned metadata, verified menus, and approved community reviews
 * from Supabase PostgreSQL under Row Level Security.
 */
export class SupabaseMetadataRepository {
  async getVerifiedRecordsByCity(cityId: CitySlug): Promise<KhanaSceneRecord[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client
      .from('restaurant_records')
      .select(
        `
        id,
        google_place_id,
        name,
        slug,
        city_id,
        area_id,
        primary_category,
        address,
        latitude,
        longitude,
        official_website,
        phone_number,
        opening_hours_text,
        price_min,
        price_max,
        price_verified_at,
        is_khanascene_pick,
        pick_reason,
        is_family_friendly,
        khanascene_rating_avg,
        khanascene_review_count,
        areas ( name ),
        restaurant_record_cuisines (
          cuisines ( slug )
        ),
        restaurant_menus (
          id,
          name,
          source_type,
          source_url,
          last_verified_at,
          menu_items (
            id,
            name,
            description,
            price,
            currency_code,
            category,
            is_available,
            last_verified_at
          )
        )
      `
      )
      .eq('city_id', cityId)
      .eq('verification_status', 'verified');

    if (error || !data) {
      return [];
    }

    return (data as unknown as SupabaseRestaurantRow[]).map((row) => ({
      id: row.id,
      googlePlaceId: row.google_place_id ?? undefined,
      name: row.name,
      slug: row.slug,
      cityId: row.city_id,
      areaId: row.area_id ?? undefined,
      areaName: row.areas?.name ?? undefined,
      primaryCategory: row.primary_category ?? undefined,
      address: row.address ?? undefined,
      latitude: row.latitude ?? undefined,
      longitude: row.longitude ?? undefined,
      officialWebsite: row.official_website ?? undefined,
      phoneNumber: row.phone_number ?? undefined,
      openingHoursText: row.opening_hours_text ?? undefined,
      cuisines:
        row.restaurant_record_cuisines
          ?.map((c) => c.cuisines?.slug)
          .filter((s): s is string => Boolean(s)) ?? [],
      priceMinPkr: row.price_min ?? undefined,
      priceMaxPkr: row.price_max ?? undefined,
      priceVerifiedAt: row.price_verified_at ?? undefined,
      isKhanaScenePick: row.is_khanascene_pick,
      pickReason: row.pick_reason ?? undefined,
      isFamilyFriendly: row.is_family_friendly ?? undefined,
      hasVerifiedMenu: (row.restaurant_menus?.length ?? 0) > 0,
      khanaSceneRatingAvg:
        row.khanascene_rating_avg != null ? Number(row.khanascene_rating_avg) : undefined,
      khanaSceneReviewCount: row.khanascene_review_count ?? undefined,
      menus:
        row.restaurant_menus?.map((menu) => ({
          id: menu.id,
          name: menu.name,
          sourceType: menu.source_type,
          sourceUrl: menu.source_url ?? undefined,
          lastVerifiedAt: menu.last_verified_at,
          items:
            menu.menu_items?.map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description ?? undefined,
              pricePkr: item.price,
              currencyCode: 'PKR' as const,
              category: item.category,
              isAvailable: item.is_available,
              lastVerifiedAt: item.last_verified_at,
            })) ?? [],
        })) ?? [],
    }));
  }
}

export const supabaseMetadataRepository = new SupabaseMetadataRepository();
