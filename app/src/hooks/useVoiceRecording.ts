/**
 * Voice Recording Hook
 *
 * Manages the full hold-to-talk recording lifecycle:
 * - Press and hold → start on-device speech recognition
 * - Release → stop and get final transcript
 * - Tap detection (< 0.5s) → tooltip (UFG-2)
 * - Short recording (< 1s) → discard with message (UFG-1)
 * - 60s max cap (ARCH-8)
 * - Audio never stored on device (FR7, FR39, NFR7)
 *
 * Uses expo-speech-recognition for on-device STT (Story 1.1 recommendation).
 */

import { useState, useCallback, useRef } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export type RecordingState =
  | 'idle'
  | 'requesting_permission'
  | 'recording'
  | 'processing'
  | 'error';

export type RecordingMessage =
  | { type: 'tap_tooltip' }
  | { type: 'too_short' }
  | { type: 'error'; message: string }
  | null;

export interface VoiceRecordingResult {
  /** Current recording state */
  state: RecordingState;
  /** Live interim transcript while recording */
  interimTranscript: string;
  /** User-facing message (tooltip, too-short, error) */
  message: RecordingMessage;
  /** How many seconds the user has been recording */
  recordingDuration: number;
  /** Called on pressIn — starts recording */
  onPressIn: () => void;
  /** Called on pressOut — stops recording */
  onPressOut: () => void;
  /** Clear the current message */
  clearMessage: () => void;
}

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────

/** Minimum press duration to count as a "hold" (not a tap) — UFG-2 */
const TAP_THRESHOLD_MS = 500;

/** Minimum recording duration to be worth transcribing — UFG-1 */
const MIN_RECORDING_MS = 1000;

/** Maximum recording duration — ARCH-8 */
const MAX_RECORDING_MS = 60_000;

/** How long the tooltip/message auto-dismisses */
export const MESSAGE_AUTO_DISMISS_MS = 3_000;

/** Language for speech recognition */
const STT_LANG = 'en-US';

// ─────────────────────────────────────────
// Hook
// ─────────────────────────────────────────

export function useVoiceRecording(
  onTranscription: (transcript: string) => void,
): VoiceRecordingResult {
  const [state, setState] = useState<RecordingState>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [message, setMessage] = useState<RecordingMessage>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const pressStartRef = useRef<number>(0);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef = useRef<string>('');
  const isRecordingRef = useRef(false);

  // --- Speech recognition event handlers ---

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    transcriptRef.current = text;
    setInterimTranscript(text);
  });

  useSpeechRecognitionEvent('end', () => {
    if (!isRecordingRef.current) return;
    finishRecording();
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.warn('[useVoiceRecording] STT error:', event.error, event.message);

    // "no-speech" is not a real error — just means the user didn't speak
    if (event.error === 'no-speech') {
      setMessage({
        type: 'error',
        message: "I didn't catch anything — try holding the mic and speaking up.",
      });
    } else if (event.error === 'audio-capture') {
      setMessage({
        type: 'error',
        message: 'Microphone access is needed. Please enable it in Settings.',
      });
    } else {
      setMessage({
        type: 'error',
        message: 'Something went wrong with voice recognition. You can try again or type instead.',
      });
    }

    cleanup();
    setState('idle');
  });

  // --- Internal helpers ---

  const cleanup = useCallback(() => {
    isRecordingRef.current = false;
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    setRecordingDuration(0);
  }, []);

  const finishRecording = useCallback(() => {
    cleanup();

    const duration = Date.now() - pressStartRef.current;
    const transcript = transcriptRef.current.trim();

    // Too short to be useful (UFG-1)
    if (duration < MIN_RECORDING_MS) {
      setMessage({ type: 'too_short' });
      setState('idle');
      setInterimTranscript('');
      return;
    }

    // Got a transcript — deliver it
    if (transcript.length > 0) {
      setState('idle');
      setInterimTranscript('');
      onTranscription(transcript);
    } else {
      // No speech detected after a valid hold
      setMessage({
        type: 'error',
        message: "I didn't catch anything — try holding the mic and speaking up.",
      });
      setState('idle');
      setInterimTranscript('');
    }
  }, [cleanup, onTranscription]);

  // --- Public handlers ---

  const onPressIn = useCallback(async () => {
    // Reset state
    setMessage(null);
    setInterimTranscript('');
    transcriptRef.current = '';
    pressStartRef.current = Date.now();

    // Request permission
    setState('requesting_permission');
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

    if (!result.granted) {
      setMessage({
        type: 'error',
        message: 'Microphone permission is needed to record. Please enable it in Settings.',
      });
      setState('idle');
      return;
    }

    // Start speech recognition
    isRecordingRef.current = true;
    setState('recording');

    ExpoSpeechRecognitionModule.start({
      lang: STT_LANG,
      interimResults: true,
      continuous: true, // Keep listening until we stop it
    });

    // Start duration counter
    const startTime = Date.now();
    durationIntervalRef.current = setInterval(() => {
      setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // 60s max cap (ARCH-8)
    maxTimerRef.current = setTimeout(() => {
      ExpoSpeechRecognitionModule.stop();
    }, MAX_RECORDING_MS);
  }, []);

  const onPressOut = useCallback(() => {
    const duration = Date.now() - pressStartRef.current;

    // Tap detection — less than 0.5s (UFG-2)
    if (duration < TAP_THRESHOLD_MS) {
      // Abort any pending recognition
      if (isRecordingRef.current) {
        isRecordingRef.current = false;
        ExpoSpeechRecognitionModule.abort();
        cleanup();
      }
      setMessage({ type: 'tap_tooltip' });
      setState('idle');
      setInterimTranscript('');
      return;
    }

    // Normal release — stop recognition (will trigger 'end' event → finishRecording)
    if (isRecordingRef.current) {
      setState('processing');
      ExpoSpeechRecognitionModule.stop();
    }
  }, [cleanup]);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return {
    state,
    interimTranscript,
    message,
    recordingDuration,
    onPressIn,
    onPressOut,
    clearMessage,
  };
}
