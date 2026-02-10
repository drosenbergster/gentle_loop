/**
 * Tests for Toolbox Store
 *
 * Validates: add entry, remove entry, FIFO at cap (50),
 * isNearCap at 45, getEntriesForAI returns max 15,
 * entries include id + text + date.
 */

import { useToolboxStore } from '../src/stores/toolboxStore';

// Reset store state between tests
beforeEach(() => {
  useToolboxStore.setState({ entries: [] });
});

describe('Toolbox Store', () => {
  describe('addEntry', () => {
    it('should add an entry with id, suggestionText, and savedAt', () => {
      useToolboxStore.getState().addEntry('Try a warm bath before bedtime');
      const entries = useToolboxStore.getState().entries;
      expect(entries).toHaveLength(1);
      expect(entries[0].suggestionText).toBe('Try a warm bath before bedtime');
      expect(entries[0].id).toBeTruthy();
      expect(entries[0].savedAt).toBeTruthy();
    });

    it('should generate unique IDs for entries', () => {
      useToolboxStore.getState().addEntry('Tip 1');
      useToolboxStore.getState().addEntry('Tip 2');
      const entries = useToolboxStore.getState().entries;
      expect(entries[0].id).not.toBe(entries[1].id);
    });

    it('should store savedAt as ISO 8601 string', () => {
      useToolboxStore.getState().addEntry('Tip');
      const savedAt = useToolboxStore.getState().entries[0].savedAt;
      // ISO 8601 pattern
      expect(new Date(savedAt).toISOString()).toBe(savedAt);
    });

    it('should add entries in order (newest last)', () => {
      useToolboxStore.getState().addEntry('First');
      useToolboxStore.getState().addEntry('Second');
      useToolboxStore.getState().addEntry('Third');
      const entries = useToolboxStore.getState().entries;
      expect(entries[0].suggestionText).toBe('First');
      expect(entries[2].suggestionText).toBe('Third');
    });
  });

  describe('removeEntry', () => {
    it('should remove an entry by ID', () => {
      useToolboxStore.getState().addEntry('To remove');
      useToolboxStore.getState().addEntry('To keep');
      const entries = useToolboxStore.getState().entries;
      const idToRemove = entries[0].id;
      useToolboxStore.getState().removeEntry(idToRemove);
      expect(useToolboxStore.getState().entries).toHaveLength(1);
      expect(useToolboxStore.getState().entries[0].suggestionText).toBe('To keep');
    });

    it('should handle removing non-existent ID gracefully', () => {
      useToolboxStore.getState().addEntry('Only entry');
      useToolboxStore.getState().removeEntry('fake-id');
      expect(useToolboxStore.getState().entries).toHaveLength(1);
    });
  });

  describe('FIFO at cap (50)', () => {
    it('should keep exactly 50 entries when the 51st is added', () => {
      // Add 51 entries
      for (let i = 1; i <= 51; i++) {
        useToolboxStore.getState().addEntry(`Tip ${i}`);
      }
      const entries = useToolboxStore.getState().entries;
      expect(entries).toHaveLength(50);
    });

    it('should drop the oldest entry when cap is exceeded (FIFO)', () => {
      for (let i = 1; i <= 51; i++) {
        useToolboxStore.getState().addEntry(`Tip ${i}`);
      }
      const entries = useToolboxStore.getState().entries;
      // The first entry should be "Tip 2" (Tip 1 was evicted)
      expect(entries[0].suggestionText).toBe('Tip 2');
      // The last entry should be "Tip 51"
      expect(entries[entries.length - 1].suggestionText).toBe('Tip 51');
    });

    it('should keep 50 after adding 100 entries', () => {
      for (let i = 1; i <= 100; i++) {
        useToolboxStore.getState().addEntry(`Tip ${i}`);
      }
      const entries = useToolboxStore.getState().entries;
      expect(entries).toHaveLength(50);
      // Oldest surviving entry should be Tip 51
      expect(entries[0].suggestionText).toBe('Tip 51');
      expect(entries[49].suggestionText).toBe('Tip 100');
    });
  });

  describe('isNearCap', () => {
    it('should return false when under 45 entries', () => {
      for (let i = 0; i < 44; i++) {
        useToolboxStore.getState().addEntry(`Tip ${i}`);
      }
      expect(useToolboxStore.getState().isNearCap()).toBe(false);
    });

    it('should return true at exactly 45 entries', () => {
      for (let i = 0; i < 45; i++) {
        useToolboxStore.getState().addEntry(`Tip ${i}`);
      }
      expect(useToolboxStore.getState().isNearCap()).toBe(true);
    });

    it('should return true at 50 entries (at cap)', () => {
      for (let i = 0; i < 50; i++) {
        useToolboxStore.getState().addEntry(`Tip ${i}`);
      }
      expect(useToolboxStore.getState().isNearCap()).toBe(true);
    });

    it('should return false when empty', () => {
      expect(useToolboxStore.getState().isNearCap()).toBe(false);
    });
  });

  describe('getEntriesForAI', () => {
    it('should return empty array when no entries', () => {
      expect(useToolboxStore.getState().getEntriesForAI()).toEqual([]);
    });

    it('should return all entries when fewer than 15', () => {
      for (let i = 0; i < 5; i++) {
        useToolboxStore.getState().addEntry(`Tip ${i}`);
      }
      expect(useToolboxStore.getState().getEntriesForAI()).toHaveLength(5);
    });

    it('should return max 15 entries', () => {
      for (let i = 0; i < 30; i++) {
        useToolboxStore.getState().addEntry(`Tip ${i}`);
      }
      expect(useToolboxStore.getState().getEntriesForAI()).toHaveLength(15);
    });

    it('should return the 15 most recent entries', () => {
      for (let i = 1; i <= 30; i++) {
        useToolboxStore.getState().addEntry(`Tip ${i}`);
      }
      const aiEntries = useToolboxStore.getState().getEntriesForAI();
      expect(aiEntries[0].suggestionText).toBe('Tip 16');
      expect(aiEntries[14].suggestionText).toBe('Tip 30');
    });

    it('should return entries with full structure (id, text, date)', () => {
      useToolboxStore.getState().addEntry('Full structure test');
      const entries = useToolboxStore.getState().getEntriesForAI();
      expect(entries[0]).toHaveProperty('id');
      expect(entries[0]).toHaveProperty('suggestionText');
      expect(entries[0]).toHaveProperty('savedAt');
    });
  });

  describe('Zustand persist configuration', () => {
    it('should have persist middleware', () => {
      expect((useToolboxStore as any).persist).toBeDefined();
    });
  });
});
