import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { CitySelector } from '@/components/CitySelector';
import { ComparisonTrayBar } from '@/components/ComparisonTrayBar';
import { GoogleAttributionBadge } from '@/components/GoogleAttributionBadge';
import { KhanaSceneLogo } from '@/components/KhanaSceneLogo';
import { RestaurantCard } from '@/components/RestaurantCard';
import {
  EmptyStateBlock,
  ErrorStateBlock,
  LoadingStateBlock,
} from '@/components/StateFeedbackBlocks';
import { APP_CONFIG, CUISINE_CATEGORIES, INITIAL_CITIES } from '@/config';
import {
  calculateHaversineDistanceKm,
  restaurantRepository,
} from '@/repositories/restaurantRepository';
import { usePreferencesStore } from '@/stores/usePreferencesStore';
import { requestOnDemandUserLocation } from '@/utils/location';
import { BrandColors, Radii, Spacing, Typography } from '@/theme';

const QUICK_FILTERS = [
  { id: 'near-me', label: 'Near Me', icon: 'navigate-outline' as const },
  { id: 'card-deals', label: 'Bank Discounts', icon: 'card-outline' as const },
  { id: 'open-now', label: 'Open Now', icon: 'time-outline' as const },
  { id: 'rating-4', label: 'Rating 4.0+', icon: 'star-outline' as const },
  { id: 'budget', label: 'Budget Friendly', icon: 'wallet-outline' as const },
  { id: 'family', label: 'Family Friendly', icon: 'people-outline' as const },
  { id: 'valet', label: 'Valet Parking', icon: 'car-outline' as const },
  { id: 'pakistani', label: 'Pakistani', icon: 'restaurant-outline' as const },
  { id: 'bbq', label: 'BBQ', icon: 'flame-outline' as const },
  { id: 'burgers', label: 'Burgers', icon: 'fast-food-outline' as const },
  { id: 'cafes', label: 'Cafés', icon: 'cafe-outline' as const },
];

