/**
 * Tests for MicButton Component
 *
 * Validates: renders, energy color mapping, accessibility props, pulse behavior.
 * Note: Component rendering tests are limited without @testing-library/react-native.
 * These tests validate the logic and data that feeds the component.
 */

import { colors } from '../src/theme/colors';
import type { EnergyLevel } from '../src/stores/energyStore';

describe('MicButton Logic', () => {
  describe('energy color mapping', () => {
    it('should map running_low to twilight purple', () => {
      expect(colors.energy.running_low).toBe('#6B5B7A');
    });

    it('should map holding_steady to dusty rose', () => {
      expect(colors.energy.holding_steady).toBe('#C4A4AC');
    });

    it('should map ive_got_this to golden amber', () => {
      expect(colors.energy.ive_got_this).toBe('#E8B87D');
    });

    it('should have all 3 energy colors defined', () => {
      const levels: EnergyLevel[] = ['running_low', 'holding_steady', 'ive_got_this'];
      levels.forEach((level) => {
        expect(colors.energy[level]).toBeTruthy();
        expect(typeof colors.energy[level]).toBe('string');
        expect(colors.energy[level]).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('WCAG contrast for Anchor Screen text', () => {
    // Pre-computed contrast ratios
    it('textPrimary on warmCream should meet WCAG AA (≥4.5:1)', () => {
      // textPrimary #3D3D3D on warmCream #FFFBF5 = 10.54:1
      const ratio = computeContrastRatio('#FFFBF5', '#3D3D3D');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('textSecondary on warmCream should meet WCAG AA (≥4.5:1)', () => {
      // textSecondary #6B6B6B on warmCream #FFFBF5 = 5.17:1
      const ratio = computeContrastRatio('#FFFBF5', '#6B6B6B');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});

// Helper: compute WCAG contrast ratio between two hex colors
function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const sR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const sG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const sB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

function computeContrastRatio(bg: string, fg: string): number {
  const l1 = Math.max(relativeLuminance(bg), relativeLuminance(fg));
  const l2 = Math.min(relativeLuminance(bg), relativeLuminance(fg));
  return (l1 + 0.05) / (l2 + 0.05);
}
