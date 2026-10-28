import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useComparisonStore } from '@/stores/useComparisonStore';
import { useSavedStore } from '@/stores/useSavedStore';
import { RestaurantDiscoveryItem } from '@/types/restaurant';
import { formatGooglePriceLevel, formatPkrRange } from '@/utils/ranking';
import { BrandColors, Radii, Spacing, Typography } from '@/theme';

interface RestaurantCardProps {
  item: RestaurantDiscoveryItem;
  distanceKm?: number | null;
}

/**
 * Restaurant Card Component
 * Displays available Google Places & KhanaScene information honestly:
 * - Restaurant name & cuisine/category
 * - Google star rating and review count (explicitly labelled as Google)
 * - Price level or verified PKR range
 * - Area or approximate distance
 * - Open/closed status when reliable
 * - Favourite button & Compare toggle
 */
export function RestaurantCard({ item, distanceKm }: RestaurantCardProps) {
  const { googleData, khanaSceneData, isFixtureData } = item;
  const { isPlaceSaved, toggleSavedPlace } = useSavedStore();
  const { selectedPlaceIds, toggleComparisonPlace } = useComparisonStore();

  const saved = isPlaceSaved(item.placeId);
  const inComparison = selectedPlaceIds.includes(item.placeId);

  const hasPkrPrice =
    khanaSceneData?.priceMinPkr != null || khanaSceneData?.priceMaxPkr != null;
  const priceDisplay = hasPkrPrice
    ? formatPkrRange(khanaSceneData?.priceMinPkr, khanaSceneData?.priceMaxPkr)
    : formatGooglePriceLevel(googleData.priceLevel);

  const activeDeals = khanaSceneData?.cardDeals ?? [];
  const maxDiscount =
    activeDeals.length > 0
      ? Math.max(...activeDeals.map((d) => d.discountPercentage))
      : 0;
  const uniqueBanks = Array.from(new Set(activeDeals.map((d) => d.bankName)));
  const bankNames = uniqueBanks.slice(0, 2).join(', ');
  const cardDealsSummary =
    activeDeals.length > 0
      ? `Up to ${maxDiscount}% Off • ${bankNames}${uniqueBanks.length > 2 ? ` +${uniqueBanks.length - 2} more` : ''}`
      : null;

  return (
    <Pressable
      accessibilityRole={Platform.OS === 'web' ? undefined : 'button'}
      accessibilityLabel={`View details for ${googleData.name}`}
      onPress={() =>
        router.push({
          pathname: '/restaurant/[placeId]',
          params: { placeId: item.placeId },
        })
      }
      style={styles.card}>
      {/* Top Visual Banner / Header */}
      <View style={styles.banner}>
        <View style={styles.bannerLeft}>
          <View style={styles.avatarIcon}>
            <Ionicons name="restaurant" size={20} color={BrandColors.saffronAccent} />
          </View>
          <View style={styles.badgesColumn}>
            {khanaSceneData?.isKhanaScenePick ? (
              <View style={styles.pickBadge}>
                <Ionicons name="sparkles" size={12} color={BrandColors.deepForestGreen} />
                <Text style={styles.pickBadgeText}>KhanaScene Pick</Text>
              </View>
            ) : null}
            {isFixtureData ? (
              <View style={styles.fixtureBadge}>
                <Text style={styles.fixtureBadgeText}>DEV FIXTURE</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.cardActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={inComparison ? 'Remove from comparison' : 'Add to comparison'}
            onPress={(e) => {
              e.stopPropagation();
              toggleComparisonPlace(item.placeId);
            }}
            style={[styles.iconButton, inComparison && styles.iconButtonCompareActive]}>
            <Ionicons
              name="git-compare-outline"
              size={17}
              color={inComparison ? BrandColors.white : BrandColors.deepForestGreen}
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Remove from saved' : 'Save restaurant'}
            onPress={(e) => {
              e.stopPropagation();
              toggleSavedPlace(item.placeId);
            }}
            style={[styles.iconButton, saved && styles.iconButtonSavedActive]}>
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={17}
              color={saved ? BrandColors.white : BrandColors.deepForestGreen}
            />
          </Pressable>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {googleData.name}
        </Text>

        <Text style={styles.categoryText} numberOfLines={1}>
          {googleData.primaryCategory ?? 'Category unavailable'}
          {googleData.neighbourhood ? ` • ${googleData.neighbourhood}` : ''}
          {distanceKm != null ? ` • ${distanceKm} km` : ''}
        </Text>

        {/* Distinct Rating Badges */}
        <View style={styles.ratingsRow}>
          {googleData.googleRating != null ? (
            <View style={styles.googleRatingBox}>
              <Ionicons name="star" size={14} color={BrandColors.saffronAccent} />
              <Text style={styles.ratingValue}>
                {googleData.googleRating.toFixed(1)}{' '}
                <Text style={styles.ratingCount}>
                  ({googleData.googleReviewCount?.toLocaleString('en-PK') ?? 0} Google reviews)
                </Text>
              </Text>
            </View>
          ) : khanaSceneData?.khanaSceneRatingAvg != null ? (
            <View style={styles.googleRatingBox}>
              <Ionicons name="ribbon" size={14} color={BrandColors.primaryGreen} />
              <Text style={styles.ratingValue}>
                {khanaSceneData.khanaSceneRatingAvg.toFixed(1)}{' '}
                <Text style={styles.ratingCount}>
                  ({khanaSceneData.khanaSceneReviewCount ?? 0} KhanaScene reviews)
                </Text>
              </Text>
            </View>
          ) : (
            <View style={styles.googleRatingBox}>
              <Ionicons name="star-outline" size={14} color={BrandColors.mutedGrey} />
              <Text style={styles.ratingCount}>Google rating unavailable</Text>
            </View>
          )}

          {googleData.openNow != null ? (
            <View
              style={[
                styles.statusPill,
                googleData.openNow ? styles.statusOpen : styles.statusClosed,
              ]}>
              <Text
                style={[
                  styles.statusText,
                  googleData.openNow ? styles.statusTextOpen : styles.statusTextClosed,
                ]}>
                {googleData.openNow ? 'Open Now' : 'Closed'}
              </Text>
            </View>
          ) : (
            <View style={styles.statusPillNeutral}>
              <Text style={styles.statusTextNeutral}>Hours unavailable</Text>
            </View>
          )}
        </View>

        {/* Parking Badge */}
        {khanaSceneData?.hasValet ? (
          <View style={styles.parkingBadgeRow}>
            <View style={styles.valetBadge}>
              <Ionicons name="car" size={11} color="#15803D" />
              <Text style={styles.valetBadgeText}>Valet Available</Text>
            </View>
          </View>
        ) : khanaSceneData?.parkingType === 'dedicated_lot' ? (
          <View style={styles.parkingBadgeRow}>
            <View style={styles.dedicatedParkingBadge}>
              <Ionicons name="car-outline" size={11} color={BrandColors.deepForestGreen} />
              <Text style={styles.dedicatedParkingText}>Dedicated Parking</Text>
            </View>
          </View>
        ) : khanaSceneData?.parkingType === 'street_crowded' ? (
          <View style={styles.parkingBadgeRow}>
            <View style={styles.crowdedParkingBadge}>
              <Ionicons name="alert-circle-outline" size={11} color="#B45309" />
              <Text style={styles.crowdedParkingText}>Crowded Street Parking</Text>
            </View>
          </View>
        ) : null}

        {/* Hero Dishes Preview Line */}
        {khanaSceneData?.heroDishes && khanaSceneData.heroDishes.length > 0 ? (
          <View style={styles.heroDishesRow}>
            <Ionicons name="restaurant" size={12} color={BrandColors.saffronAccent} />
            <Text style={styles.heroDishesText} numberOfLines={1}>
              Famous for:{' '}
              <Text style={styles.heroDishesBold}>
                {khanaSceneData.heroDishes.slice(0, 2).join(', ')}
                {khanaSceneData.heroDishes.length > 2 ? '...' : ''}
              </Text>
            </Text>
          </View>
        ) : null}

        {/* Bank Card Discount Pill */}
        {cardDealsSummary ? (
          <View style={styles.cardDealPill}>
            <Ionicons name="card" size={13} color="#B45309" />
            <Text style={styles.cardDealText} numberOfLines={1}>
              {cardDealsSummary}
            </Text>
          </View>
        ) : null}

        {/* Footer Meta: Price & Attribution */}
        <View style={styles.footerRow}>
          <Text style={styles.priceText}>{priceDisplay}</Text>
          <Text style={styles.attributionLabel}>
            Source: {googleData.googleRating != null ? 'Google Maps' : 'KhanaScene Verified'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
    overflow: 'hidden',
  },
  banner: {
    backgroundColor: BrandColors.deepForestGreen,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  avatarIcon: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    backgroundColor: BrandColors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgesColumn: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BrandColors.saffronAccent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  pickBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.deepForestGreen,
  },
  fixtureBadge: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  fixtureBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: BrandColors.warmCream,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: Radii.pill,
    backgroundColor: BrandColors.warmCream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonCompareActive: {
    backgroundColor: BrandColors.saffronAccent,
  },
  iconButtonSavedActive: {
    backgroundColor: BrandColors.primaryGreen,
  },
  body: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  name: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: BrandColors.charcoal,
  },
  categoryText: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.mutedGrey,
    fontWeight: '500',
  },
  ratingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  googleRatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  ratingCount: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
    color: BrandColors.mutedGrey,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  statusOpen: {
    backgroundColor: BrandColors.successBackground,
  },
  statusClosed: {
    backgroundColor: BrandColors.errorBackground,
  },
  statusPillNeutral: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    backgroundColor: BrandColors.lightGreen,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextOpen: {
    color: BrandColors.successGreen,
  },
  statusTextClosed: {
    color: BrandColors.errorRed,
  },
  statusTextNeutral: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.mutedGrey,
  },
  cardDealPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  cardDealText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  parkingBadgeRow: {
    flexDirection: 'row',
    marginTop: 3,
  },
  valetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  valetBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  dedicatedParkingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BrandColors.lightGreen,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  dedicatedParkingText: {
    fontSize: 10,
    fontWeight: '700',
    color: BrandColors.deepForestGreen,
  },
  crowdedParkingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  crowdedParkingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B45309',
  },
  heroDishesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  heroDishesText: {
    fontSize: 11,
    color: BrandColors.mutedGrey,
    flex: 1,
  },
  heroDishesBold: {
    color: BrandColors.charcoal,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BrandColors.borderSubtle,
    paddingTop: Spacing.xs,
    marginTop: 4,
  },
  priceText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.primaryGreen,
  },
  attributionLabel: {
    fontSize: 11,
    color: BrandColors.mutedGrey,
  },
});
