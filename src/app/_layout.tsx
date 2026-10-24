import { DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useSavedStore } from '@/stores/useSavedStore';
import { BrandColors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if splash screen was already hidden
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const KhanaSceneNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: BrandColors.primaryGreen,
    background: BrandColors.warmCream,
    card: BrandColors.white,
    text: BrandColors.charcoal,
    border: BrandColors.borderSubtle,
  },
};

export default function RootLayout() {
  const hydrateSavedPlaces = useSavedStore((s) => s.hydrateSavedPlaces);

  useEffect(() => {
    hydrateSavedPlaces();
  }, [hydrateSavedPlaces]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={KhanaSceneNavigationTheme}>
        <StatusBar style="dark" />
        <AnimatedSplashOverlay />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: BrandColors.warmCream },
            headerTintColor: BrandColors.deepForestGreen,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: BrandColors.warmCream },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="restaurant/[placeId]"
            options={{ title: 'Restaurant Details', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="compare"
            options={{ title: 'Compare Restaurants', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="cuisines"
            options={{ title: 'Explore Cuisines', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="map"
            options={{ title: 'Map & Directions', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="auth/sign-in"
            options={{ title: 'Sign In', presentation: 'modal' }}
          />
          <Stack.Screen
            name="auth/sign-up"
            options={{ title: 'Create Account', presentation: 'modal' }}
          />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
