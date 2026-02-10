/**
 * Breathing Overlay
 *
 * Story 3.2: Breathing timer with auto follow-up.
 * UX-6: Expanding/contracting circle, 4-second cycle.
 * UFG-9: Skip button is prominent, not a small text link.
 * UFG-3: Mic button remains accessible during timer.
 * UX-8: Reduce Motion → static indicator with countdown.
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, AppState, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

import { colors, spacing, fontFamilies } from '../../theme';
import type { EnergyLevel } from '../../theme/colors';

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────

/** Default breathing timer duration in ms */
export const BREATHING_DURATION_MS = 90_000; // 90 seconds

/** Breathing circle animation cycle (4 seconds) */
const BREATHE_CYCLE_MS = 4_000;

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface BreathingOverlayProps {
  visible: boolean;
  energyLevel: EnergyLevel;
  reduceMotion: boolean;
  /** Called when timer expires naturally */
  onTimerExpired: () => void;
  /** Called when user taps Skip */
  onSkip: () => void;
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export function BreathingOverlay({
  visible,
  energyLevel,
  reduceMotion,
  onTimerExpired,
  onSkip,
}: BreathingOverlayProps) {
  const [remainingMs, setRemainingMs] = useState(BREATHING_DURATION_MS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const appStateRef = useRef(AppState.currentState);

  const breatheScale = useSharedValue(0.8);
  const energyColor = colors.energy[energyLevel];

  // --- Breathing animation ---
  useEffect(() => {
    if (visible && !reduceMotion) {
      breatheScale.value = withRepeat(
        withSequence(
          withTiming(1.0, {
            duration: BREATHE_CYCLE_MS / 2,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.8, {
            duration: BREATHE_CYCLE_MS / 2,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      );
    } else {
      breatheScale.value = 0.9;
    }
  }, [visible, reduceMotion, breatheScale]);

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breatheScale.value }],
  }));

  // --- Countdown timer ---
  useEffect(() => {
    if (!visible) {
      if (timerRef.current) clearInterval(timerRef.current);
      setRemainingMs(BREATHING_DURATION_MS);
      return;
    }

    startTimeRef.current = Date.now();
    setRemainingMs(BREATHING_DURATION_MS);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, BREATHING_DURATION_MS - elapsed);
      setRemainingMs(remaining);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        onTimerExpired();
      }
    }, 500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible, onTimerExpired]);

  // --- App resume handling (FM-9) ---
  useEffect(() => {
    if (!visible) return;

    const sub = AppState.addEventListener('change', (nextState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        // App resumed — check if timer should have expired
        const elapsed = Date.now() - startTimeRef.current;
        if (elapsed >= BREATHING_DURATION_MS) {
          if (timerRef.current) clearInterval(timerRef.current);
          setRemainingMs(0);
          onTimerExpired();
        }
      }
      appStateRef.current = nextState;
    });

    return () => sub.remove();
  }, [visible, onTimerExpired]);

  const handleSkip = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    onSkip();
  }, [onSkip]);

  if (!visible) return null;

  // Format remaining time
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')} remaining`;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.overlay}
      pointerEvents="box-none"
    >
      <View style={styles.content}>
        {/* Breathing circle */}
        <Animated.View
          style={[
            styles.breatheCircle,
            {
              borderColor: energyColor,
              backgroundColor: `${energyColor}0D`, // 5% opacity
            },
            breatheStyle,
          ]}
        />

        {/* Timer */}
        <Text style={styles.timerText}>{timeDisplay}</Text>

        {/* Skip button — prominent, not a small link (UFG-9) */}
        <Pressable
          style={({ pressed }) => [
            styles.skipButton,
            pressed && styles.skipPressed,
          ]}
          onPress={handleSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip breathing timer"
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  content: {
    alignItems: 'center',
  },
  breatheCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  timerText: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
  skipButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    minWidth: 120,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipPressed: {
    opacity: 0.7,
  },
  skipText: {
    fontFamily: fontFamilies.medium,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
