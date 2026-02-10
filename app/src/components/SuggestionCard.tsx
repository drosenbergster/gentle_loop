/**
 * Suggestion Card
 *
 * Displays AI suggestion with 4 action buttons.
 * FR11: That worked, Dismiss, Another, Mic follow-up.
 * FR12: Swipe left-to-right dismisses card (Story 1.11).
 * UX-4: Max 60% screen height, anchor visible behind.
 * UX-3: Fades after 5s inactivity (crisis detection).
 * UX-7: Swipe dismiss same as Dismiss button.
 * UX-9: Gentle easing — 400-600ms card, 300ms micro-interactions.
 * FM-5: Swipe excludes Android back gesture zone (left 20px).
 * ARCH-15: Animations via react-native-reanimated for 60fps.
 * NFR15: All buttons min 44x44pt.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors, spacing, fontFamilies } from '../theme';
import type { EnergyLevel } from '../theme/colors';
import type { ResponseType } from '../types/ai';
import { useAccessibility } from '../hooks';

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────

/** Fade card after 30s of no interaction — enough time to read and re-read (UX-3) */
export const INACTIVITY_TIMEOUT_MS = 30_000;

/** Swipe dismiss threshold — px the card must travel right to trigger dismiss */
const SWIPE_DISMISS_THRESHOLD = 100;

/** Android system back gesture zone width (FM-5) */
const ANDROID_BACK_GESTURE_ZONE = 20;

