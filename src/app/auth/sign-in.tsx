import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { KhanaSceneLogo } from '@/components/KhanaSceneLogo';
import { BrandColors, Radii, Spacing, Typography } from '@/theme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSignIn = () => {
    if (!email.trim() || !password) {
      setFeedback('Please enter both your email address and password.');
      return;
    }
    setFeedback(
      'Supabase Auth will be connected in Phase 3 once your Supabase project URL and anon key are configured.'
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <KhanaSceneLogo size="md" showTagline />

      <View style={styles.card}>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>
          Sign in to sync your saved restaurants across devices and write KhanaScene reviews.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={BrandColors.mutedGrey}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor={BrandColors.mutedGrey}
            secureTextEntry
            style={styles.input}
          />
        </View>

        {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}

        <Pressable onPress={handleSignIn} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/auth/sign-up')} style={styles.switchLink}>
          <Text style={styles.switchLinkText}>Don&apos;t have an account? Create one</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: BrandColors.deepForestGreen,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: BrandColors.mutedGrey,
    lineHeight: 20,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  input: {
    backgroundColor: BrandColors.warmCream,
    borderWidth: 1,
    borderColor: BrandColors.borderSubtle,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: Typography.sizes.md,
    color: BrandColors.charcoal,
  },
  feedbackText: {
    fontSize: Typography.sizes.xs,
    color: BrandColors.warningAmber,
    backgroundColor: BrandColors.warningBackground,
    padding: Spacing.sm,
    borderRadius: Radii.sm,
  },
  primaryButton: {
    backgroundColor: BrandColors.primaryGreen,
    paddingVertical: 14,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: BrandColors.white,
    fontWeight: '700',
    fontSize: Typography.sizes.md,
  },
  switchLink: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  switchLinkText: {
    fontSize: Typography.sizes.sm,
    color: BrandColors.primaryGreen,
    fontWeight: '600',
  },
});
