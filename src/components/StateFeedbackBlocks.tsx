import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors, Radii, Spacing, Typography } from '@/theme';

export function LoadingStateBlock({ label = 'Loading restaurants...' }: { label?: string }) {
  return (
    <View style={styles.stateBox} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={BrandColors.primaryGreen} />
      <Text style={styles.stateTitle}>{label}</Text>
    </View>
  );
}

export function ErrorStateBlock({
  title = 'Unable to load restaurants',
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={[styles.stateBox, styles.errorBox]}>
      <Ionicons name="alert-circle-outline" size={32} color={BrandColors.errorRed} />
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateBody}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Ionicons name="refresh" size={16} color={BrandColors.white} />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyStateBlock({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.stateBox}>
      <Ionicons name="search-outline" size={32} color={BrandColors.primaryGreen} />
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateBody}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stateBox: {
    backgroundColor: BrandColors.white,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  errorBox: {
    borderColor: BrandColors.errorRed,
  },
  stateTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '700',
    color: BrandColors.charcoal,
    textAlign: 'center',
  },
  stateBody: {
    fontSize: Typography.sizes.sm,
    color: BrandColors.mutedGrey,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BrandColors.primaryGreen,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.pill,
  },
  retryButtonText: {
    color: BrandColors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
});
