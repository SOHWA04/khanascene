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
  neonEmerald: '#00F59B',
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
  cyberPink: '#EC4899',
  partyPurple: '#8B5CF6',
  darkCanvas: '#0A0F0D',
  cardDark: '#161F1A',
} as const;

export const VIBE_DEFINITIONS = [
  {
    id: 'broke',
    label: 'Broke Mode (< Rs.600)',
    shortLabel: '💸 Broke Mode',
    badge: '💸 Broke Approved',
    icon: 'wallet-outline' as const,
    color: '#059669',
    bgColor: '#ECFDF5',
    description: 'Student-budget friendly feeds under Rs. 600/person',
  },
  {
    id: 'insta',
    label: 'Insta Photo Dump',
    shortLabel: '📸 Insta Vibe',
    badge: '📸 Insta Aesthetic',
    icon: 'camera-outline' as const,
    color: '#DB2777',
    bgColor: '#FCE7F3',
    description: 'Aesthetic interiors, latte art, and photo-dump lighting',
  },
  {
    id: 'latenight',
    label: 'Late Night 2 AM Chai',
    shortLabel: '🌙 2 AM Chai',
    badge: '🌙 2 AM Scene',
    icon: 'moon-outline' as const,
    color: '#D97706',
    bgColor: '#FEF3C7',
    description: 'Open past 1 AM for paratha roll runs & chai bakar',
  },
  {
    id: 'study',
    label: 'Laptop & Study',
    shortLabel: '💻 Study Friendly',
    badge: '💻 Study Hub',
    icon: 'laptop-outline' as const,
    color: '#2563EB',
    bgColor: '#EFF6FF',
    description: 'Quiet atmosphere, power sockets & reliable WiFi',
  },
  {
    id: 'car',
    label: 'Car Scene / Diggi',
    shortLabel: '🚗 Car Dining',
    badge: '🚗 Diggi Baithak',
    icon: 'car-sport-outline' as const,
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    description: 'Boot dining & tea served straight to your window',
  },
  {
    id: 'date',
    label: 'First Date / Safe Bet',
    shortLabel: '🕯️ Date Safe',
    badge: '🕯️ Date Safe',
    icon: 'heart-outline' as const,
    color: '#E11D48',
    bgColor: '#FFE4E6',
    description: 'Cozy mood lighting, great acoustics & foolproof food',
  },
] as const;

export type VibeId = (typeof VIBE_DEFINITIONS)[number]['id'];

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
