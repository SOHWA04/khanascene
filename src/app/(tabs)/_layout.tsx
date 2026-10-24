import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors, Typography } from '@/theme';

/**
 * Primary Bottom Navigation Destinations:
 * 1. Explore — home screen and restaurant discovery
 * 2. Search — restaurant searches, filters and results
 * 3. Saved — favourite restaurants
 * 4. Profile — settings, authentication and account management
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BrandColors.primaryGreen,
        tabBarInactiveTintColor: BrandColors.mutedGrey,
        tabBarStyle: {
          backgroundColor: BrandColors.white,
          borderTopColor: BrandColors.borderSubtle,
          borderTopWidth: 1,
          height: Platform.select({ ios: 86, android: 66, default: 64 }),
          paddingTop: 6,
          paddingBottom: Platform.select({ ios: 24, android: 10, default: 10 }),
        },
        tabBarLabelStyle: {
          fontSize: Typography.sizes.xs,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'compass' : 'compass-outline'}
              size={24}
              color={focused ? BrandColors.primaryGreen : BrandColors.mutedGrey}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={24}
              color={focused ? BrandColors.primaryGreen : BrandColors.mutedGrey}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={focused ? BrandColors.primaryGreen : BrandColors.mutedGrey}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={focused ? BrandColors.primaryGreen : BrandColors.mutedGrey}
            />
          ),
        }}
      />
    </Tabs>
  );
}
