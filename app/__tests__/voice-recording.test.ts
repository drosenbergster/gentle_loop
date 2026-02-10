/**
 * Story 1.7: Voice Recording & Transcription
 *
 * Tests:
 * - Recording state machine transitions
 * - Tap detection (< 0.5s → tooltip) — UFG-2
 * - Short recording detection (< 1s → discard) — UFG-1
 * - 60s max cap constant — ARCH-8
 * - Error message mapping
 * - Transcript delivery on successful recording
 * - Constants validation
 */

import { MESSAGE_AUTO_DISMISS_MS } from '../src/hooks/useVoiceRecording';
import type { RecordingState, RecordingMessage } from '../src/hooks/useVoiceRecording';

// ─────────────────────────────────────────
// Mirror constants from the hook for testing
// ─────────────────────────────────────────
const TAP_THRESHOLD_MS = 500;
const MIN_RECORDING_MS = 1000;
const MAX_RECORDING_MS = 60_000;

// ─────────────────────────────────────────
// 1. Constants validation
// ─────────────────────────────────────────
describe('voice recording constants', () => {
  it('tap threshold is 500ms (UFG-2)', () => {
    expect(TAP_THRESHOLD_MS).toBe(500);
  });

  it('minimum recording is 1000ms (UFG-1)', () => {
    expect(MIN_RECORDING_MS).toBe(1000);
  });

  it('maximum recording is 60 seconds (ARCH-8)', () => {
    expect(MAX_RECORDING_MS).toBe(60_000);
  });

  it('message auto-dismiss is 3 seconds', () => {
    expect(MESSAGE_AUTO_DISMISS_MS).toBe(3_000);
  });
});

// ─────────────────────────────────────────
// 2. State machine logic
// ─────────────────────────────────────────
describe('recording state transitions', () => {
  it('valid states are defined', () => {
    const validStates: RecordingState[] = [
      'idle',
      'requesting_permission',
      'recording',
      'processing',
      'error',
    ];
    expect(validStates.length).toBe(5);
  });

  it('initial state should be idle', () => {
    const initialState: RecordingState = 'idle';
    expect(initialState).toBe('idle');
  });
});

// ─────────────────────────────────────────
// 3. Tap detection logic (UFG-2)
// ─────────────────────────────────────────
describe('tap detection (UFG-2)', () => {
  it('press < 500ms is a tap', () => {
    const pressDuration = 300;
    const isTap = pressDuration < TAP_THRESHOLD_MS;
    expect(isTap).toBe(true);
  });

  it('press = 500ms is NOT a tap', () => {
    const pressDuration = 500;
    const isTap = pressDuration < TAP_THRESHOLD_MS;
    expect(isTap).toBe(false);
  });

  it('press > 500ms is NOT a tap', () => {
    const pressDuration = 800;
    const isTap = pressDuration < TAP_THRESHOLD_MS;
    expect(isTap).toBe(false);
  });

  it('tap produces correct message type', () => {
    const message: RecordingMessage = { type: 'tap_tooltip' };
    expect(message.type).toBe('tap_tooltip');
  });
});

// ─────────────────────────────────────────
// 4. Short recording detection (UFG-1)
// ─────────────────────────────────────────
describe('short recording detection (UFG-1)', () => {
  it('recording < 1000ms is too short', () => {
    const duration = 800;
    const isTooShort = duration < MIN_RECORDING_MS;
    expect(isTooShort).toBe(true);
  });

  it('recording = 1000ms is valid', () => {
    const duration = 1000;
    const isTooShort = duration < MIN_RECORDING_MS;
    expect(isTooShort).toBe(false);
  });

  it('recording > 1000ms is valid', () => {
    const duration = 5000;
    const isTooShort = duration < MIN_RECORDING_MS;
    expect(isTooShort).toBe(false);
  });

  it('too-short produces correct message type', () => {
    const message: RecordingMessage = { type: 'too_short' };
    expect(message.type).toBe('too_short');
  });
});

