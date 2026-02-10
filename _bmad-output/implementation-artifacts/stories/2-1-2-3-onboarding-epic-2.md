# Epic 2: Onboarding & First-Time Setup (Stories 2.1, 2.2, 2.3)

Status: review

## Stories

### Story 2.1: Onboarding Flow — Welcome, How It Works & Your Name
### Story 2.2: Onboarding Flow — Your Anchor & Meet the Mic
### Story 2.3: Wellness Disclaimer & First Launch Gate

## Acceptance Criteria Completed

### Story 2.1
- [x] App launches to onboarding when no completion flag (FR29)
- [x] Step 1 (Welcome): warm intro, app purpose, "Get Started" button
- [x] Step 2 (How It Works): 3-step visual explanation of mic-first interaction
- [x] Step 3 (Your Name): text input for first name, required to advance
- [x] Progress indicator shows step position (5 dots)
- [x] All interactive elements ≥44x44pt (NFR11)

### Story 2.2
- [x] Step 4 (Your Anchor): 3 default images + custom upload option (FR25)
- [x] Photo library permission requested before picker (FM-8)
- [x] Default placeholder available if caregiver skips (skip link)
- [x] Prompt suggests non-person photos (SQ-5)
- [x] Step 5 (Meet the Mic): hold-to-talk visual demo (UX-11)
- [x] Mic permission dialog triggered with pre-permission explanation (FR30, ARCH-16)
- [x] Denied mic permission → message about text input fallback

### Story 2.3
- [x] Wellness disclaimer with approachable language (FR31)
- [x] Checkbox acknowledgment required — "Get Started" disabled until accepted
- [x] Onboarding-completed flag persisted to MMKV on finish
- [x] Navigates to Anchor Screen on completion
- [x] Force-quit mid-onboarding → restarts from beginning (no partial state)
- [x] All onboarding data (name, anchor, disclaimer) persists across restarts (FR38, FR41)

## Dev Agent Record

### Agent Model Used
Claude claude-4.6-opus

### Completion Notes List
- **Onboarding screen** (`app/onboarding.tsx`): Single screen with 5-step internal navigation using `useState`. FadeIn transitions between steps. Steps match wireframe spec: Welcome (app icon, tagline, description), How It Works (3 numbered steps), Your Name (56px input, required), Your Anchor (3 default + upload grid, skip link), Meet the Mic (demo visual, privacy note, mic permission button, wellness disclaimer checkbox).
- **Photo picker**: Uses `expo-image-picker` with `requestMediaLibraryPermissionsAsync` before `launchImageLibraryAsync`. 1:1 aspect crop, 80% quality. Permission denied → alert with guidance.
- **Mic permission**: Calls `ExpoSpeechRecognitionModule.requestPermissionsAsync()`. Denied → alert explaining text input fallback.
- **Routing gate**: `app/index.tsx` already has `if (!hasCompletedOnboarding) return <Redirect href="/onboarding" />` from earlier stories.
- **Disclaimer**: Checkbox + text, wired to `disclaimerAccepted` state. CTA disabled until checked.

### Change Log
- Created `app/onboarding.tsx` — 5-step onboarding flow
- Updated `jest.setup.js` — added expo-image-picker mock
- Created `__tests__/onboarding.test.ts` — 18 tests
- Installed `expo-image-picker`

### File List
- `app/app/onboarding.tsx` (new)
- `app/jest.setup.js` (modified)
- `app/__tests__/onboarding.test.ts` (new)
