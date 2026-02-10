# Story 1.7: Voice Recording & Transcription

Status: review

## Story

As a caregiver,
I want to hold the mic button, describe what's happening, and have my words understood,
So that I can get help without typing during a stressful moment.

## Acceptance Criteria

1. **AC-1: Hold to record** — Press and hold mic starts on-device speech recognition via expo-speech-recognition. ✅
2. **AC-2: Pulsing overlay** — RecordingOverlay shows pulsing mic ring, duration counter, and live interim transcript while anchor image stays visible (FR6, UX-2). ✅
3. **AC-3: 60s cap** — Recording auto-stops at 60 seconds via setTimeout (ARCH-8). ✅
4. **AC-4: Transcription** — On-device STT delivers final transcript on release. No audio files stored (FR7, FR39, NFR7). ✅
5. **AC-5: Tap tooltip** — Tap < 0.5s → abort recognition, show "Hold the mic and talk — let go when you're done" (UFG-2). Auto-dismisses after 3s. ✅
6. **AC-6: Short recording** — Hold < 1s → discard, show "That was a short one — try holding a bit longer" (UFG-1). ✅
7. **AC-7: Error handling** — STT errors mapped to friendly messages: "no-speech" → re-prompt, "audio-capture" → Settings, other → generic with retry/type option. ✅

## Dev Agent Record

### Agent Model Used
claude-4.6-opus

### Debug Log References
None — clean implementation.

### Completion Notes List

- **`useVoiceRecording` hook** manages the full lifecycle: idle → requesting_permission → recording → processing → idle/error. Uses `useRef` for timing to avoid stale closures in event handlers.
- **expo-speech-recognition** with `continuous: true` and `interimResults: true` for real-time transcript preview while recording. On-device processing means no audio leaves the device (FR7, NFR7).
- **Tap detection (UFG-2)**: Tracks press start time via `useRef`. If `onPressOut` fires within 500ms, calls `abort()` on speech recognition and shows tooltip. No STT request is wasted.
- **Short recording (UFG-1)**: If duration is 500ms–1000ms, recording is discarded with a friendly message. No transcript delivered.
- **60s cap (ARCH-8)**: A `setTimeout` auto-calls `ExpoSpeechRecognitionModule.stop()` at 60 seconds. This triggers the normal `end` event flow.
- **Error mapping**: `no-speech` → re-prompt to speak up, `audio-capture` → direct to Settings, any other code → generic message offering retry or text input.
- **RecordingOverlay** component: Semi-transparent overlay with pulsing ring animation (Reanimated), centered mic icon, duration display (M:SS format), live interim transcript preview (max 2 lines), and "Release to finish" hint. `pointerEvents="none"` so it doesn't intercept the pressOut event on the mic button.
- **MicButton** updated with `onPressIn`/`onPressOut` props and `recording` state for visual feedback (slight opacity reduction). Accessibility labels update based on state.
- **Anchor Screen** wired: offline → uses `onPress` for ideas overlay. Online → uses `onPressIn`/`onPressOut` for recording. Toast system unified for offline messages, tap tooltips, and errors.
- **Transcript delivery**: The `onTranscription` callback receives the final text. Currently logs to console — Story 1.8 will wire it to the AI service client.
- **213 tests across 15 suites**, all passing, zero regressions (30 new tests for recording logic, timing thresholds, error mapping, duration formatting, and STT mock validation).

### Change Log
- Created `src/hooks/useVoiceRecording.ts` — full recording lifecycle hook
- Created `src/components/anchor/RecordingOverlay.tsx` — pulsing overlay during recording
- Updated `src/components/anchor/MicButton.tsx` — onPressIn/onPressOut/recording props
- Updated `src/components/anchor/index.ts` — RecordingOverlay export
- Updated `src/hooks/index.ts` — useVoiceRecording export
- Updated `app/index.tsx` — integrated recording flow with toast system
- Created `__tests__/voice-recording.test.ts` (30 tests)
- Updated sprint-status.yaml

### File List
- `app/src/hooks/useVoiceRecording.ts` (new)
- `app/src/components/anchor/RecordingOverlay.tsx` (new)
- `app/src/components/anchor/MicButton.tsx` (modified)
- `app/src/components/anchor/index.ts` (modified)
- `app/src/hooks/index.ts` (modified)
- `app/app/index.tsx` (modified)
- `app/__tests__/voice-recording.test.ts` (new)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)
- `_bmad-output/implementation-artifacts/stories/1-7-voice-recording-transcription.md` (new)
