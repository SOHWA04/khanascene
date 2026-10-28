import { DEV_RESTAURANT_FIXTURES } from '@/services/google-places/devFixtures';
import { filterAndSortRestaurants } from '@/repositories/restaurantRepository';
import { SearchFilters } from '@/types/restaurant';

describe('Parking & Signature Hero Dishes Filtering', () => {
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

  it('filters restaurants that have verified valet parking', () => {
    const valetFilters: SearchFilters = {
      ...baseFilters,
      valetOnly: true,
    };

    const results = filterAndSortRestaurants(DEV_RESTAURANT_FIXTURES, valetFilters);
    expect(results.length).toBeGreaterThan(0);

    for (const item of results) {
      expect(item.khanaSceneData?.hasValet).toBe(true);
    }
  });

  it('finds restaurants by searching hero dish keywords (e.g. Rosh, Burrata)', () => {
    const roshFilters: SearchFilters = {
      ...baseFilters,
      query: 'Rosh',
    };

    const results = filterAndSortRestaurants(DEV_RESTAURANT_FIXTURES, roshFilters);
    expect(results.length).toBeGreaterThan(0);

    const hasKabul = results.some((item) =>
      item.khanaSceneData?.heroDishes?.some((dish) => dish.toLowerCase().includes('rosh'))
    );
    expect(hasKabul).toBe(true);
  });
});
