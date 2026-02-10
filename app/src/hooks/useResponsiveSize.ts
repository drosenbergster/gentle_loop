/**
 * Responsive Sizing Hook
 *
 * Calculates responsive sizes for Anchor Screen elements based on screen height.
 * UX-15: mic button 72-88px, anchor image 240-320px depending on screen size.
 */

import { useWindowDimensions } from 'react-native';

/** Responsive sizes for Anchor Screen layout */
export interface ResponsiveSizes {
  /** Anchor image height (240-320px) */
  imageSize: number;
  /** Mic button diameter (72-88px) */
  micSize: number;
  /** Mic icon size (scales with button) */
  micIconSize: number;
}

// Reference screen height (iPhone 14 Pro / similar)
const REF_HEIGHT = 844;

// Size ranges
const IMAGE_MIN = 240;
const IMAGE_MAX = 320;
const MIC_MIN = 72;
const MIC_MAX = 88;

/**
 * Linearly interpolate between min and max based on screen height.
 * Clamps to min/max range.
 */
function lerp(min: number, max: number, screenHeight: number): number {
  // Scale factor: 0.0 at 667px (iPhone SE), 1.0 at 926px (iPhone 14 Pro Max)
  const t = Math.max(0, Math.min(1, (screenHeight - 667) / (926 - 667)));
  return Math.round(min + t * (max - min));
}

export function useResponsiveSize(): ResponsiveSizes {
  const { height } = useWindowDimensions();

  const imageSize = lerp(IMAGE_MIN, IMAGE_MAX, height);
  const micSize = lerp(MIC_MIN, MIC_MAX, height);
  const micIconSize = Math.round(micSize * 0.4); // ~32px at 80px button

  return { imageSize, micSize, micIconSize };
}
