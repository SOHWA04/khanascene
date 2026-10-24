import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { ComparisonTrayBar } from '@/components/ComparisonTrayBar';
import { GoogleAttributionBadge } from '@/components/GoogleAttributionBadge';
import { RestaurantCard } from '@/components/RestaurantCard';
import {
  EmptyStateBlock,
  ErrorStateBlock,
  LoadingStateBlock,
} from '@/components/StateFeedbackBlocks';
import { restaurantRepository } from '@/repositories/restaurantRepository';
import { useSavedStore } from '@/stores/useSavedStore';
import { BrandColors, Spacing, Typography } from '@/theme';

export default function SavedScreen() {
  const { savedPlaceIds } = useSavedStore();

  const { data: savedItems = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['saved-restaurants', savedPlaceIds],
    queryFn: () => restaurantRepository.getRestaurantsByPlaceIds(savedPlaceIds),
    enabled: savedPlaceIds.length > 0,
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Saved Restaurants</Text>
        <Text style={styles.subtitle}>
          Favourites are stored using permitted Place ID references and load fresh details when
          viewed. Sign in on the Profile tab to sync across devices.
        </Text>

        <ComparisonTrayBar />

        {savedPlaceIds.length === 0 ? (
          <EmptyStateBlock
            title="No saved restaurants yet"
            message="Tap the bookmark icon on any restaurant in Islamabad or Rawalpindi to save it here."
            actionLabel="Explore Restaurants"
            onAction={() => router.push('/(tabs)/search')}
          />
        ) : isLoading ? (
          <LoadingStateBlock label="Loading your saved restaurants..." />
        ) : isError ? (
          <ErrorStateBlock
            message="Could not retrieve details for your saved places."
            onRetry={() => refetch()}
          />
        ) : (
          <View style={styles.list}>
            {savedItems.map((item) => (
              <RestaurantCard key={item.placeId} item={item} />
            ))}
          </View>
        )}

        <GoogleAttributionBadge />
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
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: BrandColors.deepForestGreen,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: BrandColors.mutedGrey,
    lineHeight: 20,
  },
  list: {
    gap: Spacing.md,
  },
});
