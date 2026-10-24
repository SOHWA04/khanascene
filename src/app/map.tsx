import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CitySelector } from '@/components/CitySelector';
import { GoogleAttributionBadge } from '@/components/GoogleAttributionBadge';
import { INITIAL_CITIES } from '@/config';
import { usePreferencesStore } from '@/stores/usePreferencesStore';
import { BrandColors, Radii, Spacing, Typography } from '@/theme';

export default function MapScreen() {
  const { selectedCity } = usePreferencesStore();
  const activeCity = INITIAL_CITIES[selectedCity];

  const openAreaInGoogleMaps = (areaName: string) => {
    const query = encodeURIComponent(`Restaurants in ${areaName}, ${activeCity.name}, Pakistan`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Map & Directions</Text>
        <CitySelector />
      </View>

      <Text style={styles.subtitle}>
        Open dining areas in {activeCity.name} directly in Google Maps for turn-by-turn directions,
        or browse without requiring device location access.
      </Text>

      <View style={styles.list}>
        {activeCity.areas.map((area) => (
          <View key={area.id} style={styles.areaCard}>
            <View style={styles.areaTextCol}>
              <Text style={styles.areaName}>{area.name}</Text>
              <Text style={styles.areaCity}>{activeCity.name}</Text>
            </View>
            <Pressable
              onPress={() => openAreaInGoogleMaps(area.name)}
              style={styles.mapsBtn}>
              <Ionicons name="navigate-outline" size={16} color={BrandColors.white} />
              <Text style={styles.mapsBtnText}>Open in Google Maps</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <GoogleAttributionBadge />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.sm,
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
    gap: Spacing.sm,
  },
  areaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BrandColors.white,
    borderRadius: Radii.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
    gap: Spacing.sm,
  },
  areaTextCol: {
    flex: 1,
  },
  areaName: {
    fontSize: Typography.sizes.md,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  areaCity: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.mutedGrey,
  },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BrandColors.primaryGreen,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
  },
  mapsBtnText: {
    color: BrandColors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
});