export default function ExploreScreen() {
  const {
    selectedCity,
    selectedAreaId,
    setArea,
    locationPermissionGranted,
    userCoordinates,
  } = usePreferencesStore();
  const activeCity = INITIAL_CITIES[selectedCity];
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['explore-sections', selectedCity],
    queryFn: () => restaurantRepository.getExploreSections(selectedCity),
  });

  const handleQuickFilterPress = async (filterId: string) => {
    if (filterId === 'near-me') {
      const result = await requestOnDemandUserLocation();
      if (!result.granted && result.errorMessage) {
        setLocationNotice(result.errorMessage);
        return;
      }
      setLocationNotice(null);
      router.push({
        pathname: '/(tabs)/search',
        params: { filter: 'near-me' },
      });
      return;
    }

    router.push({
      pathname: '/(tabs)/search',
      params: { filter: filterId },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <KhanaSceneLogo size="md" showTagline />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Account and preferences"
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.profileShortcut}>
            <Ionicons name="person-circle-outline" size={28} color={BrandColors.deepForestGreen} />
          </Pressable>
        </View>

        {/* City & Neighbourhood Selector */}
        <View style={styles.locationBar}>
          <CitySelector />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.areaRow}>
            <Pressable
              onPress={() => setArea(null)}
              style={[styles.areaChip, selectedAreaId === null && styles.areaChipActive]}>
              <Text
                style={[
                  styles.areaChipText,
                  selectedAreaId === null && styles.areaChipTextActive,
                ]}>
                All {activeCity.name}
              </Text>
            </Pressable>
            {activeCity.areas.map((area) => {
              const isSelected = selectedAreaId === area.id;
              return (
                <Pressable
                  key={area.id}
                  onPress={() => {
                    setArea(isSelected ? null : area.id);
                    router.push({
                      pathname: '/(tabs)/search',
                      params: { areaId: area.id },
                    });
                  }}
                  style={[styles.areaChip, isSelected && styles.areaChipActive]}>
                  <Text
                    style={[
                      styles.areaChipText,
                      isSelected && styles.areaChipTextActive,
                    ]}>
                    {area.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {locationNotice ? (
          <View style={styles.noticeBanner}>
            <Ionicons name="information-circle-outline" size={18} color={BrandColors.warningAmber} />
            <Text style={styles.noticeText}>{locationNotice}</Text>
          </View>
        ) : null}

        {/* Primary Search Bar CTA */}
        <Pressable
          accessibilityRole="search"
          accessibilityLabel="Search restaurants, dishes or cuisines"
          onPress={() => router.push('/(tabs)/search')}
          style={styles.searchBox}>
          <Ionicons name="search" size={20} color={BrandColors.primaryGreen} />
          <Text style={styles.searchPlaceholder}>
            Search restaurants, dishes or cuisines in {activeCity.name}
          </Text>
        </Pressable>

        {/* Quick Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFilterRow}>
          {QUICK_FILTERS.map((chip) => (
            <Pressable
              key={chip.id}
              onPress={() => handleQuickFilterPress(chip.id)}
              style={styles.quickFilterChip}>
              <Ionicons name={chip.icon} size={15} color={BrandColors.deepForestGreen} />
              <Text style={styles.quickFilterText}>{chip.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <ComparisonTrayBar />

        {/* Khana Roulette Banner CTA */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Spin the Khana Roulette to decide where to eat"
          onPress={() => router.push('/roulette')}
          style={styles.rouletteBanner}>
          <View style={styles.rouletteBannerLeft}>
            <View style={styles.rouletteBadge}>
              <Text style={styles.rouletteBadgeText}>GROUP SCENE DECIDER 🎲</Text>
            </View>
            <Text style={styles.rouletteBannerTitle}>Can&apos;t agree where to eat?</Text>
            <Text style={styles.rouletteBannerSubtitle}>
              Spin the Khana Roulette to pick a spot & share to WhatsApp
            </Text>
          </View>
          <View style={styles.rouletteBannerRight}>
            <Ionicons name="dice" size={28} color={BrandColors.warmCream} />
            <Ionicons name="chevron-forward" size={18} color={BrandColors.warmCream} />
          </View>
        </Pressable>

        {/* Section 1: Explore by Cuisine */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>1. Explore by Cuisine</Text>
          <Pressable onPress={() => router.push('/cuisines')}>
            <Text style={styles.sectionLink}>See all</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cuisineRow}>
          {CUISINE_CATEGORIES.slice(0, 8).map((cuisine) => (
            <Pressable
              key={cuisine.id}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/search',
                  params: { cuisine: cuisine.slug },
                })
              }
              style={styles.cuisineCard}>
              <View style={styles.cuisineIconCircle}>
                <Ionicons name="restaurant-outline" size={22} color={BrandColors.primaryGreen} />
              </View>
              <Text style={styles.cuisineName}>{cuisine.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {isLoading ? (
          <LoadingStateBlock label={`Loading ${activeCity.name} discovery sections...`} />
        ) : isError ? (
          <ErrorStateBlock
            message="Could not load discovery sections. Please check your connection."
            onRetry={() => refetch()}
          />
        ) : (
          <>
            {/* Section 2: Restaurants Near You / In Selected City */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  2. {locationPermissionGranted ? 'Restaurants Near You' : `Restaurants in ${activeCity.name}`}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {locationPermissionGranted
                    ? 'Sorted using your device location'
                    : `Showing ${activeCity.name} listings • Tap "Near Me" above to enable location`}
                </Text>
              </View>
              <Pressable onPress={() => router.push('/(tabs)/search')}>
                <Text style={styles.sectionLink}>Search all</Text>
              </Pressable>
            </View>

            {data && data.nearbyOrCityPlaces.length > 0 ? (
              <View style={styles.cardList}>
                {data.nearbyOrCityPlaces.map((item) => {
                  const distanceKm =
                    userCoordinates && item.googleData.location
                      ? calculateHaversineDistanceKm(
                          userCoordinates.latitude,
                          userCoordinates.longitude,
                          item.googleData.location.latitude,
                          item.googleData.location.longitude
                        )
                      : null;
                  return <RestaurantCard key={item.placeId} item={item} distanceKm={distanceKm} />;
                })}
              </View>
            ) : (
              <EmptyStateBlock
                title={`No live listings loaded for ${activeCity.name}`}
                message="Connect the Google Places Edge Function in live mode or use dev fixture mode during UI testing."
              />
            )}

            {/* Section 3: Popular Searches */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>3. Popular Searches in {activeCity.name}</Text>
            </View>
            <View style={styles.popularWrap}>
              {(selectedCity === 'islamabad'
                ? [
                    'Biryani in Islamabad',
                    'Restaurants in F-7 Markaz',
                    'Cafés in F-6',
                    'BBQ in Blue Area',
                    'Karahi in F-8',
                  ]
                : [
                    'Pulao in Saddar',
                    'Restaurants in Bahria Town',
                    'Burgers in Rawalpindi',
                    'Street food in Commercial Market',
                    'Family restaurants in Rawalpindi',
                  ]
              ).map((query) => (
                <Pressable
                  key={query}
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/search',
                      params: { q: query },
                    })
                  }
                  style={styles.popularQueryPill}>
                  <Ionicons name="trending-up-outline" size={14} color={BrandColors.primaryGreen} />
                  <Text style={styles.popularQueryText}>{query}</Text>
                </Pressable>
              ))}
            </View>

            {/* Section 4: KhanaScene Picks */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>4. KhanaScene Picks</Text>
                <Text style={styles.sectionSubtitle}>
                  Curated KhanaScene-owned dataset of notable local dining spots
                </Text>
              </View>
            </View>
            {data && data.khanaScenePicks.length > 0 ? (
              <View style={styles.cardList}>
                {data.khanaScenePicks.map((item) => (
                  <RestaurantCard key={`pick-${item.placeId}`} item={item} />
                ))}
              </View>
            ) : (
              <EmptyStateBlock
                title="No KhanaScene Picks in this city yet"
                message="Curated picks are added after verification."
              />
            )}

            {/* Section 5: Bank Card Discounts */}
            {data && data.cardDealsSpots && data.cardDealsSpots.length > 0 ? (
              <>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>5. Bank Card Discounts (Up to 30% Off)</Text>
                    <Text style={styles.sectionSubtitle}>
                      Verified dining discounts on Meezan, Alfalah, HBL, Nayapay & SCB cards
                    </Text>
                  </View>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/(tabs)/search',
                        params: { filter: 'card-deals' },
                      })
                    }>
                    <Text style={styles.sectionLink}>View all</Text>
                  </Pressable>
                </View>
                <View style={styles.cardList}>
                  {data.cardDealsSpots.map((item) => (
                    <RestaurantCard key={`deal-${item.placeId}`} item={item} />
                  ))}
                </View>
              </>
            ) : null}

            {/* Section 6: Budget-Friendly Restaurants */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>6. Budget-Friendly Restaurants</Text>
                <Text style={styles.sectionSubtitle}>
                  Places with verified budget PKR pricing or Google Inexpensive level
                </Text>
              </View>
            </View>
            {data && data.budgetFriendly.length > 0 ? (
              <View style={styles.cardList}>
                {data.budgetFriendly.map((item) => (
                  <RestaurantCard key={`budget-${item.placeId}`} item={item} />
                ))}
              </View>
            ) : (
              <EmptyStateBlock
                title="No verified budget listings found"
                message="We only list budget-friendly places when verified price data is available."
              />
            )}
          </>
        )}

        <GoogleAttributionBadge
          notice={`Data mode: ${APP_CONFIG.dataMode.toUpperCase()} • Google ratings and KhanaScene metadata are strictly separated.`}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BrandColors.warmCream,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileShortcut: {
    padding: Spacing.xs,
  },
  locationBar: {
    gap: Spacing.sm,
  },
  areaRow: {
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  areaChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  areaChipActive: {
    backgroundColor: BrandColors.deepForestGreen,
    borderColor: BrandColors.deepForestGreen,
  },
  areaChipText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: BrandColors.charcoal,
  },
  areaChipTextActive: {
    color: BrandColors.white,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: BrandColors.warningBackground,
    padding: Spacing.md,
    borderRadius: Radii.md,
  },
  noticeText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    color: BrandColors.warningAmber,
    fontWeight: '600',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: BrandColors.white,
    borderWidth: 1.5,
    borderColor: BrandColors.primaryGreen,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  searchPlaceholder: {
    fontSize: Typography.sizes.sm,
    color: BrandColors.mutedGrey,
    fontWeight: '500',
    flex: 1,
  },
  quickFilterRow: {
    gap: Spacing.sm,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BrandColors.lightGreen,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
  },
  quickFilterText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: BrandColors.deepForestGreen,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: BrandColors.deepForestGreen,
  },
  sectionSubtitle: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.mutedGrey,
    marginTop: 2,
  },
  sectionLink: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: BrandColors.primaryGreen,
  },
  cuisineRow: {
    gap: Spacing.md,
  },
  cuisineCard: {
    width: 96,
    backgroundColor: BrandColors.white,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  cuisineIconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radii.pill,
    backgroundColor: BrandColors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuisineName: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: BrandColors.charcoal,
    textAlign: 'center',
  },
  cardList: {
    gap: Spacing.md,
  },
  rouletteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BrandColors.deepForestGreen,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    marginVertical: Spacing.xs,
    shadowColor: BrandColors.deepForestGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  rouletteBannerLeft: {
    flex: 1,
    gap: 3,
    paddingRight: Spacing.sm,
  },
  rouletteBadge: {
    alignSelf: 'flex-start',
    backgroundColor: BrandColors.primaryGreen,
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radii.sm,
  },
  rouletteBadgeText: {
    color: BrandColors.warmCream,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rouletteBannerTitle: {
    color: BrandColors.warmCream,
    fontSize: Typography.sizes.md,
    fontWeight: '700',
  },
  rouletteBannerSubtitle: {
    color: BrandColors.warmCream,
    fontSize: Typography.sizes.xs,
    opacity: 0.85,
  },
  rouletteBannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  popularQueryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  popularQueryText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
    color: BrandColors.charcoal,
  },
});
