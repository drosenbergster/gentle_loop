# Story 1.9: Text-to-Speech Playback

Status: review

## Story

As a caregiver,
I want suggestions read aloud to me,
So that I can hear the guidance without looking at my phone during a difficult moment.

## Acceptance Criteria Completed

- [x] When response mode is "audio" or "both" (default), suggestion text is read aloud via expo-speech (ARCH-7)
- [x] Playback starts within 1 second of card appearing (NFR4) — called immediately after setShowCard(true)
- [x] Speech speed respects TTS speed setting: slower (0.75x), default (1.0x), faster (1.35x) per NFR16
- [x] Dismissing the card ("That worked", "Dismiss") stops TTS immediately
- [x] Requesting "Another" stops current TTS before new request
- [x] When response mode is "text only", no audio playback occurs
- [x] TTS stops on component unmount (cleanup)

## Dev Agent Record

### Agent Model Used
Claude claude-4.6-opus

### Completion Notes List
- **useTTS hook** (`src/hooks/useTTS.ts`): Wraps expo-speech with response mode gating and speed mapping. `speak()` only fires for "audio" or "both" modes. Always calls `Speech.stop()` before starting new speech to prevent overlap. Cleans up on unmount.
- **Anchor Screen integration** (`app/index.tsx`): `tts.speak(result.text)` called right after suggestion card appears. `tts.stop()` called in handleThatWorked, handleDismiss, and handleAnother.
- **Jest mock** (`jest.setup.js`): Added expo-speech mock with speak, stop, pause, resume, isSpeakingAsync.

### Change Log
- Installed `expo-speech` package
- Created `src/hooks/useTTS.ts` — TTS hook with speed mapping and response mode gating
- Updated `src/hooks/index.ts` — added useTTS export
- Updated `app/index.tsx` — integrated TTS: speak on card appear, stop on dismiss/another
- Updated `jest.setup.js` — added expo-speech mock
- Created `__tests__/tts-playback.test.ts` — 13 tests

### File List
- `app/src/hooks/useTTS.ts` (new)
- `app/src/hooks/index.ts` (modified)
- `app/app/index.tsx` (modified)
- `app/jest.setup.js` (modified)
- `app/__tests__/tts-playback.test.ts` (new)
