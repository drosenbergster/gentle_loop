/**
 * Gentle Loop Color System
 *
 * Based on the Sunset Gradient palette:
 * - Twilight Purple → Dusty Rose → Golden Amber
 */

export const colors = {
  // Primary Sunset Gradient Colors
  twilightPurple: '#6B5B7A',
  dustyRose: '#C4A4AC',
  goldenAmber: '#E8B87D',

  // Neutral Base
  warmCream: '#FFFBF5',
  softGray: '#F5EDE3',
  textPrimary: '#3D3D3D',
  textSecondary: '#6B6B6B',
  textMuted: '#9B9B9B',

  // Energy States (for slider and tinting)
  energy: {
    running_low: '#6B5B7A', // Twilight Purple - low energy
    holding_steady: '#C4A4AC', // Dusty Rose - medium energy
    ive_got_this: '#E8B87D', // Golden Amber - higher energy
  },

  // Background Tints (subtle overlays for energy states)
  tints: {
    running_low: 'rgba(107, 91, 122, 0.08)',
    holding_steady: 'rgba(196, 164, 172, 0.08)',
    ive_got_this: 'rgba(232, 184, 125, 0.08)',
  },

  // UI Elements
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  cardBackground: '#FFFFFF',

  // Accent (used sparingly)
  success: '#7CB69D',
  error: '#D4847C',
} as const;

// Gradient definitions for linear gradients
export const gradients = {
  sunset: [colors.twilightPurple, colors.dustyRose, colors.goldenAmber],
  sunsetReverse: [colors.goldenAmber, colors.dustyRose, colors.twilightPurple],
  warmBackground: [colors.warmCream, colors.softGray],
} as const;

// Type exports
export type ColorKey = keyof typeof colors;
export type EnergyLevel = 'running_low' | 'holding_steady' | 'ive_got_this';
