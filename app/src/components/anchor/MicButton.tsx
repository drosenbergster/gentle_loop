/**
 * Mic Button (Hero Element)
 *
 * The primary interaction point on the Anchor Screen.
 * Circle button with energy-state background color, white mic icon,
 * and a gentle breathing pulse animation.
 *
 * Recording behavior wired in Story 1.7 — this is UI-only for now.
 */

import { useEffect } from 'react';
import { StyleSheet, Platform, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import { colors } from '../../theme';
import type { EnergyLevel } from '../../stores/energyStore';

// Web-compatible shadow helper
const createShadow = (offsetY: number, radius: number, opacity: number): any => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0px ${offsetY}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    };
  }
  return {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: Math.round(offsetY / 2),
  };
};

interface MicButtonProps {
  /** Current energy level — determines button background color */
  energyLevel: EnergyLevel;
  /** Button diameter in pixels */
  size: number;
  /** Mic icon size in pixels */
  iconSize: number;
  /** Whether to disable the breathing pulse animation */
  reduceMotion: boolean;
  /** Whether the mic is offline (grayed out, 50% opacity) */
  offline?: boolean;
  /** Whether the mic is actively recording */
  recording?: boolean;
  /** Called when button is tapped (used for offline mode) */
  onPress?: () => void;
  /** Called on press-in (start recording) */
  onPressIn?: () => void;
  /** Called on press-out (stop recording) */
  onPressOut?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MicButton({
  energyLevel,
  size,
  iconSize,
  reduceMotion,
  offline = false,
  recording = false,
  onPress,
  onPressIn,
  onPressOut,
}: MicButtonProps) {
  const pulseScale = useSharedValue(1);

  // Breathing pulse: 1.0 → 1.05 → 1.0, ~4s cycle (disabled when offline)
  useEffect(() => {
    if (!reduceMotion && !offline) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      pulseScale.value = 1;
    }
  }, [reduceMotion, offline, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const bgColor = colors.energy[energyLevel];

  return (
    <AnimatedPressable
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
          opacity: offline ? 0.5 : recording ? 0.85 : 1,
        },
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={
        offline
          ? 'Microphone button. AI is not available offline.'
          : recording
            ? 'Recording. Release to finish.'
            : 'Microphone button. Press and hold to describe your situation.'
      }
      accessibilityHint={offline ? 'Tap for offline ideas' : 'Hold to record your voice'}
    >
      <Text style={[styles.micIcon, { fontSize: iconSize }]}>🎤</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    ...createShadow(4, 8, 0.2),
  },
  micIcon: {
    textAlign: 'center',
  },
});