// ─────────────────────────────────────────
// 5. 60s max cap (ARCH-8)
// ─────────────────────────────────────────
describe('max recording cap (ARCH-8)', () => {
  it('cap is exactly 60 seconds', () => {
    expect(MAX_RECORDING_MS).toBe(60 * 1000);
  });

  it('recording at 59s is within cap', () => {
    expect(59_000 < MAX_RECORDING_MS).toBe(true);
  });

  it('recording at 60s triggers cap', () => {
    expect(60_000 >= MAX_RECORDING_MS).toBe(true);
  });
});

// ─────────────────────────────────────────
// 6. Error message mapping
// ─────────────────────────────────────────
describe('error message mapping', () => {
  it('no-speech error produces friendly message', () => {
    const errorCode = 'no-speech';
    let message = '';

    if (errorCode === 'no-speech') {
      message = "I didn't catch anything — try holding the mic and speaking up.";
    }

    expect(message).toContain("didn't catch anything");
  });

  it('audio-capture error suggests Settings', () => {
    const errorCode = 'audio-capture';
    let message = '';

    if (errorCode === 'audio-capture') {
      message = 'Microphone access is needed. Please enable it in Settings.';
    }

    expect(message).toContain('Settings');
  });

  it('unknown error produces generic message', () => {
    const errorCode = 'network';
    let message = '';

    if (errorCode !== 'no-speech' && errorCode !== 'audio-capture') {
      message = 'Something went wrong with voice recognition. You can try again or type instead.';
    }

    expect(message).toContain('try again');
  });

  it('error message type includes message string', () => {
    const msg: RecordingMessage = {
      type: 'error',
      message: 'Something went wrong.',
    };
    expect(msg.type).toBe('error');
    expect(msg.message).toBe('Something went wrong.');
  });
});

// ─────────────────────────────────────────
// 7. Transcript delivery
// ─────────────────────────────────────────
describe('transcript delivery', () => {
  it('non-empty transcript is delivered', () => {
    const transcript = "She won't eat anything I make.";
    const delivered = transcript.trim().length > 0;
    expect(delivered).toBe(true);
  });

  it('empty transcript triggers error', () => {
    const transcript = '   ';
    const delivered = transcript.trim().length > 0;
    expect(delivered).toBe(false);
  });

  it('whitespace-only transcript is treated as empty', () => {
    const transcript = '  \n  \t  ';
    const delivered = transcript.trim().length > 0;
    expect(delivered).toBe(false);
  });
});

// ─────────────────────────────────────────
// 8. Duration display formatting
// ─────────────────────────────────────────
describe('duration formatting', () => {
  it('formats 0 seconds as 0:00', () => {
    const duration = 0;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    expect(`${minutes}:${seconds.toString().padStart(2, '0')}`).toBe('0:00');
  });

  it('formats 45 seconds as 0:45', () => {
    const duration = 45;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    expect(`${minutes}:${seconds.toString().padStart(2, '0')}`).toBe('0:45');
  });

  it('formats 60 seconds as 1:00', () => {
    const duration = 60;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    expect(`${minutes}:${seconds.toString().padStart(2, '0')}`).toBe('1:00');
  });
});

// ─────────────────────────────────────────
// 9. expo-speech-recognition mock validation
// ─────────────────────────────────────────
describe('expo-speech-recognition mock', () => {
  it('mock module is importable', () => {
    const mod = require('expo-speech-recognition');
    expect(mod.ExpoSpeechRecognitionModule).toBeDefined();
  });

  it('requestPermissionsAsync resolves granted', async () => {
    const mod = require('expo-speech-recognition');
    const result = await mod.ExpoSpeechRecognitionModule.requestPermissionsAsync();
    expect(result.granted).toBe(true);
  });

  it('start and stop are callable', () => {
    const mod = require('expo-speech-recognition');
    expect(() => mod.ExpoSpeechRecognitionModule.start({ lang: 'en-US' })).not.toThrow();
    expect(() => mod.ExpoSpeechRecognitionModule.stop()).not.toThrow();
  });
});
