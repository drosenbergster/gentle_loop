/**
 * Gentle Loop Spacing System
 * 
 * Base unit: 4px
 * Emphasizes airy, calming layouts
 */

const BASE = 4;

export const spacing = {
  // Base scale (4px increments)
  xs: BASE,           // 4px
  sm: BASE * 2,       // 8px
  md: BASE * 3,       // 12px
  lg: BASE * 4,       // 16px
  xl: BASE * 6,       // 24px
  xxl: BASE * 8,      // 32px
  xxxl: BASE * 12,    // 48px
  
  // Semantic spacing
  screenPadding: BASE * 6,    // 24px - padding from screen edges
  cardPadding: BASE * 5,      // 20px - internal card padding
  sectionGap: BASE * 8,       // 32px - between major sections
  elementGap: BASE * 4,       // 16px - between related elements
  tightGap: BASE * 2,         // 8px - between tightly related items
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

// Common layout patterns
export const layout = {
  // Screen container
  screenContainer: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
  },
  
  // Centered content
  centered: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  
  // Card styling
  card: {
    padding: spacing.cardPadding,
    borderRadius: borderRadius.xl,
  },
} as const;
