# Technical Architecture - gentle_loop

**Version:** 2.0
**Date:** 2026-02-09
**Updated:** Reflects PRD v2026-02-07 (AI Guided Support, Toolbox-aware AI, conversation threading, conversation pivot)

---

## Executive Summary

gentle_loop is a React Native mobile app designed for dementia caregivers. The architecture prioritizes:

1. **Instant Load** — Anchor screen visible in <2 seconds
2. **Offline-First** — Core features work without network
3. **Voice-First AI** — Hold-to-talk mic on Anchor Screen, AI response in <5 seconds
4. **Minimal Complexity** — Simple stack for fast MVP delivery
5. **Privacy by Default** — All sensitive data stays on device; audio transcribed and immediately discarded

---

## Technology Stack

### Core Framework

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | React Native (Expo) | Cross-platform iOS/Android, fast iteration |
| **Language** | TypeScript | Type safety, better developer experience |
| **UI Components** | React Native Paper | Accessible, themeable, Material Design base |
| **Navigation** | Expo Router | File-based routing, deep linking support |

### Data & State

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Local Storage** | MMKV | Fastest synchronous storage for React Native |
| **State Management** | Zustand | Simple, lightweight, TypeScript-native |
| **Data Sync (Phase 2)** | TBD (Supabase or Firebase) | For family features later |

### AI & Voice

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Speech-to-Text** | On-device (Apple Speech / Google Speech) or Whisper API | Low latency; evaluate both during development |
| **LLM API** | OpenAI (GPT-4o-mini) or Anthropic (Claude 3.5 Haiku) | Cost-effective, strong instruction-following, fast |
| **Text-to-Speech** | expo-speech (on-device TTS) | Read AI responses aloud; configurable in Settings |
| **API Proxy** | Supabase Edge Function (or similar) | Secures API key server-side; client never holds key |
| **Audio Recording** | expo-av | Hold-to-talk recording, 60-second max |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Expo** | Build, preview, OTA updates |
| **EAS Build** | App store builds |
| **TypeScript** | Type checking |
| **ESLint + Prettier** | Code quality |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                          gentle_loop                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│   │   Screens    │  │  Components  │  │    Hooks     │          │
│   │              │  │              │  │              │          │
│   │ - Anchor     │  │ - MicButton  │  │ - useAI      │          │
│   │ - Onboarding │  │ - Suggestion │  │ - useVoice   │          │
│   │ - Settings   │  │   Card       │  │ - useEnergy  │          │
│   │              │  │ - Toolbox    │  │ - useToolbox │          │
│   │              │  │ - Timer      │  │ - useTimer   │          │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│          │                 │                 │                   │
│          └─────────────────┼─────────────────┘                   │
│                            │                                     │
│                     ┌──────▼───────┐                             │
│                     │    Stores    │                             │
│                     │  (Zustand)   │                             │
│                     │              │                             │
│                     │ - settings   │                             │
│                     │ - energy     │                             │
│                     │ - toolbox    │                             │
│                     │ - convo      │                             │
│                     └──────┬───────┘                             │
│                            │                                     │
│              ┌─────────────┼─────────────┐                       │
│              │             │             │                       │
│        ┌─────▼─────┐ ┌────▼─────┐ ┌─────▼──────┐               │
│        │   MMKV    │ │  AI API  │ │  Speech    │               │
│        │ (Storage) │ │ (Proxy)  │ │ (STT/TTS) │               │
│        └───────────┘ └────┬─────┘ └────────────┘               │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │  Edge Function  │
                   │  (API Proxy)    │
                   │                 │
                   │  - Auth check   │
                   │  - Rate limit   │
                   │  - Key secured  │
                   └────────┬────────┘
                            │
                   ┌────────▼────────┐
                   │   LLM API      │
                   │ (OpenAI /      │
                   │  Anthropic)    │
                   └─────────────────┘
