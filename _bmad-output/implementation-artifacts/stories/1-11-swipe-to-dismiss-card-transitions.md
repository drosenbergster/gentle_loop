# Story 1.11: Swipe-to-Dismiss & Card Transitions

Status: review

## Story

As a caregiver,
I want to swipe away a suggestion card quickly,
So that I can return to my anchor without hunting for a button.

## Acceptance Criteria Completed

- [x] Swipe left-to-right dismisses card, same behavior as Dismiss button (FR12, UX-7)
- [x] Swipe gesture excludes Android back gesture zone (left 20px) via `activeOffsetX(20)` (FM-5)
- [x] Swipe threshold: 100px rightward to trigger dismiss
- [x] Card slides off screen with opacity fade on swipe (300ms exit)
- [x] Below-threshold swipe snaps back with spring animation
- [x] Card enter: 400ms slide-up with cubic easing (UX-9)
- [x] Card exit: 300ms with ease-out easing (UX-9)
- [x] When Reduce Motion enabled: instant fade-in (100ms), instant exit (0ms) (UX-8)
- [x] All animations via react-native-reanimated for 60fps (ARCH-15)
- [x] Gesture via react-native-gesture-handler Pan gesture
- [x] Opacity fades proportionally during swipe (1 → 0 over 60% screen width)

## Dev Agent Record

### Agent Model Used
Claude claude-4.6-opus

### Completion Notes List
- **SuggestionCard refactored** (`src/components/SuggestionCard.tsx`): Added `react-native-gesture-handler` `Gesture.Pan()` for swipe-to-dismiss. Only rightward swipes count. `activeOffsetX(20)` prevents conflict with Android's system back gesture zone (FM-5). Swipe past 100px triggers dismiss — card animates off screen and calls `onDismiss()`. Below threshold, card snaps back with spring. Opacity fades proportionally during swipe. Combined with existing crisis detection opacity for smooth compositing. Enter/exit durations match UX-9 spec. Reduce motion uses instant transitions.
- **GestureHandlerRootView** already in `_layout.tsx` — no changes needed.
- **Jest mock** for `react-native-gesture-handler` added to `jest.setup.js`.

### Change Log
- Updated `src/components/SuggestionCard.tsx` — added swipe-to-dismiss gesture, polished animation durations
- Updated `jest.setup.js` — added react-native-gesture-handler mock
- Created `__tests__/swipe-dismiss.test.ts` — 17 tests

### File List
- `app/src/components/SuggestionCard.tsx` (modified)
- `app/jest.setup.js` (modified)
- `app/__tests__/swipe-dismiss.test.ts` (new)
