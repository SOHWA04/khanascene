import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CUISINE_CATEGORIES, INITIAL_CITIES } from '@/config';
import { usePreferencesStore } from '@/stores/usePreferencesStore';
import { BrandColors, Radii, Spacing, Typography } from '@/theme';

export default function CuisinesScreen() {
  const { selectedCity } = usePreferencesStore();
  const activeCity = INITIAL_CITIES[selectedCity];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Explore Cuisines in {activeCity.name}</Text>
      <Text style={styles.subtitle}>
        Select a cuisine or dish category to search restaurants across {activeCity.name}.
      </Text>

      <View style={styles.grid}>
        {CUISINE_CATEGORIES.map((category) => (
          <Pressable
            key={category.id}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/search',
                params: { q: `${category.searchQuery} in ${activeCity.name}` },
              })
            }
            style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="restaurant-outline" size={24} color={BrandColors.primaryGreen} />
            </View>
            <Text style={styles.cardTitle}>{category.name}</Text>
            <Text style={styles.cardHint}>Search in {activeCity.name}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  card: {
    width: '47%',
    backgroundColor: BrandColors.white,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radii.pill,
    backgroundColor: BrandColors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  cardHint: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.mutedGrey,
  },
});
