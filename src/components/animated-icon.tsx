import * as SplashScreen from 'expo-splash-screen';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { KhanaSceneLogo } from '@/components/KhanaSceneLogo';
import { BrandColors, Spacing, Typography } from '@/theme';

const DURATION = 450;

/**
 * Screen 1 — KhanaScene Splash Overlay
 * Displays the KhanaScene logo, app name, and primary tagline:
 * "Khana kahan? Scene yahan."
 * Startup is kept fast without blocking on network restaurant fetches.
 */
export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: {
      opacity: 1,
    },
    60: {
      opacity: 1,
    },
    100: {
      opacity: 0,
      easing: Easing.out(Easing.quad),
    },
  });

  const content = (
    <View style={styles.inner}>
      <KhanaSceneLogo size="lg" showTagline lightText />
      <Text style={styles.subDescription}>Pakistan&apos;s restaurant discovery guide</Text>
    </View>
  );

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}>
      {content}
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={styles.splashOverlay}>
      {content}
    </View>
  );
}

export function AnimatedIcon() {
  return <KhanaSceneLogo size="lg" showTagline />;
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BrandColors.deepForestGreen,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    paddingHorizontal: Spacing.xl,
  },
  inner: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  subDescription: {
    color: BrandColors.saffronAccent,
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: Spacing.xs,
  },
});
