/**
 * Crisis Banner
 *
 * Displayed when the AI detects a crisis (responseType === 'crisis')
 * or when client-side keyword pre-screening identifies immediate danger.
 *
 * Shows the AI's response (when available) alongside relevant emergency
 * contacts with tappable call/text buttons.
 *
 * Design: Same bottom-sheet pattern as SuggestionCard, but with a warm
 * red accent (colors.error) to visually distinguish urgency without
 * being alarming.
 *
 * ARCH-15: Animations via react-native-reanimated.
 * NFR15: All interactive elements min 44x44pt.
 */

import { useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Linking,
  Platform,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  FadeIn,
  SlideInDown,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors, spacing, fontFamilies } from '../theme';
import { useAccessibility } from '../hooks';
import type { CrisisContext, CrisisResource } from '../data/crisisResources';
import { getResourcesForContext, getAllCrisisResources } from '../data/crisisResources';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface CrisisBannerProps {
  /** The AI's crisis response text (may be null while waiting for AI) */
  aiMessage: string | null;
  /** The detected crisis context (from client-side pre-screening or AI) */
  crisisContext: CrisisContext | null;
  /** Whether to show the banner */
  visible: boolean;
  /** Whether to reduce motion */
  reduceMotion: boolean;
  /** Called when the user dismisses the banner */
  onDismiss: () => void;
}

