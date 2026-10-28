import { DEV_RESTAURANT_FIXTURES } from '@/services/google-places/devFixtures';
import { filterAndSortRestaurants } from '@/repositories/restaurantRepository';
import { SearchFilters } from '@/types/restaurant';

describe('Bank Card Deals & Discounts Filtering', () => {
  const baseFilters: SearchFilters = {
    query: '',
    cityId: 'islamabad',
    areaId: null,
    cuisineSlug: null,
    minRating: null,
    minReviewCount: null,
    budgetOnly: false,
    openNowOnly: false,
    familyFriendlyOnly: false,
    nearMeOnly: false,
    sortBy: 'relevance',
  };

  it('filters restaurants that have active card deals', () => {
    const dealsOnlyFilters: SearchFilters = {
      ...baseFilters,
      hasCardDealsOnly: true,
    };

    const results = filterAndSortRestaurants(DEV_RESTAURANT_FIXTURES, dealsOnlyFilters);
    expect(results.length).toBeGreaterThan(0);

    // Every returned restaurant must have at least one card deal
    for (const item of results) {
      expect(item.khanaSceneData?.cardDeals?.length).toBeGreaterThan(0);
    }
  });

  it('filters restaurants by specific bank code (e.g. alfalah)', () => {
    const alfalahFilters: SearchFilters = {
      ...baseFilters,
      hasCardDealsOnly: true,
      cardDealBank: 'alfalah',
    };

    const results = filterAndSortRestaurants(DEV_RESTAURANT_FIXTURES, alfalahFilters);
    expect(results.length).toBeGreaterThan(0);

    for (const item of results) {
      const hasAlfalah = item.khanaSceneData?.cardDeals?.some(
        (deal) => deal.bankCode === 'alfalah'
      );
      expect(hasAlfalah).toBe(true);
    }
  });

  it('filters restaurants by nayapay discount', () => {
    const nayapayFilters: SearchFilters = {
      ...baseFilters,
      hasCardDealsOnly: true,
      cardDealBank: 'nayapay',
    };

    const results = filterAndSortRestaurants(DEV_RESTAURANT_FIXTURES, nayapayFilters);
    expect(results.length).toBeGreaterThan(0);

    for (const item of results) {
      const hasNayapay = item.khanaSceneData?.cardDeals?.some(
        (deal) => deal.bankCode === 'nayapay'
      );
      expect(hasNayapay).toBe(true);
    }
  });
});
