/**
 * Tests for Settings Store
 *
 * Validates: defaults, all setters, persistence via Zustand persist,
 * responseMode and ttsSpeed fields, no manual hydrate.
 */

import { useSettingsStore } from '../src/stores/settingsStore';

// Reset store state between tests
beforeEach(() => {
  useSettingsStore.setState({
    userName: '',
    hasCompletedOnboarding: false,
    anchorImage: 'default-mountains',
    reduceMotion: false,
    largerText: false,
    highContrast: false,
    responseMode: 'both',
    ttsSpeed: 'default',
  });
});

describe('Settings Store', () => {
  describe('default values', () => {
    it('should have empty userName by default', () => {
      expect(useSettingsStore.getState().userName).toBe('');
    });

    it('should have hasCompletedOnboarding false by default', () => {
      expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(false);
    });

    it('should have default-mountains as anchor image', () => {
      expect(useSettingsStore.getState().anchorImage).toBe('default-mountains');
    });

    it('should have reduceMotion false by default', () => {
      expect(useSettingsStore.getState().reduceMotion).toBe(false);
    });

    it('should have largerText false by default', () => {
      expect(useSettingsStore.getState().largerText).toBe(false);
    });

    it('should have highContrast false by default', () => {
      expect(useSettingsStore.getState().highContrast).toBe(false);
    });

    it('should have responseMode "both" by default', () => {
      expect(useSettingsStore.getState().responseMode).toBe('both');
    });

    it('should have ttsSpeed "default" by default', () => {
      expect(useSettingsStore.getState().ttsSpeed).toBe('default');
    });
  });

  describe('setters', () => {
    it('should set userName', () => {
      useSettingsStore.getState().setUserName('Sarah');
      expect(useSettingsStore.getState().userName).toBe('Sarah');
    });

    it('should set onboarding complete', () => {
      useSettingsStore.getState().setOnboardingComplete();
      expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(true);
    });

    it('should set anchor image', () => {
      useSettingsStore.getState().setAnchorImage('default-water');
      expect(useSettingsStore.getState().anchorImage).toBe('default-water');
    });

    it('should set anchor image to custom URI', () => {
      useSettingsStore.getState().setAnchorImage('file:///photo.jpg');
      expect(useSettingsStore.getState().anchorImage).toBe('file:///photo.jpg');
    });

    it('should set reduceMotion', () => {
      useSettingsStore.getState().setReduceMotion(true);
      expect(useSettingsStore.getState().reduceMotion).toBe(true);
    });

    it('should set largerText', () => {
      useSettingsStore.getState().setLargerText(true);
      expect(useSettingsStore.getState().largerText).toBe(true);
    });

    it('should set highContrast', () => {
      useSettingsStore.getState().setHighContrast(true);
      expect(useSettingsStore.getState().highContrast).toBe(true);
    });

    it('should set responseMode to text', () => {
      useSettingsStore.getState().setResponseMode('text');
      expect(useSettingsStore.getState().responseMode).toBe('text');
    });

    it('should set responseMode to audio', () => {
      useSettingsStore.getState().setResponseMode('audio');
      expect(useSettingsStore.getState().responseMode).toBe('audio');
    });

    it('should set ttsSpeed to slower', () => {
      useSettingsStore.getState().setTTSSpeed('slower');
      expect(useSettingsStore.getState().ttsSpeed).toBe('slower');
    });

    it('should set ttsSpeed to faster', () => {
      useSettingsStore.getState().setTTSSpeed('faster');
      expect(useSettingsStore.getState().ttsSpeed).toBe('faster');
    });
  });

  describe('no manual hydrate', () => {
    it('should not have a hydrate method', () => {
      const state = useSettingsStore.getState();
      expect((state as any).hydrate).toBeUndefined();
    });
  });

  describe('Zustand persist configuration', () => {
    it('should have persist middleware (store has persist API)', () => {
      // Zustand persist adds a .persist property to the store
      expect((useSettingsStore as any).persist).toBeDefined();
    });
  });
});
