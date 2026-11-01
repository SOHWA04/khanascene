import React, { useMemo, useState } from 'react';
import {
  Animated,
  Platform,
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

import { EasyBillSplitterModal } from '@/components/EasyBillSplitterModal';
import { GoogleAttributionBadge } from '@/components/GoogleAttributionBadge';
import {
  ErrorStateBlock,
  LoadingStateBlock,
} from '@/components/StateFeedbackBlocks';
import { CAMPUS_HUBS, INITIAL_CITIES } from '@/config';
import { restaurantRepository } from '@/repositories/restaurantRepository';
import { usePollStore } from '@/stores/usePollStore';
import { usePreferencesStore } from '@/stores/usePreferencesStore';
import { BrandColors, Radii, Spacing, Typography, VIBE_DEFINITIONS } from '@/theme';
import { RestaurantDiscoveryItem } from '@/types/restaurant';
import { openWhatsAppShare } from '@/utils/whatsapp';

export default function KhanaMatchScreen() {
  const { selectedCity } = usePreferencesStore();
  const activeCity = INITIAL_CITIES[selectedCity];
  const { addCandidate, candidatePlaceIds } = usePollStore();

  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null);

  // Deck index & match history
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedRestaurants, setLikedRestaurants] = useState<RestaurantDiscoveryItem[]>([]);
  const [matchedRestaurant, setMatchedRestaurant] = useState<RestaurantDiscoveryItem | null>(null);
  const [showBillSplitter, setShowBillSplitter] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Simple swipe animation value
  const [cardScale] = useState(() => new Animated.Value(1));

  // Query restaurants based on selected filters
  const { data: deck = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['khana-match-deck', selectedCity, selectedVibe, selectedCampusId],
    queryFn: async () => {
      const res = await restaurantRepository.searchRestaurants({
        query: '',
        cityId: selectedCity,
        areaId: null,
        cuisineSlug: null,
        minRating: null,
        minReviewCount: null,
        budgetOnly: false,
        openNowOnly: false,
        familyFriendlyOnly: false,
        nearMeOnly: false,
        vibe: selectedVibe,
        campusId: selectedCampusId,
        sortBy: 'relevance',
      });
      return res.items;
    },
  });

  const currentItem = useMemo(() => {
    if (currentIndex >= deck.length) return null;
    return deck[currentIndex];
  }, [deck, currentIndex]);

  const handleNextCard = () => {
    Animated.sequence([
      Animated.timing(cardScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(cardScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePass = () => {
    handleNextCard();
  };

  const handleLike = (item: RestaurantDiscoveryItem) => {
    const updated = [...likedRestaurants, item];
    setLikedRestaurants(updated);
    // Trigger match celebration on like
    setMatchedRestaurant(item);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setMatchedRestaurant(null);
  };

  const handleShareMatchToWhatsApp = async () => {
    if (!matchedRestaurant) return;
    const name = matchedRestaurant.googleData.name;
    const hood = matchedRestaurant.googleData.neighbourhood || activeCity.name;
    const dish = matchedRestaurant.khanaSceneData?.heroDishes?.[0];
    const maps = matchedRestaurant.googleData.googleMapsUri;

    let msg = `🔥 *IT'S A KHANA MATCH!* 🎉\n\n`;
    msg += `We matched on tonight's scene:\n`;
    msg += `📍 *${name}* (${hood})\n`;
    if (dish) {
      msg += `🍔 Must-order: *${dish}*\n`;
    }
    if (matchedRestaurant.googleData.googleRating) {
      msg += `★ Rating: ${matchedRestaurant.googleData.googleRating.toFixed(1)}/5\n`;
    }
    msg += `\nScene on hai? Gaari nikaalo! 🚗💨\n`;
    if (maps) {
      msg += `Directions: ${maps}\n`;
    }
    msg += `\n_Matched via KhanaScene (khanascene.pk)_`;

    const sent = await openWhatsAppShare(msg);
    if (sent) {
      setShareFeedback('WhatsApp opened! Shared match with friends.');
    } else {
      setShareFeedback('Could not open WhatsApp.');
    }
    setTimeout(() => setShareFeedback(null), 3500);
  };

  const handleAddToPoll = (item: RestaurantDiscoveryItem) => {
    addCandidate(item.placeId);
    setShareFeedback(`Added ${item.googleData.name} to Group Poll! 🗳️`);
    setTimeout(() => setShareFeedback(null), 3000);
  };

  const relevantCampuses = useMemo(() => {
    return CAMPUS_HUBS.filter((c) => c.cityId === selectedCity);
  }, [selectedCity]);

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
            <View style={styles.titleRow}>
              <Text style={styles.headerTitle}>Khana Match</Text>
              <View style={styles.flameBadge}>
                <Ionicons name="flame" size={14} color="#FFFFFF" />
                <Text style={styles.flameBadgeText}>HOT</Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>
              Swipe right on what you crave. Settle the scene in 30 seconds!
            </Text>
          </View>
        </View>

        {/* Campus & Vibe Quick Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Vibe Check:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}>
            <Pressable
              onPress={() => {
                setSelectedVibe(null);
                setCurrentIndex(0);
              }}
              style={[styles.vibeChip, selectedVibe === null && styles.vibeChipActive]}>
              <Text style={[styles.vibeChipText, selectedVibe === null && styles.vibeChipTextActive]}>
                ✨ All Vibes
              </Text>
            </Pressable>
            {VIBE_DEFINITIONS.map((vibe) => {
              const isSelected = selectedVibe === vibe.id;
              return (
                <Pressable
                  key={vibe.id}
                  onPress={() => {
                    setSelectedVibe(isSelected ? null : vibe.id);
                    setCurrentIndex(0);
                  }}
                  style={[styles.vibeChip, isSelected && styles.vibeChipActive]}>
                  <Text style={[styles.vibeChipText, isSelected && styles.vibeChipTextActive]}>
                    {vibe.shortLabel}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {relevantCampuses.length > 0 && (
            <>
              <Text style={[styles.filterLabel, { marginTop: Spacing.xs }]}>Campus Hub:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}>
                <Pressable
                  onPress={() => {
                    setSelectedCampusId(null);
                    setCurrentIndex(0);
                  }}
                  style={[styles.campusChip, selectedCampusId === null && styles.campusChipActive]}>
                  <Text
                    style={[
                      styles.campusChipText,
                      selectedCampusId === null && styles.campusChipTextActive,
                    ]}>
                    All {activeCity.name}
                  </Text>
                </Pressable>
                {relevantCampuses.map((campus) => {
                  const isSelected = selectedCampusId === campus.id;
                  return (
                    <Pressable
                      key={campus.id}
                      onPress={() => {
                        setSelectedCampusId(isSelected ? null : campus.id);
                        setCurrentIndex(0);
                      }}
                      style={[styles.campusChip, isSelected && styles.campusChipActive]}>
                      <Text
                        style={[
                          styles.campusChipText,
                          isSelected && styles.campusChipTextActive,
                        ]}>
                        🎓 {campus.shortName}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          )}
        </View>

        {/* Content Body */}
        {isLoading ? (
          <LoadingStateBlock label="Loading hot food spots for your vibe..." />
        ) : isError ? (
          <ErrorStateBlock message="Failed to load food deck." onRetry={() => refetch()} />
        ) : matchedRestaurant ? (
          /* Match Celebration View */
          <View style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <View style={styles.matchHypeBadge}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                <Text style={styles.matchHypeBadgeText}>IT&apos;S A MATCH!</Text>
              </View>
              <Text style={styles.matchSubtitleText}>Tonight&apos;s scene is officially locked in 🎉</Text>
            </View>

            <View style={styles.matchDetailsBox}>
              <Text style={styles.matchNameText}>{matchedRestaurant.googleData.name}</Text>
              <Text style={styles.matchAreaText}>
                {matchedRestaurant.googleData.neighbourhood || activeCity.name}
              </Text>

              {matchedRestaurant.googleData.googleRating != null && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={styles.matchRatingText}>
                    {matchedRestaurant.googleData.googleRating.toFixed(1)} / 5 (Google Reviews)
                  </Text>
                </View>
              )}

              {matchedRestaurant.khanaSceneData?.heroDishes &&
                matchedRestaurant.khanaSceneData.heroDishes.length > 0 && (
                  <View style={styles.heroDishBox}>
                    <Text style={styles.heroDishLabel}>🍔 Signature Must-Order:</Text>
                    <Text style={styles.heroDishText}>
                      {matchedRestaurant.khanaSceneData.heroDishes.join(', ')}
                    </Text>
                  </View>
                )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionCol}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share match on WhatsApp"
                onPress={handleShareMatchToWhatsApp}
                style={styles.shareMatchBtn}>
                <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
                <Text style={styles.shareMatchBtnText}>Share Match with Friends</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Split the bill"
                onPress={() => setShowBillSplitter(true)}
                style={styles.splitBillBtn}>
                <Ionicons name="flash" size={16} color="#047857" />
                <Text style={styles.splitBillBtnText}>Split Bill & Contri (Easypaisa)</Text>
              </Pressable>

              <View style={styles.secondaryActionsRow}>
                <Pressable
                  onPress={() => handleAddToPoll(matchedRestaurant)}
                  style={styles.secondaryBtn}>
                  <Ionicons name="chatbubbles-outline" size={15} color="#0E382C" />
                  <Text style={styles.secondaryBtnText}>
                    {candidatePlaceIds.includes(matchedRestaurant.placeId)
                      ? 'In Poll 🗳️'
                      : 'Add to Poll'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setMatchedRestaurant(null);
                    handleNextCard();
                  }}
                  style={[styles.secondaryBtn, styles.secondaryBtnDark]}>
                  <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
                  <Text style={[styles.secondaryBtnText, { color: '#FFFFFF' }]}>Keep Swiping</Text>
                </Pressable>
              </View>
            </View>

            {shareFeedback ? (
              <Text style={styles.shareFeedbackText}>{shareFeedback}</Text>
            ) : null}
          </View>
        ) : !currentItem ? (
          /* Deck Complete View */
          <View style={styles.emptyDeckCard}>
            <Ionicons name="checkmark-done-circle-outline" size={60} color="#047857" />
            <Text style={styles.emptyDeckTitle}>You&apos;ve checked all the spots!</Text>
            <Text style={styles.emptyDeckSubtitle}>
              {likedRestaurants.length > 0
                ? `You liked ${likedRestaurants.length} places. Ready to make a scene?`
                : 'Try picking a different campus or vibe filter to discover more places.'}
            </Text>
            <View style={styles.emptyDeckBtnRow}>
              <Pressable onPress={handleRestart} style={styles.restartBtn}>
                <Ionicons name="refresh" size={16} color="#FFFFFF" />
                <Text style={styles.restartBtnText}>Shuffle & Swipe Again</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* Active Swipe Card */
          <Animated.View style={[styles.swipeCard, { transform: [{ scale: cardScale }] }]}>
            {/* Top Tag Row */}
            <View style={styles.cardHeader}>
              <View style={styles.neighbourhoodPill}>
                <Ionicons name="location-outline" size={12} color="#0E382C" />
                <Text style={styles.neighbourhoodPillText}>
                  {currentItem.googleData.neighbourhood || activeCity.name}
                </Text>
              </View>

              {currentItem.googleData.openNow === true && (
                <View style={styles.openNowBadge}>
                  <View style={styles.liveGreenDot} />
                  <Text style={styles.openNowText}>OPEN NOW</Text>
                </View>
              )}
            </View>

            {/* Restaurant Name */}
            <Text style={styles.cardRestaurantName}>{currentItem.googleData.name}</Text>

            {/* Ratings & Price */}
            <View style={styles.cardMetaRow}>
              {currentItem.googleData.googleRating != null && (
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={styles.ratingBadgeText}>
                    {currentItem.googleData.googleRating.toFixed(1)}
                  </Text>
                </View>
              )}

              {currentItem.khanaSceneData?.priceMinPkr != null ? (
                <Text style={styles.priceEstimateText}>
                  Rs {currentItem.khanaSceneData.priceMinPkr} –{' '}
                  {currentItem.khanaSceneData.priceMaxPkr ?? 1200} / person
                </Text>
              ) : (
                <Text style={styles.priceEstimateText}>Student Budget Friendly</Text>
              )}
            </View>

            {/* Hero Dishes */}
            {currentItem.khanaSceneData?.heroDishes &&
              currentItem.khanaSceneData.heroDishes.length > 0 && (
                <View style={styles.dishesWrap}>
                  <Text style={styles.dishesHeading}>Famous for:</Text>
                  <View style={styles.dishesChipRow}>
                    {currentItem.khanaSceneData.heroDishes.map((dish, i) => (
                      <View key={i} style={styles.dishChip}>
                        <Text style={styles.dishChipText}>✨ {dish}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

            {/* Bank Card Deals */}
            {currentItem.khanaSceneData?.cardDeals &&
              currentItem.khanaSceneData.cardDeals.length > 0 && (
                <View style={styles.cardDealBanner}>
                  <Ionicons name="card-outline" size={14} color="#065F46" />
                  <Text style={styles.cardDealBannerText}>
                    {currentItem.khanaSceneData.cardDeals[0].bankName}{' '}
                    {currentItem.khanaSceneData.cardDeals[0].discountPercentage}% Discount
                  </Text>
                </View>
              )}

            {/* Swiper Controls */}
            <View style={styles.controlButtonsRow}>
              {/* Pass / Dislike */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Pass restaurant"
                onPress={handlePass}
                style={styles.passBtn}>
                <Ionicons name="close" size={26} color="#EF4444" />
              </Pressable>

              {/* View details shortcut */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View restaurant menu"
                onPress={() =>
                  router.push({
                    pathname: '/restaurant/[placeId]',
                    params: { placeId: currentItem.placeId },
                  })
                }
                style={styles.menuShortcutBtn}>
                <Ionicons name="receipt-outline" size={20} color="#64748B" />
              </Pressable>

              {/* Like / Match Flame */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Like and match restaurant"
                onPress={() => handleLike(currentItem)}
                style={styles.likeBtn}>
                <Ionicons name="flame" size={32} color="#FFFFFF" />
              </Pressable>
            </View>

            <Text style={styles.swipeHintText}>
              Tap ❌ to skip • Tap 🔥 to lock in the match
            </Text>
          </Animated.View>
        )}

        {/* Bill Splitter Modal */}
        <EasyBillSplitterModal
          visible={showBillSplitter}
          onClose={() => setShowBillSplitter(false)}
          initialTitle={matchedRestaurant?.googleData.name || 'Khana Match Dawat'}
        />

        <GoogleAttributionBadge notice="Khana Match dynamically curates local dining spots based on crowd favorites and student vibes." />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0F0D', // Sleek dark canvas for Gen Z drip
  },
  container: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backBtn: {
    padding: Spacing.xs,
    backgroundColor: '#161F1A',
    borderRadius: Radii.pill,
  },
  headerTitleBox: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  flameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EF4444',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radii.pill,
  },
  flameBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  headerSubtitle: {
    fontSize: Typography.sizes.xs,
    color: '#94A3B8',
    marginTop: 2,
  },
  filterSection: {
    gap: 6,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    gap: 6,
  },
  vibeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    backgroundColor: '#161F1A',
    borderWidth: 1,
    borderColor: '#24332B',
  },
  vibeChipActive: {
    backgroundColor: '#00F59B',
    borderColor: '#00F59B',
  },
  vibeChipText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  vibeChipTextActive: {
    color: '#0A0F0D',
    fontWeight: '800',
  },
  campusChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    backgroundColor: '#161F1A',
    borderWidth: 1,
    borderColor: '#24332B',
  },
  campusChipActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  campusChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  campusChipTextActive: {
    color: '#0A0F0D',
    fontWeight: '800',
  },
  swipeCard: {
    backgroundColor: '#161F1A',
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: '#24332B',
    gap: Spacing.md,
    ...Platform.select({
      web: {
        boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
      },
      default: {
        elevation: 8,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  neighbourhoodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF4F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  neighbourhoodPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0E382C',
  },
  openNowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00F59B',
  },
  openNowText: {
    color: '#00F59B',
    fontSize: 10,
    fontWeight: '800',
  },
  cardRestaurantName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 30,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#272F2B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  ratingBadgeText: {
    color: '#F8FAFC',
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
  },
  priceEstimateText: {
    fontSize: Typography.sizes.xs,
    color: '#94A3B8',
  },
  dishesWrap: {
    gap: 6,
    backgroundColor: '#1E2A23',
    padding: Spacing.md,
    borderRadius: Radii.md,
  },
  dishesHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00F59B',
  },
  dishesChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dishChip: {
    backgroundColor: '#25352C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  dishChipText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  cardDealBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: Radii.md,
  },
  cardDealBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  controlButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  passBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2A1C20',
    borderWidth: 2,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuShortcutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#222F28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#00F59B',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 0 20px rgba(0, 245, 155, 0.5)',
      },
      default: {
        elevation: 6,
      },
    }),
  },
  swipeHintText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  matchCard: {
    backgroundColor: '#161F1A',
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: '#00F59B',
    gap: Spacing.lg,
  },
  matchHeader: {
    alignItems: 'center',
    gap: 8,
  },
  matchHypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radii.pill,
  },
  matchHypeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  matchSubtitleText: {
    fontSize: Typography.sizes.sm,
    color: '#94A3B8',
    textAlign: 'center',
  },
  matchDetailsBox: {
    backgroundColor: '#1E2A23',
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    gap: 8,
  },
  matchNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  matchAreaText: {
    fontSize: Typography.sizes.xs,
    color: '#00F59B',
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchRatingText: {
    fontSize: Typography.sizes.xs,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  heroDishBox: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#283A31',
    gap: 2,
  },
  heroDishLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  heroDishText: {
    fontSize: Typography.sizes.xs,
    color: '#F8FAFC',
  },
  actionCol: {
    gap: Spacing.sm,
  },
  shareMatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: Radii.md,
  },
  shareMatchBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
  },
  splitBillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingVertical: 14,
    borderRadius: Radii.md,
  },
  splitBillBtnText: {
    color: '#047857',
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: Radii.md,
  },
  secondaryBtnDark: {
    backgroundColor: '#25352C',
  },
  secondaryBtnText: {
    color: '#0E382C',
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  emptyDeckCard: {
    backgroundColor: '#161F1A',
    borderRadius: Radii.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  emptyDeckTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emptyDeckSubtitle: {
    fontSize: Typography.sizes.sm,
    color: '#94A3B8',
    textAlign: 'center',
  },
  emptyDeckBtnRow: {
    marginTop: Spacing.sm,
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00F59B',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  restartBtnText: {
    color: '#0A0F0D',
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
  },
  shareFeedbackText: {
    fontSize: Typography.sizes.xs,
    color: '#00F59B',
    textAlign: 'center',
    marginTop: 4,
  },
});
