/**
 * Gentle Ideas Overlay
 *
 * Displays curated ideas matched to energy level when offline.
 * WAR-6: Same card container as AI suggestion cards.
 * WAR-7: Two actions: "Something else" + "That helps".
 * FM-10: IdeaCycler reshuffles when pool exhausted.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable, Modal, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors, spacing, fontFamilies, borderRadius } from '../theme';
import { useEnergyLevel, useSettingsStore, useToolboxStore } from '../stores';
import { useAccessibility } from '../hooks';
import { IdeaCycler, type Idea } from '../data';

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
    elevation: Math.round(Math.abs(offsetY) / 2),
  };
};

interface IdeasOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export function IdeasOverlay({ visible, onClose }: IdeasOverlayProps) {
  const energyLevel = useEnergyLevel();
  const reduceMotion = useSettingsStore((state) => state.reduceMotion);
  const addToolboxEntry = useToolboxStore((state) => state.addEntry);
  const { scale, textColor } = useAccessibility();

  const [currentIdea, setCurrentIdea] = useState<Idea | null>(null);
  const cyclerRef = useRef(new IdeaCycler(energyLevel));

  // Animation values
  const overlayOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(300);

  // Handle visibility changes
  useEffect(() => {
    if (visible) {
      const idea = cyclerRef.current.next(energyLevel);
      setCurrentIdea(idea);

      overlayOpacity.value = withTiming(1, { duration: 200 });
      cardTranslateY.value = withSpring(0, {
        damping: reduceMotion ? 20 : 15,
        stiffness: reduceMotion ? 150 : 100,
      });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 150 });
      cardTranslateY.value = withTiming(300, { duration: 200 });
    }
  }, [visible, energyLevel, reduceMotion]);

  const triggerHaptic = useCallback(
    (style: 'light' | 'medium') => {
      if (Platform.OS !== 'web') {
        const feedbackStyle =
          style === 'light'
            ? Haptics.ImpactFeedbackStyle.Light
            : Haptics.ImpactFeedbackStyle.Medium;
        Haptics.impactAsync(feedbackStyle);
      }
    },
    [],
  );

  const handleSomethingElse = useCallback(() => {
    triggerHaptic('light');

    const nextIdea = cyclerRef.current.next(energyLevel);
    setCurrentIdea(nextIdea);

    if (!reduceMotion) {
      cardTranslateY.value = withSpring(20, { damping: 20, stiffness: 300 });
      setTimeout(() => {
        cardTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      }, 100);
    }
  }, [energyLevel, reduceMotion, triggerHaptic]);

  const handleThatHelps = useCallback(() => {
    triggerHaptic('medium');

    // Save to Toolbox (AC-6)
    if (currentIdea) {
      addToolboxEntry(`${currentIdea.title}: ${currentIdea.content}`);
    }

    onClose();
  }, [onClose, triggerHaptic, currentIdea, addToolboxEntry]);

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
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, overlayStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleBackdropPress}
            accessibilityRole="button"
            accessibilityLabel="Close ideas"
          />
        </Animated.View>

        {/* Card */}
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Drag indicator */}
          <View style={styles.dragIndicator} />

          {/* Validation */}
          <Text
            style={[
              styles.validation,
              {
                fontSize: scale(15),
                lineHeight: scale(22),
                color: textColor('textSecondary'),
              },
            ]}
          >
            "{currentIdea.validation}"
          </Text>

          {/* Title */}
          <Text
            style={[
              styles.title,
              { fontSize: scale(22), color: textColor('textPrimary') },
            ]}
          >
            {currentIdea.title}
          </Text>

          {/* Content */}
          <Text
            style={[
              styles.content,
              {
                fontSize: scale(16),
                lineHeight: scale(26),
                color: textColor('textPrimary'),
              },
            ]}
          >
            {currentIdea.content}
          </Text>

          {/* Actions (WAR-7) */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSomethingElse}
              accessibilityRole="button"
              accessibilityLabel="Something else"
            >
              <Text
                style={[styles.secondaryButtonText, { fontSize: scale(15) }]}
              >
                Something else
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleThatHelps}
              accessibilityRole="button"
              accessibilityLabel="That helps"
            >
              <Text
                style={[styles.primaryButtonText, { fontSize: scale(15) }]}
              >
                That helps
              </Text>
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
    paddingBottom: spacing.xxl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    maxHeight: '80%',
    ...createShadow(-4, 16, 0.15),
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.softGray,
    alignSelf: 'center',
    marginBottom: spacing.lg,
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
    minHeight: 44,
    justifyContent: 'center',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.dustyRose,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
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
