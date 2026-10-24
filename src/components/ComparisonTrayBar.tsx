import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { APP_CONFIG } from '@/config';
import { useComparisonStore } from '@/stores/useComparisonStore';
import { BrandColors, Radii, Spacing, Typography } from '@/theme';

export function ComparisonTrayBar() {
  const { selectedPlaceIds, clearComparison } = useComparisonStore();

  if (selectedPlaceIds.length === 0) {
    return null;
  }

  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <Ionicons name="git-compare" size={18} color={BrandColors.saffronAccent} />
        <Text style={styles.text}>
          {selectedPlaceIds.length}/{APP_CONFIG.maxComparisonItems} selected to compare
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={clearComparison} style={styles.clearBtn}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/compare')}
          style={styles.compareBtn}>
          <Text style={styles.compareText}>Compare Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: BrandColors.deepForestGreen,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  text: {
    color: BrandColors.warmCream,
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  clearBtn: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
  },
  clearText: {
    color: BrandColors.lightGreen,
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
  },
  compareBtn: {
    backgroundColor: BrandColors.saffronAccent,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.pill,
  },
  compareText: {
    color: BrandColors.deepForestGreen,
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
  },
});
