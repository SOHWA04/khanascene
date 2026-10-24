/**
 * Maintain backwards compatibility with Expo template components while exposing KhanaScene theme.
 */

import { Platform } from 'react-native';
import { BrandColors, Colors as KhanaSceneColors } from '@/theme';

export const Colors = {
  light: {
    text: KhanaSceneColors.light.text,
    background: KhanaSceneColors.light.background,
    backgroundElement: KhanaSceneColors.light.backgroundElement,
    backgroundSelected: KhanaSceneColors.light.backgroundSelected,
    textSecondary: KhanaSceneColors.light.textSecondary,
    primary: KhanaSceneColors.light.primary,
    primaryDark: KhanaSceneColors.light.primaryDark,
    accent: KhanaSceneColors.light.accent,
    surface: KhanaSceneColors.light.surface,
    border: KhanaSceneColors.light.border,
  },
  dark: {
    text: KhanaSceneColors.dark.text,
    background: KhanaSceneColors.dark.background,
    backgroundElement: KhanaSceneColors.dark.backgroundElement,
    backgroundSelected: KhanaSceneColors.dark.backgroundSelected,
    textSecondary: KhanaSceneColors.dark.textSecondary,
    primary: KhanaSceneColors.dark.primary,
    primaryDark: KhanaSceneColors.dark.primaryDark,
    accent: KhanaSceneColors.dark.accent,
    surface: KhanaSceneColors.dark.surface,
    border: KhanaSceneColors.dark.border,
  },
} as const;

export { BrandColors };

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
