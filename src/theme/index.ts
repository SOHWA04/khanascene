/**
 * KhanaScene Brand Identity & Design System
 * Primary tagline: "Khana kahan? Scene yahan."
 * Brand description: "Pakistan's restaurant discovery guide."
 */

import { Platform } from 'react-native';

export const BrandColors = {
  deepForestGreen: '#0E382C',
  primaryGreen: '#126149',
  emeraldGlow: '#10B981',
  warmCream: '#F8F9FA',
  canvasBg: '#F8F9FA',
  white: '#FFFFFF',
  charcoal: '#0F172A',
  mutedGrey: '#64748B',
  subtleGrey: '#94A3B8',
  saffronAccent: '#F59E0B',
  saffronLight: '#FEF3C7',
  lightGreen: '#EAF4F0',
  borderSubtle: '#E2E8F0',
  errorRed: '#EF4444',
  errorBackground: '#FEE2E2',
  successGreen: '#10B981',
  successBackground: '#ECFDF5',
  warningAmber: '#D97706',
  warningBackground: '#FEF3C7',
  googleBlue: '#2563EB',
} as const;

export const Colors = {
  light: {
    text: BrandColors.charcoal,
    textSecondary: BrandColors.mutedGrey,
    background: BrandColors.warmCream,
    surface: BrandColors.white,
    backgroundElement: BrandColors.lightGreen,
    backgroundSelected: '#D5E5D5',
    primary: BrandColors.primaryGreen,
    primaryDark: BrandColors.deepForestGreen,
    accent: BrandColors.saffronAccent,
    border: BrandColors.borderSubtle,
    error: BrandColors.errorRed,
    success: BrandColors.successGreen,
  },
  dark: {
    text: BrandColors.warmCream,
    textSecondary: '#A8B2AA',
    background: '#111A16',
    surface: '#182620',
    backgroundElement: '#1E332A',
    backgroundSelected: '#284539',
    primary: '#368562',
    primaryDark: BrandColors.deepForestGreen,
    accent: BrandColors.saffronAccent,
    border: '#283A32',
    error: '#F87171',
    success: '#4ADE80',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 9999,
} as const;

export const Typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 34,
  },
} as const;
