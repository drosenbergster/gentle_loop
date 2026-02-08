/**
 * Onboarding Step 4: Choose Your Anchor
 * 
 * Select a default nature image as the anchor.
 * Option to skip (uses default mountains).
 * Photo upload deferred to Settings for MVP simplicity.
 */

import { useState } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontFamilies, fontSizes } from '../../src/theme';
import { useSettingsStore } from '../../src/stores';

const ANCHOR_OPTIONS = [
  {
    key: 'default-mountains',
    label: 'Mountains',
    source: require('../../assets/images/mountains.jpg'),
  },
  {
    key: 'default-water',
    label: 'Water',
    source: require('../../assets/images/water.jpg'),
  },
  {
    key: 'default-sunset',
    label: 'Sunset',
    source: require('../../assets/images/sunset.jpg'),
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

export default function YourAnchorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setAnchorImage = useSettingsStore(state => state.setAnchorImage);
  const setOnboardingComplete = useSettingsStore(state => state.setOnboardingComplete);
  const [selected, setSelected] = useState('default-mountains');

  const handleStart = () => {
    setAnchorImage(selected);
    setOnboardingComplete();
    router.replace('/');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xxxl }]}>
      {/* Title */}
      <Text style={styles.title}>Choose your anchor</Text>
      <Text style={styles.subtitle}>
        This image will greet you every time{'\n'}you open the app.
      </Text>

      {/* Image options */}
      <View style={styles.optionsContainer}>
        {ANCHOR_OPTIONS.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.optionCard,
              selected === option.key && styles.optionCardSelected,
            ]}
            onPress={() => setSelected(option.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: selected === option.key }}
            accessibilityLabel={`Select ${option.label} image`}
          >
            <Image
              source={option.source}
              style={styles.optionImage}
              resizeMode="cover"
            />
            {selected === option.key && (
              <View style={styles.checkBadge}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            )}
            <Text style={[
              styles.optionLabel,
              selected === option.key && styles.optionLabelSelected,
            ]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Helper text */}
      <Text style={styles.helperText}>
        You can change this anytime in Settings.
      </Text>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* CTA */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleStart}
        accessibilityRole="button"
        accessibilityLabel="Start using Gentle Loop"
      >
        <Text style={styles.buttonText}>Start using Gentle Loop</Text>
      </Pressable>

      {/* Progress */}
      <View style={[styles.progressContainer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <ProgressDots current={3} total={4} />
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
    marginBottom: spacing.xxl,
    lineHeight: 24,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  optionCard: {
    alignItems: 'center',
    width: 100,
  },
  optionCardSelected: {
    // Selection indicated by border and badge
  },
  optionImage: {
    width: 96,
    height: 96,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.dustyRose,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: colors.white,
    fontFamily: fontFamilies.semiBold,
    fontSize: 14,
  },
  optionLabel: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  optionLabelSelected: {
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  helperText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
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