```

---

## Project Structure

```
gentle_loop/
├── app/                          # Expo Router screens
│   ├── (tabs)/
│   │   └── index.tsx             # Anchor Screen (home)
│   ├── onboarding/
│   │   ├── welcome.tsx
│   │   ├── how-it-works.tsx
│   │   ├── your-name.tsx
│   │   ├── your-anchor.tsx
│   │   └── meet-the-mic.tsx      # NEW: Step 5 — mic intro + permission
│   ├── settings/
│   │   ├── index.tsx
│   │   └── toolbox.tsx           # NEW: Toolbox detail view
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry redirect
│
├── components/
│   ├── ui/                       # Primitive components
│   │   ├── Button.tsx
│   │   ├── Text.tsx
│   │   ├── Card.tsx
│   │   └── Slider.tsx
│   ├── anchor/
│   │   ├── AnchorImage.tsx
│   │   └── Affirmation.tsx
│   ├── ai/                       # NEW: AI Guided Support components
│   │   ├── MicButton.tsx         # Hold-to-talk mic button
│   │   ├── RecordingOverlay.tsx   # Pulsing mic during recording
│   │   ├── ProcessingOverlay.tsx  # Pulsing ellipses while AI thinks
│   │   ├── SuggestionCard.tsx     # AI response card with 4 actions
│   │   ├── EncouragementBanner.tsx # "Still With You" messages
│   │   ├── TimerOverlay.tsx       # Breathing/pause timer UI
│   │   └── TextInputFallback.tsx  # Typed input alternative
│   ├── ideas/                     # Curated offline ideas (fallback)
│   │   ├── IdeaCard.tsx
│   │   └── IdeaOverlay.tsx
│   ├── toolbox/                   # NEW: Toolbox components
│   │   ├── ToolboxList.tsx
│   │   └── ToolboxEntry.tsx
│   └── onboarding/
│       ├── OnboardingStep.tsx
│       └── ProgressDots.tsx
│
├── services/                      # NEW: External service integrations
│   ├── ai.ts                     # AI API client (builds context, calls proxy)
│   ├── speech.ts                 # Speech-to-text wrapper
│   └── tts.ts                    # Text-to-speech wrapper
│
├── stores/                       # Zustand stores
│   ├── settingsStore.ts
│   ├── energyStore.ts
│   ├── toolboxStore.ts           # NEW: Toolbox state + persistence
│   └── conversationStore.ts      # NEW: Conversation thread state
│
├── data/                         # Static content
│   ├── ideas.ts                  # Curated ideas library (16 ideas, offline fallback)
│   ├── affirmations.ts           # Rotating affirmations
│   ├── encouragements.ts         # NEW: "Still With You" message pool
│   └── defaults.ts               # Default images, etc.
│
├── hooks/                        # Custom hooks
│   ├── useVoiceInput.ts          # NEW: Hold-to-talk recording + transcription
│   ├── useAIGuidance.ts          # NEW: AI request/response lifecycle
│   ├── useConversation.ts        # NEW: Conversation thread management
│   ├── useToolbox.ts             # NEW: Toolbox CRUD operations
│   ├── useTimer.ts               # NEW: Breathing/pause timer
│   ├── useIdeas.ts               # Curated ideas (offline fallback)
│   ├── useEnergy.ts
│   └── useOnboarding.ts
│
├── types/                         # NEW: Shared type definitions
│   ├── ai.ts                     # AI request/response types
│   ├── conversation.ts           # Conversation thread types
│   └── toolbox.ts                # Toolbox entry types
│
├── theme/                        # Design tokens
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts
│
├── utils/                        # Utilities
│   ├── storage.ts                # MMKV wrapper
│   └── haptics.ts                # Haptic feedback
│
├── assets/                       # Static assets
│   ├── images/
│   │   └── default-anchor.jpg
│   └── fonts/
│       └── Poppins/
│
├── app.json                      # Expo config
├── package.json
├── tsconfig.json
└── README.md
```

---

## Data Architecture

### Local Storage Schema (MMKV)

```typescript
// User Settings
interface UserSettings {
  name: string;
  hasCompletedOnboarding: boolean;
  anchorImageUri: string | null;
  anchorVideoUri: string | null;
  reduceMotion: boolean;
  largerText: boolean;
  highContrast: boolean;
  responseMode: 'text' | 'audio' | 'both';  // NEW: AI response output mode
}

// Energy State (persists across sessions)
interface EnergyState {
  level: number;                    // 0-1 (slider position)
  resolvedState: EnergyApiValue;    // Derived: 'running_low' | 'holding_steady' | 'ive_got_this'
  lastUpdated: string;              // ISO timestamp
}

// Toolbox Entry (NEW)
interface ToolboxEntry {
  id: string;                       // UUID
  suggestionText: string;           // The AI suggestion that worked
  savedAt: string;                  // ISO timestamp
}

// Conversation Thread (NEW — ephemeral, not persisted to MMKV)
interface ConversationThread {
  id: string;                       // UUID, new per thread
  startedAt: string;                // ISO timestamp
  turns: ConversationTurn[];        // All exchanges in this thread
  turnCount: number;                // Current turn count
  anotherCount: number;             // Consecutive "Another" taps (for pivot tracking)
  lastResponseType: ResponseType;   // Most recent AI response classification
  isTimerActive: boolean;           // Breathing timer is running
}

// Response type returned by the API proxy after parsing LLM structured tags
type ResponseType = 'suggestion' | 'pause' | 'question' | 'out_of_ideas';

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  requestType: RequestType;         // What triggered this turn
  timestamp: string;
}

type RequestType = 'initial' | 'another' | 'follow_up' | 'timer_follow_up';
type EnergyApiValue = 'running_low' | 'holding_steady' | 'ive_got_this';
```

### Storage Keys

```typescript
const STORAGE_KEYS = {
  USER_SETTINGS: 'user_settings',
  ENERGY_STATE: 'energy_state',
  TOOLBOX: 'toolbox_entries',
  LAST_IDEA_INDEX: 'last_idea_index',
  LAST_ENCOURAGEMENT_INDEX: 'last_encouragement_index',
} as const;
```

### Storage Utility

```typescript
// utils/storage.ts
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'gentle-loop-storage',
  encryptionKey: 'gentle-loop-key',  // MMKV encryption at rest
});

export const storageUtils = {
  get: <T>(key: string): T | null => {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  },

  set: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  delete: (key: string): void => {
    storage.delete(key);
  },
};
```

---

## State Management

### Zustand Store Pattern

```typescript
// stores/settingsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../utils/storage';

interface SettingsState {
  name: string;
  hasCompletedOnboarding: boolean;
  anchorImageUri: string | null;
  reduceMotion: boolean;
  responseMode: 'text' | 'audio' | 'both';

  // Actions
  setName: (name: string) => void;
  setAnchorImage: (uri: string) => void;
  completeOnboarding: () => void;
  toggleReduceMotion: () => void;
  setResponseMode: (mode: 'text' | 'audio' | 'both') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      name: '',
      hasCompletedOnboarding: false,
      anchorImageUri: null,
      reduceMotion: false,
      responseMode: 'both',

