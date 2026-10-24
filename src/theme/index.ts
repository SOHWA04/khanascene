/**
 * KhanaScene Brand Identity & Design System
 * Primary tagline: "Khana kahan? Scene yahan."
 * Brand description: "Pakistan's restaurant discovery guide."
 */

import { Platform } from 'react-native';

export const BrandColors = {
  deepForestGreen: '#173D32',
  primaryGreen: '#245C43',
  warmCream: '#FAF7F0',
  white: '#FFFFFF',
  charcoal: '#242824',
  mutedGrey: '#737A75',
  saffronAccent: '#E5A84B',
  saffronLight: '#FDF5E6',
  lightGreen: '#E8F0E8',
  borderSubtle: '#E2E6E2',
  errorRed: '#B91C1C',
  errorBackground: '#FEE2E2',
  successGreen: '#15803D',
  successBackground: '#DCFCE7',
  warningAmber: '#B45309',
  warningBackground: '#FEF3C7',
  googleBlue: '#1A73E8',
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
