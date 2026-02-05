/**
 * Energy Slider
 * 
 * A vertical gradient slider for checking in on energy levels.
 * Sunset gradient: Twilight Purple (low) → Dusty Rose → Golden Amber (high)
 */

import { useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
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

const SLIDER_HEIGHT = 180;
const SLIDER_WIDTH = 60;
const THUMB_SIZE = 28;

export function EnergySlider() {
  const energy = useEnergyStore(state => state.energy);
  const setEnergy = useEnergyStore(state => state.setEnergy);
  
  // Shared value for smooth animation
  const thumbPosition = useSharedValue(energy);
  
  // Track gesture state
  const isActive = useSharedValue(false);

  const updateEnergy = useCallback((value: number) => {
    setEnergy(value);
  }, [setEnergy]);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isActive.value = true;
      runOnJS(triggerHaptic)();
    })
    .onUpdate((event) => {
      // Calculate position (inverted because 0 is at top visually, but bottom semantically)
      const clampedY = Math.max(0, Math.min(SLIDER_HEIGHT, event.y));
      // Invert: top of slider = 1 (high energy), bottom = 0 (low energy)
      const newValue = 1 - (clampedY / SLIDER_HEIGHT);
      thumbPosition.value = newValue;
      runOnJS(updateEnergy)(newValue);
    })
    .onEnd(() => {
      isActive.value = false;
      runOnJS(triggerHaptic)();
    });

  const thumbStyle = useAnimatedStyle(() => {
    // Position from bottom (0) to top (1)
    const positionFromBottom = thumbPosition.value * SLIDER_HEIGHT;
    const scale = isActive.value ? 1.15 : 1;
    
    return {
      bottom: positionFromBottom - THUMB_SIZE / 2,
      transform: [{ scale: withSpring(scale, { damping: 15 }) }],
    };
  });

  // Get energy state label
  const getEnergyLabel = () => {
    if (energy < 0.33) return 'Resting';
    if (energy < 0.66) return 'Warming';
    return 'Glowing';
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{getEnergyLabel()}</Text>
      
      {/* Slider Track */}
      <GestureDetector gesture={panGesture}>
        <View style={styles.sliderContainer}>
          <LinearGradient
            colors={[colors.goldenAmber, colors.dustyRose, colors.twilightPurple]}
            style={styles.track}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
          />
          
          {/* Thumb */}
          <Animated.View style={[styles.thumb, thumbStyle]}>
            <View style={styles.thumbInner} />
          </Animated.View>
        </View>
      </GestureDetector>
      
      {/* Energy indicators */}
      <View style={styles.indicators}>
        <Text style={styles.indicatorText}>✦</Text>
        <Text style={styles.indicatorText}>◦</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
  },
  label: {
    fontFamily: fontFamilies.medium,
    fontSize: 14,
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sliderContainer: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: THUMB_SIZE - 8,
    height: THUMB_SIZE - 8,
    borderRadius: (THUMB_SIZE - 8) / 2,
    backgroundColor: colors.warmCream,
  },
  indicators: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 40,
    marginTop: spacing.sm,
  },
  indicatorText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
