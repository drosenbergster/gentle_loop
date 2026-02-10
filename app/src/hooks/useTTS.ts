/**
 * Text-to-Speech Hook
 *
 * ARCH-7: On-device TTS via expo-speech.
 * NFR4: Playback starts within 1 second of card appearing.
 * NFR16: Speech speed respects TTS speed setting.
 *
 * Respects the response mode setting:
 * - "audio" or "both" → speak aloud
 * - "text" → no audio
 */

import { useCallback, useRef, useEffect } from 'react';
import * as Speech from 'expo-speech';

import { useSettingsStore, type TTSSpeed, type ResponseMode } from '../stores';

// ─────────────────────────────────────────
// Speed mapping (NFR16)
// ─────────────────────────────────────────

/** Maps the user-facing speed setting to expo-speech rate values.
 *  Rate: 1.0 is normal. Range is roughly 0.5–2.0 on most platforms. */
const SPEED_MAP: Record<TTSSpeed, number> = {
  slower: 0.75,
  default: 1.0,
  faster: 1.35,
};

// ─────────────────────────────────────────
// Hook
// ─────────────────────────────────────────

export interface TTSControls {
  /** Speak the given text aloud (if response mode allows) */
  speak: (text: string) => void;
  /** Stop any current speech */
  stop: () => void;
}

export function useTTS(): TTSControls {
  const responseMode = useSettingsStore((s) => s.responseMode);
  const ttsSpeed = useSettingsStore((s) => s.ttsSpeed);
  const isSpeakingRef = useRef(false);

  // Stop on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      // Only speak in "audio" or "both" modes
      if (responseMode === 'text') return;

      // Stop any in-progress speech before starting new
      Speech.stop();

      const rate = SPEED_MAP[ttsSpeed] ?? 1.0;

      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate,
        onStart: () => {
          isSpeakingRef.current = true;
        },
        onDone: () => {
          isSpeakingRef.current = false;
        },
        onError: () => {
          isSpeakingRef.current = false;
        },
        onStopped: () => {
          isSpeakingRef.current = false;
        },
      });
    },
    [responseMode, ttsSpeed],
  );

  const stop = useCallback(() => {
    Speech.stop();
    isSpeakingRef.current = false;
  }, []);

  return { speak, stop };
}

// Re-export speed map for testing
export { SPEED_MAP };
