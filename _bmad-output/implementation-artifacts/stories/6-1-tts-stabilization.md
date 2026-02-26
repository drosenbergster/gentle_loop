# Story 6.1: TTS Stabilization — Production-Ready Read-Aloud

Status: ready-for-dev

## Story

As a caregiver,
I want AI suggestions reliably read aloud to me,
So that I can hear guidance hands-free during difficult moments without needing to look at my phone.

## Context

TTS was implemented in Story 1.9 using `expo-speech`. The hook (`useTTS.ts`) and Anchor Screen integration are wired, and unit tests pass. However, real-world playback is unreliable — the feature doesn't work consistently enough for production use. This story covers diagnosing the issues, stabilizing playback, and enabling TTS by default for "audio" and "both" response modes.

## Acceptance Criteria

- [ ] TTS plays back suggestion text reliably on iOS (physical device)
- [ ] TTS plays back suggestion text reliably on Android (physical device)
- [ ] Playback starts within 1 second of the suggestion card appearing
- [ ] Speech speed setting (slower / default / faster) works correctly on both platforms
- [ ] Dismissing the card stops TTS immediately without errors
- [ ] Requesting "Another" stops current TTS before new suggestion loads
- [ ] TTS respects response mode setting: only plays for "audio" or "both" modes
- [ ] No audio overlap when rapid card transitions occur
- [ ] Graceful fallback when TTS engine is unavailable (silent, no crash)
- [ ] Works correctly when device is in silent/vibrate mode (platform-appropriate behavior documented)

## Investigation Tasks

1. Test `expo-speech` on physical iOS device — document failure modes
2. Test `expo-speech` on physical Android device — document failure modes
3. Check if speech synthesis voices are available and appropriate for caregiving tone
4. Verify speech queue behavior when `speak()` is called rapidly
5. Test interaction with device audio settings (silent mode, Do Not Disturb, Bluetooth)

## Potential Issues to Investigate

- `expo-speech` may have timing issues when called immediately after component mount
- Speech synthesis availability varies by device/OS version
- Audio session configuration may conflict with speech recognition
- Silent mode behavior differs between iOS and Android

## References

- Story 1.9 implementation: `app/src/hooks/useTTS.ts`
- Settings store: `app/src/stores/settingsStore.ts` (responseMode, ttsSpeed)
- Anchor Screen integration: `app/app/index.tsx`
- PRD: FR15 (TTS configurable), NFR4 (< 1s playback start), NFR16 (speed settings)
- ARCH-7 in technical architecture
