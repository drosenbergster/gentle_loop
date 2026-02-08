/**
 * Onboarding Step 1: Welcome
 * 
 * App introduction with tagline and wellness disclaimer.
 */

import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontFamilies, fontSizes } from '../../src/theme';

// Progress dots component
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

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xxxl }]}>
      {/* Logo area */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoIcon}>~</Text>
        <Text style={styles.appName}>gentle loop</Text>
      </View>

      {/* Tagline */}
      <Text style={styles.tagline}>
        A moment of calm{'\n'}when you need it most.
      </Text>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          This app is your personal reset button. Open it when caregiving gets
          heavy. We'll help you pause, breathe, and find your next step.
        </Text>
      </View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Disclaimer */}
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimer}>
          This is a wellness support tool, not a medical device. It does not
          provide medical advice or diagnosis.
        </Text>
      </View>

      {/* CTA */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => router.push('/onboarding/how-it-works')}
        accessibilityRole="button"
        accessibilityLabel="Get started"
      >
        <Text style={styles.buttonText}>Get started</Text>
      </Pressable>

      {/* Progress */}
      <View style={[styles.progressContainer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <ProgressDots current={0} total={4} />
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoIcon: {
    fontSize: 48,
    color: colors.dustyRose,
    fontFamily: fontFamilies.light,
    marginBottom: spacing.sm,
  },
  appName: {
    fontFamily: fontFamilies.light,
    fontSize: fontSizes.xxxl,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  tagline: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: spacing.xxl,
  },
  descriptionContainer: {
    paddingHorizontal: spacing.lg,
  },
  description: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  spacer: {
    flex: 1,
  },
  disclaimerContainer: {
    backgroundColor: colors.softGray,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  disclaimer: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  button: {
    backgroundColor: colors.dustyRose,
    paddingVertical: spacing.lg,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: spacing.lg,
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
  progressContainer: {
    alignItems: 'center',
  },
});