// Web-compatible shadow
const createShadow = (offsetY: number, radius: number, opacity: number): any => {
  if (Platform.OS === 'web') {
    return { boxShadow: `0px ${offsetY}px ${radius}px rgba(0,0,0,${opacity})` };
  }
  return {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: Math.round(Math.abs(offsetY) / 2),
  };
};

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export function CrisisBanner({
  aiMessage,
  crisisContext,
  visible,
  reduceMotion,
  onDismiss,
}: CrisisBannerProps) {
  const { scale, textColor } = useAccessibility();

  const resources = crisisContext
    ? getResourcesForContext(crisisContext)
    : getAllCrisisResources();

  const handleCall = useCallback(async (resource: CrisisResource) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    try {
      await Linking.openURL(resource.phone);
    } catch {
      // If the phone link fails, try the website
      if (resource.website) {
        await Linking.openURL(resource.website);
      }
    }
  }, []);

  const handleText = useCallback(async (resource: CrisisResource) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (resource.textOption) {
      // Parse text option — e.g. "Text HOME to 741741" → sms:741741
      if (resource.phone.startsWith('sms:')) {
        await Linking.openURL(resource.phone);
      } else if (resource.id === 'suicide-crisis-988') {
        await Linking.openURL('sms:988');
      }
    }
  }, []);

  const handleDismiss = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onDismiss();
  }, [onDismiss]);

  if (!visible) return null;

  const enterAnimation = reduceMotion
    ? FadeIn.duration(100)
    : SlideInDown.duration(400).easing(Easing.out(Easing.cubic));

  return (
    <View style={styles.bannerWrapper}>
      <Animated.View entering={enterAnimation}>
        <View style={styles.banner}>
          {/* Accent bar at top */}
          <View style={styles.accentBar} />

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* AI message (if available) */}
            {aiMessage && (
              <View style={styles.aiMessageContainer}>
                <Text
                  style={[
                    styles.aiMessage,
                    {
                      fontSize: scale(18),
                      lineHeight: scale(27),
                      color: textColor('textPrimary'),
                    },
                  ]}
                >
                  {aiMessage}
                </Text>
              </View>
            )}

            {/* Waiting state (pre-screening caught it, AI hasn't responded yet) */}
            {!aiMessage && (
              <View style={styles.aiMessageContainer}>
                <Text
                  style={[
                    styles.waitingText,
                    {
                      fontSize: scale(16),
                      color: textColor('textSecondary'),
                    },
                  ]}
                >
                  Help is available right now.
                </Text>
              </View>
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Resource label */}
            <Text
              style={[
                styles.resourcesLabel,
                { fontSize: scale(13) },
              ]}
            >
              Reach someone who can help
            </Text>

            {/* Crisis resources */}
            {resources.map((resource) => (
              <View key={resource.id} style={styles.resourceCard}>
                <View style={styles.resourceInfo}>
                  <Text
                    style={[
                      styles.resourceName,
                      { fontSize: scale(15) },
                    ]}
                  >
                    {resource.name}
                  </Text>
                  <Text
                    style={[
                      styles.resourceDescription,
                      { fontSize: scale(13) },
                    ]}
                    numberOfLines={2}
                  >
                    {resource.description}
                  </Text>
                  <Text
                    style={[
                      styles.resourceAvailability,
                      { fontSize: scale(11) },
                    ]}
                  >
                    {resource.availability}
                  </Text>
                </View>

                <View style={styles.resourceActions}>
                  {/* Call button */}
                  {resource.showCallButton && (
                    <Pressable
                      style={({ pressed }) => [
                        styles.callButton,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={() => handleCall(resource)}
                      accessibilityRole="button"
                      accessibilityLabel={`Call ${resource.name} at ${resource.phoneDisplay}`}
                    >
                      <Text style={[styles.callButtonText, { fontSize: scale(14) }]}>
                        Call {resource.phoneDisplay}
                      </Text>
                    </Pressable>
                  )}

                  {/* Text option */}
                  {resource.textOption && (
                    <Pressable
                      style={({ pressed }) => [
                        styles.textButton,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={() => handleText(resource)}
                      accessibilityRole="button"
                      accessibilityLabel={resource.textOption}
                    >
                      <Text style={[styles.textButtonText, { fontSize: scale(13) }]}>
                        {resource.textOption}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Dismiss */}
          <View style={styles.dismissContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.dismissButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleDismiss}
              accessibilityRole="button"
              accessibilityLabel="Dismiss crisis resources"
            >
              <Text style={[styles.dismissText, { fontSize: scale(15) }]}>
                Dismiss
              </Text>
            </Pressable>
          </View>

          {/* AI-generated label */}
          {aiMessage && <Text style={styles.aiLabel}>AI-generated</Text>}
        </View>
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────

const styles = StyleSheet.create({
  bannerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30, // Above SuggestionCard (zIndex: 20)
  },
  banner: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: spacing.lg,
    maxHeight: '80%', // Allow more space than suggestion card for resources
    ...createShadow(-4, 20, 0.15),
  },
  accentBar: {
    height: 4,
    backgroundColor: colors.error,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    flexGrow: 0,
  },

  // AI message
  aiMessageContainer: {
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  aiMessage: {
    fontFamily: fontFamilies.regular,
    fontSize: 18,
    lineHeight: 27,
    color: colors.textPrimary,
  },
  waitingText: {
    fontFamily: fontFamilies.medium,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(61, 61, 61, 0.1)',
    marginBottom: spacing.md,
  },

  // Resources
  resourcesLabel: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(61, 61, 61, 0.06)',
  },
  resourceInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  resourceName: {
    fontFamily: fontFamilies.medium,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  resourceDescription: {
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  resourceAvailability: {
    fontFamily: fontFamilies.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  resourceActions: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },

  // Call button
  callButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: 9999,
    minWidth: 120,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    color: colors.white,
  },

  // Text button
  textButton: {
    borderWidth: 1.5,
    borderColor: colors.error,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 9999,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textButtonText: {
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    color: colors.error,
  },

  // Dismiss
  dismissContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  dismissButton: {
    width: '100%',
    height: 44,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissText: {
    fontFamily: fontFamilies.regular,
    fontSize: 15,
    color: colors.textSecondary,
  },

  // Shared
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  // AI label
  aiLabel: {
    fontFamily: fontFamilies.regular,
    fontSize: 11,
    color: '#767676',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
