import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { KhanaSceneLogo } from '@/components/KhanaSceneLogo';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSavedStore } from '@/stores/useSavedStore';
import { BrandColors, Radii, Spacing, Typography } from '@/theme';

export default function SignUpScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const { signUpWithEmail, isSubmitting } = useAuthStore();
  const syncWithCloudForUser = useSavedStore((s) => s.syncWithCloudForUser);

  const handleSignUp = async () => {
    setFeedback(null);
    const result = await signUpWithEmail(displayName, email, password);
    if (!result.ok) {
      setFeedback(result.error ?? 'Account creation failed.');
      return;
    }
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      await syncWithCloudForUser(currentUser.id);
    }
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <KhanaSceneLogo size="md" showTagline />

      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Accounts are optional. Create one if you want cloud-synced favourites and original review
          submissions.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            placeholderTextColor={BrandColors.mutedGrey}
            style={styles.input}
          />
        </View>

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
          <Text style={styles.label}>Password (minimum 8 characters)</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            placeholderTextColor={BrandColors.mutedGrey}
            secureTextEntry
            style={styles.input}
          />
        </View>

        {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}

        <Pressable
          disabled={isSubmitting}
          onPress={handleSignUp}
          style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}>
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/auth/sign-in')} style={styles.switchLink}>
          <Text style={styles.switchLinkText}>Already have an account? Sign in</Text>
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
  buttonDisabled: {
    opacity: 0.6,
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