      setName: (name) => set({ name }),
      setAnchorImage: (uri) => set({ anchorImageUri: uri }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      toggleReduceMotion: () => set((state) => ({
        reduceMotion: !state.reduceMotion
      })),
      setResponseMode: (mode) => set({ responseMode: mode }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => storage.getString(name) ?? null,
        setItem: (name, value) => storage.set(name, value),
        removeItem: (name) => storage.delete(name),
      })),
    }
  )
);
```

### Energy Store

```typescript
// stores/energyStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../utils/storage';

type EnergyApiValue = 'running_low' | 'holding_steady' | 'ive_got_this';

interface EnergyStoreState {
  level: number;                     // 0-1 continuous (slider position)
  resolvedState: EnergyApiValue;     // Discrete state sent to AI API

  setLevel: (level: number) => void;
}

const resolveEnergyState = (level: number): EnergyApiValue => {
  if (level < 0.33) return 'running_low';
  if (level < 0.66) return 'holding_steady';
  return 'ive_got_this';
};

export const useEnergyStore = create<EnergyStoreState>()(
  persist(
    (set) => ({
      level: 0.5,
      resolvedState: 'holding_steady',

      setLevel: (level) => set({
        level,
        resolvedState: resolveEnergyState(level),
      }),
    }),
    {
      name: 'energy-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => storage.getString(name) ?? null,
        setItem: (name, value) => storage.set(name, value),
        removeItem: (name) => storage.delete(name),
      })),
    }
  )
);
```

### Toolbox Store (NEW)

```typescript
// stores/toolboxStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../utils/storage';
import { ToolboxEntry } from '../types/toolbox';
import uuid from 'react-native-uuid';

const TOOLBOX_MAX_ENTRIES = 50;        // Storage cap (MMKV)
const TOOLBOX_AI_CONTEXT_LIMIT = 15;   // Sent to LLM per request
const TOOLBOX_WARNING_THRESHOLD = 45;  // Show warning at this count

interface ToolboxStoreState {
  entries: ToolboxEntry[];

  addEntry: (suggestionText: string) => void;
  removeEntry: (id: string) => void;
  getEntriesForAI: () => ToolboxEntry[];  // Returns up to 15 most recent
  isNearCap: () => boolean;               // True when entries >= warning threshold
}

export const useToolboxStore = create<ToolboxStoreState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (suggestionText) => set((state) => {
        const newEntry = {
          id: uuid.v4() as string,
          suggestionText,
          savedAt: new Date().toISOString(),
        };
        let updated = [newEntry, ...state.entries];
        // FIFO: if over cap, drop oldest entries
        if (updated.length > TOOLBOX_MAX_ENTRIES) {
          updated = updated.slice(0, TOOLBOX_MAX_ENTRIES);
        }
        return { entries: updated };
      }),

      removeEntry: (id) => set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
      })),

      getEntriesForAI: () => {
        return get().entries.slice(0, TOOLBOX_AI_CONTEXT_LIMIT); // 15 most recent for AI context
      },

      isNearCap: () => {
        return get().entries.length >= TOOLBOX_WARNING_THRESHOLD;
      },
    }),
    {
      name: 'toolbox-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => storage.getString(name) ?? null,
        setItem: (name, value) => storage.set(name, value),
        removeItem: (name) => storage.delete(name),
      })),
    }
  )
);
```

### Conversation Store (NEW)

```typescript
// stores/conversationStore.ts
import { create } from 'zustand';
import uuid from 'react-native-uuid';
import { ConversationThread, ConversationTurn, RequestType } from '../types/conversation';

const MAX_TURNS = 7;

interface ConversationStoreState {
  thread: ConversationThread | null;
  isActive: boolean;

  startThread: () => void;
  addTurn: (role: 'user' | 'assistant', content: string, requestType: RequestType) => void;
  incrementAnotherCount: () => void;
  resetAnotherCount: () => void;
  setResponseType: (type: ResponseType) => void;
  setTimerActive: (active: boolean) => void;
  resetThread: () => void;
  isAtTurnLimit: () => boolean;
  shouldPivot: () => boolean;
  getHistoryForAI: () => string;
}

export const useConversationStore = create<ConversationStoreState>((set, get) => ({
  thread: null,
  isActive: false,

  startThread: () => set({
    thread: {
      id: uuid.v4() as string,
      startedAt: new Date().toISOString(),
      turns: [],
      turnCount: 0,
      anotherCount: 0,
      lastResponseType: 'suggestion' as ResponseType,
      isTimerActive: false,
    },
    isActive: true,
  }),

  addTurn: (role, content, requestType) => set((state) => {
    if (!state.thread) return state;
    const turn: ConversationTurn = {
      role,
      content,
      requestType,
      timestamp: new Date().toISOString(),
    };
    return {
      thread: {
        ...state.thread,
        turns: [...state.thread.turns, turn],
        turnCount: state.thread.turnCount + 1,
      },
    };
  }),

  incrementAnotherCount: () => set((state) => {
    if (!state.thread) return state;
    return {
      thread: {
        ...state.thread,
        anotherCount: state.thread.anotherCount + 1,
      },
    };
  }),

  resetAnotherCount: () => set((state) => {
    if (!state.thread) return state;
    return {
      thread: { ...state.thread, anotherCount: 0 },
    };
  }),

  setResponseType: (type: ResponseType) => set((state) => {
    if (!state.thread) return state;
    return {
      thread: { ...state.thread, lastResponseType: type },
    };
  }),

  setTimerActive: (active) => set((state) => {
    if (!state.thread) return state;
    return {
      thread: { ...state.thread, isTimerActive: active },
    };
  }),

  resetThread: () => set({ thread: null, isActive: false }),

  isAtTurnLimit: () => {
    const thread = get().thread;
    return thread ? thread.turnCount >= MAX_TURNS : false;
  },

  // The AI handles pivot detection via conversation history,
  // but the app tracks anotherCount for "Still With You" encouragement
  shouldPivot: () => {
    const thread = get().thread;
    return thread ? thread.anotherCount >= 3 : false;
  },

  getHistoryForAI: () => {
    const thread = get().thread;
    if (!thread || thread.turns.length === 0) return '';

    return thread.turns.map((turn) => {
      if (turn.role === 'user') {
        if (turn.requestType === 'another') {
          return 'Caregiver: [requested another suggestion]';
        }
        if (turn.requestType === 'timer_follow_up') {
          return 'Caregiver: [Timer expired after breathing pause. Provide a practical follow-up for the original situation.]';
        }
        return `Caregiver: ${turn.content}`;
      }
      return `You: ${turn.content}`;
    }).join('\n');
  },
}));
```

---

## AI Service Layer (NEW)

### AI Client

```typescript
// services/ai.ts
import { EnergyApiValue, RequestType } from '../types/ai';
import { ToolboxEntry } from '../types/toolbox';

