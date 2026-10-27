import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CitySelector } from '@/components/CitySelector';
import { APP_CONFIG } from '@/config';
import { communityRepository } from '@/repositories/communityRepository';
import { isSupabaseConfigured } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';
import { usePreferencesStore } from '@/stores/usePreferencesStore';
import { requestOnDemandUserLocation } from '@/utils/location';
import { BrandColors, Radii, Spacing, Typography } from '@/theme';

export default function ProfileScreen() {
  const { user, signOut, deleteAccount, isSubmitting } = useAuthStore();
  const { selectedCity, locationPermissionGranted } = usePreferencesStore();
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposedName, setProposedName] = useState('');
  const [proposedAddress, setProposedAddress] = useState('');
  const [proposedPhone, setProposedPhone] = useState('');
  const supabaseReady = isSupabaseConfigured();

  const handleRequestLocation = async () => {
    const res = await requestOnDemandUserLocation();
    if (res.granted) {
      setStatusMessage('Device location enabled for "Near Me" and distance sorting.');
    } else if (res.errorMessage) {
      setStatusMessage(res.errorMessage);
    }
  };

  const handleDeleteAccount = async () => {
    const result = await deleteAccount();
    setConfirmDeleteVisible(false);
    if (result.ok) {
      setStatusMessage(
        'Your account and associated data (profile, saved places, reviews) have been deleted.'
      );
    } else {
      setStatusMessage(result.error ?? 'Could not delete account.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile & Settings</Text>
        <Text style={styles.subtitle}>
          Browse and compare restaurants freely as a guest, or sign in to sync saved restaurants
          and submit KhanaScene reviews.
        </Text>

        {statusMessage ? (
          <View style={styles.banner}>
            <Ionicons name="information-circle-outline" size={18} color={BrandColors.deepForestGreen} />
            <Text style={styles.bannerText}>{statusMessage}</Text>
          </View>
        ) : null}

        {/* Auth Card */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>KhanaScene Account</Text>
            <View
              style={[
                styles.statusBadge,
                supabaseReady ? styles.statusBadgeLive : styles.statusBadgeMock,
              ]}>
              <Text style={styles.statusBadgeText}>
                {supabaseReady ? 'Supabase Connected' : 'Local / Guest Mode'}
              </Text>
            </View>
          </View>

          {user ? (
            <View style={styles.accountBox}>
              <Text style={styles.accountName}>{user.displayName}</Text>
              <Text style={styles.accountEmail}>{user.email}</Text>

              <View style={styles.authButtonsRow}>
                <Pressable onPress={() => signOut()} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Sign Out</Text>
                </Pressable>
                <Pressable
                  onPress={() => setConfirmDeleteVisible((v) => !v)}
                  style={styles.dangerOutlineButton}>
                  <Text style={styles.dangerOutlineText}>Delete Account</Text>
                </Pressable>
              </View>

              {confirmDeleteVisible ? (
                <View style={styles.deleteConfirmBox}>
                  <Text style={styles.deleteConfirmTitle}>
                    Permanently Delete Account?
                  </Text>
                  <Text style={styles.deleteConfirmBody}>
                    This will permanently delete your KhanaScene account, profile, saved restaurant
                    references, and submitted reviews. This action cannot be undone.
                  </Text>
                  <View style={styles.authButtonsRow}>
                    <Pressable
                      disabled={isSubmitting}
                      onPress={handleDeleteAccount}
                      style={styles.dangerButton}>
                      <Text style={styles.dangerButtonText}>
                        {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setConfirmDeleteVisible(false)}
                      style={styles.secondaryButton}>
                      <Text style={styles.secondaryButtonText}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            <>
              <Text style={styles.cardBody}>
                Sign in with your email to back up favourites across Android and iOS devices.
              </Text>
              <View style={styles.authButtonsRow}>
                <Pressable
                  onPress={() => router.push('/auth/sign-in')}
                  style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push('/auth/sign-up')}
                  style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Create Account</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>

        {/* Preferences Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferred City & Language</Text>
          <CitySelector />
          <Text style={styles.metaLine}>Preferred Language: English (Pakistan)</Text>
        </View>

        {/* Location Settings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location Settings</Text>
          <Text style={styles.cardBody}>
            Status:{' '}
            {locationPermissionGranted
              ? 'Foreground location enabled for session'
              : 'Manual city & neighbourhood selection active'}
          </Text>
          <Pressable onPress={handleRequestLocation} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>
              {locationPermissionGranted ? 'Refresh My Location' : 'Enable Device Location'}
            </Text>
          </Pressable>
        </View>

        {/* Community Restaurant Proposal Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Propose a Restaurant (Editorial Verification)</Text>
          <Text style={styles.cardBody}>
            Know a great spot in Islamabad or Rawalpindi? Submit it for verification before it joins
            trusted KhanaScene listings.
          </Text>
          {showProposalForm ? (
            <View style={styles.accountBox}>
              <TextInput
                value={proposedName}
                onChangeText={setProposedName}
                placeholder="Restaurant Name (e.g. Dera Restaurant F-11)"
                placeholderTextColor={BrandColors.mutedGrey}
                style={styles.input}
              />
              <TextInput
                value={proposedAddress}
                onChangeText={setProposedAddress}
                placeholder="Address / Markaz in Islamabad or Rawalpindi"
                placeholderTextColor={BrandColors.mutedGrey}
                style={styles.input}
              />
              <TextInput
                value={proposedPhone}
                onChangeText={setProposedPhone}
                placeholder="Phone or Website (optional)"
                placeholderTextColor={BrandColors.mutedGrey}
                style={styles.input}
              />
              <View style={styles.authButtonsRow}>
                <Pressable
                  onPress={async () => {
                    if (!user) {
                      router.push('/auth/sign-in');
                      return;
                    }
                    const res = await communityRepository.submitRestaurantProposal({
                      proposedName,
                      proposedAddress,
                      proposedCityId: selectedCity,
                      proposedPhone,
                    });
                    setStatusMessage(res.message);
                    if (res.ok) {
                      setProposedName('');
                      setProposedAddress('');
                      setProposedPhone('');
                      setShowProposalForm(false);
                    }
                  }}
                  style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Submit Proposal</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowProposalForm(false)}
                  style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                if (!user) {
                  router.push('/auth/sign-in');
                  return;
                }
                setShowProposalForm(true);
              }}
              style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>
                {user ? 'Propose a Restaurant' : 'Sign in to Propose a Restaurant'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Privacy, Terms, Data Deletion & Contact */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Privacy, Terms & Data Deletion</Text>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={BrandColors.primaryGreen} />
            <Text style={styles.infoText}>
              Privacy Policy: Location is requested only on demand. We never track continuous
              background location or sell personal data.
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={18} color={BrandColors.primaryGreen} />
            <Text style={styles.infoText}>
              Terms of Service: Google ratings, review counts and reviews are attributed to Google
              Maps and never fabricated or merged with KhanaScene ratings.
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="trash-outline" size={18} color={BrandColors.primaryGreen} />
            <Text style={styles.infoText}>
              Data Deletion Instructions: Signed-in users can delete their account and all stored
              data immediately using the &quot;Delete Account&quot; button in the account card above.
            </Text>
          </View>

          <Pressable
            onPress={() => Linking.openURL('mailto:support@khanascene.pk?subject=KhanaScene%20Feedback')}
            style={styles.contactButton}>
            <Ionicons name="mail-outline" size={16} color={BrandColors.deepForestGreen} />
            <Text style={styles.contactButtonText}>Contact / Send Feedback</Text>
          </Pressable>
        </View>

        <Text style={styles.versionFooter}>
          {APP_CONFIG.appName} v{APP_CONFIG.version} • {APP_CONFIG.tagline}
        </Text>
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: BrandColors.lightGreen,
    padding: Spacing.md,
    borderRadius: Radii.md,
  },
  bannerText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    color: BrandColors.deepForestGreen,
    fontWeight: '600',
  },
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  cardTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  statusBadgeLive: {
    backgroundColor: BrandColors.successBackground,
  },
  statusBadgeMock: {
    backgroundColor: BrandColors.lightGreen,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: BrandColors.deepForestGreen,
  },
  cardBody: {
    fontSize: Typography.sizes.sm,
    color: BrandColors.mutedGrey,
    lineHeight: 20,
  },
  accountBox: {
    gap: Spacing.sm,
  },
  accountName: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: BrandColors.deepForestGreen,
  },
  accountEmail: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.mutedGrey,
  },
  authButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: BrandColors.primaryGreen,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: BrandColors.white,
    fontWeight: '700',
    fontSize: Typography.sizes.sm,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: BrandColors.lightGreen,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: BrandColors.deepForestGreen,
    fontWeight: '700',
    fontSize: Typography.sizes.sm,
  },
  dangerOutlineButton: {
    flex: 1,
    backgroundColor: BrandColors.errorBackground,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  dangerOutlineText: {
    color: BrandColors.errorRed,
    fontWeight: '700',
    fontSize: Typography.sizes.sm,
  },
  dangerButton: {
    flex: 1,
    backgroundColor: BrandColors.errorRed,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: BrandColors.white,
    fontWeight: '700',
    fontSize: Typography.sizes.sm,
  },
  deleteConfirmBox: {
    backgroundColor: BrandColors.warmCream,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: BrandColors.errorRed,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  deleteConfirmTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: BrandColors.errorRed,
  },
  deleteConfirmBody: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.charcoal,
    lineHeight: 18,
  },
  metaLine: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.mutedGrey,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    color: BrandColors.mutedGrey,
    lineHeight: 18,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: BrandColors.lightGreen,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    marginTop: 4,
  },
  contactButtonText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.deepForestGreen,
  },
  versionFooter: {
    textAlign: 'center',
    fontSize: Typography.sizes.xs,
    color: BrandColors.mutedGrey,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: BrandColors.warmCream,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: Typography.sizes.sm,
    color: BrandColors.charcoal,
  },
});
