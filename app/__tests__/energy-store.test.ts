/**
 * Tests for Energy Store
 *
 * Validates: 3 discrete positions only, no intermediate values,
 * persistence, default value.
 */

import { useEnergyStore, ENERGY_LEVELS, type EnergyLevel } from '../src/stores/energyStore';

// Reset store state between tests
beforeEach(() => {
  useEnergyStore.setState({ energyLevel: 'holding_steady' });
});

describe('Energy Store', () => {
  describe('default value', () => {
    it('should default to holding_steady', () => {
      expect(useEnergyStore.getState().energyLevel).toBe('holding_steady');
    });
  });

  describe('discrete positions only', () => {
    it('should set to running_low', () => {
      useEnergyStore.getState().setEnergyLevel('running_low');
      expect(useEnergyStore.getState().energyLevel).toBe('running_low');
    });

    it('should set to holding_steady', () => {
      useEnergyStore.getState().setEnergyLevel('running_low');
      useEnergyStore.getState().setEnergyLevel('holding_steady');
      expect(useEnergyStore.getState().energyLevel).toBe('holding_steady');
    });

    it('should set to ive_got_this', () => {
      useEnergyStore.getState().setEnergyLevel('ive_got_this');
      expect(useEnergyStore.getState().energyLevel).toBe('ive_got_this');
    });

    it('should reject invalid values', () => {
      useEnergyStore.getState().setEnergyLevel('holding_steady');
      // Try to set an invalid value
      useEnergyStore.getState().setEnergyLevel('invalid' as EnergyLevel);
      // Should remain at previous value
      expect(useEnergyStore.getState().energyLevel).toBe('holding_steady');
    });

    it('should reject empty string', () => {
      useEnergyStore.getState().setEnergyLevel('' as EnergyLevel);
      expect(useEnergyStore.getState().energyLevel).toBe('holding_steady');
    });
  });

  describe('ENERGY_LEVELS constant', () => {
    it('should contain exactly 3 levels', () => {
      expect(ENERGY_LEVELS).toHaveLength(3);
    });

    it('should be in order: running_low, holding_steady, ive_got_this', () => {
      expect(ENERGY_LEVELS).toEqual([
        'running_low',
        'holding_steady',
        'ive_got_this',
      ]);
    });
  });

  describe('Zustand persist configuration', () => {
    it('should have persist middleware', () => {
      expect((useEnergyStore as any).persist).toBeDefined();
    });
  });
});
