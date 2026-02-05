/**
 * Gentle Loop Theme
 * 
 * Unified export of all theme tokens
 */

export * from './colors';
export * from './typography';
export * from './spacing';

import { colors, gradients } from './colors';
import { fontFamilies, fontSizes, lineHeights, textStyles } from './typography';
import { spacing, borderRadius, layout } from './spacing';

export const theme = {
  colors,
  gradients,
  fontFamilies,
  fontSizes,
  lineHeights,
  textStyles,
  spacing,
  borderRadius,
  layout,
} as const;

export type Theme = typeof theme;
