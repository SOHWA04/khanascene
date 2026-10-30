import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { getCuisineVisual } from '@/constants/cuisines';
import {
  calculateHaversineDistanceKm,
  restaurantRepository,
} from '@/repositories/restaurantRepository';
import { usePreferencesStore } from '@/stores/usePreferencesStore';
import { requestOnDemandUserLocation } from '@/utils/location';
import { Radii } from '@/theme';

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
        {/* Modern Header */}
        <View style={styles.header}>
          <KhanaSceneLogo size="md" showTagline />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Account and preferences"
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.profileShortcut}>
            <Ionicons name="person-circle-outline" size={32} color="#0E382C" />
          </Pressable>
        </View>

        {/* City & Neighbourhood Bar */}
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
            <Ionicons name="information-circle-outline" size={18} color="#D97706" />
            <Text style={styles.noticeText}>{locationNotice}</Text>
          </View>
        ) : null}

        {/* Elevated Search Bar */}
        <Pressable
          accessibilityRole="search"
          accessibilityLabel="Search restaurants, dishes or cuisines"
          onPress={() => router.push('/(tabs)/search')}
          style={styles.searchBox}>
          <View style={styles.searchLeft}>
            <View style={styles.searchIconBox}>
              <Ionicons name="search" size={18} color="#126149" />
            </View>
            <Text style={styles.searchPlaceholder}>
              Search dishes, cuisines, or sectors in {activeCity.name}...
            </Text>
          </View>
          <View style={styles.filterPillShortcut}>
            <Ionicons name="options-outline" size={16} color="#64748B" />
          </View>
        </Pressable>

        {/* Quick Filter Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFilterRow}>
          {QUICK_FILTERS.map((chip) => (
            <Pressable
              key={chip.id}
              onPress={() => handleQuickFilterPress(chip.id)}
              style={styles.quickFilterChip}>
              <Ionicons name={chip.icon} size={14} color="#0E382C" />
              <Text style={styles.quickFilterText}>{chip.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <ComparisonTrayBar />

        {/* High-Energy Khana Roulette Banner */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Spin the Khana Roulette to decide where to eat"
          onPress={() => router.push('/roulette')}
          style={styles.rouletteBanner}>
          <View style={styles.rouletteLeft}>
            <View style={styles.rouletteBadge}>
              <Text style={styles.rouletteBadgeText}>🎲 GROUP SCENE DECIDER</Text>
            </View>
            <Text style={styles.rouletteTitle}>Can&apos;t agree where to eat?</Text>
            <Text style={styles.rouletteSubtitle}>
              Spin the Khana Roulette & share the pick directly to WhatsApp
            </Text>
          </View>
          <View style={styles.rouletteAction}>
            <Text style={styles.rouletteBtnText}>Spin Now</Text>
            <Ionicons name="arrow-forward" size={16} color="#0E382C" />
          </View>
        </Pressable>

        {/* Cuisines Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>What are you craving?</Text>
            <Text style={styles.sectionSubtitle}>Explore dishes, karahis, and local cafes</Text>
          </View>
          <Pressable onPress={() => router.push('/cuisines')}>
            <Text style={styles.sectionLink}>See all</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cuisineRow}>
          {CUISINE_CATEGORIES.slice(0, 10).map((cuisine) => {
            const visual = getCuisineVisual(cuisine.slug);
            return (
              <Pressable
                key={cuisine.id}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/search',
                    params: { cuisine: cuisine.slug },
                  })
                }
                style={styles.cuisineCard}>
                <View style={[styles.cuisineIconCircle, { backgroundColor: visual.bg }]}>
                  <Text style={styles.cuisineEmojiText}>{visual.emoji}</Text>
                </View>
                <Text style={styles.cuisineName} numberOfLines={1}>
                  {cuisine.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {isLoading ? (
          <LoadingStateBlock label={`Loading ${activeCity.name} restaurants...`} />
        ) : isError ? (
          <ErrorStateBlock
            message="Could not load discovery sections. Please check your connection."
            onRetry={() => refetch()}
          />
        ) : (
          <>
            {/* Section: Restaurants Near You / In Selected City */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  {locationPermissionGranted ? 'Trending Near You' : `Featured in ${activeCity.name}`}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {locationPermissionGranted
                    ? 'Sorted by your GPS distance'
                    : `Showing verified twin-cities restaurants`}
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
                title={`No listings loaded for ${activeCity.name}`}
                message="Please refresh or check your internet connection."
              />
            )}

            {/* Popular Searches */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Popular Food Searches</Text>
                <Text style={styles.sectionSubtitle}>Top trending cravings in {activeCity.name}</Text>
              </View>
            </View>
            <View style={styles.popularWrap}>
              {(selectedCity === 'islamabad'
                ? [
                    'Biryani in Islamabad',
                    'Restaurants in F-7 Markaz',
                    'Kohsar Cafés F-6',
                    'BBQ in Blue Area',
                    'Karahi in F-8',
                    'Steaks in Beverly Centre',
                  ]
                : [
                    'Savour Pulao Saddar',
                    'Food Street Stadium Road',
                    'Kartarpura Nihari',
                    'Restaurants in Bahria Town',
                    'Commercial Market Chaat',
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
                  <Ionicons name="trending-up" size={13} color="#126149" />
                  <Text style={styles.popularQueryText}>{query}</Text>
                </Pressable>
              ))}
            </View>

            {/* KhanaScene Curated Picks */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>👑 KhanaScene Picks</Text>
                <Text style={styles.sectionSubtitle}>
                  Editor-curated classics with verified menus & hero dishes
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

            {/* Bank Card Discounts */}
            {data && data.cardDealsSpots && data.cardDealsSpots.length > 0 ? (
              <>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>💳 Bank Card Deals</Text>
                    <Text style={styles.sectionSubtitle}>
                      Save up to 30% with Meezan, Alfalah, HBL, & SCB cards
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

            {/* Budget-Friendly Restaurants */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>💰 Budget-Friendly Gems</Text>
                <Text style={styles.sectionSubtitle}>
                  Hearty meals under ₨ 1,200 with honest verified prices
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
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  profileShortcut: {
    padding: 4,
  },
  locationBar: {
    gap: 10,
  },
  areaRow: {
    gap: 8,
    paddingVertical: 2,
  },
  areaChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  areaChipActive: {
    backgroundColor: '#0E382C',
    borderColor: '#0E382C',
  },
  areaChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  areaChipTextActive: {
    color: '#FFFFFF',
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 3px 12px rgba(15, 23, 42, 0.05)',
      },
      default: {
        elevation: 2,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
    }),
  },
  searchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  searchIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EAF4F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchPlaceholder: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  filterPillShortcut: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickFilterRow: {
    gap: 8,
    paddingVertical: 2,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.pill,
  },
  quickFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0E382C',
  },
  rouletteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E382C',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    ...Platform.select({
      web: {
        boxShadow: '0 6px 20px rgba(14, 56, 44, 0.25)',
      },
      default: {
        elevation: 4,
        shadowColor: '#0E382C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
    }),
  },
  rouletteLeft: {
    flex: 1,
    gap: 4,
    paddingRight: 10,
  },
  rouletteBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radii.pill,
  },
  rouletteBadgeText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rouletteTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  rouletteSubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
  },
  rouletteAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.pill,
  },
  rouletteBtnText: {
    color: '#0E382C',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#126149',
  },
  cuisineRow: {
    gap: 12,
    paddingVertical: 4,
  },
  cuisineCard: {
    width: 82,
    alignItems: 'center',
    gap: 8,
  },
  cuisineIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
    }),
  },
  cuisineEmojiText: {
    fontSize: 26,
  },
  cuisineName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  cardList: {
    gap: 14,
  },
  popularWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularQueryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  popularQueryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
});
