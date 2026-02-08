/**
 * Accessibility Hook
 * 
 * Provides dynamic font scaling and high contrast colors
 * based on user's accessibility preferences.
 */

import { useSettingsStore } from '../stores';
import { colors } from '../theme';

const SCALE_FACTOR = 1.3;

// Higher contrast text colors for improved readability
const highContrastTextColors = {
  textPrimary: '#1A1A1A',
  textSecondary: '#2D2D2D',
  textMuted: '#4A4A4A',
};

export function useAccessibility() {
  const largerText = useSettingsStore(state => state.largerText);
  const highContrast = useSettingsStore(state => state.highContrast);

  /** Scale a font size when Larger Text is enabled */
  const scale = (size: number): number =>
    largerText ? Math.round(size * SCALE_FACTOR) : size;

  /** Get the appropriate text color based on High Contrast setting */
  const textColor = (
    key: 'textPrimary' | 'textSecondary' | 'textMuted',
  ): string => (highContrast ? highContrastTextColors[key] : colors[key]);

  return { scale, textColor, largerText, highContrast };
}
