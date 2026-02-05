/**
 * Ideas Overlay
 * 
 * Displays contextual ideas matched to energy state.
 * Validates first, then offers actionable guidance.
 */

import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, Dimensions, Modal } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors, spacing, fontFamilies, borderRadius } from '../theme';
import { useEnergyState, useSettingsStore } from '../stores';
import { getRandomIdea, getNextIdea, Idea } from '../data';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface IdeasOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export function IdeasOverlay({ visible, onClose }: IdeasOverlayProps) {
  const energyState = useEnergyState();
  const reduceMotion = useSettingsStore(state => state.reduceMotion);
  
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(null);
  
  // Animation values
  const overlayOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(SCREEN_HEIGHT);

  // Load initial idea when overlay becomes visible
  useEffect(() => {
    if (visible) {
      const idea = getRandomIdea(energyState);
      setCurrentIdea(idea);
      
      // Animate in
      overlayOpacity.value = withTiming(1, { duration: 200 });
      cardTranslateY.value = withSpring(0, {
        damping: reduceMotion ? 20 : 15,
        stiffness: reduceMotion ? 150 : 100,
      });
    } else {
      // Animate out
      overlayOpacity.value = withTiming(0, { duration: 150 });
      cardTranslateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 });
    }
  }, [visible, energyState, reduceMotion]);

  const handleSomethingElse = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Get a different idea
    const nextIdea = getNextIdea(energyState, currentIdea?.id);
    setCurrentIdea(nextIdea);
    
    // Quick bounce animation
    if (!reduceMotion) {
      cardTranslateY.value = withSpring(20, { damping: 20, stiffness: 300 });
      setTimeout(() => {
        cardTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      }, 100);
    }
  }, [energyState, currentIdea, reduceMotion]);

  const handleThatHelps = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  }, [onClose]);

  const handleBackdropPress = useCallback(() => {
    onClose();
  }, [onClose]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardTranslateY.value }],
  }));

  if (!currentIdea) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, overlayStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress} />
        </Animated.View>

        {/* Card */}
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Validation */}
          <Text style={styles.validation}>"{currentIdea.validation}"</Text>
          
          {/* Title */}
          <Text style={styles.title}>{currentIdea.title}</Text>
          
          {/* Content */}
          <Text style={styles.content}>{currentIdea.content}</Text>
          
          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSomethingElse}
            >
              <Text style={styles.secondaryButtonText}>Something else</Text>
            </Pressable>
            
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleThatHelps}
            >
              <Text style={styles.primaryButtonText}>That helps</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  validation: {
    fontFamily: fontFamilies.light,
    fontSize: 15,
    fontStyle: 'italic',
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  content: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 26,
    marginBottom: spacing.xxl,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.dustyRose,
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.dustyRose,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  secondaryButtonText: {
    fontFamily: fontFamilies.medium,
    fontSize: 15,
    color: colors.dustyRose,
  },
  primaryButtonText: {
    fontFamily: fontFamilies.medium,
    fontSize: 15,
    color: colors.white,
  },
});
