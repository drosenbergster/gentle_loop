/**
 * Anchor Screen
 * 
 * The primary entry point - a calming reset space.
 * Layout: Large image (with overlaid slider) → Affirmation → Ideas button
 */

import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Platform, Image } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';

import { EnergySlider } from '../src/components/EnergySlider';
import { IdeasOverlay } from '../src/components/IdeasOverlay';
import { colors, spacing, fontFamilies } from '../src/theme';
import { useEnergyState, useSettingsStore } from '../src/stores';
import { useAccessibility } from '../src/hooks';
import { getRandomAffirmation } from '../src/data';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Default images (bundled with app)
const defaultImages: Record<string, any> = {
  'default-mountains': require('../assets/images/mountains.jpg'),
  'default-water': require('../assets/images/water.jpg'),
  'default-sunset': require('../assets/images/sunset.jpg'),
};

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

export default function AnchorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const energyState = useEnergyState();
  const anchorImage = useSettingsStore(state => state.anchorImage);
  const reduceMotion = useSettingsStore(state => state.reduceMotion);
  const hasCompletedOnboarding = useSettingsStore(state => state.hasCompletedOnboarding);
  
  const { scale, textColor } = useAccessibility();
  const [showIdeas, setShowIdeas] = useState(false);
  const [affirmation, setAffirmation] = useState(() => getRandomAffirmation().text);

  // Redirect to onboarding if not completed
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // Breathing pulse animation
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (!reduceMotion) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [reduceMotion]);

  // Update affirmation when energy state changes
  useEffect(() => {
    const newAffirmation = getRandomAffirmation(energyState);
    setAffirmation(newAffirmation.text);
  }, [energyState]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Get the tint color for current energy state
  const tintColor = colors.tints[energyState];

  // Get the image source
  const imageSource = anchorImage.startsWith('default-')
    ? defaultImages[anchorImage]
    : { uri: anchorImage };

  const handleIdeasPress = useCallback(() => {
    setShowIdeas(true);
  }, []);

  const handleIdeasClose = useCallback(() => {
    setShowIdeas(false);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background with subtle energy tint */}
      <View style={[styles.background, { backgroundColor: tintColor }]} />
      
      {/* Main Content */}
      <View style={[styles.content, { paddingTop: insets.top + spacing.md }]}>
        
        {/* Settings button */}
        <Pressable
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </Pressable>

        {/* Anchor Image with overlaid Energy Slider */}
        <Animated.View style={[styles.imageWrapper, pulseStyle]}>
          <View style={styles.imageContainer}>
            <Image
              source={imageSource}
              style={styles.anchorImage}
              resizeMode="cover"
            />
            
            {/* Energy Slider overlaid on image */}
            <View style={styles.sliderOverlay}>
              <EnergySlider overlay />
            </View>
          </View>
        </Animated.View>

        {/* Affirmation — responds to energy state */}
        <View style={styles.affirmationContainer}>
          <Text style={[styles.affirmation, { fontSize: scale(20), lineHeight: scale(30), color: textColor('textPrimary') }]}>
            {affirmation}
          </Text>
        </View>

        {/* Flexible spacer pushes button to bottom */}
        <View style={styles.spacer} />

        {/* Ideas Button */}
        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Pressable
            style={({ pressed }) => [
              styles.ideasButton,
              pressed && styles.ideasButtonPressed,
            ]}
            onPress={handleIdeasPress}
            accessibilityRole="button"
            accessibilityLabel="Gentle ideas for support"
          >
            <Text style={[styles.ideasButtonText, { fontSize: scale(15), color: textColor('textPrimary') }]}>Gentle ideas</Text>
          </Pressable>
        </View>
      </View>

      {/* Ideas Overlay */}
      <IdeasOverlay visible={showIdeas} onClose={handleIdeasClose} />
    </View>
  );
}

// Image takes ~55% of viewport
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.55;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.warmCream,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
  },
  settingsButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  settingsIcon: {
    fontSize: 20,
    color: colors.textMuted,
  },

  // -- Image with slider overlay --
  imageWrapper: {
    alignSelf: 'center',
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    ...createShadow(8, 16, 0.12),
  },
  anchorImage: {
    width: '100%',
    height: '100%',
  },
  sliderOverlay: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
  },

  // -- Affirmation --
  affirmationContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  affirmation: {
    fontFamily: fontFamilies.light,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
  },

  // -- Spacer --
  spacer: {
    flex: 1,
    minHeight: spacing.lg,
  },

  // -- Ideas button --
  buttonContainer: {
    alignItems: 'center',
  },
  ideasButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 50,
    ...createShadow(4, 8, 0.1),
  },
  ideasButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  ideasButtonText: {
    fontFamily: fontFamilies.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