/** Card animation durations (UX-9) */
const CARD_ENTER_DURATION = 400;
const CARD_EXIT_DURATION = 300;
const MICRO_INTERACTION_DURATION = 300;

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface SuggestionCardProps {
  suggestion: string;
  responseType: ResponseType;
  energyLevel: EnergyLevel;
  reduceMotion: boolean;
  visible: boolean;
  onThatWorked: () => void;
  onDismiss: () => void;
  onAnother: () => void;
  onMicPressIn: () => void;
  onMicPressOut: () => void;
  isRecording: boolean;
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

export function SuggestionCard({
  suggestion,
  responseType,
  energyLevel,
  reduceMotion,
  visible,
  onThatWorked,
  onDismiss,
  onAnother,
  onMicPressIn,
  onMicPressOut,
  isRecording,
}: SuggestionCardProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { scale, textColor } = useAccessibility();
  const [isFaded, setIsFaded] = useState(false);
  const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Shared values for animations
  const cardOpacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const swipeOpacity = useSharedValue(1);

  const maxCardHeight = screenHeight * 0.6; // UX-4
  const energyColor = colors.energy[energyLevel];
  const isOutOfIdeas = responseType === 'out_of_ideas';
  const isPivotQuestion = responseType === 'question'; // Story 5.2

  // --- Crisis detection: inactivity timer (UX-3) ---
  const resetInactivityTimer = useCallback(() => {
    if (isFaded) {
      setIsFaded(false);
      cardOpacity.value = withTiming(1, { duration: 200 });
    }

    if (inactivityRef.current) {
      clearTimeout(inactivityRef.current);
    }

    inactivityRef.current = setTimeout(() => {
      setIsFaded(true);
      cardOpacity.value = withTiming(0.5, { duration: 800 });
    }, INACTIVITY_TIMEOUT_MS);
  }, [isFaded, cardOpacity]);

  useEffect(() => {
    if (visible) {
      // Reset swipe position when card appears
      translateX.value = 0;
      swipeOpacity.value = 1;
      resetInactivityTimer();
    }
    return () => {
      if (inactivityRef.current) clearTimeout(inactivityRef.current);
    };
  }, [visible]);

  // --- Swipe-to-dismiss gesture (FR12, UX-7) ---
  const handleSwipeDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  const panGesture = Gesture.Pan()
    .activeOffsetX(ANDROID_BACK_GESTURE_ZONE) // FM-5: don't activate in Android back zone
    .onUpdate((event) => {
      // Only allow rightward swipe (positive translationX)
      if (event.translationX > 0) {
        translateX.value = event.translationX;
        // Fade as card moves right
        swipeOpacity.value = 1 - event.translationX / (screenWidth * 0.6);
      }
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_DISMISS_THRESHOLD) {
        // Dismiss: animate off screen
        translateX.value = withTiming(
          screenWidth,
          {
            duration: reduceMotion ? 0 : CARD_EXIT_DURATION,
            easing: Easing.out(Easing.ease),
          },
          () => {
            runOnJS(handleSwipeDismiss)();
          },
        );
        swipeOpacity.value = withTiming(0, {
          duration: reduceMotion ? 0 : CARD_EXIT_DURATION,
        });
      } else {
        // Snap back
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        swipeOpacity.value = withSpring(1);
      }
    });

  // Combined animated style: crisis fade + swipe translate
  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value * swipeOpacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  // --- Haptic feedback ---
  const haptic = useCallback((style: 'light' | 'medium') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(
        style === 'light'
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium,
      );
    }
  }, []);

  // --- Action handlers (all reset inactivity) ---
  const handleThatWorked = useCallback(() => {
    resetInactivityTimer();
    haptic('medium');
    onThatWorked();
  }, [onThatWorked, haptic, resetInactivityTimer]);

  const handleDismiss = useCallback(() => {
    resetInactivityTimer();
    haptic('light');
    onDismiss();
  }, [onDismiss, haptic, resetInactivityTimer]);

  const handleAnother = useCallback(() => {
    resetInactivityTimer();
    haptic('light');
    onAnother();
  }, [onAnother, haptic, resetInactivityTimer]);

  const handleMicPressIn = useCallback(() => {
    resetInactivityTimer();
    onMicPressIn();
  }, [onMicPressIn, resetInactivityTimer]);

  const handleMicPressOut = useCallback(() => {
    resetInactivityTimer();
    onMicPressOut();
  }, [onMicPressOut, resetInactivityTimer]);

  const handleCardPress = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  if (!visible) return null;

  const enterAnimation = reduceMotion
    ? FadeIn.duration(100)
    : SlideInDown.duration(CARD_ENTER_DURATION).easing(
        Easing.out(Easing.cubic),
      );

  return (
    <View style={styles.cardWrapper}>
      <GestureDetector gesture={panGesture}>
        <Animated.View entering={enterAnimation}>
          <Pressable onPress={handleCardPress}>
            <Animated.View
              style={[
                styles.card,
                { maxHeight: maxCardHeight },
                animatedCardStyle,
              ]}
            >
              {/* Drag indicator */}
              <View style={styles.dragIndicator} />

              {/* Suggestion text */}
              <Text
                style={[
                  styles.suggestionText,
                  {
                    fontSize: scale(18),
                    lineHeight: scale(27),
                    color: textColor('textPrimary'),
                  },
                ]}
              >
                {suggestion}
              </Text>

              {/* Story 5.2: Pivot question card — mic is primary, hide That Worked/Another */}
              {isPivotQuestion ? (
                <>
                  {/* Primary action: Mic (UX-16) */}
                  <Pressable
                    style={[
                      styles.thatWorkedButton,
                      { backgroundColor: energyColor },
                    ]}
                    onPressIn={handleMicPressIn}
                    onPressOut={handleMicPressOut}
                    accessibilityRole="button"
                    accessibilityLabel="Hold the mic to respond"
                    accessibilityHint="Hold to record your response to the question"
                  >
                    <Text style={[styles.thatWorkedText, { fontSize: scale(16) }]}>
                      🎤 Hold the mic to respond
                    </Text>
                  </Pressable>

                  {/* Dismiss row */}
                  <View style={styles.secondaryRow}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.dismissButton,
                        styles.dismissButtonWide,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={handleDismiss}
                      accessibilityRole="button"
                      accessibilityLabel="Dismiss and end conversation"
                    >
                      <Text style={[styles.dismissText, { fontSize: scale(15) }]}>
                        Dismiss
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  {/* Primary action: That Worked */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.thatWorkedButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={handleThatWorked}
                    accessibilityRole="button"
                    accessibilityLabel="That worked — save this suggestion"
                  >
                    <Text style={[styles.thatWorkedText, { fontSize: scale(16) }]}>
                      ✓ That worked
                    </Text>
                  </Pressable>

                  {/* Secondary action row */}
                  <View style={styles.secondaryRow}>
                    {/* Dismiss */}
                    <Pressable
                      style={({ pressed }) => [
                        styles.dismissButton,
                        isOutOfIdeas && styles.dismissButtonWide,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={handleDismiss}
                      accessibilityRole="button"
                      accessibilityLabel="Dismiss this suggestion"
                    >
                      <Text
                        style={[styles.dismissText, { fontSize: scale(15) }]}
                      >
                        Dismiss
                      </Text>
                    </Pressable>

                    {/* Another (hidden when out of ideas — UX-14) */}
                    {!isOutOfIdeas && (
                      <Pressable
                        style={({ pressed }) => [
                          styles.anotherButton,
                          { borderColor: energyColor },
                          pressed && styles.buttonPressed,
                        ]}
                        onPress={handleAnother}
                        accessibilityRole="button"
                        accessibilityLabel="Get another suggestion"
                      >
                        <Text
                          style={[
                            styles.anotherText,
                            { color: energyColor, fontSize: scale(15) },
                          ]}
                        >
                          Another
                        </Text>
                      </Pressable>
                    )}

                    {/* Mic follow-up button */}
                    <Pressable
                      style={[
                        styles.cardMicButton,
                        { backgroundColor: energyColor },
                      ]}
                      onPressIn={handleMicPressIn}
                      onPressOut={handleMicPressOut}
                      accessibilityRole="button"
                      accessibilityLabel="Hold to add more context"
                      accessibilityHint="Hold to record a follow-up message"
                    >
                      <Text style={styles.cardMicIcon}>🎤</Text>
                    </Pressable>
                  </View>
                </>
              )}

              {/* AI-generated label (CM-3) */}
              <Text style={styles.aiLabel}>AI-generated</Text>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: 12,
    paddingBottom: spacing.lg,
    ...createShadow(-4, 20, 0.15),
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(61, 61, 61, 0.3)',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  suggestionText: {
    fontFamily: fontFamilies.regular,
    fontSize: 18,
    lineHeight: 27,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },

  // --- That Worked (primary) ---
  thatWorkedButton: {
    width: '100%',
    height: 48,
    backgroundColor: colors.success,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  thatWorkedText: {
    fontFamily: fontFamilies.medium,
    fontSize: 16,
    color: colors.white,
  },

  // --- Secondary row ---
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  dismissButton: {
    width: '38%',
    height: 44,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissButtonWide: {
    width: '60%',
  },
  dismissText: {
    fontFamily: fontFamilies.regular,
    fontSize: 15,
    color: colors.textSecondary,
  },
  anotherButton: {
    width: '38%',
    height: 44,
    borderRadius: 9999,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  anotherText: {
    fontFamily: fontFamilies.medium,
    fontSize: 15,
  },
  cardMicButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMicIcon: {
    fontSize: 20,
    textAlign: 'center',
  },

  // --- Shared ---
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  // --- AI label (CM-3, NFR12) ---
  // WCAG AA: #767676 on #FFFFFF = 4.54:1 contrast ratio (meets 4.5:1 minimum)
  aiLabel: {
    fontFamily: fontFamilies.regular,
    fontSize: 11,
    color: '#767676',
    marginTop: spacing.md,
  },
});
