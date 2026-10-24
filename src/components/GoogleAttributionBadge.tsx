import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors, Radii, Spacing, Typography } from '@/theme';

interface GoogleAttributionBadgeProps {
  notice?: string;
}

/**
 * Mandatory Google Maps attribution component when displaying Google Places content.
 * Strictly separates Google-sourced data from KhanaScene-owned metadata.
 */
export function GoogleAttributionBadge({ notice }: GoogleAttributionBadgeProps) {
  return (
    <View style={styles.container} accessibilityRole="text">
      <View style={styles.row}>
        <Ionicons name="globe-outline" size={14} color={BrandColors.mutedGrey} />
        <Text style={styles.brandText}>Place ratings & reviews powered by Google Maps</Text>
      </View>
      {notice ? <Text style={styles.noticeText}>{notice}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BrandColors.white,
    borderColor: BrandColors.borderSubtle,
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  brandText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: BrandColors.charcoal,
  },
  noticeText: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.mutedGrey,
  },
});