const API_PROXY_URL = process.env.EXPO_PUBLIC_API_PROXY_URL;

interface AIRequestContext {
  energyLevel: EnergyApiValue;
  requestType: RequestType;
  toolboxEntries: ToolboxEntry[];
  conversationHistory: string;
  caregiverMessage: string;
}

interface AIResponse {
  suggestion: string;
  responseType: ResponseType;  // 'suggestion' | 'pause' | 'question' | 'out_of_ideas'
}

/**
 * Builds the structured context block for the AI.
 * All context is sent as a single user message; conversation history
 * is formatted inline rather than as separate chat messages.
 */
function buildUserMessage(context: AIRequestContext): string {
  const toolboxSection = context.toolboxEntries.length > 0
    ? context.toolboxEntries
        .map((e) => `- "${e.suggestionText}" (saved: ${e.savedAt.split('T')[0]})`)
        .join('\n')
    : '(none)';

  const historySection = context.conversationHistory || '(none)';

  return [
    '[Context]',
    `Energy: ${context.energyLevel}`,
    `Request: ${context.requestType}`,
    `Toolbox:`,
    toolboxSection,
    '',
    '[Conversation History]',
    historySection,
    '',
    '[Caregiver]',
    context.caregiverMessage,
  ].join('\n');
}

/**
 * Sends a request to the AI via the API proxy.
 * The system prompt is stored server-side in the proxy to avoid
 * sending ~2,200 tokens from the client on every request.
 */
