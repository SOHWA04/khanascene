import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { detectRestaurantEmoji, getCuisineVisual } from '@/constants/cuisines';
import { useComparisonStore } from '@/stores/useComparisonStore';
import { useSavedStore } from '@/stores/useSavedStore';
import { RestaurantDiscoveryItem } from '@/types/restaurant';
import { formatGooglePriceLevel, formatPkrRange } from '@/utils/ranking';
import { BrandColors, Radii } from '@/theme';

interface RestaurantCardProps {
  item: RestaurantDiscoveryItem;
  distanceKm?: number | null;
}

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

  const heroDishes = khanaSceneData?.heroDishes ?? [];
  const cuisineSlug = khanaSceneData?.cuisines?.[0] ?? null;
  const visual = getCuisineVisual(cuisineSlug);
  const emoji = detectRestaurantEmoji(
    googleData.name,
    googleData.primaryCategory,
    khanaSceneData?.cuisines
  );

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
      {/* Top Visual Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.cuisineIconBadge, { backgroundColor: visual.bg }]}>
            <Text style={styles.cuisineEmoji}>{emoji}</Text>
          </View>
          <View style={styles.headerMeta}>
            <View style={styles.badgesRow}>
              {khanaSceneData?.isKhanaScenePick ? (
                <View style={styles.pickBadge}>
                  <Ionicons name="sparkles" size={11} color="#B45309" />
                  <Text style={styles.pickBadgeText}>KhanaScene Pick</Text>
                </View>
              ) : null}
              {isFixtureData ? (
                <View style={styles.fixtureBadge}>
                  <Text style={styles.fixtureBadgeText}>DEV FIXTURE</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.categorySubhead} numberOfLines={1}>
              {googleData.primaryCategory ?? 'Category unavailable'}
            </Text>
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
            style={[styles.actionBtn, inComparison && styles.actionBtnActiveCompare]}>
            <Ionicons
              name={inComparison ? 'git-compare' : 'git-compare-outline'}
              size={16}
              color={inComparison ? BrandColors.white : BrandColors.charcoal}
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Remove from saved' : 'Save restaurant'}
            onPress={(e) => {
              e.stopPropagation();
              toggleSavedPlace(item.placeId);
            }}
            style={[styles.actionBtn, saved && styles.actionBtnActiveSaved]}>
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={16}
              color={saved ? BrandColors.white : BrandColors.charcoal}
            />
          </Pressable>
        </View>
      </View>

      {/* Main Body */}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {googleData.name}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={13} color={BrandColors.mutedGrey} />
          <Text style={styles.locationText} numberOfLines={1}>
            {googleData.neighbourhood ?? googleData.shortAddress ?? 'Islamabad'}
            {distanceKm != null ? ` • ${distanceKm} km away` : ''}
          </Text>
        </View>

        {/* Ratings & Operating Status */}
        <View style={styles.statusRow}>
          <View style={styles.ratingGroup}>
            {googleData.googleRating != null ? (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.ratingScore}>{googleData.googleRating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>
                  ({googleData.googleReviewCount?.toLocaleString('en-PK') ?? 0} Google reviews)
                </Text>
              </View>
            ) : khanaSceneData?.khanaSceneRatingAvg != null ? (
              <View style={styles.ratingBadge}>
                <Ionicons name="ribbon" size={13} color={BrandColors.primaryGreen} />
                <Text style={styles.ratingScore}>
                  {khanaSceneData.khanaSceneRatingAvg.toFixed(1)}
                </Text>
                <Text style={styles.ratingCount}>
                  ({khanaSceneData.khanaSceneReviewCount ?? 0} KhanaScene reviews)
                </Text>
              </View>
            ) : (
              <View style={styles.ratingBadgeEmpty}>
                <Ionicons name="star-outline" size={13} color={BrandColors.mutedGrey} />
                <Text style={styles.ratingCountMuted}>Google rating unavailable</Text>
              </View>
            )}
          </View>

          {googleData.openNow != null ? (
            <View
              style={[
                styles.statusPill,
                googleData.openNow ? styles.statusOpen : styles.statusClosed,
              ]}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: googleData.openNow ? '#10B981' : '#EF4444' },
                ]}
              />
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

        {/* Bank Discounts Chip */}
        {cardDealsSummary ? (
          <View style={styles.dealsPill}>
            <Ionicons name="card" size={14} color="#047857" />
            <Text style={styles.dealsText} numberOfLines={1}>
              {cardDealsSummary}
            </Text>
          </View>
        ) : null}

        {/* Must-Try Signature Hero Dishes */}
        {heroDishes.length > 0 ? (
          <View style={styles.heroDishesRow}>
            <Text style={styles.heroDishesPrefix}>Famous for:</Text>
            <View style={styles.heroChipsContainer}>
              {heroDishes.slice(0, 2).map((dish, idx) => (
                <View key={idx} style={styles.heroChip}>
                  <Text style={styles.heroChipText}>⭐ {dish}</Text>
                </View>
              ))}
              {heroDishes.length > 2 ? (
                <Text style={styles.heroMoreText}>+{heroDishes.length - 2} more</Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Parking Reality Badge */}
        {khanaSceneData?.parkingType && khanaSceneData.parkingType !== 'unknown' ? (
          <View style={styles.parkingRow}>
            <Ionicons
              name={khanaSceneData.hasValet ? 'car' : 'navigate-circle-outline'}
              size={13}
              color={BrandColors.mutedGrey}
            />
            <Text style={styles.parkingText}>
              {khanaSceneData.hasValet
                ? 'Valet Parking Available'
                : khanaSceneData.parkingType === 'dedicated_lot'
                  ? 'Dedicated Parking Lot'
                  : khanaSceneData.parkingType === 'street_moderate'
                    ? 'Moderate Street Parking'
                    : 'Crowded Street Parking'}
            </Text>
          </View>
        ) : null}

        {/* Card Footer: Verified PKR Price & Source */}
        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{priceDisplay}</Text>
            {hasPkrPrice ? <Text style={styles.taxSubtext}>• Verified Menu</Text> : null}
          </View>

          <Text style={styles.sourceText}>
            Source: {hasPkrPrice ? 'KhanaScene' : 'Google Maps'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 14,
    ...Platform.select({
      web: {
        boxShadow:
          '0 4px 18px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
      },
      default: {
        elevation: 3,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
    }),
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cuisineIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuisineEmoji: {
    fontSize: 22,
  },
  headerMeta: {
    flex: 1,
    gap: 3,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  pickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pickBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  fixtureBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  fixtureBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: BrandColors.mutedGrey,
  },
  categorySubhead: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.mutedGrey,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: Radii.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnActiveCompare: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  actionBtnActiveSaved: {
    backgroundColor: '#126149',
    borderColor: '#126149',
  },
  body: {
    padding: 16,
    gap: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
    color: BrandColors.mutedGrey,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  ratingBadgeEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingScore: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  ratingCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#B45309',
  },
  ratingCountMuted: {
    fontSize: 12,
    fontWeight: '500',
    color: BrandColors.mutedGrey,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusOpen: {
    backgroundColor: '#ECFDF5',
  },
  statusClosed: {
    backgroundColor: '#FEE2E2',
  },
  statusPillNeutral: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextOpen: {
    color: '#047857',
  },
  statusTextClosed: {
    color: '#B91C1C',
  },
  statusTextNeutral: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.mutedGrey,
  },
  dealsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  dealsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
    flex: 1,
  },
  heroDishesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  heroDishesPrefix: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  heroChipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  heroChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  heroChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  heroMoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.mutedGrey,
  },
  parkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  parkingText: {
    fontSize: 12,
    fontWeight: '500',
    color: BrandColors.mutedGrey,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0E382C',
  },
  taxSubtext: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.mutedGrey,
  },
  sourceText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
