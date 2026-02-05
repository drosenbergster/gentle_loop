/**
 * Energy Slider
 * 
 * A vertical gradient slider for checking in on energy levels.
 * Sunset gradient: Twilight Purple (low) → Dusty Rose → Golden Amber (high)
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

const SLIDER_HEIGHT = 180;
const SLIDER_WIDTH = 60;
const THUMB_SIZE = 28;

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
    // Haptics only work on native
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
