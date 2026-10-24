import {
  calculateBayesianScore,
  formatGooglePriceLevel,
  formatPkrRange,
} from '@/utils/ranking';
import { useComparisonStore } from '@/stores/useComparisonStore';
import { usePreferencesStore } from '@/stores/usePreferencesStore';

describe('KhanaScene Phase 1 Foundation — Ranking & Formatting', () => {
  it('computes Bayesian-adjusted score correctly without fabricating ratings', () => {
    expect(calculateBayesianScore({ averageRating: 0, reviewCount: 0 })).toBe(0);

    // A restaurant with 1 five-star review should be tempered toward the dataset mean (3.8)
    const singleReviewScore = calculateBayesianScore({
      averageRating: 5.0,
      reviewCount: 1,
      minimumReviewsThreshold: 5,
      datasetMeanRating: 3.8,
    });
    // A restaurant with 50 4.6-star reviews should rank higher than 1 five-star review
    const establishedScore = calculateBayesianScore({
      averageRating: 4.6,
      reviewCount: 50,
      minimumReviewsThreshold: 5,
      datasetMeanRating: 3.8,
    });

    expect(singleReviewScore).toBe(4.0);
    expect(establishedScore).toBeGreaterThan(singleReviewScore);
  });

  it('formats Google price levels and PKR ranges honestly when data is missing', () => {
    expect(formatGooglePriceLevel(undefined)).toBe('Price level unavailable');
    expect(formatGooglePriceLevel('PRICE_LEVEL_INEXPENSIVE')).toContain('Budget Friendly');
    expect(formatPkrRange(undefined, undefined)).toBe('Price range unavailable');
    expect(formatPkrRange(800, 1800)).toBe('Rs 800 – Rs 1,800');
  });
});

describe('KhanaScene Phase 1 Foundation — Stores', () => {
  beforeEach(() => {
    useComparisonStore.getState().clearComparison();
    usePreferencesStore.getState().setCity('islamabad');
  });

  it('switches between Islamabad and Rawalpindi and resets area selection', () => {
    const store = usePreferencesStore.getState();
    store.setArea('isb-f7');
    expect(usePreferencesStore.getState().selectedAreaId).toBe('isb-f7');

    store.setCity('rawalpindi');
    expect(usePreferencesStore.getState().selectedCity).toBe('rawalpindi');
    expect(usePreferencesStore.getState().selectedAreaId).toBeNull();
  });

  it('enforces a maximum of 3 restaurants in the comparison store', () => {
    const store = useComparisonStore.getState();
    expect(store.toggleComparisonPlace('place-1')).toEqual({ added: true, limitReached: false });
    expect(store.toggleComparisonPlace('place-2')).toEqual({ added: true, limitReached: false });
    expect(store.toggleComparisonPlace('place-3')).toEqual({ added: true, limitReached: false });
    expect(store.toggleComparisonPlace('place-4')).toEqual({ added: false, limitReached: true });
    expect(useComparisonStore.getState().selectedPlaceIds).toHaveLength(3);
  });
});