export async function getAISuggestion(context: AIRequestContext): Promise<AIResponse> {
  const response = await fetch(`${API_PROXY_URL}/ai/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: buildUserMessage(context),
    }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    suggestion: data.suggestion,
    responseType: data.response_type ?? 'suggestion',  // Default to 'suggestion' if missing
  };
}
```

### API Proxy (Edge Function)

The API proxy is a lightweight server-side function that:
1. Holds the LLM API key securely (never in client bundle)
2. Holds the system prompt (reduces per-request payload from client)
3. Applies rate limiting (per-device, soft cap)
4. Forwards the client's context message to the LLM API
5. Parses the structured response tag (`[SUGGESTION]`, `[PAUSE]`, `[QUESTION]`, `[OUT_OF_IDEAS]`) from the LLM response, strips it, and returns the clean text with a `response_type` metadata field

```typescript
// Edge function pseudocode (Supabase Edge Function or similar)
// supabase/functions/ai-suggest/index.ts

import { serve } from 'https://deno.land/std/http/server.ts';

const SYSTEM_PROMPT = Deno.env.get('GENTLE_LOOP_SYSTEM_PROMPT');
const LLM_API_KEY = Deno.env.get('LLM_API_KEY');
const LLM_API_URL = 'https://api.openai.com/v1/chat/completions';

serve(async (req) => {
  const { message } = await req.json();

  const llmResponse = await fetch(LLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      max_tokens: 120,
      temperature: 0.7,
    }),
  });

  const data = await llmResponse.json();
  const rawContent = data.choices[0].message.content;

  // Parse structured response tag from LLM output
  // The system prompt instructs the LLM to prepend [SUGGESTION], [PAUSE], [QUESTION], or [OUT_OF_IDEAS]
  const TAG_REGEX = /^\[(SUGGESTION|PAUSE|QUESTION|OUT_OF_IDEAS)\]\s*/i;
  const tagMatch = rawContent.match(TAG_REGEX);

  let responseType = 'suggestion'; // Default fallback
  let suggestion = rawContent;

  if (tagMatch) {
    responseType = tagMatch[1].toLowerCase().replace('out_of_ideas', 'out_of_ideas');
    suggestion = rawContent.replace(TAG_REGEX, '').trim();
  } else {
    // Tag missing or malformed — log for monitoring, default to "suggestion"
    console.warn('LLM response missing structured tag:', rawContent.substring(0, 80));
  }

  return new Response(JSON.stringify({ suggestion, response_type: responseType }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Voice Input Pipeline

```typescript
// services/speech.ts
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

/**
 * Records audio via hold-to-talk, transcribes, and immediately deletes.
 * Audio never persists on device or server.
 */
export class VoiceRecorder {
  private recording: Audio.Recording | null = null;

  async startRecording(): Promise<void> {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true });

    this.recording = new Audio.Recording();
    await this.recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    await this.recording.startAsync();
  }

  async stopAndTranscribe(): Promise<string> {
    if (!this.recording) throw new Error('No active recording');

    await this.recording.stopAndUnloadAsync();
    const uri = this.recording.getURI();
    this.recording = null;

    if (!uri) throw new Error('Recording URI not available');

    try {
      const transcript = await transcribeAudio(uri);
      return transcript;
    } finally {
      // CRITICAL: Always delete audio, even on transcription failure
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  }
}

/**
 * Transcribes audio to text.
 * Implementation depends on chosen STT provider:
 * - On-device: Apple Speech / Google Speech (lower latency, no network)
 * - Cloud: Whisper API via proxy (higher accuracy, requires network)
 */
async function transcribeAudio(audioUri: string): Promise<string> {
  // Implementation TBD based on STT provider evaluation
  // Target: <2 seconds from release to transcript (NFR2)
  throw new Error('Not implemented — choose STT provider');
}
```

### Text-to-Speech

```typescript
// services/tts.ts
import * as Speech from 'expo-speech';

/**
 * Reads AI response aloud using on-device TTS.
 * Configurable via Settings: text only, audio only, or both.
 */
export function speakSuggestion(text: string): void {
  Speech.speak(text, {
    language: 'en-US',
    pitch: 1.0,
    rate: 0.9,  // Slightly slower for calm delivery
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}
```

---

## AI Interaction Hooks (NEW)

### useVoiceInput

```typescript
// hooks/useVoiceInput.ts
import { useState, useRef, useCallback } from 'react';
import { VoiceRecorder } from '../services/speech';

const MAX_RECORDING_DURATION = 60000; // 60 seconds

export const useVoiceInput = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recorder = useRef(new VoiceRecorder());
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startRecording = useCallback(async () => {
    setIsRecording(true);
    await recorder.current.startRecording();

    // Auto-stop at 60 seconds
    timeoutRef.current = setTimeout(() => {
      stopAndTranscribe();
    }, MAX_RECORDING_DURATION);
  }, []);

  const stopAndTranscribe = useCallback(async (): Promise<string> => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsRecording(false);
    setIsTranscribing(true);

    try {
      const transcript = await recorder.current.stopAndTranscribe();
      return transcript;
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopAndTranscribe,
  };
};
```

### useAIGuidance

```typescript
// hooks/useAIGuidance.ts
import { useState, useCallback } from 'react';
import { getAISuggestion } from '../services/ai';
import { useEnergyStore } from '../stores/energyStore';
import { useToolboxStore } from '../stores/toolboxStore';
import { useConversationStore } from '../stores/conversationStore';
import { RequestType } from '../types/ai';

export const useAIGuidance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<string | null>(null);
  const [responseType, setResponseType] = useState<ResponseType>('suggestion');

  const energyState = useEnergyStore((s) => s.resolvedState);
  const getToolboxEntries = useToolboxStore((s) => s.getEntriesForAI);
  const { addTurn, getHistoryForAI } = useConversationStore();

  const requestSuggestion = useCallback(async (
    caregiverMessage: string,
    requestType: RequestType,
  ) => {
    setIsLoading(true);

    // Add user turn to conversation
    if (requestType !== 'timer_follow_up') {
      addTurn('user', caregiverMessage, requestType);
    }

    try {
      const response = await getAISuggestion({
        energyLevel: energyState,
        requestType,
        toolboxEntries: getToolboxEntries(),
        conversationHistory: getHistoryForAI(),
        caregiverMessage,
      });

      setCurrentSuggestion(response.suggestion);
      setResponseType(response.responseType);

      // Add assistant turn to conversation
      addTurn('assistant', response.suggestion, requestType);

      return response;
    } finally {
      setIsLoading(false);
    }
  }, [energyState, getToolboxEntries, addTurn, getHistoryForAI]);

  return {
    isLoading,
    currentSuggestion,
    responseType,       // 'suggestion' | 'pause' | 'question' | 'out_of_ideas'
    requestSuggestion,
  };
};
```

### useTimer

```typescript
// hooks/useTimer.ts
import { useState, useRef, useCallback } from 'react';

const DEFAULT_TIMER_DURATION = 90000; // 90 seconds

export const useTimer = (onExpire: () => void) => {
  const [isActive, setIsActive] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const start = useCallback((durationMs = DEFAULT_TIMER_DURATION) => {
    setIsActive(true);
    setRemainingMs(durationMs);

    // Update remaining time every second for UI
    intervalRef.current = setInterval(() => {
      setRemainingMs((prev) => Math.max(0, prev - 1000));
    }, 1000);

    // Fire callback on expiry
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsActive(false);
      setRemainingMs(0);
      onExpire();
    }, durationMs);
  }, [onExpire]);

  const cancel = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsActive(false);
    setRemainingMs(0);
  }, []);

  return {
    isActive,
    remainingMs,
    start,
    cancel,
  };
};
```

---

## Curated Ideas System (Offline Fallback)

The curated ideas library serves as the offline fallback when the AI is unavailable.

### Ideas Data Structure

```typescript
// data/ideas.ts
export interface Idea {
  id: string;
  validation: string;
  title: string;
  content: string;
  energyState: 'resting' | 'warming' | 'glowing';
}

export const ideas: Idea[] = [
  // 16 curated ideas across 3 energy states
  // See UX Design Specification for full content
];

export const getIdeasForState = (state: string): Idea[] => {
  return ideas.filter(idea => idea.energyState === state);
};

