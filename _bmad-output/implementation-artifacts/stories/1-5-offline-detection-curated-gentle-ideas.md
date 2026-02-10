# Story 1.5: Offline Detection & Curated Gentle Ideas

Status: review

## Story

As a caregiver,
I want to still get helpful ideas even when I don't have internet,
So that I'm never left with nothing when I need support.

## Acceptance Criteria

1. **AC-1: Offline mic** — When offline, mic button appears grayed out (50% opacity) (FR27). ✅
2. **AC-2: Offline tap** — Tapping grayed mic shows "AI isn't available offline" within 1s, then opens Gentle Ideas overlay (FR28, NFR17). ✅
3. **AC-3: Curated ideas** — 16 ideas across energy states, filtered to current level (FR26). ✅
4. **AC-4: Card format** — Same visual card container as AI suggestion cards (WAR-6). Two actions: "Something else" + "That helps" (WAR-7). ✅
5. **AC-5: Pool exhaustion** — When all ideas for current energy shown, pool reshuffles and restarts (FM-10). ✅
6. **AC-6: That helps saves** — "That helps" saves the idea to Toolbox store. ✅
7. **AC-7: Offline functionality** — Anchor Screen, affirmations, and Toolbox work fully offline (NFR18). ✅
8. **AC-8: Online transition** — When connectivity restores, mic re-enables (SCV-6). ✅

## Dev Agent Record

### Agent Model Used
claude-4.6-opus

### Debug Log References
None — clean implementation with no test failures.

### Completion Notes List

- **@react-native-community/netinfo** installed as network detection provider (ARCH-13). Expo SDK 54 compatible.
- **`ideas.ts` migrated** to new `EnergyLevel` keys (`running_low`, `holding_steady`, `ive_got_this`), matching the energy store refactor from Story 1.2. All 16 ideas preserved (FR26: 4 + 6 + 6).
- **`IdeaCycler` class** implements FM-10 pool exhaustion: Fisher-Yates shuffle ensures all ideas for a level are shown before reshuffling. Automatically resets when energy level changes.
- **`useNetworkStatus` hook** wraps NetInfo `addEventListener` with optimistic default (online until proven otherwise). Returns `{ isOnline, isReady }`.
- **`IdeasOverlay` updated** to use `useEnergyLevel` (replacing deprecated `useEnergyState`), integrated `IdeaCycler` for ordered cycling, and added Toolbox save on "That helps" — saves `"Title: Content"` format.
- **Anchor Screen** updated: mic button receives `offline={!isOnline}` prop, tapping offline mic shows toast ("AI isn't available offline") via Reanimated FadeIn/FadeOut, then opens IdeasOverlay after 1.5s.
- **MicButton** enhanced with `offline` prop: grays to 50% opacity, stops breathing pulse, updates accessibility labels for screen readers.
- **Drag indicator** added to IdeasOverlay card for visual consistency.
- **Button min-height 44px** on overlay actions (NFR11).
- **163 tests across 13 suites**, all passing, zero regressions (up from 135 tests in Story 1.4).

### Change Log
- Installed `@react-native-community/netinfo`
- Rewrote `src/data/ideas.ts` — new energy level keys, `IdeaCycler` class, `TOTAL_IDEAS_COUNT` export
- Created `src/hooks/useNetworkStatus.ts`
- Updated `src/hooks/index.ts` — added `useNetworkStatus` export
- Rewrote `src/components/IdeasOverlay.tsx` — `IdeaCycler`, Toolbox save, new energy imports
- Updated `src/components/anchor/MicButton.tsx` — `offline` prop with opacity, accessibility labels, pulse disable
- Updated `app/index.tsx` — offline detection, toast, IdeasOverlay integration
- Updated `jest.setup.js` — added NetInfo mock
- Created `__tests__/offline-ideas.test.ts` (28 tests)

### File List
- `app/package.json` (modified — netinfo dependency)
- `app/src/data/ideas.ts` (modified — energy level keys, IdeaCycler, TOTAL_IDEAS_COUNT)
- `app/src/hooks/useNetworkStatus.ts` (new)
- `app/src/hooks/index.ts` (modified)
- `app/src/components/IdeasOverlay.tsx` (modified — IdeaCycler, Toolbox save)
- `app/src/components/anchor/MicButton.tsx` (modified — offline prop)
- `app/app/index.tsx` (modified — offline detection, toast, overlay)
- `app/jest.setup.js` (modified — NetInfo mock)
- `app/__tests__/offline-ideas.test.ts` (new)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)
- `_bmad-output/implementation-artifacts/stories/1-5-offline-detection-curated-gentle-ideas.md` (new)
