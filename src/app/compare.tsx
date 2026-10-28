import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { GoogleAttributionBadge } from '@/components/GoogleAttributionBadge';
import {
  EmptyStateBlock,
  ErrorStateBlock,
  LoadingStateBlock,
} from '@/components/StateFeedbackBlocks';
import { APP_CONFIG } from '@/config';
import {
  calculateHaversineDistanceKm,
  restaurantRepository,
} from '@/repositories/restaurantRepository';
import { useComparisonStore } from '@/stores/useComparisonStore';
import { usePreferencesStore } from '@/stores/usePreferencesStore';
import { formatGooglePriceLevel, formatPkrRange } from '@/utils/ranking';
import { buildGroupVoteMessage, openWhatsAppShare } from '@/utils/whatsapp';
import { BrandColors, Radii, Spacing, Typography } from '@/theme';

export default function CompareScreen() {
  const {
    selectedPlaceIds,
    removeComparisonPlace,
    clearComparison,
  } = useComparisonStore();
  const { userCoordinates } = usePreferencesStore();
  const [shareNotice, setShareNotice] = React.useState<string | null>(null);

  const { data: items = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['compare-restaurants', selectedPlaceIds],
    queryFn: () => restaurantRepository.getRestaurantsByPlaceIds(selectedPlaceIds),
    enabled: selectedPlaceIds.length > 0,
  });

  const handleSharePoll = async () => {
    if (items.length < 2) return;

    const options = items.map((item) => {
      const cardSummary =
        item.khanaSceneData?.cardDeals && item.khanaSceneData.cardDeals.length > 0
          ? `${item.khanaSceneData.cardDeals[0].bankName} ${item.khanaSceneData.cardDeals[0].discountPercentage}% Off`
          : null;

      return {
        name: item.googleData.name,
        neighbourhood: item.googleData.neighbourhood,
        rating: item.googleData.googleRating ?? item.khanaSceneData?.khanaSceneRatingAvg,
        cardDealSummary: cardSummary,
        hasValet: item.khanaSceneData?.hasValet,
        heroDishes: item.khanaSceneData?.heroDishes,
      };
    });

    const msg = buildGroupVoteMessage(options);
    const sent = await openWhatsAppShare(msg);
    if (sent) {
      setShareNotice('WhatsApp opened! Forward to your group to vote.');
    } else {
      setShareNotice('Could not open WhatsApp. Please check if installed.');
    }
    setTimeout(() => setShareNotice(null), 4000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Compare Restaurants</Text>
        <Text style={styles.subtitle}>
          Compare up to {APP_CONFIG.maxComparisonItems} restaurants side by side. Missing values
          are stated honestly, and Google ratings are never merged with KhanaScene ratings.
        </Text>
      </View>

      {selectedPlaceIds.length === 0 ? (
        <EmptyStateBlock
          title="No restaurants selected to compare"
          message={`Tap the compare icon on up to ${APP_CONFIG.maxComparisonItems} restaurant cards in Explore or Search to compare them side by side.`}
          actionLabel="Browse Restaurants"
          onAction={() => router.push('/(tabs)/search')}
        />
      ) : isLoading ? (
        <LoadingStateBlock label="Loading comparison data..." />
      ) : isError ? (
        <ErrorStateBlock
          message="Could not load restaurants for comparison."
          onRetry={() => refetch()}
        />
      ) : (
        <View style={styles.tableWrapper}>
          <View style={styles.topActions}>
            <Text style={styles.countText}>
              Comparing {items.length} of {APP_CONFIG.maxComparisonItems} restaurants
            </Text>
            <Pressable onPress={clearComparison}>
              <Text style={styles.clearAllText}>Clear all</Text>
            </Pressable>
          </View>

          {items.length >= 2 && (
            <View style={styles.pollCtaContainer}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share voting poll on WhatsApp"
                onPress={handleSharePoll}
                style={styles.pollShareBtn}>
                <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                <Text style={styles.pollShareBtnText}>Share Poll on WhatsApp Group 🗳️</Text>
              </Pressable>
              {shareNotice ? (
                <Text style={styles.shareNoticeText}>{shareNotice}</Text>
              ) : null}
            </View>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.columnsRow}>
              {items.map((item) => {
                const { googleData, khanaSceneData } = item;
                const distanceKm =
                  userCoordinates && googleData.location
                    ? calculateHaversineDistanceKm(
                        userCoordinates.latitude,
                        userCoordinates.longitude,
                        googleData.location.latitude,
                        googleData.location.longitude
                      )
                    : null;

                return (
                  <View key={item.placeId} style={styles.columnCard}>
                    <View style={styles.columnHeader}>
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: '/restaurant/[placeId]',
                            params: { placeId: item.placeId },
                          })
                        }>
                        <Text style={styles.restaurantName} numberOfLines={2}>
                          {googleData.name}
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${googleData.name} from comparison`}
                        onPress={() => removeComparisonPlace(item.placeId)}
                        style={styles.removeBtn}>
                        <Ionicons name="close-circle" size={18} color={BrandColors.errorRed} />
                      </Pressable>
                    </View>

                    {/* Row 1: Rating */}
                    <View style={styles.metricBlock}>
                      <Text style={styles.metricLabel}>1. Rating</Text>
                      <Text style={styles.metricValue}>
                        {googleData.googleRating != null
                          ? `★ ${googleData.googleRating.toFixed(1)} / 5 (Google)`
                          : khanaSceneData?.khanaSceneRatingAvg != null
                            ? `★ ${khanaSceneData.khanaSceneRatingAvg.toFixed(1)} / 5 (KhanaScene)`
                            : 'Unavailable'}
                      </Text>
                    </View>

                    {/* Row 2: Review Count */}
                    <View style={styles.metricBlock}>
                      <Text style={styles.metricLabel}>2. Review Count</Text>
                      <Text style={styles.metricValue}>
                        {googleData.googleReviewCount != null
                          ? `${googleData.googleReviewCount.toLocaleString()} reviews (Google)`
                          : khanaSceneData?.khanaSceneReviewCount != null
                            ? `${khanaSceneData.khanaSceneReviewCount} reviews (KhanaScene)`
                            : 'Unavailable'}
                      </Text>
                    </View>

                    {/* Row 3: Cuisine & Category */}
                    <View style={styles.metricBlock}>
                      <Text style={styles.metricLabel}>3. Cuisine & Category</Text>
                      <Text style={styles.metricValue}>
                        {googleData.primaryCategory ?? 'Unavailable'}
                        {khanaSceneData?.cuisines?.length
                          ? ` (${khanaSceneData.cuisines.join(', ')})`
                          : ''}
                      </Text>
                    </View>

                    {/* Row 4: Price Level & Verified PKR Range */}
                    <View style={styles.metricBlock}>
                      <Text style={styles.metricLabel}>4. Price Level / PKR Range</Text>
                      <Text style={styles.metricValue}>
                        Google: {formatGooglePriceLevel(googleData.priceLevel)}
                      </Text>
                      <Text style={styles.metricSubValue}>
                        Verified Menu:{' '}
                        {formatPkrRange(
                          khanaSceneData?.priceMinPkr,
                          khanaSceneData?.priceMaxPkr
                        )}
                      </Text>
                    </View>

                    {/* Row 5: Distance / Neighbourhood */}
                    <View style={styles.metricBlock}>
                      <Text style={styles.metricLabel}>5. Area & Distance</Text>
                      <Text style={styles.metricValue}>
                        {googleData.neighbourhood ?? 'Area unavailable'}
                      </Text>
                      <Text style={styles.metricSubValue}>
                        {distanceKm != null
                          ? `${distanceKm} km from your location`
                          : 'Enable location for distance'}
                      </Text>
                    </View>

                    {/* Row 6: Opening Status */}
                    <View style={styles.metricBlock}>
                      <Text style={styles.metricLabel}>6. Opening Status</Text>
                      <Text style={styles.metricValue}>
                        {googleData.openNow === true
                          ? 'Open Now'
                          : googleData.openNow === false
                            ? 'Closed'
                            : googleData.regularOpeningHoursText &&
                                googleData.regularOpeningHoursText.length > 0
                              ? googleData.regularOpeningHoursText[0]
                              : 'Hours unavailable'}
                      </Text>
                    </View>

                    {/* Row 7: Facilities (Verified) */}
                    <View style={styles.metricBlock}>
                      <Text style={styles.metricLabel}>7. Verified Facilities</Text>
                      <Text style={styles.metricValue}>
                        {khanaSceneData?.isFamilyFriendly === true
                          ? 'Family Dining Verified'
                          : 'Not verified'}
                      </Text>
                    </View>

                    {/* Row 8: Menu Availability */}
                    <View style={styles.metricBlock}>
                      <Text style={styles.metricLabel}>8. Menu Availability</Text>
                      <Text style={styles.metricValue}>
                        {khanaSceneData?.hasVerifiedMenu
                          ? 'Verified PKR Menu Available'
                          : 'No verified menu on file'}
                      </Text>
                    </View>

                    {/* Row 9: Website / Directions */}
                    <View style={styles.metricBlock}>
                      <Text style={styles.metricLabel}>9. Links & Directions</Text>
                      <View style={styles.linksRow}>
                        <Pressable
                          onPress={() => Linking.openURL(googleData.googleMapsUri)}
                          style={styles.miniLinkBtn}>
                          <Text style={styles.miniLinkText}>Google Maps</Text>
                        </Pressable>
                        {googleData.websiteUri ? (
                          <Pressable
                            onPress={() => Linking.openURL(googleData.websiteUri!)}
                            style={styles.miniLinkBtn}>
                            <Text style={styles.miniLinkText}>Website</Text>
                          </Pressable>
                        ) : (
                          <Text style={styles.metricSubValue}>No website</Text>
                        )}
                      </View>
                    </View>

                    {/* Row 10: Bank Card Discounts */}
                    <View style={styles.metricBlock}>
                      <Text style={styles.metricLabel}>10. Bank Card Discounts</Text>
                      <Text style={styles.metricValue}>
                        {khanaSceneData?.cardDeals && khanaSceneData.cardDeals.length > 0
                          ? khanaSceneData.cardDeals
                              .map((d) => `${d.bankName} (${d.discountPercentage}% Off)`)
                              .join('\n')
                          : 'No active card deals'}
                      </Text>
                    </View>

                    {/* Row 11: Parking & Valet */}
                    <View style={styles.metricBlock}>
                      <Text style={styles.metricLabel}>11. Parking & Valet</Text>
                      <Text style={styles.metricValue}>
                        {khanaSceneData?.hasValet
                          ? '🚗 Valet Parking Available'
                          : khanaSceneData?.parkingType
                            ? `Parking: ${khanaSceneData.parkingType.replace('_', ' ')}`
                            : 'Standard parking'}
                      </Text>
                    </View>

                    {/* Row 12: Famous / Hero Dishes */}
                    <View style={styles.metricBlock}>
                      <Text style={styles.metricLabel}>12. Must-Try Signature Dishes</Text>
                      <Text style={styles.metricValue}>
                        {khanaSceneData?.heroDishes && khanaSceneData.heroDishes.length > 0
                          ? `⭐ ${khanaSceneData.heroDishes.join(', ')}`
                          : 'Not listed'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      <GoogleAttributionBadge notice="Comparison presents factual attributes side by side so you can decide where to eat. No restaurant is labelled objectively 'best'." />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  headerBox: {
    gap: Spacing.xs,
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
  tableWrapper: {
    gap: Spacing.md,
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  clearAllText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.errorRed,
  },
  pollCtaContainer: {
    gap: 4,
  },
  pollShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: '#E8F5E9',
    borderWidth: 1.5,
    borderColor: '#25D366',
    borderRadius: Radii.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  pollShareBtnText: {
    color: '#075E54',
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
  },
  shareNoticeText: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.primaryGreen,
    textAlign: 'center',
    fontWeight: '500',
  },
  columnsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  columnCard: {
    width: 245,
    backgroundColor: BrandColors.white,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderSubtle,
    paddingBottom: Spacing.sm,
  },
  restaurantName: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: BrandColors.deepForestGreen,
    maxWidth: 185,
  },
  removeBtn: {
    padding: 2,
  },
  metricBlock: {
    backgroundColor: BrandColors.warmCream,
    borderRadius: Radii.sm,
    padding: Spacing.sm,
    gap: 2,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: BrandColors.mutedGrey,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  metricSubValue: {
    fontSize: 11,
    color: BrandColors.mutedGrey,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  miniLinkBtn: {
    backgroundColor: BrandColors.primaryGreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  miniLinkText: {
    color: BrandColors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
