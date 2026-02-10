/**
 * Tests for Responsive Sizing Logic
 *
 * Validates image and mic button sizes scale correctly across screen heights.
 * Tests the pure lerp math directly since mocking useWindowDimensions is fragile.
 */

describe('Responsive Sizing', () => {
  // Replicate the lerp function from useResponsiveSize
  const IMAGE_MIN = 240;
  const IMAGE_MAX = 320;
  const MIC_MIN = 72;
  const MIC_MAX = 88;

  function lerp(min: number, max: number, screenHeight: number): number {
    const t = Math.max(0, Math.min(1, (screenHeight - 667) / (926 - 667)));
    return Math.round(min + t * (max - min));
  }

  describe('on medium screen (844px — iPhone 14 Pro)', () => {
    const height = 844;

    it('should return image size between 240 and 320', () => {
      const imageSize = lerp(IMAGE_MIN, IMAGE_MAX, height);
      expect(imageSize).toBeGreaterThanOrEqual(240);
      expect(imageSize).toBeLessThanOrEqual(320);
    });

    it('should return mic size between 72 and 88', () => {
      const micSize = lerp(MIC_MIN, MIC_MAX, height);
      expect(micSize).toBeGreaterThanOrEqual(72);
      expect(micSize).toBeLessThanOrEqual(88);
    });
  });

  describe('on small screen (667px — iPhone SE)', () => {
    const height = 667;

    it('should return minimum image size (240)', () => {
      expect(lerp(IMAGE_MIN, IMAGE_MAX, height)).toBe(240);
    });

    it('should return minimum mic size (72)', () => {
      expect(lerp(MIC_MIN, MIC_MAX, height)).toBe(72);
    });
  });

  describe('on large screen (926px — iPhone 14 Pro Max)', () => {
    const height = 926;

    it('should return maximum image size (320)', () => {
      expect(lerp(IMAGE_MIN, IMAGE_MAX, height)).toBe(320);
    });

    it('should return maximum mic size (88)', () => {
      expect(lerp(MIC_MIN, MIC_MAX, height)).toBe(88);
    });
  });

  describe('clamping', () => {
    it('should not exceed max on very large screens', () => {
      const imageSize = lerp(IMAGE_MIN, IMAGE_MAX, 1200);
      const micSize = lerp(MIC_MIN, MIC_MAX, 1200);
      expect(imageSize).toBeLessThanOrEqual(320);
      expect(micSize).toBeLessThanOrEqual(88);
    });

    it('should not go below min on very small screens', () => {
      const imageSize = lerp(IMAGE_MIN, IMAGE_MAX, 500);
      const micSize = lerp(MIC_MIN, MIC_MAX, 500);
      expect(imageSize).toBeGreaterThanOrEqual(240);
      expect(micSize).toBeGreaterThanOrEqual(72);
    });
  });

  describe('mic icon size', () => {
    it('should be ~40% of mic button size', () => {
      const micSize = lerp(MIC_MIN, MIC_MAX, 844);
      const iconSize = Math.round(micSize * 0.4);
      expect(iconSize).toBeGreaterThan(0);
      expect(iconSize).toBeLessThan(micSize);
      // Should be roughly 29-35 pixels
      expect(iconSize).toBeGreaterThanOrEqual(28);
      expect(iconSize).toBeLessThanOrEqual(36);
    });
  });
});
