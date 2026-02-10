# Story 1.4: Settings Screen

Status: review

## Story

As a caregiver,
I want to adjust my energy level, name, anchor image, response mode, and accessibility preferences in one place,
So that the app adapts to my current state and needs without cluttering the Anchor Screen.

## Acceptance Criteria

1. **AC-1: Section order** — Sections displayed in order: Energy, Toolbox (placeholder/preview), Personalization, AI Response, Accessibility, About (UX-12).
2. **AC-2: Energy slider** — 3 discrete positions: "Running low," "Holding steady," "I've got this." No intermediate values (FR3, FM-3). Changes persist immediately via MMKV + Zustand (FR4).
3. **AC-3: Personalization** — Name and anchor image editable (FR36). Image selection via photo library. Quick 1-2 taps.
4. **AC-4: AI Response** — Response mode toggle: text only, audio only, both (default: both) (FR34). TTS speed option: slower, default, faster (NFR16).
5. **AC-5: Accessibility** — Toggles for Reduce Motion, Larger Text, High Contrast (FR35).
6. **AC-6: Persistence** — All settings persist across app restarts (FR38, FR41).
7. **AC-7: Tap targets** — All interactive elements ≥ 44x44pt (NFR11).
8. **AC-8: Toolbox preview** — Shows 3 most recent Toolbox entries (placeholder preview for Epic 4).

## Dev Agent Record

### Agent Model Used

Claude (Cursor Agent)

### Debug Log References

- No debug issues — all tests passed on first run

### Completion Notes List

- **6 sections in spec order (UX-12)**: YOUR ENERGY → TOOLBOX → PERSONALIZATION → AI RESPONSE → ACCESSIBILITY → ABOUT
- **Energy section**: Horizontal 3-position segmented selector with energy-colored backgrounds. Haptic feedback on change. Immediately persists via Zustand + MMKV. Helper text: "Helps the AI adjust its tone."
- **Toolbox preview**: Shows 3 most recent entries (newest first) with suggestion text and date. Empty state: "Strategies you mark as 'That worked' will appear here." "View All" link appears when >3 entries exist (placeholder for Epic 4 full UI).
- **AI Response section**: Two segmented controls — Response Mode (Text/Both/Audio, default: Both) and Speech Speed (Slower/Default/Faster). Both use reusable `SegmentedControl` component.
- **Reusable SegmentedControl**: Generic typed component supporting any string union. iOS-style pill selection with subtle shadow on active option. Min 44px height per option.
- **Tap targets (NFR11)**: Back button expanded from 40→44px. Edit name button wrapped in 44x44 tap target. Energy options and segmented control options all have minHeight 44.
- **Personalization and Accessibility sections**: Carried forward from previous implementation with no functional changes.
- **144 tests across 12 suites**, all passing, zero regressions.

### Change Log

- 2026-02-09: Story 1.4 implementation complete. Settings screen restructured with 6 sections in spec order. Energy selector, Toolbox preview, AI Response controls added. 14 new tests.

### File List

New files:
- `app/__tests__/settings-screen.test.ts` — Settings screen logic tests (14 tests)

Modified files:
- `app/app/settings.tsx` — Complete rewrite: 6 sections in UX-12 order, energy selector, Toolbox preview, AI Response controls, improved tap targets
