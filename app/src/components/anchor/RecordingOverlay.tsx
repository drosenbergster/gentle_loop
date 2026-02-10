/**
 * Recording Overlay
 *
 * Displayed while the caregiver is holding the mic button and recording.
 * FR6: Pulsing microphone overlay, anchor image visible underneath.
 * UX-2: Semi-transparent overlay, visual feedback that recording is active.
 */

import { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
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

import { colors, fontFamilies, spacing } from '../../theme';

interface RecordingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Seconds recorded so far */
  duration: number;
  /** Live interim transcript */
  interimTranscript: string;
  /** Whether to reduce motion */
  reduceMotion: boolean;
}

export function RecordingOverlay({
  visible,
  duration,
  interimTranscript,
  reduceMotion,
}: RecordingOverlayProps) {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  useEffect(() => {
    if (visible && !reduceMotion) {
      // Pulsing ring animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: 800, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.in(Easing.ease) }),
        ),
        -1,
        false,
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.1, { duration: 800 }),
          withTiming(0.6, { duration: 800 }),
        ),
        -1,
        false,
      );
    } else {
      pulseScale.value = 1;
      pulseOpacity.value = 0.6;
    }
  }, [visible, reduceMotion]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  if (!visible) return null;

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.overlay}
      pointerEvents="none"
    >
      {/* Pulsing ring */}
      <View style={styles.pulseContainer}>
        <Animated.View style={[styles.pulseRing, ringStyle]} />
        <View style={styles.micCircle}>
          <Text style={styles.micEmoji}>🎤</Text>
        </View>
      </View>

      {/* Duration */}
      <Text style={styles.duration}>{timeDisplay}</Text>

      {/* Interim transcript preview */}
      {interimTranscript.length > 0 && (
        <Text style={styles.transcript} numberOfLines={2}>
          {interimTranscript}
        </Text>
      )}

      {/* Hint */}
      <Text style={styles.hint}>Release to finish</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pulseContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  micCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micEmoji: {
    fontSize: 32,
    textAlign: 'center',
  },
  duration: {
    fontFamily: fontFamilies.medium,
    fontSize: 18,
    color: colors.white,
    marginTop: spacing.lg,
  },
  transcript: {
    fontFamily: fontFamilies.light,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.xxl,
    maxWidth: 300,
  },
  hint: {
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: spacing.sm,
  },
});
