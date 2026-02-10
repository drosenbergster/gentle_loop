# Story 1.12: AI-Generated Content Label & Response Mode Wiring

Status: review

## Story

As a caregiver,
I want to know when text on screen is AI-generated,
So that I understand the source of suggestions and maintain appropriate trust.

## Acceptance Criteria Completed

- [x] Subtle, persistent "AI-generated" label visible on suggestion card (FR32)
- [x] Label is at bottom-left of card, 11px Poppins, muted color (CM-3)
- [x] Label color #767676 on #FFFFFF meets WCAG AA contrast (4.54:1 ratio, NFR12)
- [x] Label does not overlap with action buttons or suggestion text (positioned as last element)
- [x] Response mode setting propagates immediately mid-session (SCV-7):
  - "text only" → card shown, no TTS
  - "audio only" → card shown (for action buttons), TTS reads aloud
  - "both" (default) → card shown + TTS reads aloud
- [x] Card is always visible regardless of response mode (actions must be accessible)
- [x] Verified via WCAG AA contrast calculation in tests (actual luminance computation)

## Dev Agent Record

### Agent Model Used
Claude claude-4.6-opus

### Completion Notes List
- **AI label contrast fix**: Changed label color from `rgba(155, 155, 155, 0.5)` (≈1.36:1 ratio, failing WCAG) to `#767676` (4.54:1 ratio, passing WCAG AA). This is the lightest gray that passes AA on white backgrounds.
- **Response mode verification**: The `useTTS` hook reads `responseMode` from Zustand on every `speak()` call. Since Zustand is reactive, mid-session changes propagate immediately — no additional wiring needed. The card is always rendered regardless of mode.

### Change Log
- Updated `src/components/SuggestionCard.tsx` — fixed AI label color for WCAG AA compliance
- Created `__tests__/ai-label-response-mode.test.ts` — 12 tests including WCAG contrast calculation

### File List
- `app/src/components/SuggestionCard.tsx` (modified)
- `app/__tests__/ai-label-response-mode.test.ts` (new)
