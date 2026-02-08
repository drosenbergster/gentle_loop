/**
 * Energy Slider
 * 
 * A vertical gradient slider for checking in on energy levels.
 * Sunset gradient: Twilight Purple (low) → Dusty Rose → Golden Amber (high)
 * 
 * Shows permanent labels alongside the track:
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
import { useEnergyStore } from '../stores';
import { useAccessibility } from '../hooks';

// Slider dimensions
const SLIDER_HEIGHT = 160;
const SLIDER_WIDTH = 44;
const THUMB_SIZE = 26;

// Energy level labels (bottom to top)
const ENERGY_LABELS = [
  { label: 'Running low', position: 0.15 },
  { label: 'Holding steady', position: 0.5 },
  { label: "I've got this", position: 0.85 },
];

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
  const energy = useEnergyStore(state => state.energy);
  const setEnergy = useEnergyStore(state => state.setEnergy);
  const { scale, textColor } = useAccessibility();
  
  // Shared value for smooth animation
  const thumbPosition = useSharedValue(energy);
  
  // Track gesture state
  const isActive = useSharedValue(false);

  const updateEnergy = useCallback((value: number) => {
    setEnergy(value);
  }, [setEnergy]);

  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isActive.value = true;
      runOnJS(triggerHaptic)();
    })
    .onUpdate((event) => {
      const clampedY = Math.max(0, Math.min(SLIDER_HEIGHT, event.y));
      const newValue = 1 - (clampedY / SLIDER_HEIGHT);
      thumbPosition.value = newValue;
      runOnJS(updateEnergy)(newValue);
    })
    .onEnd(() => {
      isActive.value = false;
      runOnJS(triggerHaptic)();
    });

  const thumbStyle = useAnimatedStyle(() => {
    const positionFromBottom = thumbPosition.value * SLIDER_HEIGHT;
    const scale = isActive.value ? 1.15 : 1;
    
    return {
      bottom: positionFromBottom - THUMB_SIZE / 2,
      transform: [{ scale: withSpring(scale, { damping: 15 }) }],
    };
  });

  // Determine which label is currently active based on energy
  const getActiveIndex = () => {
    if (energy < 0.33) return 0;
    if (energy < 0.66) return 1;
    return 2;
  };

  const activeIndex = getActiveIndex();

  return (
    <View style={styles.container}>
      {/* "Your energy" context label */}
      <Text style={[
        styles.contextLabel,
        overlay && styles.contextLabelOverlay,
        !overlay && { color: textColor('textMuted'), fontSize: scale(12) },
      ]}>
        Your energy
      </Text>

      <View style={styles.sliderRow}>
        {/* Slider Track */}
        <GestureDetector gesture={panGesture}>
          <View style={styles.sliderContainer}>
            {/* Frosted backing for overlay mode */}
            {overlay && (
              <View style={styles.frostedBacking} />
            )}
            
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
          {[...ENERGY_LABELS].reverse().map((item, index) => {
            const labelIndex = ENERGY_LABELS.length - 1 - index;
            const isActive = labelIndex === activeIndex;
            return (
              <Text
                key={item.label}
                style={[
                  styles.levelLabel,
                  overlay && styles.levelLabelOverlay,
                  isActive && styles.levelLabelActive,
                  isActive && overlay && styles.levelLabelActiveOverlay,
                  !overlay && { fontSize: scale(12) },
                  !overlay && isActive && { color: textColor('textSecondary') },
                  !overlay && !isActive && { color: textColor('textMuted') },
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
