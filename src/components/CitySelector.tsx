import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { INITIAL_CITIES } from '@/config';
import { usePreferencesStore } from '@/stores/usePreferencesStore';
import { CitySlug } from '@/types/restaurant';
import { BrandColors, Radii, Spacing, Typography } from '@/theme';

export function CitySelector() {
  const { selectedCity, setCity } = usePreferencesStore();
  const cities: CitySlug[] = ['islamabad', 'rawalpindi'];

  return (
    <View style={styles.pillGroup} accessibilityRole="radiogroup" accessibilityLabel="Select city">
      {cities.map((cityKey) => {
        const city = INITIAL_CITIES[cityKey];
        const isActive = selectedCity === cityKey;
        return (
          <Pressable
            key={cityKey}
            accessibilityRole="radio"
            accessibilityState={{ checked: isActive }}
            onPress={() => setCity(cityKey)}
            style={[styles.cityOption, isActive && styles.cityOptionActive]}>
            <Ionicons
              name={isActive ? 'location' : 'location-outline'}
              size={14}
              color={isActive ? BrandColors.white : BrandColors.primaryGreen}
            />
            <Text style={[styles.cityLabel, isActive && styles.cityLabelActive]}>
              {city.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pillGroup: {
    flexDirection: 'row',
    backgroundColor: BrandColors.lightGreen,
    borderRadius: Radii.pill,
    padding: 3,
    gap: 4,
  },
  cityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.pill,
  },
  cityOptionActive: {
    backgroundColor: BrandColors.primaryGreen,
  },
  cityLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: BrandColors.primaryGreen,
  },
  cityLabelActive: {
    color: BrandColors.white,
  },
});
