import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors } from '@/theme';

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
        tabBarActiveTintColor: '#0E382C',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F1F5F9',
          borderTopWidth: 1,
          height: Platform.select({ ios: 88, android: 68, default: 68 }),
          paddingTop: 8,
          paddingBottom: Platform.select({ ios: 28, android: 12, default: 12 }),
          ...Platform.select({
            web: {
              boxShadow: '0 -4px 16px rgba(15, 23, 42, 0.05)',
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginTop: 2,
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
