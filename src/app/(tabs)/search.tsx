import React, { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { CitySelector } from '@/components/CitySelector';
import { ComparisonTrayBar } from '@/components/ComparisonTrayBar';
import { GoogleAttributionBadge } from '@/components/GoogleAttributionBadge';
import { RestaurantCard } from '@/components/RestaurantCard';
import {
  EmptyStateBlock,
  ErrorStateBlock,
  LoadingStateBlock,
} from '@/components/StateFeedbackBlocks';
import { CUISINE_CATEGORIES, INITIAL_CITIES } from '@/config';
import {
  calculateHaversineDistanceKm,
  restaurantRepository,
} from '@/repositories/restaurantRepository';
import { buildFreeGoogleMapsSearchUrl } from '@/services/google-places/placesService';
import { usePreferencesStore } from '@/stores/usePreferencesStore';
import { SearchFilters, SortOption } from '@/types/restaurant';
import { requestOnDemandUserLocation } from '@/utils/location';
import { BrandColors, Radii, Spacing, Typography } from '@/theme';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'highest_rating', label: 'Highest Rating' },
  { id: 'most_reviewed', label: 'Most Reviewed' },
  { id: 'nearest', label: 'Nearest' },
  { id: 'lowest_price', label: 'Lowest Price (PKR)' },
];

