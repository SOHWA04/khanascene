import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CitySelector } from '@/components/CitySelector';
import { APP_CONFIG } from '@/config';
import { BrandColors, Radii, Spacing, Typography } from '@/theme';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Profile & Settings</Text>
        <Text style={styles.subtitle}>
          Browse and compare restaurants freely as a guest, or sign in to sync saved restaurants
          and submit KhanaScene reviews.
        </Text>

        {/* Auth Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>KhanaScene Account</Text>
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
        </View>

        {/* Preferences Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferred City</Text>
          <CitySelector />
        </View>

        {/* Privacy & Legal Disclosures */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Privacy, Data & Policies</Text>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={BrandColors.primaryGreen} />
            <Text style={styles.infoText}>
              Location is requested only when you choose a location-dependent feature. Manual city
              and area selection is always available.
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="globe-outline" size={18} color={BrandColors.primaryGreen} />
            <Text style={styles.infoText}>
              Google ratings, review counts and reviews are attributed to Google Maps and never
              fabricate missing details.
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="trash-outline" size={18} color={BrandColors.primaryGreen} />
            <Text style={styles.infoText}>
              Account deletion is available at any time for signed-in users to permanently remove
              their profile, saved places and reviews.
            </Text>
          </View>
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
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  cardTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  cardBody: {
    fontSize: Typography.sizes.sm,
    color: BrandColors.mutedGrey,
    lineHeight: 20,
  },
  authButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
  versionFooter: {
    textAlign: 'center',
    fontSize: Typography.sizes.xs,
    color: BrandColors.mutedGrey,
    marginTop: Spacing.sm,
  },
});