export const getRandomIdea = (state: string): Idea => {
  const stateIdeas = getIdeasForState(state);
  return stateIdeas[Math.floor(Math.random() * stateIdeas.length)];
};
```

### Encouragement Message Pool (NEW)

```typescript
// data/encouragements.ts
export const encouragements: string[] = [
  "We're in this together. More ideas coming.",
  "You're not alone in this. Let's keep trying.",
  "Still here with you. Let's try a different angle.",
  "Hang in there. I've got more to share.",
  "This is hard. You're still showing up, and that matters. Let's keep going.",
  "Not giving up on this one. Here's another thought.",
  "Every situation is different. Let's try something else.",
  "Still with you. One more idea.",
];

let lastIndex = -1;

/**
 * Returns a random encouragement message, never repeating consecutively.
 */
export const getEncouragement = (): string => {
  let index: number;
  do {
    index = Math.floor(Math.random() * encouragements.length);
  } while (index === lastIndex && encouragements.length > 1);
  lastIndex = index;
  return encouragements[index];
};
```

---

## Component Architecture

### Anchor Screen (Updated)

```typescript
// app/index.tsx (Anchor Screen)
// Energy slider REMOVED from this screen — now in Settings.
// Mic button is the hero interaction element.

import { View, StyleSheet } from 'react-native';
import { AnchorImage } from '../components/anchor/AnchorImage';
import { Affirmation } from '../components/anchor/Affirmation';
import { MicButton } from '../components/ai/MicButton';
import { SuggestionCard } from '../components/ai/SuggestionCard';
import { RecordingOverlay } from '../components/ai/RecordingOverlay';
import { ProcessingOverlay } from '../components/ai/ProcessingOverlay';
import { TimerOverlay } from '../components/ai/TimerOverlay';
import { EncouragementBanner } from '../components/ai/EncouragementBanner';
import { IdeaOverlay } from '../components/ideas/IdeaOverlay';

export default function AnchorScreen() {
  // Three elements on the calm screen: image, affirmation, mic button
  // Everything else overlays on top when active

  return (
    <View style={styles.container}>
      {/* Always visible — the anchor */}
      <AnchorImage />
      <Affirmation />
      <MicButton />

      {/* Overlays — only one active at a time */}
      <RecordingOverlay />
      <ProcessingOverlay />
      <TimerOverlay />
      <EncouragementBanner />
      <SuggestionCard />

      {/* Offline fallback */}
      <IdeaOverlay />
    </View>
  );
}
```

### Suggestion Card Component (NEW)

```typescript
// components/ai/SuggestionCard.tsx
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../ui/Button';
import { MicButton } from './MicButton';

interface SuggestionCardProps {
  suggestion: string;
  onThatWorked: () => void;     // Save to Toolbox
  onDismiss: () => void;         // Clear and return to Anchor
  onAnother: () => void;         // Cycle to next suggestion
  onMicPress: () => void;        // Hold-to-talk follow-up
  responseType: ResponseType;    // Controls card variant behavior
}

export function SuggestionCard({
  suggestion,
  onThatWorked,
  onDismiss,
  onAnother,
  onMicPress,
  responseType,
}: SuggestionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.suggestion}>{suggestion}</Text>
      <Text style={styles.aiLabel}>AI-generated</Text>

      <View style={styles.actions}>
        <Button variant="success" onPress={onThatWorked}>
          That worked
        </Button>
        <Button variant="secondary" onPress={onDismiss}>
          Dismiss
        </Button>
        {responseType !== 'out_of_ideas' && (
          <Button variant="secondary" onPress={onAnother}>
            Another
          </Button>
        )}
        <MicButton size="small" onPress={onMicPress} />
      </View>
    </View>
  );
}
```

---

## Theme System

### Color Tokens

```typescript
// theme/colors.ts
export const colors = {
  // Energy States (Sunset Gradient)
  energy: {
    resting: '#6B5B7A',     // Twilight Purple
    warming: '#C4A4A4',     // Dusty Rose
    glowing: '#E8C47C',     // Golden Amber
  },

  // Backgrounds
  bg: {
    primary: '#FAF8F5',     // Warm Cream
    surface: '#E8E4EC',     // Muted Lavender
  },

  // Text
  text: {
    primary: '#3D3A38',     // Warm Charcoal
    secondary: 'rgba(61, 58, 56, 0.7)',
    muted: 'rgba(61, 58, 56, 0.5)',
  },

  // Actions (NEW)
  action: {
    success: '#A8B89C',     // Sage — "That worked"
    dismiss: 'rgba(61, 58, 56, 0.15)', // Subtle — "Dismiss"
  },

  // Utilities
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

export const getEnergyTint = (level: number): string => {
  if (level < 0.33) return colors.energy.resting;
  if (level < 0.66) return colors.energy.warming;
  return colors.energy.glowing;
};
```

### Typography

```typescript
// theme/typography.ts
export const typography = {
  fontFamily: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semibold: 'Poppins_600SemiBold',
  },

  sizes: {
    affirmation: 28,
    suggestion: 18,       // NEW: AI suggestion text
    title: 20,
    body: 16,
    caption: 14,
    small: 12,
    encouragement: 15,    // NEW: "Still With You" messages
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
};
```

### Spacing

```typescript
// theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 24,
  xl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 9999,
};
```

---

## Performance Considerations

### App Startup (<2 seconds — NFR1)

```typescript
// Optimize for <2 second load
// 1. Minimize bundle size — tree-shake unused code
// 2. Preload fonts during splash screen
// 3. Keep Anchor Screen minimal (image + text + button)
// 4. Lazy-load AI/voice modules — not needed until first mic press
```

### Voice-to-Suggestion Pipeline (<5 seconds — NFR2 + NFR3)

```
Finger up → STT (<2s) → Build context (<50ms) → API proxy → LLM (<3s) → Display
                                                                Total: <5 seconds
