# STT Provider Evaluation Results

**Date:** 2026-02-09
**Story:** 1.1 — STT Provider Evaluation Spike
**Status:** Research-based recommendation (pending device validation)

---

## Recommendation

**Provider:** On-Device (Apple Speech via `expo-speech-recognition` with `requiresOnDeviceRecognition: true`)

**Rationale:** On-device STT is the recommended provider for gentle_loop MVP based on the following analysis. Device-level validation with the test harness (app/stt-eval.tsx) should confirm this recommendation before proceeding to Story 1.7.

---

## Decision Matrix

| Criterion | On-Device (Apple/Google) | Whisper API | Winner | Weight |
|-----------|--------------------------|-------------|--------|--------|
| **Latency** | <500ms (no network) | 1-3s (network dependent) | On-Device | High |
| **Offline Capability** | Yes — works without network | No — requires internet | On-Device | Critical |
| **Cost** | Free (platform-provided) | $0.006/minute | On-Device | Medium |
| **Accuracy (clean speech)** | ~90-95% (modern iOS 17+) | ~95-98% | Whisper (slight edge) | High |
| **Accuracy (noisy)** | ~70-85% (varies) | ~85-95% | Whisper | Medium |
| **Privacy** | Audio stays on device | Audio sent to OpenAI servers | On-Device | Critical |
| **Integration complexity** | Single library (expo-speech-recognition) | HTTP call + audio file upload | On-Device | Low |
| **Platform consistency** | iOS excellent, Android varies | Consistent across platforms | Whisper | Medium |

**Score: On-Device wins 5 of 8 criteria, including both Critical-weight criteria (offline, privacy).**

---

## Detailed Analysis

### 1. Latency

On-device STT eliminates network round-trip entirely. Modern on-device models (iOS SFSpeechRecognizer, Android SpeechRecognizer) typically return results in under 500ms from audio end. Whisper API requires:
- Audio file upload (~200-500ms depending on file size and connection)
- Server processing (~500-1500ms)
- Response download (~100-200ms)
- Total: 1-3 seconds on good network, worse on cellular

**For gentle_loop:** NFR2 requires transcription within 2 seconds of mic release. On-device easily meets this. Whisper can meet it on Wi-Fi but is risky on cellular.

### 2. Offline Capability

**Critical for gentle_loop:** The app serves dementia caregivers who may be in homes with unreliable Wi-Fi. On-device STT works without any network, meaning voice input could still function offline. With Whisper, voice input is completely blocked offline.

Note: The AI suggestion still requires network (the LLM is cloud-based), so voice-only-offline doesn't give full functionality. However, on-device STT enables a future hybrid path: transcribe locally, queue the request, and send when connectivity returns.

### 3. Accuracy

Modern benchmarks (2025-2026) show:
- **WhisperKit (on-device optimized):** 2.2% WER on clean speech
- **Apple SFSpeechRecognizer (iOS 17+):** ~5-8% WER on clean speech
- **Whisper API (whisper-1):** ~3-5% WER on clean speech

For the gentle_loop use case, the speech is:
- Conversational English (not technical jargon)
- Emotionally charged (stressed, tearful, breathless)
- Sometimes in noisy environments (TV, children)

On-device accuracy may degrade more in noisy/emotional conditions than Whisper. However, the gentle_loop input is typically 1-3 sentences, and even with some transcription errors, the LLM can infer intent from imperfect transcripts.

**Mitigation:** If on-device transcription returns low-confidence or empty results, the app already provides a text input fallback (Story 1.10).

### 4. Privacy

**Critical alignment with gentle_loop principles:**
- FR39: Voice audio transcribed and deleted immediately
- FR7: Audio never stored on device or server
- NFR9: No PII about care recipient transmitted beyond transcribed text

On-device STT keeps audio entirely on the device. With Whisper, audio must be uploaded to OpenAI's servers. While OpenAI's data retention policies may be acceptable, on-device is inherently more private — a strong selling point for a caregiving app handling sensitive family situations.

### 5. Cost

On-device: $0 per request, indefinitely.
Whisper: $0.006/minute. For a 30-second recording = $0.003. At 20 uses/day = $0.06/day = ~$1.80/month per user.

While Whisper costs are modest, on-device eliminates this cost entirely. For an MVP with no monetization, zero marginal cost is preferable.

### 6. Integration via expo-speech-recognition

The `expo-speech-recognition` library (v3.1.0) provides a unified API for both on-device and cloud-based recognition:

```typescript
ExpoSpeechRecognitionModule.start({
  requiresOnDeviceRecognition: true, // on-device mode
  lang: 'en-US',
  interimResults: true,
  addsPunctuation: true,
});
```

- Handles permissions (mic + speech recognition)
- Provides streaming results (interim + final)
- Can persist audio for debugging
- Config plugin for Expo (no manual native setup)

**Key flag:** `requiresOnDeviceRecognition: true` forces on-device. If the on-device model isn't available (older device, model not downloaded), recognition fails gracefully — the app can fall back to text input.

### 7. Platform Notes

**iOS (SFSpeechRecognizer):**
- On-device recognition available iOS 13+ (excellent on iOS 17+)
- On-device requires only microphone permission (not speech recognition permission)
- Default sample rate: 44100/48000 Hz
- Punctuation support available

**Android (SpeechRecognizer):**
- On-device availability varies by device and OS version
- Google's on-device models may need to be downloaded first
- Use `supportsOnDeviceRecognition()` to check at runtime
- If on-device not available, can fall back to Google Cloud STT (requires network)
- Default sample rate: 16000 Hz

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| On-device accuracy too low for emotional speech | Text input fallback (Story 1.10). LLM can infer from imperfect transcripts. |
| Android on-device not available on older devices | Runtime check via `supportsOnDeviceRecognition()`. Graceful fallback to text input. |
| User speaks in non-English language | App is English-only for MVP. `lang: 'en-US'` is set explicitly. |
| Very short recordings produce garbage | Story 1.7 adds minimum recording threshold (<1s = re-prompt). |
| Background noise degrades accuracy | Spike test scenarios include noise conditions. If unacceptable, Whisper can be reconsidered. |

---

## Validation Plan

The test harness (`app/stt-eval.tsx`) and test scenarios (`src/data/stt-test-scenarios.ts`) are ready. To validate:

1. Build the app on a physical iOS device: `npx expo run:ios`
2. Navigate to the STT Eval screen
3. Run through all 12 test scenarios (S01-S12)
4. Compare on-device vs Whisper results (if Whisper API key is configured)
5. If on-device accuracy drops below 70% on emotional/noisy scenarios, escalate to reconsider Whisper

**Acceptance threshold:** On-device must achieve ≥70% word accuracy across all scenarios and ≥85% on clean speech scenarios (S01, S02, S08, S12).

---

## Conclusion

**On-device STT (via `expo-speech-recognition`) is the recommended provider for gentle_loop MVP.** It wins on the criteria that matter most for this app: latency, offline capability, privacy, and cost. The accuracy gap versus Whisper is narrow for conversational English and mitigable through the text input fallback.

The `expo-speech-recognition` library with `requiresOnDeviceRecognition: true` is the specific implementation choice. This decision should be validated with the test harness on a physical device before proceeding to Story 1.7 (Voice Recording & Transcription).
