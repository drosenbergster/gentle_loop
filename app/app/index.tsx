/**
 * Anchor Screen
 * 
 * The primary entry point - a calming reset space
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

import { EnergySlider } from '../src/components/EnergySlider';
import { IdeasOverlay } from '../src/components/IdeasOverlay';
import { colors, spacing, fontFamilies } from '../src/theme';
import { useEnergyState, useSettingsStore } from '../src/stores';
import { getRandomAffirmation, calmPrompts } from '../src/data';

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
  const energyState = useEnergyState();
  const anchorImage = useSettingsStore(state => state.anchorImage);
  const reduceMotion = useSettingsStore(state => state.reduceMotion);
  
  const [showIdeas, setShowIdeas] = useState(false);
  const [affirmation, setAffirmation] = useState(() => getRandomAffirmation().text);
  const [calmPrompt, setCalmPrompt] = useState(calmPrompts[0]);

  // Breathing pulse animation
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (!reduceMotion) {
      // Gentle breathing pulse: 4s in, 6s out
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [reduceMotion]);

  // Rotate calm prompts
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * calmPrompts.length);
      setCalmPrompt(calmPrompts[randomIndex]);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

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
      {/* Background with tint */}
      <View style={[styles.background, { backgroundColor: tintColor }]} />
      
      {/* Anchor Image */}
      <Animated.View style={[styles.imageContainer, pulseStyle]}>
        <Image
          source={imageSource}
          style={styles.anchorImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Content Overlay */}
      <View style={[styles.contentOverlay, { paddingTop: insets.top + spacing.lg }]}>
        {/* Calm Prompt - positioned below the image */}
        <View style={styles.calmPromptContainer}>
          <Text style={styles.calmPrompt}>{calmPrompt}</Text>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Affirmation */}
        <View style={styles.affirmationContainer}>
          <Text style={styles.affirmation}>{affirmation}</Text>
        </View>

        {/* Energy Slider */}
        <View style={styles.sliderContainer}>
          <EnergySlider />
        </View>

        {/* Ideas Button */}
        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + spacing.xl }]}>
          <Pressable
            style={({ pressed }) => [
              styles.ideasButton,
              pressed && styles.ideasButtonPressed,
            ]}
            onPress={handleIdeasPress}
            accessibilityRole="button"
            accessibilityLabel="I could use some ideas"
          >
            <Text style={styles.ideasButtonText}>I could use some ideas</Text>
          </Pressable>
        </View>
      </View>

      {/* Ideas Overlay */}
      <IdeasOverlay visible={showIdeas} onClose={handleIdeasClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.warmCream,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  imageContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.06,
    left: spacing.screenPadding,
    right: spacing.screenPadding,
    height: SCREEN_HEIGHT * 0.35,
    borderRadius: 24,
    overflow: 'hidden',
    ...createShadow(8, 16, 0.15),
  },
  anchorImage: {
    width: '100%',
    height: '100%',
  },
  contentOverlay: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
  },
  calmPromptContainer: {
    // Position below the image: top (6%) + height (35%) + gap (4%) = 45%
    marginTop: SCREEN_HEIGHT * 0.45,
    alignItems: 'center',
  },
  calmPrompt: {
    fontFamily: fontFamilies.light,
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  affirmationContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  affirmation: {
    fontFamily: fontFamilies.light,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
  },
  sliderContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  ideasButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: 50,
    ...createShadow(4, 8, 0.1),
  },
  ideasButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  ideasButtonText: {
    fontFamily: fontFamilies.medium,
    fontSize: 16,
    color: colors.textPrimary,
  },
});
