# Story 1.10: Text Input Fallback

Status: review

## Story

As a caregiver,
I want to type my situation when I can't use voice,
So that I can still get AI support in quiet environments or when speaking isn't possible.

## Acceptance Criteria Completed

- [x] Keyboard/text input icon positioned below mic button, visually secondary (UX-10)
- [x] Minimum 44x44pt tap target on keyboard icon (UFG-5)
- [x] Tapping keyboard icon opens text input field (FR13)
- [x] Text input supports autocorrect, paste, multi-line
- [x] Max length: 500 characters
- [x] Submitting text sends through same AI pipeline as voice (same context payload, same suggestion card)
- [x] Empty/whitespace-only input rejected (Send button disabled)
- [x] Caregiver can dismiss text input (tap outside or swipe down) to return to mic-first Anchor Screen
- [x] Text input uses correct request_type (initial for new thread, follow_up for active thread)
- [x] Offline: keyboard icon shows toast + ideas overlay (same as mic offline behavior)
- [x] Keyboard icon hidden during recording
- [x] KeyboardAvoidingView for proper keyboard handling on iOS

## Dev Agent Record

### Agent Model Used
Claude claude-4.6-opus

### Completion Notes List
- **TextInputFallback component** (`src/components/TextInputFallback.tsx`): Bottom sheet with slide-up animation, text input (56px, rounded, Poppins 16px), energy-colored Send button (48px), drag indicator, auto-focus on open. Dismisses via tap on backdrop. KeyboardAvoidingView wraps the input container for proper iOS keyboard handling.
- **Anchor Screen integration** (`app/index.tsx`): Keyboard icon (⌨) below mic button, 44x44pt. When online, opens TextInputFallback. When offline, shows toast → ideas (same as mic). Text submit routes through `sendToAI()` with correct `requestType`. Hidden during recording.

### Change Log
- Created `src/components/TextInputFallback.tsx` — text input fallback component
- Updated `app/index.tsx` — added keyboard icon, text input state, handlers, overlay
- Created `__tests__/text-input-fallback.test.ts` — 10 tests

### File List
- `app/src/components/TextInputFallback.tsx` (new)
- `app/app/index.tsx` (modified)
- `app/__tests__/text-input-fallback.test.ts` (new)
