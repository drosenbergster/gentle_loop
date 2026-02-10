/**
 * Toolbox Store
 *
 * "That worked" suggestions saved by the caregiver.
 * Capped at 50 entries with FIFO eviction.
 *
 * CR-1: Thin data layer — UI built in Epic 4.
 * FM-7, SQ-3: Cap at 50, FIFO when full, near-cap warning at 45.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage, STORAGE_KEYS } from '../utils/storage';
import type { ToolboxEntry } from '../types/toolbox';

/** Maximum number of entries in the Toolbox */
const TOOLBOX_CAP = 50;

/** Threshold for "near cap" warning */
const NEAR_CAP_THRESHOLD = 45;

/** Number of most recent entries sent to AI context */
const AI_CONTEXT_LIMIT = 15;

interface ToolboxState {
  entries: ToolboxEntry[];
}

interface ToolboxActions {
  /** Add a new entry. If at cap, oldest entry is replaced (FIFO). */
  addEntry: (suggestionText: string) => void;

  /** Remove an entry by ID */
  removeEntry: (id: string) => void;

  /** Returns true when entries count >= 45 */
  isNearCap: () => boolean;

  /** Returns the 15 most recent entries for AI context serialization */
  getEntriesForAI: () => ToolboxEntry[];
}

type ToolboxStore = ToolboxState & ToolboxActions;

/** Generate a simple unique ID */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const useToolboxStore = create<ToolboxStore>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (suggestionText: string) => {
        const newEntry: ToolboxEntry = {
          id: generateId(),
          suggestionText,
          savedAt: new Date().toISOString(),
        };

        set((state) => {
          const updated = [...state.entries, newEntry];
          // FIFO: if over cap, drop the oldest entries
          if (updated.length > TOOLBOX_CAP) {
            return { entries: updated.slice(updated.length - TOOLBOX_CAP) };
          }
          return { entries: updated };
        });
      },

      removeEntry: (id: string) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },

      isNearCap: () => {
        return get().entries.length >= NEAR_CAP_THRESHOLD;
      },

      getEntriesForAI: () => {
        const { entries } = get();
        // Return the most recent entries (up to AI_CONTEXT_LIMIT)
        return entries.slice(-AI_CONTEXT_LIMIT);
      },
    }),
    {
      name: STORAGE_KEYS.TOOLBOX,
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

// Selector hooks
export const useToolboxEntries = () =>
  useToolboxStore((state) => state.entries);
export const useToolboxCount = () =>
  useToolboxStore((state) => state.entries.length);
