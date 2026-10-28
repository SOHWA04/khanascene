import React, { useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { GoogleAttributionBadge } from '@/components/GoogleAttributionBadge';
import {
  EmptyStateBlock,
  ErrorStateBlock,
  LoadingStateBlock,
} from '@/components/StateFeedbackBlocks';
import { INITIAL_CITIES } from '@/config';
import { restaurantRepository } from '@/repositories/restaurantRepository';
import { usePreferencesStore } from '@/stores/usePreferencesStore';
import { RestaurantDiscoveryItem } from '@/types/restaurant';
import { buildRoulettePickMessage, openWhatsAppShare } from '@/utils/whatsapp';
import { BrandColors, Radii, Spacing, Typography } from '@/theme';

export default function KhanaRouletteScreen() {
  const { selectedCity, selectedAreaId, setArea } = usePreferencesStore();
  const activeCity = INITIAL_CITIES[selectedCity];

  // Filters state
  const [valetOnly, setValetOnly] = useState(false);
  const [cardDealsOnly, setCardDealsOnly] = useState(false);
  const [familyOnly, setFamilyOnly] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);

  // Animation & Selection state
  const [selectedResult, setSelectedResult] = useState<RestaurantDiscoveryItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinNamePreview, setSpinNamePreview] = useState<string>('Ready to spin!');
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const [spinAnimation] = useState(() => new Animated.Value(0));
  const [pulseAnimation] = useState(() => new Animated.Value(1));

  // Fetch candidates from repository
  const { data: candidates = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['roulette-candidates', selectedCity, selectedAreaId, valetOnly, cardDealsOnly, familyOnly, openNowOnly],
    queryFn: async () => {
      const result = await restaurantRepository.searchRestaurants({
        query: '',
        cityId: selectedCity,
        areaId: selectedAreaId,
        cuisineSlug: null,
        minRating: null,
        minReviewCount: null,
        budgetOnly: false,
        openNowOnly,
        familyFriendlyOnly: familyOnly,
        nearMeOnly: false,
        valetOnly,
        hasCardDealsOnly: cardDealsOnly,
        sortBy: 'relevance',
      });
      return result.items;
    },
  });

  const availableCount = candidates.length;

  const handleSpin = () => {
    if (availableCount === 0 || isSpinning) return;

    setIsSpinning(true);
    setSelectedResult(null);
    setShareFeedback(null);

    // Reset animations
    spinAnimation.setValue(0);
    Animated.loop(
      Animated.timing(spinAnimation, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.sequence([
      Animated.timing(pulseAnimation, {
        toValue: 1.08,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Rapid name flicker
    let step = 0;
    const totalSteps = 16;
    const interval = setInterval(() => {
      step += 1;
      const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      setSpinNamePreview(randomCandidate.googleData.name);

      if (step >= totalSteps) {
        clearInterval(interval);
        spinAnimation.stopAnimation();

        // Final pick
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        setSelectedResult(pick);
        setSpinNamePreview(pick.googleData.name);
        setIsSpinning(false);
      }
    }, 120);
  };

  const handleShareToWhatsApp = async () => {
    if (!selectedResult) return;

    const cardSummary =
      selectedResult.khanaSceneData?.cardDeals && selectedResult.khanaSceneData.cardDeals.length > 0
        ? `${selectedResult.khanaSceneData.cardDeals[0].bankName} ${selectedResult.khanaSceneData.cardDeals[0].discountPercentage}% Off`
        : null;

    const msg = buildRoulettePickMessage({
      name: selectedResult.googleData.name,
      neighbourhood: selectedResult.googleData.neighbourhood,
      rating: selectedResult.googleData.googleRating ?? selectedResult.khanaSceneData?.khanaSceneRatingAvg,
      heroDishes: selectedResult.khanaSceneData?.heroDishes,
      cardDealSummary: cardSummary,
      hasValet: selectedResult.khanaSceneData?.hasValet,
      mapsUrl: selectedResult.googleData.googleMapsUri,
    });

    const sent = await openWhatsAppShare(msg);
    if (sent) {
      setShareFeedback('WhatsApp opened! Send to your friends or group.');
    } else {
      setShareFeedback('Could not open WhatsApp. Please check if installed.');
    }
    setTimeout(() => setShareFeedback(null), 4000);
  };

  const spinRotation = spinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={BrandColors.deepForestGreen} />
          </Pressable>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Khana Roulette 🎲</Text>
            <Text style={styles.headerSubtitle}>
              Can&apos;t agree on dinner? Let the scene decide!
            </Text>
          </View>
        </View>

        {/* City & Neighbourhood Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionLabel}>
            Exploring in {activeCity.name} ({availableCount} spots matching)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.areaChipsRow}>
            <Pressable
              onPress={() => setArea(null)}
              style={[styles.areaChip, selectedAreaId === null && styles.areaChipActive]}>
              <Text style={[styles.areaChipText, selectedAreaId === null && styles.areaChipTextActive]}>
                All {activeCity.name}
              </Text>
            </Pressable>
            {activeCity.areas.map((area) => {
              const isSelected = selectedAreaId === area.id;
              return (
                <Pressable
                  key={area.id}
                  onPress={() => setArea(isSelected ? null : area.id)}
                  style={[styles.areaChip, isSelected && styles.areaChipActive]}>
                  <Text style={[styles.areaChipText, isSelected && styles.areaChipTextActive]}>
                    {area.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Quick Perks Toggles */}
          <View style={styles.perksRow}>
            <Pressable
              onPress={() => setCardDealsOnly(!cardDealsOnly)}
              style={[styles.perkChip, cardDealsOnly && styles.perkChipActive]}>
              <Ionicons
                name="card-outline"
                size={14}
                color={cardDealsOnly ? BrandColors.white : BrandColors.primaryGreen}
              />
              <Text style={[styles.perkChipText, cardDealsOnly && styles.perkChipTextActive]}>
                Bank Deals
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setValetOnly(!valetOnly)}
              style={[styles.perkChip, valetOnly && styles.perkChipActive]}>
              <Ionicons
                name="car-outline"
                size={14}
                color={valetOnly ? BrandColors.white : BrandColors.primaryGreen}
              />
              <Text style={[styles.perkChipText, valetOnly && styles.perkChipTextActive]}>
                Valet Only
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setFamilyOnly(!familyOnly)}
              style={[styles.perkChip, familyOnly && styles.perkChipActive]}>
              <Ionicons
                name="people-outline"
                size={14}
                color={familyOnly ? BrandColors.white : BrandColors.primaryGreen}
              />
              <Text style={[styles.perkChipText, familyOnly && styles.perkChipTextActive]}>
                Family
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setOpenNowOnly(!openNowOnly)}
              style={[styles.perkChip, openNowOnly && styles.perkChipActive]}>
              <Ionicons
                name="time-outline"
                size={14}
                color={openNowOnly ? BrandColors.white : BrandColors.primaryGreen}
              />
              <Text style={[styles.perkChipText, openNowOnly && styles.perkChipTextActive]}>
                Open Now
              </Text>
            </Pressable>
          </View>
        </View>

        {isLoading ? (
          <LoadingStateBlock label="Loading restaurants for roulette..." />
        ) : isError ? (
          <ErrorStateBlock message="Failed to load roulette options." onRetry={() => refetch()} />
        ) : availableCount === 0 ? (
          <EmptyStateBlock
            title="No restaurants match these filters"
            message="Try turning off some filter perks (like Valet or Bank Deals) to expand choices."
            actionLabel="Reset Filters"
            onAction={() => {
              setValetOnly(false);
              setCardDealsOnly(false);
              setFamilyOnly(false);
              setOpenNowOnly(false);
              setArea(null);
            }}
          />
        ) : (
          <>
            {/* The Roulette Wheel Display Box */}
            <View style={styles.rouletteBox}>
              <Animated.View
                style={[
                  styles.wheelContainer,
                  {
                    transform: [{ scale: pulseAnimation }],
                  },
                ]}>
                <Animated.View style={{ transform: [{ rotate: spinRotation }] }}>
                  <Ionicons name="dice-outline" size={64} color={BrandColors.primaryGreen} />
                </Animated.View>

                <Text style={styles.rouletteFlickerText} numberOfLines={2}>
                  {isSpinning ? spinNamePreview : selectedResult ? 'We have a winner!' : 'Ready to decide?'}
                </Text>
              </Animated.View>

              {/* Spin Button */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Spin the roulette"
                onPress={handleSpin}
                disabled={isSpinning || availableCount === 0}
                style={[styles.spinButton, (isSpinning || availableCount === 0) && styles.spinButtonDisabled]}>
                <Ionicons name="sparkles" size={20} color={BrandColors.white} />
                <Text style={styles.spinButtonText}>
                  {isSpinning ? 'Picking your spot...' : selectedResult ? 'Spin Again 🎲' : 'Spin the Roulette 🎲'}
                </Text>
              </Pressable>
            </View>

            {/* Winner Result Card */}
            {selectedResult && (
              <View style={styles.winnerCard}>
                <View style={styles.winnerHeader}>
                  <View style={styles.winnerBadge}>
                    <Ionicons name="trophy" size={16} color={BrandColors.white} />
                    <Text style={styles.winnerBadgeText}>Tonight&apos;s Pick</Text>
                  </View>
                  <Text style={styles.winnerAreaText}>
                    {selectedResult.googleData.neighbourhood ?? activeCity.name}
                  </Text>
                </View>

                <Text style={styles.winnerName}>{selectedResult.googleData.name}</Text>

                {/* Rating & Cuisines */}
                <View style={styles.metaRow}>
                  {selectedResult.googleData.googleRating != null && (
                    <Text style={styles.ratingText}>
                      ★ {selectedResult.googleData.googleRating.toFixed(1)} / 5 (Google)
                    </Text>
                  )}
                  {selectedResult.khanaSceneData?.cuisines && selectedResult.khanaSceneData.cuisines.length > 0 && (
                    <Text style={styles.cuisinesText}>
                      • {selectedResult.khanaSceneData.cuisines.slice(0, 2).join(', ')}
                    </Text>
                  )}
                </View>

                {/* Perks Line (Valet, Card Deals, Hero Dishes) */}
                <View style={styles.perkHighlights}>
                  {selectedResult.khanaSceneData?.hasValet && (
                    <View style={styles.valetBadge}>
                      <Ionicons name="car" size={13} color={BrandColors.white} />
                      <Text style={styles.valetBadgeText}>Valet Parking</Text>
                    </View>
                  )}

                  {selectedResult.khanaSceneData?.cardDeals && selectedResult.khanaSceneData.cardDeals.length > 0 && (
                    <View style={styles.cardDealBadge}>
                      <Ionicons name="card" size={13} color={BrandColors.deepForestGreen} />
                      <Text style={styles.cardDealBadgeText}>
                        {selectedResult.khanaSceneData.cardDeals[0].bankName} {selectedResult.khanaSceneData.cardDeals[0].discountPercentage}% Off
                      </Text>
                    </View>
                  )}
                </View>

                {/* Signature Dishes */}
                {selectedResult.khanaSceneData?.heroDishes && selectedResult.khanaSceneData.heroDishes.length > 0 && (
                  <View style={styles.heroDishesBox}>
                    <Text style={styles.heroDishesLabel}>⭐ Famous for:</Text>
                    <Text style={styles.heroDishesText}>
                      {selectedResult.khanaSceneData.heroDishes.join(', ')}
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtonsCol}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="View restaurant menu and details"
                    onPress={() =>
                      router.push({
                        pathname: '/restaurant/[placeId]',
                        params: { placeId: selectedResult.placeId },
                      })
                    }
                    style={styles.viewDetailsBtn}>
                    <Ionicons name="restaurant-outline" size={18} color={BrandColors.white} />
                    <Text style={styles.viewDetailsBtnText}>View Menu & Details</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Share pick with friends on WhatsApp"
                    onPress={handleShareToWhatsApp}
                    style={styles.shareWhatsAppBtn}>
                    <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                    <Text style={styles.shareWhatsAppBtnText}>Share Pick with Friends</Text>
                  </Pressable>
                </View>

                {shareFeedback ? (
                  <Text style={styles.shareFeedbackText}>{shareFeedback}</Text>
                ) : null}
              </View>
            )}
          </>
        )}

        <GoogleAttributionBadge notice="Khana Roulette randomly selects from verified dining spots to resolve group decision fatigue. Ratings reflect honest community & Google review signals." />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: BrandColors.deepForestGreen,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    color: BrandColors.mutedGrey,
  },
  filterSection: {
    backgroundColor: BrandColors.white,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  filterSectionLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.deepForestGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  areaChipsRow: {
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  areaChip: {
    paddingVertical: 5,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.pill,
    backgroundColor: BrandColors.warmCream,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  areaChipActive: {
    backgroundColor: BrandColors.primaryGreen,
    borderColor: BrandColors.primaryGreen,
  },
  areaChipText: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.charcoal,
  },
  areaChipTextActive: {
    color: BrandColors.white,
    fontWeight: '700',
  },
  perksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: 4,
  },
  perkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: BrandColors.primaryGreen,
    backgroundColor: BrandColors.white,
  },
  perkChipActive: {
    backgroundColor: BrandColors.primaryGreen,
  },
  perkChipText: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.primaryGreen,
  },
  perkChipTextActive: {
    color: BrandColors.white,
    fontWeight: '700',
  },
  rouletteBox: {
    backgroundColor: BrandColors.white,
    padding: Spacing.xl,
    borderRadius: Radii.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: BrandColors.primaryGreen,
    gap: Spacing.lg,
  },
  wheelContainer: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  rouletteFlickerText: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: BrandColors.deepForestGreen,
    textAlign: 'center',
    minHeight: 48,
  },
  spinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: BrandColors.primaryGreen,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.pill,
    width: '100%',
    shadowColor: BrandColors.deepForestGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  spinButtonDisabled: {
    opacity: 0.6,
  },
  spinButtonText: {
    color: BrandColors.white,
    fontSize: Typography.sizes.md,
    fontWeight: '700',
  },
  winnerCard: {
    backgroundColor: BrandColors.white,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: BrandColors.primaryGreen,
    gap: Spacing.md,
  },
  winnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BrandColors.primaryGreen,
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.pill,
  },
  winnerBadgeText: {
    color: BrandColors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  winnerAreaText: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.mutedGrey,
  },
  winnerName: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: BrandColors.deepForestGreen,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  ratingText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  cuisinesText: {
    fontSize: Typography.sizes.sm,
    color: BrandColors.mutedGrey,
  },
  perkHighlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  valetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0F5132',
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.sm,
  },
  valetBadgeText: {
    color: BrandColors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  cardDealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1E7DD',
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.sm,
  },
  cardDealBadgeText: {
    color: BrandColors.deepForestGreen,
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  heroDishesBox: {
    backgroundColor: BrandColors.warmCream,
    padding: Spacing.sm,
    borderRadius: Radii.md,
    gap: 2,
  },
  heroDishesLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  heroDishesText: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.deepForestGreen,
  },
  actionButtonsCol: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: BrandColors.deepForestGreen,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  viewDetailsBtnText: {
    color: BrandColors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
  },
  shareWhatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#25D366',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  shareWhatsAppBtnText: {
    color: '#075E54',
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
  },
  shareFeedbackText: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.primaryGreen,
    textAlign: 'center',
  },
});
