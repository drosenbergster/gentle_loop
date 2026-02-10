/**
 * Energy Slider
 *
 * A vertical gradient slider for checking in on energy levels.
 * Sunset gradient: Twilight Purple (low) → Dusty Rose → Golden Amber (high)
 *
 * FM-3: Snaps to exactly 3 discrete positions — no intermediate values.
 *
 * Labels alongside the track:
 * - "I've got this" (top)
 * - "Holding steady" (middle)
 * - "Running low" (bottom)
 */

import { useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors, spacing, fontFamilies } from '../theme';
import { useEnergyStore, type EnergyLevel } from '../stores';
import { useAccessibility } from '../hooks';

// Slider dimensions
const SLIDER_HEIGHT = 160;
const SLIDER_WIDTH = 44;
const THUMB_SIZE = 26;

// Discrete snap positions (normalized 0-1, bottom to top)
const SNAP_POSITIONS: { level: EnergyLevel; position: number; label: string }[] = [
  { level: 'running_low', position: 0.15, label: 'Running low' },
  { level: 'holding_steady', position: 0.5, label: 'Holding steady' },
  { level: 'ive_got_this', position: 0.85, label: "I've got this" },
];

/** Map energy level to its normalized position on the track */
function levelToPosition(level: EnergyLevel): number {
  const snap = SNAP_POSITIONS.find((s) => s.level === level);
  return snap?.position ?? 0.5;
}

/** Find the nearest snap level for a given position */
function positionToLevel(position: number): EnergyLevel {
  let closest = SNAP_POSITIONS[0];
  let minDist = Math.abs(position - closest.position);

  for (const snap of SNAP_POSITIONS) {
    const dist = Math.abs(position - snap.position);
    if (dist < minDist) {
      minDist = dist;
      closest = snap;
    }
  }

  return closest.level;
}

// Web-compatible shadow helper
const createShadow = (offsetY: number, radius: number, opacity: number) => {
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

interface EnergySliderProps {
  /** When true, renders with light text for overlay on dark backgrounds */
  overlay?: boolean;
}

export function EnergySlider({ overlay = false }: EnergySliderProps) {
  const energyLevel = useEnergyStore((state) => state.energyLevel);
  const setEnergyLevel = useEnergyStore((state) => state.setEnergyLevel);
  const { scale, textColor } = useAccessibility();

  // Shared value for smooth animation — maps to normalized position
  const thumbPosition = useSharedValue(levelToPosition(energyLevel));

  // Track gesture state
  const isActive = useSharedValue(false);

  const updateEnergy = useCallback(
    (level: EnergyLevel) => {
      setEnergyLevel(level);
    },
    [setEnergyLevel],
  );

  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const snapToNearest = useCallback(
    (rawPosition: number) => {
      const level = positionToLevel(rawPosition);
      const snapPos = levelToPosition(level);
      thumbPosition.value = withSpring(snapPos, { damping: 15, stiffness: 150 });
      updateEnergy(level);
      triggerHaptic();
    },
    [updateEnergy, triggerHaptic, thumbPosition],
  );

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isActive.value = true;
      runOnJS(triggerHaptic)();
    })
    .onUpdate((event) => {
      const clampedY = Math.max(0, Math.min(SLIDER_HEIGHT, event.y));
      const rawPosition = 1 - clampedY / SLIDER_HEIGHT;
      thumbPosition.value = rawPosition;
    })
    .onEnd((event) => {
      isActive.value = false;
      const clampedY = Math.max(0, Math.min(SLIDER_HEIGHT, event.y));
      const rawPosition = 1 - clampedY / SLIDER_HEIGHT;
      runOnJS(snapToNearest)(rawPosition);
    });

  const thumbStyle = useAnimatedStyle(() => {
    const positionFromBottom = thumbPosition.value * SLIDER_HEIGHT;
    const thumbScale = isActive.value ? 1.15 : 1;

    return {
      bottom: positionFromBottom - THUMB_SIZE / 2,
      transform: [{ scale: withSpring(thumbScale, { damping: 15 }) }],
    };
  });

  // Determine which label is currently active
  const activeIndex = SNAP_POSITIONS.findIndex((s) => s.level === energyLevel);

  return (
    <View style={styles.container}>
      {/* "Your energy" context label */}
      <Text
        style={[
          styles.contextLabel,
          overlay && styles.contextLabelOverlay,
          !overlay && { color: textColor('textMuted'), fontSize: scale(12) },
        ]}
      >
        Your energy
      </Text>

      <View style={styles.sliderRow}>
        {/* Slider Track */}
        <GestureDetector gesture={panGesture}>
          <View style={styles.sliderContainer}>
            {/* Frosted backing for overlay mode */}
            {overlay && <View style={styles.frostedBacking} />}

            <LinearGradient
              colors={[colors.goldenAmber, colors.dustyRose, colors.twilightPurple]}
              style={styles.track}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />

            {/* Thumb */}
            <Animated.View style={[styles.thumb, thumbStyle]}>
              <View style={styles.thumbInner} />
            </Animated.View>
          </View>
        </GestureDetector>

        {/* Permanent labels alongside track */}
        <View style={styles.labelsColumn}>
          {[...SNAP_POSITIONS].reverse().map((item, index) => {
            const labelIndex = SNAP_POSITIONS.length - 1 - index;
            const isActiveLabel = labelIndex === activeIndex;
            return (
              <Text
                key={item.level}
                style={[
                  styles.levelLabel,
                  overlay && styles.levelLabelOverlay,
                  isActiveLabel && styles.levelLabelActive,
                  isActiveLabel && overlay && styles.levelLabelActiveOverlay,
                  !overlay && { fontSize: scale(12) },
                  !overlay && isActiveLabel && { color: textColor('textSecondary') },
                  !overlay && !isActiveLabel && { color: textColor('textMuted') },
                ]}
              >
                {item.label}
              </Text>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  contextLabel: {
    fontFamily: fontFamilies.light,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: 2,
  },
  contextLabelOverlay: {
    color: 'rgba(255, 255, 255, 0.7)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sliderContainer: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frostedBacking: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: SLIDER_WIDTH / 2,
  },
  track: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    borderRadius: SLIDER_WIDTH / 2,
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...createShadow(2, 4, 0.25),
  },
  thumbInner: {
    width: THUMB_SIZE - 8,
    height: THUMB_SIZE - 8,
    borderRadius: (THUMB_SIZE - 8) / 2,
    backgroundColor: colors.warmCream,
  },
  labelsColumn: {
    height: SLIDER_HEIGHT,
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  levelLabel: {
    fontFamily: fontFamilies.light,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  levelLabelOverlay: {
    color: 'rgba(255, 255, 255, 0.5)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  levelLabelActive: {
    fontFamily: fontFamilies.medium,
    color: colors.textSecondary,
  },
  levelLabelActiveOverlay: {
    color: 'rgba(255, 255, 255, 0.95)',
  },
});