```

- STT runs immediately on finger release
- Context building is synchronous (Zustand stores are in-memory)
- API call targets <3 seconds total (proxy + LLM)
- Response displays immediately; TTS starts in parallel if enabled

### Image Optimization

```typescript
import { Image } from 'expo-image';

<Image
  source={anchorImageUri || require('../assets/images/default-anchor.jpg')}
  style={styles.anchorImage}
  contentFit="cover"
  transition={300}
  cachePolicy="memory-disk"
/>
```

### Animation Performance

```typescript
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Breathing pulse animation
const pulseStyle = useAnimatedStyle(() => ({
  transform: [{
    scale: withSpring(isPulsing ? 1.02 : 1.0, {
      damping: 10,
      stiffness: 100,
    })
  }],
}));
```

---

## Offline-First Design

### Feature Availability

| Feature | Data Source | Network Required |
|---------|-------------|------------------|
| Anchor Screen | Local storage | No |
| Affirmations | Bundled data | No |
| Curated Ideas (fallback) | Bundled data | No |
| Energy Slider (Settings) | Local storage | No |
| Toolbox (view/delete) | Local storage | No |
| Settings | Local storage | No |
| Custom Photos | Local filesystem | No |
| **AI Guided Support** | **LLM API** | **Yes** |
| **Voice Input** | **STT (on-device or API)** | **Depends on STT provider** |
| **Text-to-Speech** | **On-device TTS** | **No** |

### Offline Behavior

When the device has no network connectivity:
1. Mic button appears grayed out on the Anchor Screen
2. Tapping it shows a brief message: "AI isn't available offline"
3. After the message, the curated Gentle Ideas overlay opens as fallback
4. All other features (Anchor, affirmations, Toolbox viewing, Settings) work normally

```typescript
// hooks/useNetworkStatus.ts
import { useNetInfo } from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const netInfo = useNetInfo();
  return {
    isOnline: netInfo.isConnected ?? false,
  };
};
```

---

## Security & Privacy

### Data Classification

| Data Type | Storage | Encryption | Shared Externally |
|-----------|---------|------------|-------------------|
| User name | MMKV | Device encryption | No |
| Energy level | MMKV | Device encryption | Sent as context to AI (no PII) |
| Toolbox entries | MMKV | Device encryption | Sent as context to AI (suggestion text + date only) |
| Anchor photos | Filesystem | Device encryption | No |
| Voice audio | RAM only | N/A | Transcribed then deleted within 5 seconds |
| Voice transcript | RAM only | N/A | Sent to AI via proxy, not persisted |
| Conversation thread | RAM only | N/A | Sent as context to AI, not persisted |

### Privacy Implementation

```typescript
// Voice recording — transcribe and delete
const transcribeAndDelete = async (audioUri: string) => {
  try {
    const transcript = await speechToText(audioUri);
    return transcript;
  } finally {
    // CRITICAL: Ensure deletion even on error (NFR7: within 5 seconds)
    await FileSystem.deleteAsync(audioUri, { idempotent: true });
  }
};
```

### API Key Security

- The LLM API key is stored **only** in the Edge Function's environment variables
- The client app **never** contains the API key (not in bundle, not in config, not in env)
- All AI requests route through the API proxy
- The proxy can enforce rate limiting per device

---

## Development Setup

### Initial Setup

```bash
# Create new Expo project
npx create-expo-app gentle_loop -t expo-template-blank-typescript

# Install core dependencies
npx expo install react-native-mmkv
npx expo install react-native-reanimated
npx expo install expo-image
npx expo install expo-font
npx expo install react-native-paper
npx expo install expo-av                   # Audio recording
npx expo install expo-speech               # Text-to-speech
npx expo install expo-file-system          # Audio file deletion
npx expo install @react-native-community/netinfo  # Network status

# Install Zustand
npm install zustand

# Install navigation
npx expo install expo-router

# Install UUID generation
npm install react-native-uuid
```

### Environment Configuration

```typescript
// app.config.ts
export default {
  expo: {
    name: 'gentle_loop',
    slug: 'gentle-loop',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      backgroundColor: '#FAF8F5',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.gentleloop.app',
      infoPlist: {
        NSMicrophoneUsageDescription:
          'Used to describe caregiving situations for real-time guidance. Audio is never stored.',
        NSSpeechRecognitionUsageDescription:
          'Used to convert your voice to text. Audio is immediately discarded.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FAF8F5',
      },
      package: 'com.gentleloop.app',
      permissions: ['RECORD_AUDIO'],
    },
    extra: {
      apiProxyUrl: process.env.EXPO_PUBLIC_API_PROXY_URL,
    },
  },
};
```

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/conversationStore.test.ts
import { useConversationStore } from '../stores/conversationStore';

describe('Conversation Store', () => {
  beforeEach(() => {
    useConversationStore.getState().resetThread();
  });

  it('starts a new thread', () => {
    useConversationStore.getState().startThread();
    expect(useConversationStore.getState().isActive).toBe(true);
    expect(useConversationStore.getState().thread).not.toBeNull();
  });

  it('tracks turn count', () => {
    useConversationStore.getState().startThread();
    useConversationStore.getState().addTurn('user', 'test', 'initial');
    useConversationStore.getState().addTurn('assistant', 'response', 'initial');
    expect(useConversationStore.getState().thread?.turnCount).toBe(2);
  });

  it('enforces turn limit', () => {
    useConversationStore.getState().startThread();
    for (let i = 0; i < 7; i++) {
      useConversationStore.getState().addTurn('user', `msg ${i}`, 'another');
    }
    expect(useConversationStore.getState().isAtTurnLimit()).toBe(true);
  });

  it('resets thread cleanly', () => {
    useConversationStore.getState().startThread();
    useConversationStore.getState().addTurn('user', 'test', 'initial');
    useConversationStore.getState().resetThread();
    expect(useConversationStore.getState().thread).toBeNull();
    expect(useConversationStore.getState().isActive).toBe(false);
  });
});
```

