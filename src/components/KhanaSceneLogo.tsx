import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors, Radii, Spacing, Typography } from '@/theme';

interface KhanaSceneLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  lightText?: boolean;
}

/**
 * Original KhanaScene brand mark combining a location pin with a discovery utensils emblem.
 * Does not use or imitate Google's branding.
 */
export function KhanaSceneLogo({
  size = 'md',
  showTagline = false,
  lightText = false,
}: KhanaSceneLogoProps) {
  const iconBoxSize = size === 'lg' ? 68 : size === 'md' ? 40 : 32;
  const iconSize = size === 'lg' ? 32 : size === 'md' ? 20 : 16;
  const titleSize =
    size === 'lg'
      ? Typography.sizes.xxl
      : size === 'md'
        ? Typography.sizes.xl
        : Typography.sizes.lg;

  return (
    <View style={[styles.container, size === 'lg' && styles.containerCentered]}>
      <View
        style={[
          styles.emblem,
          {
            width: iconBoxSize,
            height: iconBoxSize,
            borderRadius: size === 'lg' ? Radii.lg : Radii.md,
          },
        ]}>
        <Ionicons name="location" size={iconSize} color={BrandColors.saffronAccent} />
        <View style={styles.subBadge}>
          <Ionicons name="restaurant" size={Math.round(iconSize * 0.48)} color={BrandColors.deepForestGreen} />
        </View>
      </View>

      <View style={size === 'lg' ? styles.textColumnCentered : styles.textColumn}>
        <Text
          style={[
            styles.wordmark,
            {
              fontSize: titleSize,
              color: lightText ? BrandColors.warmCream : BrandColors.deepForestGreen,
            },
          ]}>
          Khana<Text style={styles.wordmarkAccent}>Scene</Text>
        </Text>
        {showTagline ? (
          <Text
            style={[
              styles.tagline,
              {
                color: lightText ? BrandColors.lightGreen : BrandColors.mutedGrey,
              },
            ]}>
            Khana kahan? Scene yahan.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  containerCentered: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emblem: {
    backgroundColor: BrandColors.deepForestGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: BrandColors.saffronAccent,
    position: 'relative',
  },
  subBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: BrandColors.saffronAccent,
    borderRadius: Radii.pill,
    padding: 3,
  },
  textColumn: {
    flexDirection: 'column',
  },
  textColumnCentered: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  wordmark: {
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  wordmarkAccent: {
    color: BrandColors.saffronAccent,
  },
  tagline: {
    fontSize: Typography.sizes.sm,
    fontWeight: '500',
    marginTop: 2,
  },
});
