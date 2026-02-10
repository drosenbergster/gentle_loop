/**
 * Energy State Store
 *
 * Manages discrete energy levels (3 positions only, no intermediates).
 * Persisted via Zustand persist middleware + MMKV.
 *
 * FM-3: Energy slider snaps to exactly 3 discrete positions.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage, STORAGE_KEYS } from '../utils/storage';

/** Discrete energy levels — no intermediate values */
export type EnergyLevel = 'running_low' | 'holding_steady' | 'ive_got_this';

/** All valid energy levels in order (low → high) */
export const ENERGY_LEVELS: EnergyLevel[] = [
  'running_low',
  'holding_steady',
  'ive_got_this',
];

interface EnergyState {
  /** Current discrete energy level */
  energyLevel: EnergyLevel;
}

interface EnergyActions {
  /** Set energy to one of the 3 discrete levels */
  setEnergyLevel: (level: EnergyLevel) => void;
}

type EnergyStore = EnergyState & EnergyActions;

export const useEnergyStore = create<EnergyStore>()(
  persist(
    (set) => ({
      energyLevel: 'holding_steady',

      setEnergyLevel: (level: EnergyLevel) => {
        // Only accept valid discrete values
        if (ENERGY_LEVELS.includes(level)) {
          set({ energyLevel: level });
        }
      },
    }),
    {
      name: STORAGE_KEYS.ENERGY,
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

// Selector hooks
export const useEnergyLevel = () =>
  useEnergyStore((state) => state.energyLevel);
export const useSetEnergyLevel = () =>
  useEnergyStore((state) => state.setEnergyLevel);

/**
 * @deprecated Use useEnergyLevel() instead. Kept temporarily for migration.
 */
export const useEnergyState = () =>
  useEnergyStore((state) => state.energyLevel);