```typescript
// __tests__/toolboxStore.test.ts
import { useToolboxStore } from '../stores/toolboxStore';

describe('Toolbox Store', () => {
  it('adds entries', () => {
    useToolboxStore.getState().addEntry('Try finger foods');
    expect(useToolboxStore.getState().entries.length).toBe(1);
  });

  it('limits AI context to 15 most recent entries', () => {
    for (let i = 0; i < 20; i++) {
      useToolboxStore.getState().addEntry(`Suggestion ${i}`);
    }
    expect(useToolboxStore.getState().getEntriesForAI().length).toBe(15);
  });

  it('enforces storage cap of 50 via FIFO', () => {
    for (let i = 0; i < 55; i++) {
      useToolboxStore.getState().addEntry(`Suggestion ${i}`);
    }
    expect(useToolboxStore.getState().entries.length).toBe(50);
    // Most recent entry should be first
    expect(useToolboxStore.getState().entries[0].suggestionText).toBe('Suggestion 54');
  });

  it('reports when near cap', () => {
    for (let i = 0; i < 45; i++) {
      useToolboxStore.getState().addEntry(`Suggestion ${i}`);
    }
    expect(useToolboxStore.getState().isNearCap()).toBe(true);
  });

  it('removes entries by id', () => {
    useToolboxStore.getState().addEntry('Test suggestion');
    const id = useToolboxStore.getState().entries[0].id;
    useToolboxStore.getState().removeEntry(id);
    expect(useToolboxStore.getState().entries.length).toBe(0);
  });
});
```

---

## Build & Deployment

### EAS Configuration

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_PROXY_URL": "http://localhost:54321/functions/v1"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_PROXY_URL": "https://your-project.supabase.co/functions/v1"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_PROXY_URL": "https://your-project.supabase.co/functions/v1"
      }
    }
  }
}
```

---

## MVP Development Phases

### Phase 1: Foundation (Week 1)
- [ ] Project setup with Expo + all dependencies
- [ ] Theme system (colors, typography, spacing)
- [ ] Basic navigation structure (Expo Router)
- [ ] MMKV storage setup with encryption
- [ ] Zustand stores (settings, energy)

### Phase 2: Anchor Screen (Week 2)
- [ ] Anchor image component with breathing pulse
- [ ] Affirmation display (rotating, energy-aware)
- [ ] Mic button (UI only, no recording yet)
- [ ] Header (settings icon)
- [ ] Screen tinting based on energy state

### Phase 3: Voice Input & AI Integration (Week 3-4)
- [ ] Audio recording (hold-to-talk)
- [ ] Speech-to-text integration (evaluate on-device vs. API)
- [ ] API proxy Edge Function setup
- [ ] System prompt deployment to proxy
- [ ] AI service client
- [ ] Conversation store
- [ ] Recording overlay (pulsing mic)
- [ ] Processing overlay (pulsing ellipsis)

### Phase 4: Suggestion Card & Conversation Flow (Week 4-5)
- [ ] Suggestion card component (4 actions)
- [ ] "That worked" → Toolbox save
- [ ] "Another" → cycle suggestion
- [ ] "Dismiss" → return to Anchor
- [ ] Mic follow-up from suggestion card
- [ ] Text input fallback
- [ ] Text-to-speech output
- [ ] "Still With You" encouragement banner
- [ ] Timer-based follow-up (running low flow)
- [ ] "Out of Ideas" endpoint handling

### Phase 5: Toolbox & Settings (Week 5-6)
- [ ] Toolbox store + persistence
- [ ] Toolbox UI in Settings (list, delete)
- [ ] Toolbox context serialization for AI
- [ ] Energy slider in Settings
- [ ] Response mode setting (text/audio/both)
- [ ] Accessibility settings

### Phase 6: Onboarding & Offline (Week 6-7)
- [ ] 5-step onboarding flow (Welcome, How It Works, Name, Anchor, Meet the Mic)
- [ ] Mic permission request in onboarding
- [ ] Wellness disclaimer acceptance
- [ ] Offline detection + grayed mic behavior
- [ ] Curated ideas overlay as offline fallback

### Phase 7: Polish & Testing (Week 7-8)
- [ ] Performance optimization (startup <2s, voice-to-suggestion <5s)
- [ ] Animation polish (pulse, transitions, card interactions)
- [ ] Accessibility audit (tap targets, contrast, screen reader)
- [ ] Unit tests for stores and services
- [ ] Integration testing of AI flow
- [ ] Family beta testing

---

## Next Steps

1. **Architecture review** — Validate AI proxy design and STT provider choice
2. **Set up project** — Initialize Expo project with full dependency list
3. **Deploy Edge Function** — Stand up API proxy with system prompt
4. **Build Anchor Screen** — Core UI with mic button
5. **Integrate voice pipeline** — End-to-end: record → transcribe → AI → display
6. **Test with family** — Real caregiver scenarios from PRD user journeys
