/**
 * Processing Overlay
 *
 * FR8: Pulsing ellipsis (...) overlay while AI suggestion is loading.
 * UX-2: Anchor image remains visible underneath.
 */

import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

import { colors, fontFamilies, spacing } from '../../theme';

interface ProcessingOverlayProps {
  visible: boolean;
  reduceMotion: boolean;
}

export function ProcessingOverlay({
  visible,
  reduceMotion,
}: ProcessingOverlayProps) {
  const dotOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (visible && !reduceMotion) {
      dotOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0.3, { duration: 600 }),
        ),
        -1,
        false,
      );
    } else {
      dotOpacity.value = 1;
    }
  }, [visible, reduceMotion]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.overlay}
      pointerEvents="none"
    >
      <View style={styles.dotsContainer}>
        <Animated.Text style={[styles.dots, dotStyle]}>...</Animated.Text>
      </View>
      <Text style={styles.hint}>Getting a suggestion</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dotsContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dots: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 36,
    color: colors.textPrimary,
    letterSpacing: 4,
  },
  hint: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    color: colors.white,
    marginTop: spacing.md,
  },
});
