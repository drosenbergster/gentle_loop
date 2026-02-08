/**
 * Onboarding Step 3: Your Name
 * 
 * Optional name input for personalization.
 * User can skip this step entirely.
 */

import { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontFamilies, fontSizes } from '../../src/theme';
import { useSettingsStore } from '../../src/stores';

// Progress dots
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={dotStyles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[dotStyles.dot, i === current && dotStyles.dotActive]}
        />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.softGray,
  },
  dotActive: {
    backgroundColor: colors.dustyRose,
  },
});

export default function YourNameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setUserName = useSettingsStore(state => state.setUserName);
  const [name, setName] = useState('');

  const handleContinue = () => {
    if (name.trim()) {
      setUserName(name.trim());
    }
    router.push('/onboarding/your-anchor');
  };

  const handleSkip = () => {
    router.push('/onboarding/your-anchor');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xxxl }]}>
      {/* Title */}
      <Text style={styles.title}>What should we call you?</Text>
      <Text style={styles.subtitle}>
        This helps us personalize your experience.{'\n'}Totally optional.
      </Text>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your first name"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          maxLength={30}
        />
      </View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* CTA */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleContinue}
        accessibilityRole="button"
        accessibilityLabel="Continue"
      >
        <Text style={styles.buttonText}>
          {name.trim() ? 'Continue' : 'Skip'}
        </Text>
      </Pressable>

      {/* Skip link (only show if name is entered, to clarify the option) */}
      {name.trim() ? (
        <Pressable
          onPress={handleSkip}
          style={styles.skipButton}
          accessibilityRole="button"
          accessibilityLabel="Skip this step"
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      ) : null}

      {/* Progress */}
      <View style={[styles.progressContainer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <ProgressDots current={2} total={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    backgroundColor: colors.warmCream,
  },
  title: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xxl,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fontFamilies.light,
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
    lineHeight: 24,
  },
  inputContainer: {
    marginHorizontal: spacing.md,
  },
  input: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    textAlign: 'center',
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
    }),
  },
  spacer: {
    flex: 1,
  },
  button: {
    backgroundColor: colors.dustyRose,
    paddingVertical: spacing.lg,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.md,
    color: colors.white,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  skipText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  progressContainer: {
    alignItems: 'center',
  },
});
