/**
 * "Still With You" Encouragement Banner
 *
 * Story 5.1 / UX-5: Appears above the suggestion card after 2+ cycles
 * without "That worked." Auto-fades after ~3.5 seconds.
 * UX-8: Reduce Motion → instant show/hide, no fade.
 */

import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { colors, spacing, fontFamilies } from '../theme';
import { ENCOURAGEMENT_DISPLAY_MS } from '../data/encouragements';

interface EncouragementBannerProps {
  message: string;
  visible: boolean;
  reduceMotion: boolean;
  onFaded: () => void;
}

export function EncouragementBanner({
  message,
  visible,
  reduceMotion,
  onFaded,
}: EncouragementBannerProps) {
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      fadeTimer.current = setTimeout(() => {
        onFaded();
      }, ENCOURAGEMENT_DISPLAY_MS);
    }
    return () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, [visible, onFaded]);

  if (!visible) return null;

  const entering = reduceMotion ? undefined : FadeIn.duration(400);
  const exiting = reduceMotion ? undefined : FadeOut.duration(300);

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      style={styles.banner}
    >
      <Text style={styles.bannerText}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: '62%', // Just above the suggestion card (card is max 60% height)
    left: spacing.lg,
    right: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 16,
    zIndex: 25,
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerText: {
    fontFamily: fontFamilies.light,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
});
