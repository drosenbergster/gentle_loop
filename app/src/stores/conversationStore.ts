/**
 * Conversation Store
 *
 * In-memory conversation threading (ARCH-4 — NOT persisted to MMKV).
 * When the app is force-quit or restarted, conversations are lost.
 *
 * FM-6: Truncation keeps first turn + last 2 turns, drops middle.
 * FR42/FR43: Thread persists through follow-ups until dismiss.
 */

import { create } from 'zustand';
import type { ResponseType } from '../types/ai';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface ConversationTurn {
  role: 'caregiver' | 'assistant';
  content: string;
  responseType?: ResponseType;
}

export interface ConversationThread {
  turns: ConversationTurn[];
  isActive: boolean;
}

interface ConversationState {
  thread: ConversationThread;
}

interface ConversationActions {
  /** Add a caregiver message to the thread */
  addCaregiverTurn: (message: string) => void;
  /** Add an assistant response to the thread */
  addAssistantTurn: (text: string, responseType: ResponseType) => void;
  /** Clear the thread (dismiss, start fresh) */
  clearThread: () => void;
  /** Get conversation history as formatted string for the AI */
  getHistoryString: () => string;
  /** Get the turn count */
  getTurnCount: () => number;
  /** Check if the last response was "out_of_ideas" */
  isOutOfIdeas: () => boolean;
}

type ConversationStore = ConversationState & ConversationActions;

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────

/** Max turns before conversation should end */
const MAX_TURNS = 7;

/** Turns to keep at end when truncating (FM-6) */
const KEEP_RECENT_TURNS = 4; // 2 exchanges = 4 turns (caregiver + assistant each)

// ─────────────────────────────────────────
// Truncation (FM-6)
// ─────────────────────────────────────────

/**
 * Truncate conversation history.
 * Keeps: first turn pair + last 2 turn pairs.
 * Drops: middle turns with a placeholder.
 */
function truncateHistory(turns: ConversationTurn[]): string {
  if (turns.length <= 6) {
    // No truncation needed — format all turns
    return formatTurns(turns);
  }

  // Keep first 2 turns (first exchange) + last 4 turns (last 2 exchanges)
  const firstPair = turns.slice(0, 2);
  const lastPairs = turns.slice(-KEEP_RECENT_TURNS);
  const droppedCount = Math.floor((turns.length - 2 - KEEP_RECENT_TURNS) / 2);

  return [
    formatTurns(firstPair),
    `[${droppedCount} earlier exchange${droppedCount > 1 ? 's' : ''} omitted]`,
    formatTurns(lastPairs),
  ].join('\n');
}

function formatTurns(turns: ConversationTurn[]): string {
  return turns
    .map((t) => {
      if (t.role === 'caregiver') {
        return `Caregiver: ${t.content}`;
      }
      return `You: ${t.content}`;
    })
    .join('\n');
}

// ─────────────────────────────────────────
// Store
// ─────────────────────────────────────────

const emptyThread: ConversationThread = {
  turns: [],
  isActive: false,
};

export const useConversationStore = create<ConversationStore>()((set, get) => ({
  thread: { ...emptyThread },

  addCaregiverTurn: (message: string) => {
    set((state) => ({
      thread: {
        turns: [...state.thread.turns, { role: 'caregiver', content: message }],
        isActive: true,
      },
    }));
  },

  addAssistantTurn: (text: string, responseType: ResponseType) => {
    set((state) => ({
      thread: {
        turns: [
          ...state.thread.turns,
          { role: 'assistant', content: text, responseType },
        ],
        isActive: true,
      },
    }));
  },

  clearThread: () => {
    set({ thread: { ...emptyThread } });
  },

  getHistoryString: () => {
    const { turns } = get().thread;
    if (turns.length === 0) return '';
    return truncateHistory(turns);
  },

  getTurnCount: () => {
    // Count assistant turns as "turns" (each exchange = 1 turn)
    return get().thread.turns.filter((t) => t.role === 'assistant').length;
  },

  isOutOfIdeas: () => {
    const { turns } = get().thread;
    if (turns.length === 0) return false;
    const lastAssistant = [...turns].reverse().find((t) => t.role === 'assistant');
    return lastAssistant?.responseType === 'out_of_ideas';
  },
}));