export default function SearchScreen() {
  const params = useLocalSearchParams<{
    q?: string;
    filter?: string;
    cuisine?: string;
    areaId?: string;
  }>();

  const {
    selectedCity,
    selectedAreaId,
    setArea,
    userCoordinates,
  } = usePreferencesStore();
  const activeCity = INITIAL_CITIES[selectedCity];

  const initialFilterCuisine =
    params.cuisine ??
    (params.filter === 'pakistani'
      ? 'pakistani'
      : params.filter === 'bbq'
        ? 'bbq'
        : params.filter === 'burgers'
          ? 'burgers'
          : params.filter === 'cafes'
            ? 'cafes'
            : null);

  const [rawQuery, setRawQuery] = useState(params.q ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(params.q ?? '');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(
    initialFilterCuisine
  );
  const [minRating, setMinRating] = useState<number | null>(
    params.filter === 'rating-4' ? 4.0 : null
  );
  const [minReviewCount, setMinReviewCount] = useState<number | null>(null);
  const [openNowOnly, setOpenNowOnly] = useState(params.filter === 'open-now');
  const [budgetOnly, setBudgetOnly] = useState(params.filter === 'budget');
  const [familyFriendlyOnly, setFamilyFriendlyOnly] = useState(
    params.filter === 'family'
  );
  const [hasCardDealsOnly, setHasCardDealsOnly] = useState(
    params.filter === 'card-deals'
  );
  const [valetOnly, setValetOnly] = useState(params.filter === 'valet');
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>(
    params.filter === 'near-me' ? 'nearest' : 'relevance'
  );
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  const [prevParamsKey, setPrevParamsKey] = useState(
    `${params.q ?? ''}|${params.filter ?? ''}|${params.cuisine ?? ''}`
  );
  const currentParamsKey = `${params.q ?? ''}|${params.filter ?? ''}|${params.cuisine ?? ''}`;

  if (currentParamsKey !== prevParamsKey) {
    setPrevParamsKey(currentParamsKey);
    if (params.q !== undefined) {
      setRawQuery(params.q);
      setDebouncedQuery(params.q);
    }
    if (params.cuisine !== undefined) {
      setSelectedCuisine(params.cuisine);
    }
    if (params.filter) {
      if (params.filter === 'open-now') setOpenNowOnly(true);
      if (params.filter === 'rating-4') setMinRating(4.0);
      if (params.filter === 'budget') setBudgetOnly(true);
      if (params.filter === 'family') setFamilyFriendlyOnly(true);
      if (params.filter === 'pakistani') setSelectedCuisine('pakistani');
      if (params.filter === 'bbq') setSelectedCuisine('bbq');
      if (params.filter === 'burgers') setSelectedCuisine('burgers');
      if (params.filter === 'cafes') setSelectedCuisine('cafes');
      if (params.filter === 'card-deals') setHasCardDealsOnly(true);
      if (params.filter === 'valet') setValetOnly(true);
      if (params.filter === 'near-me') setSortBy('nearest');
    }
  }

  useEffect(() => {
    if (params.areaId !== undefined) {
      setArea(params.areaId);
    }
  }, [params.areaId, setArea]);

  // Debounce typing (350ms) so keystrokes never fire rapid API requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(rawQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [rawQuery]);

  const filters: SearchFilters = useMemo(
    () => ({
      query: debouncedQuery,
      cityId: selectedCity,
      areaId: selectedAreaId,
      cuisineSlug: selectedCuisine,
      minRating,
      minReviewCount,
      budgetOnly,
      openNowOnly,
      familyFriendlyOnly,
      valetOnly,
      hasCardDealsOnly,
      cardDealBank: selectedBank !== 'all' ? selectedBank : null,
      nearMeOnly: sortBy === 'nearest',
      sortBy,
    }),
    [
      debouncedQuery,
      selectedCity,
      selectedAreaId,
      selectedCuisine,
      minRating,
      minReviewCount,
      budgetOnly,
      openNowOnly,
      familyFriendlyOnly,
      valetOnly,
      hasCardDealsOnly,
      selectedBank,
      sortBy,
    ]
  );

  const {
    data: searchData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['search-restaurants', filters, userCoordinates],
    queryFn: () => restaurantRepository.searchRestaurants(filters, userCoordinates),
  });

  const results = searchData?.items ?? [];
  const quotaPaused = searchData?.quotaPaused ?? false;
  const quotaMessage = searchData?.quotaMessage;

  const handleSortSelection = async (option: SortOption) => {
    if (option === 'nearest' && !userCoordinates) {
      const res = await requestOnDemandUserLocation();
      if (!res.granted) {
        setLocationMessage(
          res.errorMessage ?? 'Location access is needed to sort by distance.'
        );
        return;
      }
      setLocationMessage(null);
    }
    setSortBy(option);
  };

  const resetAllFilters = () => {
    setRawQuery('');
    setDebouncedQuery('');
    setArea(null);
    setSelectedCuisine(null);
    setMinRating(null);
    setMinReviewCount(null);
    setOpenNowOnly(false);
    setBudgetOnly(false);
    setFamilyFriendlyOnly(false);
    setValetOnly(false);
    setHasCardDealsOnly(false);
    setSelectedBank('all');
    setSortBy('relevance');
    setLocationMessage(null);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Header & City Switcher */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Search & Filter</Text>
          <CitySelector />
        </View>

        {/* Debounced Search Input */}
        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={20} color={BrandColors.primaryGreen} />
          <TextInput
            value={rawQuery}
            onChangeText={setRawQuery}
            placeholder={`Search restaurants, dishes or areas in ${activeCity.name}`}
            placeholderTextColor={BrandColors.mutedGrey}
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Search restaurants, dishes or cuisines"
          />
          {rawQuery.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search query"
              onPress={() => {
                setRawQuery('');
                setDebouncedQuery('');
              }}>
              <Ionicons name="close-circle" size={20} color={BrandColors.mutedGrey} />
            </Pressable>
          ) : null}
        </View>

        {/* Area / Neighbourhood Filter */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupLabel}>Neighbourhood in {activeCity.name}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}>
            <Pressable
              onPress={() => setArea(null)}
              style={[styles.chip, selectedAreaId === null && styles.chipActive]}>
              <Text
                style={[
                  styles.chipText,
                  selectedAreaId === null && styles.chipTextActive,
                ]}>
                All Areas
              </Text>
            </Pressable>
            {activeCity.areas.map((area) => {
              const active = selectedAreaId === area.id;
              return (
                <Pressable
                  key={area.id}
                  onPress={() => setArea(active ? null : area.id)}
                  style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {area.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Cuisine Filter */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupLabel}>Cuisine</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}>
            <Pressable
              onPress={() => setSelectedCuisine(null)}
              style={[styles.chip, selectedCuisine === null && styles.chipActive]}>
              <Text
                style={[
                  styles.chipText,
                  selectedCuisine === null && styles.chipTextActive,
                ]}>
                All Cuisines
              </Text>
            </Pressable>
            {CUISINE_CATEGORIES.map((cuisine) => {
              const active = selectedCuisine === cuisine.slug;
              return (
                <Pressable
                  key={cuisine.id}
                  onPress={() => setSelectedCuisine(active ? null : cuisine.slug)}
                  style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {cuisine.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Toggle Filters (Open Now, Rating, Review Count, Budget, Family) */}
        <View style={styles.filterGroup}>
          <View style={styles.rowBetween}>
            <Text style={styles.filterGroupLabel}>Filters</Text>
            <Pressable onPress={resetAllFilters}>
              <Text style={styles.resetLink}>Reset all</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}>
            <Pressable
              onPress={() => setOpenNowOnly((v) => !v)}
              style={[styles.chip, openNowOnly && styles.chipActive]}>
              <Text style={[styles.chipText, openNowOnly && styles.chipTextActive]}>
                Open Now
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMinRating((r) => (r === 4.0 ? null : 4.0))}
              style={[styles.chip, minRating === 4.0 && styles.chipActive]}>
              <Text style={[styles.chipText, minRating === 4.0 && styles.chipTextActive]}>
                Google Rating 4.0+
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMinReviewCount((c) => (c === 2000 ? null : 2000))}
              style={[styles.chip, minReviewCount === 2000 && styles.chipActive]}>
              <Text
                style={[
                  styles.chipText,
                  minReviewCount === 2000 && styles.chipTextActive,
                ]}>
                2,000+ Google Reviews
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setBudgetOnly((v) => !v)}
              style={[styles.chip, budgetOnly && styles.chipActive]}>
              <Text style={[styles.chipText, budgetOnly && styles.chipTextActive]}>
                Budget Friendly
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setFamilyFriendlyOnly((v) => !v)}
              style={[styles.chip, familyFriendlyOnly && styles.chipActive]}>
              <Text
                style={[
                  styles.chipText,
                  familyFriendlyOnly && styles.chipTextActive,
                ]}>
                Family Friendly (Verified)
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setValetOnly((v) => !v)}
              style={[styles.chip, valetOnly && styles.chipActive]}>
              <Ionicons
                name="car-outline"
                size={13}
                color={valetOnly ? BrandColors.white : BrandColors.charcoal}
              />
              <Text style={[styles.chipText, valetOnly && styles.chipTextActive]}>
                Valet Parking
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setHasCardDealsOnly((v) => !v)}
              style={[styles.chip, hasCardDealsOnly && styles.chipDealActive]}>
              <Ionicons
                name="card-outline"
                size={13}
                color={hasCardDealsOnly ? BrandColors.white : '#B45309'}
              />
              <Text
                style={[
                  styles.chipText,
                  hasCardDealsOnly && styles.chipTextActive,
                ]}>
                Bank Discounts
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Bank Selection Filter */}
        {hasCardDealsOnly ? (
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupLabel}>Select Your Bank</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}>
              {[
                { id: 'all', label: 'All Banks' },
                { id: 'alfalah', label: 'Bank Alfalah' },
                { id: 'meezan', label: 'Meezan Bank' },
                { id: 'hbl', label: 'HBL' },
                { id: 'nayapay', label: 'Nayapay' },
                { id: 'scb', label: 'Standard Chartered' },
                { id: 'ubl', label: 'UBL' },
              ].map((bank) => {
                const active = selectedBank === bank.id;
                return (
                  <Pressable
                    key={bank.id}
                    onPress={() => setSelectedBank(bank.id)}
                    style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {bank.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* Sort Options */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupLabel}>Sort By</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}>
            {SORT_OPTIONS.map((opt) => {
              const active = sortBy === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => handleSortSelection(opt.id)}
                  style={[styles.chip, active && styles.chipSortActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {locationMessage ? (
          <View style={styles.locationWarning}>
            <Ionicons name="information-circle-outline" size={16} color={BrandColors.warningAmber} />
            <Text style={styles.locationWarningText}>{locationMessage}</Text>
          </View>
        ) : null}

        {quotaPaused && quotaMessage ? (
          <View style={styles.locationWarning}>
            <Ionicons name="shield-checkmark-outline" size={16} color={BrandColors.deepForestGreen} />
            <Text style={styles.locationWarningText}>{quotaMessage}</Text>
          </View>
        ) : null}

        <ComparisonTrayBar />

        {/* Results Count & Free Google Maps Deep Link Fallback */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {results.length} {results.length === 1 ? 'restaurant' : 'restaurants'} found in{' '}
            {activeCity.name}
          </Text>
          <Pressable
            onPress={() =>
              Linking.openURL(
                buildFreeGoogleMapsSearchUrl(
                  rawQuery || selectedCuisine || 'Restaurants',
                  selectedCity
                )
              )
            }>
            <Text style={styles.resetLink}>Open query in Google Maps (Free)</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <LoadingStateBlock label="Searching restaurants..." />
        ) : isError ? (
          <ErrorStateBlock
            message="Search request failed. Please verify your network connection and try again."
            onRetry={() => refetch()}
          />
        ) : results.length === 0 ? (
          <EmptyStateBlock
            title="No matching restaurants found"
            message="Try broadening your search terms or clearing active filters."
            actionLabel="Reset Filters"
            onAction={resetAllFilters}
          />
        ) : (
          <View style={styles.resultsList}>
            {results.map((item) => {
              const distanceKm =
                userCoordinates && item.googleData.location
                  ? calculateHaversineDistanceKm(
                      userCoordinates.latitude,
                      userCoordinates.longitude,
                      item.googleData.location.latitude,
                      item.googleData.location.longitude
                    )
                  : null;
              return (
                <RestaurantCard
                  key={item.placeId}
                  item={item}
                  distanceKm={distanceKm}
                />
              );
            })}
          </View>
        )}

        <GoogleAttributionBadge notice="Google ratings and KhanaScene user ratings are never combined into a single synthetic number." />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BrandColors.warmCream,
  },
  container: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: BrandColors.deepForestGreen,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: BrandColors.white,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderColor: BrandColors.primaryGreen,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: BrandColors.charcoal,
    paddingVertical: 4,
  },
  filterGroup: {
    gap: 6,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterGroupLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.mutedGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  resetLink: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.primaryGreen,
  },
  chipRow: {
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.pill,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  chipActive: {
    backgroundColor: BrandColors.primaryGreen,
    borderColor: BrandColors.primaryGreen,
  },
  chipDealActive: {
    backgroundColor: '#B45309',
    borderColor: '#B45309',
  },
  chipSortActive: {
    backgroundColor: BrandColors.deepForestGreen,
    borderColor: BrandColors.deepForestGreen,
  },
  chipText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: BrandColors.charcoal,
  },
  chipTextActive: {
    color: BrandColors.white,
  },
  locationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: BrandColors.warningBackground,
    padding: Spacing.sm,
    borderRadius: Radii.md,
  },
  locationWarningText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    color: BrandColors.warningAmber,
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  resultsCount: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: BrandColors.deepForestGreen,
  },
  resultsList: {
    gap: Spacing.md,
  },
});
