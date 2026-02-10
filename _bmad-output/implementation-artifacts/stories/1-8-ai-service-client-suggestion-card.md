# Story 1.8: AI Service Client & Suggestion Card

Status: review

## Story

As a caregiver,
I want to speak my situation and quickly see a helpful suggestion I can act on right now,
So that I have practical support in the moment I need it.

## Acceptance Criteria Completed

### Phase A: Service Client & Card Display
- [x] Pulsing ellipsis overlay while AI request is processing (FR8, UX-2) — `ProcessingOverlay.tsx`
- [x] Context payload includes: energy level, request_type, Toolbox entries, conversation history, caregiver message (ARCH-9)
- [x] Suggestion card slides up from bottom, max 60% screen height, anchor visible behind (UX-4)
- [x] Card shows 4 action buttons: That worked, Dismiss, Another, Mic follow-up (FR11)
- [x] All action buttons min 44x44pt (NFR15)
- [x] AI-generated label at bottom-left of card (CM-3, FR32)

### Phase B: Card Actions, Threading & Crisis Detection
- [x] "That worked" saves suggestion + date to Toolbox via Zustand/MMKV (FR23)
- [x] "Dismiss" clears card and ends conversation thread
- [x] "Another" sends new request with request_type=another and full thread context (FR42, FR43)
- [x] Mic button on card triggers follow-up with request_type=follow_up
- [x] Conversation thread in-memory only (ARCH-4) — Zustand store, not persisted to MMKV
- [x] Truncation: keeps first turn + last 2 turns, drops middle turns with placeholder (FM-6)
- [x] "Another" button hidden when response_type=out_of_ideas, "Dismiss" expands
- [x] Crisis detection: 5s inactivity → card fades to 15% opacity (UX-3)
- [x] Any interaction restores full card from faded state
- [x] Haptic feedback on action buttons
- [x] Error handling: timeout, network, API errors → toast messages

## Dev Agent Record

### Agent Model Used
Claude claude-4.6-opus

### Completion Notes List
- **AI Service Client** (`src/services/aiClient.ts`): Fetches from ai-suggest Edge Function with full context payload, handles timeout (10s), network errors, and API errors. Supabase anon key from env/fallback. Returns typed `AISuggestion` with text, responseType, rateLimitWarning.
- **Conversation Store** (`src/stores/conversationStore.ts`): In-memory Zustand store (ARCH-4). Manages caregiver/assistant turns, thread lifecycle, history string formatting with FM-6 truncation, turn counting, and out-of-ideas detection.
- **Processing Overlay** (`src/components/anchor/ProcessingOverlay.tsx`): Pulsing dots (...) over a dimmed background while waiting for AI response (FR8). Respects reduceMotion.
- **Suggestion Card** (`src/components/SuggestionCard.tsx`): Bottom sheet with slide-up animation. 4 action buttons per wireframe spec. Crisis detection (UX-3) fades card after 5s inactivity, any touch restores. "Another" hidden when out_of_ideas.
- **Anchor Screen Integration** (`app/index.tsx`): Full flow wired: transcript → sendToAI → processing overlay → suggestion card → actions (That worked/Dismiss/Another/Mic). Thread persists through follow-ups. Mic hidden when card is showing. Card mic enables follow-up recording.

### Change Log
- Created `src/services/aiClient.ts` — AI service client
- Created `src/services/index.ts` — service exports
- Created `src/stores/conversationStore.ts` — in-memory conversation threading
- Updated `src/stores/index.ts` — added conversationStore export
- Created `src/components/anchor/ProcessingOverlay.tsx` — pulsing ellipsis overlay
- Updated `src/components/anchor/index.ts` — added ProcessingOverlay export
- Created `src/components/SuggestionCard.tsx` — suggestion card with all actions + crisis detection
- Updated `app/index.tsx` — full Phase A + B integration
- Created `__tests__/conversation-store.test.ts` — 12 tests
- Created `__tests__/ai-service-client.test.ts` — 13 tests

### File List
- `app/src/services/aiClient.ts` (new)
- `app/src/services/index.ts` (new)
- `app/src/stores/conversationStore.ts` (new)
- `app/src/stores/index.ts` (modified)
- `app/src/components/anchor/ProcessingOverlay.tsx` (new)
- `app/src/components/anchor/index.ts` (modified)
- `app/src/components/SuggestionCard.tsx` (new)
- `app/app/index.tsx` (modified)
- `app/__tests__/conversation-store.test.ts` (new)
- `app/__tests__/ai-service-client.test.ts` (new)
