/**
 * Energy State Store
 * 
 * Manages the current energy level (0-1) and derived energy state
 */

import { create } from 'zustand';
import { EnergyState } from '../theme/colors';

interface EnergyStore {
  // Current energy value (0-1 continuous)
  energy: number;
  
  // Set energy level
  setEnergy: (value: number) => void;
  
  // Get the discrete energy state
  getEnergyState: () => EnergyState;
}

/**
 * Convert continuous energy (0-1) to discrete state
 */
function energyToState(energy: number): EnergyState {
  if (energy < 0.33) return 'resting';
  if (energy < 0.66) return 'warming';
  return 'glowing';
}

export const useEnergyStore = create<EnergyStore>((set, get) => ({
  // Default to middle (warming state)
  energy: 0.5,
  
  setEnergy: (value: number) => {
    // Clamp between 0 and 1
    const clamped = Math.max(0, Math.min(1, value));
    set({ energy: clamped });
  },
  
  getEnergyState: () => {
    return energyToState(get().energy);
  },
}));

// Selector hooks for common patterns
export const useEnergy = () => useEnergyStore(state => state.energy);
export const useSetEnergy = () => useEnergyStore(state => state.setEnergy);
export const useEnergyState = () => useEnergyStore(state => energyToState(state.energy));
