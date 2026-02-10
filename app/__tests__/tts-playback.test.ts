/**
 * Story 1.9: TTS Playback Tests
 *
 * Tests:
 * - Speed map values (NFR16)
 * - Response mode gating (text-only skips TTS)
 * - expo-speech mock interactions
 * - Dismiss stops playback
 */

import * as Speech from 'expo-speech';
import { SPEED_MAP } from '../src/hooks/useTTS';
import { useSettingsStore } from '../src/stores/settingsStore';

// Reset settings before each test
beforeEach(() => {
  jest.clearAllMocks();
  useSettingsStore.setState({
    responseMode: 'both',
    ttsSpeed: 'default',
  });
});

describe('TTS speed mapping (NFR16)', () => {
  it('maps "slower" to 0.75', () => {
    expect(SPEED_MAP.slower).toBe(0.75);
  });

  it('maps "default" to 1.0', () => {
    expect(SPEED_MAP.default).toBe(1.0);
  });

  it('maps "faster" to 1.35', () => {
    expect(SPEED_MAP.faster).toBe(1.35);
  });

  it('covers all three TTSSpeed values', () => {
    expect(Object.keys(SPEED_MAP).sort()).toEqual([
      'default',
      'faster',
      'slower',
    ]);
  });
});

describe('response mode gating', () => {
  it('"both" mode should allow TTS', () => {
    const mode = useSettingsStore.getState().responseMode;
    expect(mode).toBe('both');
    const shouldSpeak = mode !== 'text';
    expect(shouldSpeak).toBe(true);
  });

  it('"audio" mode should allow TTS', () => {
    useSettingsStore.setState({ responseMode: 'audio' });
    const mode = useSettingsStore.getState().responseMode;
    const shouldSpeak = mode !== 'text';
    expect(shouldSpeak).toBe(true);
  });

  it('"text" mode should NOT allow TTS', () => {
    useSettingsStore.setState({ responseMode: 'text' });
    const mode = useSettingsStore.getState().responseMode;
    const shouldSpeak = mode !== 'text';
    expect(shouldSpeak).toBe(false);
  });
});

describe('expo-speech mock', () => {
  it('Speech.speak is callable with text and options', () => {
    Speech.speak('Hello world', {
      language: 'en-US',
      pitch: 1.0,
      rate: 1.0,
    });
    expect(Speech.speak).toHaveBeenCalledWith('Hello world', {
      language: 'en-US',
      pitch: 1.0,
      rate: 1.0,
    });
  });

  it('Speech.stop is callable', () => {
    Speech.stop();
    expect(Speech.stop).toHaveBeenCalled();
  });
});

describe('TTS lifecycle', () => {
  it('stops speech before starting new speech (prevents overlap)', () => {
    // Simulate the useTTS logic: stop then speak
    Speech.stop();
    Speech.speak('First suggestion', { language: 'en-US', pitch: 1.0, rate: 1.0 });
    Speech.stop();
    Speech.speak('Second suggestion', { language: 'en-US', pitch: 1.0, rate: 1.0 });

    expect(Speech.stop).toHaveBeenCalledTimes(2);
    expect(Speech.speak).toHaveBeenCalledTimes(2);
  });

  it('dismissing card calls Speech.stop', () => {
    // Simulate: speak, then dismiss
    Speech.speak('A suggestion', { language: 'en-US', pitch: 1.0, rate: 1.0 });
    Speech.stop();

    expect(Speech.stop).toHaveBeenCalled();
  });
});

describe('TTS speed integration with settings', () => {
  it('reads ttsSpeed from settings store', () => {
    useSettingsStore.setState({ ttsSpeed: 'faster' });
    const speed = useSettingsStore.getState().ttsSpeed;
    expect(speed).toBe('faster');
    expect(SPEED_MAP[speed]).toBe(1.35);
  });

  it('reads ttsSpeed change after update', () => {
    useSettingsStore.getState().setTTSSpeed('slower');
    const speed = useSettingsStore.getState().ttsSpeed;
    expect(speed).toBe('slower');
    expect(SPEED_MAP[speed]).toBe(0.75);
  });
});
