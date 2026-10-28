import React, { useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { BillEstimatorModal } from '@/components/BillEstimatorModal';
import { ComparisonTrayBar } from '@/components/ComparisonTrayBar';
import { GoogleAttributionBadge } from '@/components/GoogleAttributionBadge';
import {
  EmptyStateBlock,
  ErrorStateBlock,
  LoadingStateBlock,
} from '@/components/StateFeedbackBlocks';
import { WhatsAppInquiryModal } from '@/components/WhatsAppInquiryModal';
import { communityRepository } from '@/repositories/communityRepository';
import { restaurantRepository } from '@/repositories/restaurantRepository';
import { useAuthStore } from '@/stores/useAuthStore';
import { useComparisonStore } from '@/stores/useComparisonStore';
import { useSavedStore } from '@/stores/useSavedStore';
import { BillItem } from '@/utils/billEstimator';
import {
  calculateBayesianScore,
  formatGooglePriceLevel,
  formatPkrRange,
} from '@/utils/ranking';
import { BrandColors, Radii, Spacing, Typography } from '@/theme';

export default function RestaurantDetailScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const resolvedPlaceId = placeId ?? 'unknown';

  const { isPlaceSaved, toggleSavedPlace } = useSavedStore();
  const { selectedPlaceIds, toggleComparisonPlace } = useComparisonStore();
  const { user } = useAuthStore();
  const saved = isPlaceSaved(resolvedPlaceId);
  const inComparison = selectedPlaceIds.includes(resolvedPlaceId);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [overallRating, setOverallRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);
  const [reportFeedback, setReportFeedback] = useState<string | null>(null);

  // Menu update suggestion state
  const [showMenuUpdateForm, setShowMenuUpdateForm] = useState(false);
  const [updateDishName, setUpdateDishName] = useState('');
  const [updatePricePkr, setUpdatePricePkr] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [menuUpdateFeedback, setMenuUpdateFeedback] = useState<string | null>(null);
  const [isSubmittingMenuUpdate, setIsSubmittingMenuUpdate] = useState(false);

  // Restaurant owner claim state
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimantName, setClaimantName] = useState('');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [claimantRole, setClaimantRole] = useState('');
  const [claimNotes, setClaimNotes] = useState('');
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  // WhatsApp table inquiry state
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  // Bill & tax estimator state
  const [showBillEstimator, setShowBillEstimator] = useState(false);
  const [estimatorInitialItems, setEstimatorInitialItems] = useState<BillItem[]>([]);

  const { data: item, isLoading, isError, refetch } = useQuery({
    queryKey: ['restaurant-detail', resolvedPlaceId],
    queryFn: () => restaurantRepository.getRestaurantByPlaceId(resolvedPlaceId),
  });

  const allMenuItems = useMemo(() => {
    return item?.khanaSceneData?.menus?.flatMap((m) => m.items) ?? [];
  }, [item?.khanaSceneData?.menus]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingStateBlock label="Loading restaurant details..." />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <ErrorStateBlock
          message="Could not load details for this restaurant."
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  if (!item) {
    const encoded = encodeURIComponent(resolvedPlaceId);
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <EmptyStateBlock
          title="Restaurant details not found in current mode"
          message={`Place ID "${resolvedPlaceId}" was not found in the active dataset. You can view this place directly on Google Maps.`}
          actionLabel="Open on Google Maps"
          onAction={() =>
            Linking.openURL(
              `https://www.google.com/maps/search/?api=1&query=${encoded}&query_place_id=${encoded}`
            )
          }
        />
        <GoogleAttributionBadge />
      </ScrollView>
    );
  }

  const { googleData, khanaSceneData, isFixtureData } = item;
  const contactPhone = khanaSceneData?.phoneNumber || googleData.nationalPhoneNumber;

  const openDirections = () => {
    const uri =
      googleData.googleMapsDirectionsUri ??
      googleData.googleMapsUri ??
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleData.name)}`;
    Linking.openURL(uri);
  };

  const openGoogleMapsListing = () => {
    Linking.openURL(googleData.googleMapsUri);
  };

  const openPhoneDialer = () => {
    if (googleData.nationalPhoneNumber) {
      Linking.openURL(`tel:${googleData.nationalPhoneNumber.replace(/\s+/g, '')}`);
    }
  };

  const openOfficialWebsite = () => {
    if (googleData.websiteUri) {
      Linking.openURL(googleData.websiteUri);
    }
  };

  const khanaSceneAdjustedScore =
    khanaSceneData?.khanaSceneRatingAvg && khanaSceneData?.khanaSceneReviewCount
      ? calculateBayesianScore({
          averageRating: khanaSceneData.khanaSceneRatingAvg,
          reviewCount: khanaSceneData.khanaSceneReviewCount,
        })
      : null;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ComparisonTrayBar />

      {/* Header Section */}
      <View style={styles.heroCard}>
        <View style={styles.badgeRow}>
          {khanaSceneData?.isKhanaScenePick ? (
            <View style={styles.pickBadge}>
              <Ionicons name="sparkles" size={13} color={BrandColors.deepForestGreen} />
              <Text style={styles.pickBadgeText}>KhanaScene Pick</Text>
            </View>
          ) : null}
          {isFixtureData ? (
            <View style={styles.fixtureBadge}>
              <Text style={styles.fixtureBadgeText}>DEV FIXTURE</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.restaurantName}>{googleData.name}</Text>
        <Text style={styles.categoryLine}>
          {googleData.primaryCategory ?? 'Category unavailable'}
          {googleData.neighbourhood ? ` • ${googleData.neighbourhood}` : ''}
        </Text>

        {/* Explicitly Separated Ratings Box */}
        <View style={styles.ratingsGrid}>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingSourceLabel}>GOOGLE MAPS RATING</Text>
            <View style={styles.ratingMainRow}>
              <Ionicons name="star" size={18} color={BrandColors.saffronAccent} />
              <Text style={styles.ratingBigNumber}>
                {googleData.googleRating != null
                  ? googleData.googleRating.toFixed(1)
                  : 'N/A'}
              </Text>
            </View>
            <Text style={styles.ratingSubText}>
              {googleData.googleReviewCount != null
                ? `${googleData.googleReviewCount.toLocaleString()} Google reviews`
                : 'Review count unavailable'}
            </Text>
          </View>

          <View style={styles.ratingBox}>
            <Text style={styles.ratingSourceLabel}>KHANASCENE RATING</Text>
            <View style={styles.ratingMainRow}>
              <Ionicons name="ribbon" size={18} color={BrandColors.primaryGreen} />
              <Text style={styles.ratingBigNumber}>
                {khanaSceneAdjustedScore != null
                  ? khanaSceneAdjustedScore.toFixed(2)
                  : 'No reviews yet'}
              </Text>
            </View>
            <Text style={styles.ratingSubText}>
              {khanaSceneData?.khanaSceneReviewCount
                ? `${khanaSceneData.khanaSceneReviewCount} KhanaScene reviews (Bayesian)`
                : 'Separate from Google ratings'}
            </Text>
          </View>
        </View>

        {/* Address, Price & Opening Status */}
        <View style={styles.metaList}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={18} color={BrandColors.primaryGreen} />
            <Text style={styles.metaText}>
              {googleData.formattedAddress ?? 'Address unavailable'}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="wallet-outline" size={18} color={BrandColors.primaryGreen} />
            <Text style={styles.metaText}>
              Google Price Level: {formatGooglePriceLevel(googleData.priceLevel)}
              {khanaSceneData?.priceMinPkr || khanaSceneData?.priceMaxPkr
                ? ` • Verified Menu Range: ${formatPkrRange(
                    khanaSceneData?.priceMinPkr,
                    khanaSceneData?.priceMaxPkr
                  )}`
                : ''}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={18} color={BrandColors.primaryGreen} />
            <Text style={styles.metaText}>
              {googleData.openNow === true
                ? 'Currently Open'
                : googleData.openNow === false
                  ? 'Currently Closed'
                  : 'Current opening status unavailable'}
            </Text>
          </View>
        </View>

        {/* Action Buttons — Only offer Call / Website / WhatsApp when real data exists */}
        <View style={styles.actionButtonsWrap}>
          {contactPhone ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Inquire table availability via WhatsApp"
              onPress={() => setShowWhatsAppModal(true)}
              style={styles.whatsAppActionBtn}>
              <Ionicons name="logo-whatsapp" size={16} color={BrandColors.white} />
              <Text style={styles.whatsAppActionText}>Book via WhatsApp</Text>
            </Pressable>
          ) : null}

          <Pressable onPress={openDirections} style={styles.primaryActionBtn}>
            <Ionicons name="navigate" size={16} color={BrandColors.white} />
            <Text style={styles.primaryActionText}>Directions</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Estimate Bill & Taxes"
            onPress={() => {
              setEstimatorInitialItems([]);
              setShowBillEstimator(true);
            }}
            style={styles.secondaryActionBtn}>
            <Ionicons name="calculator-outline" size={16} color={BrandColors.deepForestGreen} />
            <Text style={styles.secondaryActionText}>Estimate Bill</Text>
          </Pressable>

          {googleData.nationalPhoneNumber ? (
            <Pressable onPress={openPhoneDialer} style={styles.secondaryActionBtn}>
              <Ionicons name="call-outline" size={16} color={BrandColors.deepForestGreen} />
              <Text style={styles.secondaryActionText}>Call</Text>
            </Pressable>
          ) : null}

          {googleData.websiteUri ? (
            <Pressable onPress={openOfficialWebsite} style={styles.secondaryActionBtn}>
              <Ionicons name="globe-outline" size={16} color={BrandColors.deepForestGreen} />
              <Text style={styles.secondaryActionText}>Visit Website</Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={() => toggleSavedPlace(item.placeId)}
            style={[styles.secondaryActionBtn, saved && styles.savedActiveBtn]}>
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={16}
              color={saved ? BrandColors.white : BrandColors.deepForestGreen}
            />
            <Text style={[styles.secondaryActionText, saved && styles.savedActiveText]}>
              {saved ? 'Saved' : 'Save to Favourites'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => toggleComparisonPlace(item.placeId)}
            style={[styles.secondaryActionBtn, inComparison && styles.savedActiveBtn]}>
            <Ionicons
              name="git-compare-outline"
              size={16}
              color={inComparison ? BrandColors.white : BrandColors.deepForestGreen}
            />
            <Text
              style={[
                styles.secondaryActionText,
                inComparison && styles.savedActiveText,
              ]}>
              {inComparison ? 'In Comparison' : 'Add to Compare'}
            </Text>
          </Pressable>

          <Pressable onPress={openGoogleMapsListing} style={styles.secondaryActionBtn}>
            <Ionicons name="map-outline" size={16} color={BrandColors.deepForestGreen} />
            <Text style={styles.secondaryActionText}>View on Google Maps</Text>
          </Pressable>
        </View>
      </View>

      {/* Section 1: Overview */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>1. Overview</Text>
        {khanaSceneData?.pickReason ? (
          <Text style={styles.pickCallout}>{khanaSceneData.pickReason}</Text>
        ) : null}
        <Text style={styles.bodyText}>
          Cuisines:{' '}
          {khanaSceneData?.cuisines?.length
            ? khanaSceneData.cuisines.join(', ')
            : googleData.primaryCategory ?? 'Not specified'}
        </Text>
        <Text style={styles.bodyText}>
          Family-friendly facilities:{' '}
          {khanaSceneData?.isFamilyFriendly === true
            ? 'Verified Family Dining Area'
            : 'Unverified / Not specified'}
        </Text>
        <Text style={styles.bodyText}>
          Parking:{' '}
          {khanaSceneData?.hasValet
            ? '🚗 Valet Parking Available'
            : khanaSceneData?.parkingType === 'dedicated_lot'
              ? '🅿️ Dedicated Parking Lot'
              : khanaSceneData?.parkingType === 'street_moderate'
                ? 'Street Parking (Usually Available)'
                : khanaSceneData?.parkingType === 'street_crowded'
                  ? '⚠️ Crowded Street Parking (Plan Ahead)'
                  : 'Parking information unavailable'}
        </Text>

        {/* Hero Dishes Callout */}
        {khanaSceneData?.heroDishes && khanaSceneData.heroDishes.length > 0 ? (
          <View style={styles.heroDishesCard}>
            <View style={styles.heroDishesCardHeader}>
              <Ionicons name="sparkles" size={13} color="#92400E" />
              <Text style={styles.heroDishesCardTitle}>MUST-TRY HERO DISHES</Text>
            </View>
            <View style={styles.heroDishesChipsWrap}>
              {khanaSceneData.heroDishes.map((dish) => (
                <View key={dish} style={styles.heroDishChip}>
                  <Text style={styles.heroDishChipText}>⭐ {dish}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      {/* Section: Bank Card Discounts & Deals */}
      {khanaSceneData?.cardDeals && khanaSceneData.cardDeals.length > 0 ? (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.dealSectionHeader}>
              <Ionicons name="card" size={18} color="#B45309" />
              <Text style={styles.sectionTitle}>Bank Card Discounts</Text>
            </View>
            <View style={styles.dealCountBadge}>
              <Text style={styles.dealCountBadgeText}>
                {khanaSceneData.cardDeals.length} active {khanaSceneData.cardDeals.length === 1 ? 'deal' : 'deals'}
              </Text>
            </View>
          </View>

          <Text style={styles.bodyText}>
            Avail these verified discounts by paying with eligible debit/credit cards at checkout.
          </Text>

          <View style={styles.dealList}>
            {khanaSceneData.cardDeals.map((deal) => (
              <View key={deal.id} style={styles.dealCard}>
                <View style={styles.dealTopRow}>
                  <View style={styles.dealBankBadge}>
                    <Text style={styles.dealBankText}>{deal.bankName}</Text>
                  </View>
                  <View style={styles.dealPercentBadge}>
                    <Text style={styles.dealPercentText}>{deal.discountPercentage}% OFF</Text>
                  </View>
                </View>

                <Text style={styles.dealTierText}>Tier: {deal.cardTier}</Text>

                <View style={styles.dealMetaRow}>
                  <Ionicons name="calendar-outline" size={13} color={BrandColors.mutedGrey} />
                  <Text style={styles.dealMetaText}>
                    Days: {deal.applicableDays.length === 7 ? 'All Days (Mon-Sun)' : deal.applicableDays.join(', ')}
                  </Text>
                </View>

                {deal.maxDiscountPkr ? (
                  <View style={styles.dealMetaRow}>
                    <Ionicons name="wallet-outline" size={13} color={BrandColors.mutedGrey} />
                    <Text style={styles.dealMetaText}>
                      Max discount: PKR {deal.maxDiscountPkr.toLocaleString()}
                      {deal.minSpendPkr ? ` • Min spend: PKR ${deal.minSpendPkr.toLocaleString()}` : ''}
                    </Text>
                  </View>
                ) : null}

                {deal.terms ? (
                  <Text style={styles.dealTermsText}>*{deal.terms}</Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Section 2: Google Reviews */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>2. Google Reviews</Text>
          <Pressable onPress={openGoogleMapsListing}>
            <Text style={styles.externalLinkText}>View all on Google Maps</Text>
          </Pressable>
        </View>
        <Text style={styles.policyNotice}>
          Displaying permitted reviews returned by Google Places API in Google&apos;s default
          ordering. Reviews are not verified by KhanaScene.
        </Text>

        {googleData.reviews && googleData.reviews.length > 0 ? (
          <View style={styles.reviewList}>
            {googleData.reviews.map((rev) => (
              <View key={rev.name} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View style={styles.authorAvatar}>
                    <Ionicons name="person" size={14} color={BrandColors.deepForestGreen} />
                  </View>
                  <View style={styles.authorMeta}>
                    <Pressable
                      disabled={!rev.authorAttribution.uri}
                      onPress={() =>
                        rev.authorAttribution.uri &&
                        Linking.openURL(rev.authorAttribution.uri)
                      }>
                      <Text style={styles.authorName}>
                        {rev.authorAttribution.displayName}
                      </Text>
                    </Pressable>
                    <Text style={styles.reviewTime}>
                      {rev.relativePublishTimeDescription} • Rating: {rev.rating}/5
                    </Text>
                  </View>
                  {rev.googleMapsUri ? (
                    <Pressable onPress={() => Linking.openURL(rev.googleMapsUri!)}>
                      <Text style={styles.sourceLink}>Source</Text>
                    </Pressable>
                  ) : null}
                </View>
                {rev.text?.text ? (
                  <Text style={styles.reviewBody}>{rev.text.text}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyNotice}>
            No individual Google review snippets returned in this response. Tap &quot;View all on
            Google Maps&quot; to read the full review listing on Google Maps.
          </Text>
        )}
      </View>

      {/* Section 3: Menu & Verified Prices */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>3. Menu & Verified Prices (PKR)</Text>
          <Pressable onPress={() => setShowMenuUpdateForm((v) => !v)}>
            <Text style={styles.externalLinkText}>
              {showMenuUpdateForm ? 'Cancel' : 'Suggest Price Update'}
            </Text>
          </Pressable>
        </View>

        {/* Estimator Banner Callout */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open Bill, Tax and Bank Discount Estimator"
          onPress={() => {
            setEstimatorInitialItems([]);
            setShowBillEstimator(true);
          }}
          style={styles.estimatorBannerBtn}>
          <View style={styles.estimatorBannerLeft}>
            <View style={styles.estimatorBannerIcon}>
              <Ionicons name="calculator" size={16} color={BrandColors.deepForestGreen} />
            </View>
            <View style={styles.estimatorBannerTextWrap}>
              <Text style={styles.estimatorBannerTitle}>Estimate Bill, Taxes & Bank Deals</Text>
              <Text style={styles.estimatorBannerSubtitle}>
                Add dishes, calculate 16% GST, apply card discounts & split bill
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={BrandColors.primaryGreen} />
        </Pressable>

        {khanaSceneData?.menus && khanaSceneData.menus.length > 0 ? (
          khanaSceneData.menus.map((menu) => (
            <View key={menu.id} style={styles.menuBlock}>
              <Text style={styles.menuSubtitle}>
                {menu.name} • Verified: {menu.lastVerifiedAt}
              </Text>
              {menu.items.map((menuItem) => (
                <View key={menuItem.id} style={styles.menuItemRow}>
                  <View style={styles.menuItemTextCol}>
                    <View style={styles.menuItemNameRow}>
                      <Text style={styles.menuItemName}>{menuItem.name}</Text>
                      {menuItem.isSignature ? (
                        <View style={styles.signatureBadge}>
                          <Ionicons name="star" size={10} color="#B45309" />
                          <Text style={styles.signatureBadgeText}>Signature</Text>
                        </View>
                      ) : null}
                    </View>
                    {menuItem.description ? (
                      <Text style={styles.menuItemDesc}>{menuItem.description}</Text>
                    ) : null}
                  </View>
                  <View style={styles.menuItemPriceWrap}>
                    <Text style={styles.menuItemPrice}>
                      Rs {menuItem.pricePkr.toLocaleString('en-PK')}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Estimate ${menuItem.name}`}
                      onPress={() => {
                        setEstimatorInitialItems([
                          {
                            id: menuItem.id,
                            name: menuItem.name,
                            pricePkr: menuItem.pricePkr,
                            quantity: 1,
                          },
                        ]);
                        setShowBillEstimator(true);
                      }}
                      style={styles.menuItemAddBtn}>
                      <Ionicons name="add" size={12} color={BrandColors.deepForestGreen} />
                      <Text style={styles.menuItemAddText}>Estimate</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.emptyNotice}>
            No verified dine-in menu items on file yet for this restaurant. Have you visited recently?
            You can suggest updated dish prices below.
          </Text>
        )}

        {/* Suggest Menu Update Form */}
        {showMenuUpdateForm ? (
          <View style={styles.reviewFormBox}>
            <Text style={styles.authorName}>Suggest Price / Menu Correction</Text>
            <Text style={styles.policyNotice}>
              Help fellow diners by reporting recent price changes or new dishes from your visit.
            </Text>
            <TextInput
              value={updateDishName}
              onChangeText={setUpdateDishName}
              placeholder="Dish or Item Name (e.g. Chicken Karahi, Hi-Tea Buffet)"
              placeholderTextColor={BrandColors.mutedGrey}
              style={styles.formInput}
            />
            <TextInput
              value={updatePricePkr}
              onChangeText={setUpdatePricePkr}
              placeholder="New Price in PKR (e.g. 2150)"
              placeholderTextColor={BrandColors.mutedGrey}
              keyboardType="numeric"
              style={styles.formInput}
            />
            <TextInput
              value={updateNotes}
              onChangeText={setUpdateNotes}
              placeholder="Notes or details (e.g. Price increased on the latest bill, includes salad)"
              placeholderTextColor={BrandColors.mutedGrey}
              multiline
              style={styles.formTextArea}
            />
            <View style={styles.formActionsRow}>
              <Pressable
                disabled={isSubmittingMenuUpdate}
                onPress={async () => {
                  setIsSubmittingMenuUpdate(true);
                  const res = await communityRepository.submitMenuUpdate({
                    googlePlaceId: item.placeId,
                    restaurantRecordId: khanaSceneData?.id,
                    dishName: updateDishName,
                    suggestedPricePkr: updatePricePkr ? parseInt(updatePricePkr, 10) : undefined,
                    notes: updateNotes,
                  });
                  setIsSubmittingMenuUpdate(false);
                  setMenuUpdateFeedback(res.message);
                  if (res.ok) {
                    setUpdateDishName('');
                    setUpdatePricePkr('');
                    setUpdateNotes('');
                    setShowMenuUpdateForm(false);
                  }
                }}
                style={styles.formSubmitBtn}>
                <Text style={styles.formSubmitText}>
                  {isSubmittingMenuUpdate ? 'Submitting...' : 'Submit Price Update'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setShowMenuUpdateForm(false)}
                style={styles.formCancelBtn}>
                <Text style={styles.formCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {menuUpdateFeedback ? (
          <Text style={styles.successBanner}>{menuUpdateFeedback}</Text>
        ) : null}

        {/* Claim Restaurant / Owner Callout */}
        <View style={styles.claimCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1, paddingRight: Spacing.xs }}>
              <Text style={styles.claimCardTitle}>Are you the manager or owner?</Text>
              <Text style={styles.claimCardText}>
                Claim this restaurant on KhanaScene to update your official menu, post deals, and get a Verified Partner badge.
              </Text>
            </View>
            <Pressable
              onPress={() => setShowClaimForm((v) => !v)}
              style={styles.menuActionBtn}>
              <Ionicons name="shield-checkmark" size={14} color={BrandColors.deepForestGreen} />
              <Text style={styles.menuActionText}>
                {showClaimForm ? 'Close' : 'Claim Spot'}
              </Text>
            </Pressable>
          </View>

          {showClaimForm ? (
            <View style={styles.reviewFormBox}>
              <Text style={styles.authorName}>Claim & Verify Restaurant Ownership</Text>
              <TextInput
                value={claimantName}
                onChangeText={setClaimantName}
                placeholder="Your Full Name (e.g. Asim Chaudhry)"
                placeholderTextColor={BrandColors.mutedGrey}
                style={styles.formInput}
              />
              <TextInput
                value={claimantPhone}
                onChangeText={setClaimantPhone}
                placeholder="Mobile / WhatsApp Number (e.g. 0300-1234567)"
                placeholderTextColor={BrandColors.mutedGrey}
                keyboardType="phone-pad"
                style={styles.formInput}
              />
              <TextInput
                value={claimantRole}
                onChangeText={setClaimantRole}
                placeholder="Role (e.g. Owner, General Manager, Marketing Lead)"
                placeholderTextColor={BrandColors.mutedGrey}
                style={styles.formInput}
              />
              <TextInput
                value={claimNotes}
                onChangeText={setClaimNotes}
                placeholder="Notes or business details (optional)"
                placeholderTextColor={BrandColors.mutedGrey}
                multiline
                style={styles.formTextArea}
              />
              <View style={styles.formActionsRow}>
                <Pressable
                  disabled={isSubmittingClaim}
                  onPress={async () => {
                    setIsSubmittingClaim(true);
                    const res = await communityRepository.submitOwnerClaim({
                      googlePlaceId: item.placeId,
                      restaurantRecordId: khanaSceneData?.id,
                      restaurantName: googleData.name,
                      claimantName,
                      claimantPhone,
                      claimantRole,
                      verificationNotes: claimNotes,
                    });
                    setIsSubmittingClaim(false);
                    setClaimFeedback(res.message);
                    if (res.ok) {
                      setClaimantName('');
                      setClaimantPhone('');
                      setClaimantRole('');
                      setClaimNotes('');
                      setShowClaimForm(false);
                    }
                  }}
                  style={styles.formSubmitBtn}>
                  <Text style={styles.formSubmitText}>
                    {isSubmittingClaim ? 'Submitting...' : 'Submit Claim Request'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowClaimForm(false)}
                  style={styles.formCancelBtn}>
                  <Text style={styles.formCancelText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {claimFeedback ? (
            <Text style={styles.successBanner}>{claimFeedback}</Text>
          ) : null}
        </View>
      </View>

      {/* Section 5: Location and Hours (Only displayed when hours or location exist) */}
      {googleData.regularOpeningHoursText || googleData.location ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Location & Opening Hours</Text>
          {googleData.regularOpeningHoursText?.map((line) => (
            <Text key={line} style={styles.hoursLine}>
              {line}
            </Text>
          )) ?? (
            <Text style={styles.emptyNotice}>
              Detailed weekly hours are not available for this restaurant.
            </Text>
          )}
        </View>
      ) : null}

      {/* Section 6: KhanaScene Community Reviews & Moderated Submission */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>KhanaScene Community Reviews</Text>
          <Pressable
            onPress={() => {
              if (!user) {
                router.push('/auth/sign-in');
                return;
              }
              setShowReviewForm((v) => !v);
            }}>
            <Text style={styles.externalLinkText}>
              {user ? (showReviewForm ? 'Cancel' : 'Write a Review') : 'Sign in to Review'}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.policyNotice}>
          Original KhanaScene reviews are moderated before publication and are kept separate from
          Google ratings.
        </Text>

        {showReviewForm ? (
          <View style={styles.reviewFormBox}>
            <Text style={styles.authorName}>Your Overall Rating (1 to 5)</Text>
            <View style={styles.starSelectorRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setOverallRating(star)}
                  style={[
                    styles.starOption,
                    overallRating === star && styles.starOptionActive,
                  ]}>
                  <Text
                    style={[
                      styles.starOptionText,
                      overallRating === star && styles.starOptionTextActive,
                    ]}>
                    {star} ★
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Share your honest experience (food, service, price, ambience)..."
              placeholderTextColor={BrandColors.mutedGrey}
              multiline
              style={styles.reviewInput}
            />
            <Pressable
              onPress={async () => {
                const res = await communityRepository.submitReview({
                  googlePlaceId: item.placeId,
                  restaurantRecordId: khanaSceneData?.id,
                  overallRating,
                  reviewText,
                });
                setReviewFeedback(res.message);
                if (res.ok) {
                  setReviewText('');
                  setShowReviewForm(false);
                }
              }}
              style={styles.primaryActionBtn}>
              <Text style={styles.primaryActionText}>Submit for Moderation</Text>
            </Pressable>
          </View>
        ) : null}

        {reviewFeedback ? (
          <Text style={styles.pickCallout}>{reviewFeedback}</Text>
        ) : null}
        {reportFeedback ? (
          <Text style={styles.pickCallout}>{reportFeedback}</Text>
        ) : null}

        {khanaSceneData?.khanaSceneReviews && khanaSceneData.khanaSceneReviews.length > 0 ? (
          khanaSceneData.khanaSceneReviews.map((ksRev) => (
            <View key={ksRev.id} style={styles.reviewItem}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.authorName}>
                  {ksRev.authorDisplayName} • {ksRev.overallRating}/5
                </Text>
                <Pressable
                  onPress={async () => {
                    if (!user) {
                      router.push('/auth/sign-in');
                      return;
                    }
                    const rep = await communityRepository.reportReview({
                      reviewId: ksRev.id,
                      reason: 'Flagged by user for moderation review',
                    });
                    setReportFeedback(rep.message);
                  }}>
                  <Text style={styles.sourceLink}>Report</Text>
                </Pressable>
              </View>
              <Text style={styles.reviewTime}>Visited: {ksRev.visitDate ?? 'Unspecified'}</Text>
              <Text style={styles.reviewBody}>{ksRev.reviewText}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyNotice}>
            No approved KhanaScene community reviews for this restaurant yet.
          </Text>
        )}
      </View>

      <GoogleAttributionBadge notice="Google ratings, review counts and review snippets are provided by Google Maps. Prices and KhanaScene Picks are maintained independently by KhanaScene." />

      <WhatsAppInquiryModal
        visible={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        restaurantName={googleData.name}
        phoneNumber={contactPhone}
      />

      {showBillEstimator ? (
        <BillEstimatorModal
          visible={showBillEstimator}
          onClose={() => setShowBillEstimator(false)}
          restaurantName={googleData.name}
          availableMenuItems={allMenuItems}
          availableCardDeals={khanaSceneData?.cardDeals ?? []}
          initialItems={estimatorInitialItems}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  heroCard: {
    backgroundColor: BrandColors.white,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  pickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BrandColors.saffronAccent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  pickBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.deepForestGreen,
  },
  fixtureBadge: {
    backgroundColor: BrandColors.lightGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  fixtureBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: BrandColors.deepForestGreen,
  },
  restaurantName: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: BrandColors.deepForestGreen,
  },
  categoryLine: {
    fontSize: Typography.sizes.sm,
    color: BrandColors.mutedGrey,
    fontWeight: '500',
  },
  ratingsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  ratingBox: {
    flex: 1,
    backgroundColor: BrandColors.warmCream,
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: 4,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  ratingSourceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: BrandColors.mutedGrey,
    letterSpacing: 0.5,
  },
  ratingMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingBigNumber: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: BrandColors.charcoal,
  },
  ratingSubText: {
    fontSize: 11,
    color: BrandColors.mutedGrey,
  },
  metaList: {
    gap: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  metaText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    color: BrandColors.charcoal,
    lineHeight: 18,
  },
  actionButtonsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: 4,
  },
  whatsAppActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#25D366',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
  },
  whatsAppActionText: {
    color: BrandColors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BrandColors.primaryGreen,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
  },
  primaryActionText: {
    color: BrandColors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BrandColors.lightGreen,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
  },
  secondaryActionText: {
    color: BrandColors.deepForestGreen,
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  savedActiveBtn: {
    backgroundColor: BrandColors.deepForestGreen,
  },
  savedActiveText: {
    color: BrandColors.white,
  },
  sectionCard: {
    backgroundColor: BrandColors.white,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: BrandColors.deepForestGreen,
  },
  dealSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dealCountBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  dealCountBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  dealList: {
    gap: Spacing.sm,
    marginTop: 4,
  },
  dealCard: {
    backgroundColor: BrandColors.warmCream,
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: 6,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  dealTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dealBankBadge: {
    backgroundColor: BrandColors.deepForestGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  dealBankText: {
    color: BrandColors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  dealPercentBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  dealPercentText: {
    color: '#15803D',
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
  },
  dealTierText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  dealMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dealMetaText: {
    fontSize: 11,
    color: BrandColors.mutedGrey,
    fontWeight: '500',
  },
  dealTermsText: {
    fontSize: 10,
    fontStyle: 'italic',
    color: BrandColors.mutedGrey,
    marginTop: 2,
  },
  externalLinkText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.primaryGreen,
  },
  pickCallout: {
    backgroundColor: BrandColors.saffronLight,
    color: BrandColors.deepForestGreen,
    padding: Spacing.sm,
    borderRadius: Radii.sm,
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
  },
  bodyText: {
    fontSize: Typography.sizes.sm,
    color: BrandColors.charcoal,
    lineHeight: 20,
  },
  policyNotice: {
    fontSize: 11,
    color: BrandColors.mutedGrey,
    fontStyle: 'italic',
  },
  reviewList: {
    gap: Spacing.sm,
  },
  reviewItem: {
    backgroundColor: BrandColors.warmCream,
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: 6,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: Radii.pill,
    backgroundColor: BrandColors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.deepForestGreen,
  },
  reviewTime: {
    fontSize: 11,
    color: BrandColors.mutedGrey,
  },
  sourceLink: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.primaryGreen,
  },
  reviewBody: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.charcoal,
    lineHeight: 18,
  },
  emptyNotice: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.mutedGrey,
    lineHeight: 18,
  },
  menuBlock: {
    gap: Spacing.xs,
  },
  menuSubtitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.mutedGrey,
    marginBottom: 4,
  },
  menuItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderSubtle,
    gap: Spacing.md,
  },
  menuItemTextCol: {
    flex: 1,
    gap: 2,
  },
  menuItemName: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  menuItemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  signatureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  signatureBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    textTransform: 'uppercase',
  },
  heroDishesCard: {
    backgroundColor: BrandColors.warmCream,
    borderRadius: Radii.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
    gap: 6,
    marginTop: 4,
  },
  heroDishesCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroDishesCardTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  heroDishesChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  heroDishChip: {
    backgroundColor: BrandColors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  heroDishChipText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  menuItemDesc: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.mutedGrey,
  },
  menuItemPrice: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: BrandColors.primaryGreen,
  },
  menuItemPriceWrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  menuItemAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: BrandColors.lightGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  menuItemAddText: {
    fontSize: 10,
    fontWeight: '700',
    color: BrandColors.deepForestGreen,
  },
  estimatorBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BrandColors.lightGreen,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  estimatorBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.xs,
  },
  estimatorBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: Radii.pill,
    backgroundColor: BrandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  estimatorBannerTextWrap: {
    flex: 1,
  },
  estimatorBannerTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: BrandColors.deepForestGreen,
  },
  estimatorBannerSubtitle: {
    fontSize: 11,
    color: BrandColors.deepForestGreen,
    marginTop: 1,
  },
  hoursLine: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.charcoal,
    lineHeight: 18,
  },
  reviewFormBox: {
    backgroundColor: BrandColors.warmCream,
    padding: Spacing.md,
    borderRadius: Radii.md,
    gap: Spacing.sm,
  },
  starSelectorRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  starOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  starOptionActive: {
    backgroundColor: BrandColors.primaryGreen,
    borderColor: BrandColors.primaryGreen,
  },
  starOptionText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  starOptionTextActive: {
    color: BrandColors.white,
  },
  reviewInput: {
    backgroundColor: BrandColors.white,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
    padding: Spacing.md,
    minHeight: 80,
    fontSize: Typography.sizes.sm,
    color: BrandColors.charcoal,
    textAlignVertical: 'top',
  },
  menuActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: BrandColors.lightGreen,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
  },
  menuActionText: {
    color: BrandColors.deepForestGreen,
    fontSize: 11,
    fontWeight: '700',
  },
  claimCard: {
    backgroundColor: BrandColors.warmCream,
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: BrandColors.saffronAccent,
    marginTop: Spacing.md,
  },
  claimCardTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    color: BrandColors.deepForestGreen,
  },
  claimCardText: {
    fontSize: 11,
    color: BrandColors.charcoal,
    lineHeight: 16,
    marginTop: 2,
  },
  formInput: {
    backgroundColor: BrandColors.white,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: Typography.sizes.xs,
    color: BrandColors.charcoal,
  },
  formTextArea: {
    backgroundColor: BrandColors.white,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
    padding: Spacing.md,
    minHeight: 65,
    fontSize: Typography.sizes.xs,
    color: BrandColors.charcoal,
    textAlignVertical: 'top',
  },
  formActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  formSubmitBtn: {
    flex: 1,
    backgroundColor: BrandColors.primaryGreen,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSubmitText: {
    color: BrandColors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  formCancelBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCancelText: {
    color: BrandColors.mutedGrey,
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
  },
  successBanner: {
    backgroundColor: BrandColors.lightGreen,
    padding: Spacing.md,
    borderRadius: Radii.md,
    color: BrandColors.deepForestGreen,
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
});
