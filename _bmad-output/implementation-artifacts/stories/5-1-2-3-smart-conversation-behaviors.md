# Epic 5: Smart Conversation Behaviors (Stories 5.1, 5.2, 5.3)

Status: review

## Stories

### Story 5.1: "Still With You" Encouragement Messages
### Story 5.2: Conversation Pivot — AI Asks a Question
### Story 5.3: "Out of Ideas" Graceful Endpoint

## Acceptance Criteria Completed

### Story 5.1
- [x] Encouragement banner appears after 2+ suggestions without "That worked" (FR18)
- [x] 10 curated messages in pool (ARCH-18), no toxic positivity (UFG-7)
- [x] No-consecutive-repeat selection logic (ARCH-18)
- [x] Banner auto-fades after ~3.5 seconds (UX-5)
- [x] Reduce Motion: instant show/hide, no fade animation (UX-8)
- [x] "That worked" resets counter — next thread starts fresh
- [x] Encouragement NOT shown for question or out_of_ideas response types

### Story 5.2
- [x] `response_type: "question"` triggers pivot card variant
- [x] Pivot card: mic is primary action with "Hold the mic to respond" label (UX-16)
- [x] "That Worked" and "Another" buttons hidden in pivot variant
- [x] "Dismiss" remains available to end thread
- [x] Card still respects 60% max screen height (UX-4)
- [x] After caregiver responds to pivot, card returns to standard 4-button layout (FR11)
- [x] All suggestions remain achievable in 1-2 minutes (FR19)

### Story 5.3
- [x] `response_type: "out_of_ideas"` detected via `isOutOfIdeas()` in conversation store
- [x] "Another" button hidden (removed, not disabled) on out_of_ideas card (UX-14)
- [x] "That Worked" and "Dismiss" and Mic remain available
- [x] Dismiss clears thread for completely fresh start (UFG-8)
- [x] New thread after out_of_ideas carries no context from exhausted thread
- [x] Anchor Screen fully restored after dismiss

## Dev Agent Record

### Agent Model Used
Claude claude-4.6-opus

### Completion Notes List
- **Encouragement Pool** (`src/data/encouragements.ts`): 10 grounded, non-toxic messages. `pickEncouragement()` with no-consecutive-repeat. Threshold at 2 turns, display for 3.5s.
- **EncouragementBanner** (`src/components/EncouragementBanner.tsx`): Positioned above suggestion card. FadeIn/FadeOut animations, auto-dismiss timer. Reduce Motion support.
- **SuggestionCard pivot variant**: When `responseType === 'question'`, card shows mic as primary full-width button with "Hold the mic to respond" label. "That Worked" and "Another" hidden. Only "Dismiss" in secondary row. After response, standard layout restores automatically based on next response_type.
- **Out of Ideas**: Already handled from Epic 1 (`isOutOfIdeas` in card). "Another" hidden, Dismiss + That Worked + Mic remain.
- **Anchor Screen integration**: Encouragement state managed via `showEncouragement`, `encouragementMsg`, and `lastEncouragementRef`. Triggers when `getTurnCount() >= 2` and not a question/out_of_ideas. Resets on "That worked" and "Dismiss".

### Change Log
- Created `src/data/encouragements.ts` — message pool + selection logic
- Created `src/components/EncouragementBanner.tsx` — auto-fading banner component
- Updated `src/components/SuggestionCard.tsx` — pivot question card variant (UX-16)
- Updated `app/index.tsx` — encouragement banner integration, state management
- Created `__tests__/smart-conversation.test.ts` — 27 tests

### File List
- `app/src/data/encouragements.ts` (new)
- `app/src/components/EncouragementBanner.tsx` (new)
- `app/src/components/SuggestionCard.tsx` (modified)
- `app/app/index.tsx` (modified)
- `app/__tests__/smart-conversation.test.ts` (new)
