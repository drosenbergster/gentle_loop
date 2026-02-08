/**
 * Onboarding Step 2: How It Works
 * 
 * Visual 3-step explanation of the app's core loop.
 */

import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontFamilies, fontSizes } from '../../src/theme';

const STEPS = [
  {
    number: '1',
    title: 'Open the app',
    description: 'See your anchor image. Take a breath.',
    color: colors.twilightPurple,
  },
  {
    number: '2',
    title: 'Check your energy',
    description: 'Slide to show how you\'re feeling. No judgment, just a check-in.',
    color: colors.dustyRose,
  },
  {
    number: '3',
    title: 'Get support',
    description: 'Tap for a gentle idea matched to where you are right now.',
    color: colors.goldenAmber,
  },
];

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

export default function HowItWorksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xxxl }]}>
      {/* Title */}
      <Text style={styles.title}>How it works</Text>
      <Text style={styles.subtitle}>Three simple moments, whenever you need them.</Text>

      {/* Steps */}
      <View style={styles.stepsContainer}>
        {STEPS.map((step) => (
          <View key={step.number} style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: step.color }]}>
              <Text style={styles.stepNumberText}>{step.number}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* CTA */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => router.push('/onboarding/your-name')}
        accessibilityRole="button"
        accessibilityLabel="Continue"
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>

      {/* Progress */}
      <View style={[styles.progressContainer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <ProgressDots current={1} total={4} />
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
  },
  stepsContainer: {
    gap: spacing.xl,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.md,
    color: colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  spacer: {
    flex: 1,
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
