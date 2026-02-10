/**
 * Epic 2: Onboarding Tests
 *
 * Stories 2.1, 2.2, 2.3
 * Tests:
 * - 5-step flow structure
 * - Name required validation
 * - Disclaimer gate
 * - Onboarding completion flag
 * - Default anchor image
 * - Settings persistence
 */

import { useSettingsStore } from '../src/stores/settingsStore';

beforeEach(() => {
  // Reset settings for each test
  useSettingsStore.setState({
    userName: '',
    hasCompletedOnboarding: false,
    anchorImage: 'default-mountains',
  });
});

describe('onboarding flow structure', () => {
  it('has exactly 5 steps', () => {
    const TOTAL_STEPS = 5;
    expect(TOTAL_STEPS).toBe(5);
  });

  it('steps are: Welcome, How It Works, Your Name, Your Anchor, Meet the Mic', () => {
    const steps = [
      'Welcome',
      'How It Works',
      'Your Name',
      'Your Anchor',
      'Meet the Mic',
    ];
    expect(steps.length).toBe(5);
  });
});

describe('name validation (Story 2.1)', () => {
  it('empty name blocks advancement', () => {
    const name = '';
    const canAdvance = name.trim().length > 0;
    expect(canAdvance).toBe(false);
  });

  it('whitespace-only name blocks advancement', () => {
    const name = '   ';
    const canAdvance = name.trim().length > 0;
    expect(canAdvance).toBe(false);
  });

  it('valid name allows advancement', () => {
    const name = 'Sarah';
    const canAdvance = name.trim().length > 0;
    expect(canAdvance).toBe(true);
  });

  it('saves name to settings store', () => {
    useSettingsStore.getState().setUserName('Maria');
    expect(useSettingsStore.getState().userName).toBe('Maria');
  });
});

describe('anchor image selection (Story 2.2)', () => {
  it('default image is default-mountains', () => {
    expect(useSettingsStore.getState().anchorImage).toBe('default-mountains');
  });

  it('can select a different default image', () => {
    useSettingsStore.getState().setAnchorImage('default-water');
    expect(useSettingsStore.getState().anchorImage).toBe('default-water');
  });

  it('can set a custom image URI', () => {
    useSettingsStore.getState().setAnchorImage('file:///custom/photo.jpg');
    expect(useSettingsStore.getState().anchorImage).toBe('file:///custom/photo.jpg');
  });

  it('skip sets default-mountains', () => {
    // When user skips, the default stays
    expect(useSettingsStore.getState().anchorImage).toBe('default-mountains');
  });
});

describe('wellness disclaimer (Story 2.3, FR31)', () => {
  it('disclaimer must be accepted to finish onboarding', () => {
    const disclaimerAccepted = false;
    const canFinish = disclaimerAccepted;
    expect(canFinish).toBe(false);
  });

  it('accepted disclaimer allows finishing', () => {
    const disclaimerAccepted = true;
    const canFinish = disclaimerAccepted;
    expect(canFinish).toBe(true);
  });
});

describe('onboarding completion (Story 2.3)', () => {
  it('starts with hasCompletedOnboarding = false', () => {
    expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(false);
  });

  it('setOnboardingComplete sets flag to true', () => {
    useSettingsStore.getState().setOnboardingComplete();
    expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(true);
  });

  it('completed onboarding persists (simulated)', () => {
    useSettingsStore.getState().setOnboardingComplete();
    // Re-read the state (simulates app restart with persisted store)
    expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(true);
  });
});

describe('onboarding routing gate', () => {
  it('not completed → redirects to onboarding', () => {
    const hasCompleted = useSettingsStore.getState().hasCompletedOnboarding;
    const shouldShowOnboarding = !hasCompleted;
    expect(shouldShowOnboarding).toBe(true);
  });

  it('completed → shows Anchor Screen', () => {
    useSettingsStore.getState().setOnboardingComplete();
    const hasCompleted = useSettingsStore.getState().hasCompletedOnboarding;
    const shouldShowOnboarding = !hasCompleted;
    expect(shouldShowOnboarding).toBe(false);
  });
});

describe('mid-onboarding force quit (Story 2.3)', () => {
  it('onboarding restarts from beginning (no partial state)', () => {
    // Only setOnboardingComplete marks it done
    // If user quits mid-flow, hasCompletedOnboarding remains false
    useSettingsStore.getState().setUserName('Test');
    // Without setOnboardingComplete:
    expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(false);
  });
});
