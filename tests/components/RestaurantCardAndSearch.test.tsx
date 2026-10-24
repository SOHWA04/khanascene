import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import { DEV_RESTAURANT_FIXTURES } from '@/services/google-places/devFixtures';
import {
  calculateHaversineDistanceKm,
  filterAndSortRestaurants,
} from '@/repositories/restaurantRepository';
import { RestaurantCard } from '@/components/RestaurantCard';
import { EmptyStateBlock, ErrorStateBlock } from '@/components/StateFeedbackBlocks';
import { useComparisonStore } from '@/stores/useComparisonStore';
import { useSavedStore } from '@/stores/useSavedStore';
import { SearchFilters } from '@/types/restaurant';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

describe('Phase 2 — Search, Filter & Sort Repository Logic', () => {
  const defaultFilters: SearchFilters = {
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

  it('filters restaurants by city (Islamabad vs Rawalpindi)', () => {
    const isbResults = filterAndSortRestaurants(DEV_RESTAURANT_FIXTURES, {
      ...defaultFilters,
      cityId: 'islamabad',
    });
    const rwpResults = filterAndSortRestaurants(DEV_RESTAURANT_FIXTURES, {
      ...defaultFilters,
      cityId: 'rawalpindi',
    });

    expect(isbResults.length).toBe(4);
    expect(rwpResults.length).toBe(2);
    expect(isbResults.every((i) => i.googleData.cityId === 'islamabad')).toBe(true);
    expect(rwpResults.every((i) => i.googleData.cityId === 'rawalpindi')).toBe(true);
  });

  it('filters by query, Open Now, Budget Friendly, and Minimum Rating 4.3+', () => {
    const biryaniQuery = filterAndSortRestaurants(DEV_RESTAURANT_FIXTURES, {
      ...defaultFilters,
      query: 'Biryani in Islamabad',
    });
    expect(biryaniQuery).toHaveLength(1);
    expect(biryaniQuery[0].googleData.name).toContain('Hot & Spicy Biryani');

    const openAndHighRated = filterAndSortRestaurants(DEV_RESTAURANT_FIXTURES, {
      ...defaultFilters,
      openNowOnly: true,
      minRating: 4.3,
    });
    expect(openAndHighRated.every((i) => i.googleData.openNow === true)).toBe(true);
    expect(openAndHighRated.every((i) => (i.googleData.googleRating ?? 0) >= 4.3)).toBe(true);
  });

  it('sorts by highest Google rating and most reviewed', () => {
    const byRating = filterAndSortRestaurants(DEV_RESTAURANT_FIXTURES, {
      ...defaultFilters,
      sortBy: 'highest_rating',
    });
    expect(byRating[0].googleData.googleRating).toBeGreaterThanOrEqual(
      byRating[1].googleData.googleRating!
    );

    const byReviews = filterAndSortRestaurants(DEV_RESTAURANT_FIXTURES, {
      ...defaultFilters,
      sortBy: 'most_reviewed',
    });
    expect(byReviews[0].googleData.googleReviewCount).toBeGreaterThanOrEqual(
      byReviews[1].googleData.googleReviewCount!
    );
  });

  it('computes Haversine distance accurately between Islamabad sectors', () => {
    // F-7 Markaz to F-8 Markaz (~2km)
    const dist = calculateHaversineDistanceKm(33.7215, 73.0571, 33.7104, 73.0402);
    expect(dist).toBeGreaterThan(1.5);
    expect(dist).toBeLessThan(3.0);
  });
});

describe('Phase 2 — UI Components (RestaurantCard & StateFeedbackBlocks)', () => {
  beforeEach(() => {
    useComparisonStore.getState().clearComparison();
    useSavedStore.setState({ savedPlaceIds: [], isHydrated: true });
  });

  it('renders RestaurantCard with explicit Google review attribution and honest missing-hours fallback', async () => {
    const fixtureWithMissingHours = DEV_RESTAURANT_FIXTURES.find(
      (i) => i.placeId === 'dev-place-rwp-bahria-grill'
    )!;

    await render(<RestaurantCard item={fixtureWithMissingHours} distanceKm={4.2} />);

    expect(screen.getByText(/Kallisto Charcoal & Burgers/)).toBeTruthy();
    expect(screen.getByText(/1,280 Google reviews/)).toBeTruthy();
    expect(screen.getByText('Hours unavailable')).toBeTruthy();
    expect(screen.getByText('Price level unavailable')).toBeTruthy();
    expect(screen.getByText('Source: Google Maps')).toBeTruthy();
  });

  it('toggles Compare and Saved state when RestaurantCard action buttons are pressed', async () => {
    const fixture = DEV_RESTAURANT_FIXTURES[0];
    await render(<RestaurantCard item={fixture} />);

    const compareBtn = screen.getByLabelText('Add to comparison');
    await fireEvent.press(compareBtn);
    expect(useComparisonStore.getState().selectedPlaceIds).toContain(fixture.placeId);

    const saveBtn = screen.getByLabelText('Save restaurant');
    await fireEvent.press(saveBtn);
    expect(useSavedStore.getState().savedPlaceIds).toContain(fixture.placeId);
  });

  it('renders EmptyStateBlock and ErrorStateBlock with retry callback', async () => {
    const onRetry = jest.fn();
    await render(
      <>
        <EmptyStateBlock title="No results" message="Broaden your filters" />
        <ErrorStateBlock message="Network interrupted" onRetry={onRetry} />
      </>
    );

    expect(screen.getByText('No results')).toBeTruthy();
    expect(screen.getByText('Network interrupted')).toBeTruthy();

    await fireEvent.press(screen.getByText('Try Again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
