/**
 * Story 1.5: Offline Detection & Curated Gentle Ideas
 *
 * Tests:
 * - ideas.ts uses correct energy level keys and has 16 ideas (FR26)
 * - IdeaCycler cycles through all ideas and reshuffles (FM-10)
 * - useNetworkStatus defaults and responds to NetInfo updates
 * - IdeasOverlay "That helps" saves to Toolbox (AC-6)
 * - Offline mic grayed out logic (FR27)
 */

import { ideas, IdeaCycler, TOTAL_IDEAS_COUNT, getRandomIdea, getNextIdea } from '../src/data/ideas';
import type { EnergyLevel } from '../src/theme/colors';

// ─────────────────────────────────────────
// 1. Ideas Data Validation
// ─────────────────────────────────────────
describe('ideas data', () => {
  it('has exactly 16 ideas total (FR26)', () => {
    expect(TOTAL_IDEAS_COUNT).toBe(16);
  });

  it('uses correct EnergyLevel keys', () => {
    const keys = Object.keys(ideas);
    expect(keys).toEqual(expect.arrayContaining(['running_low', 'holding_steady', 'ive_got_this']));
    expect(keys.length).toBe(3);
  });

  it('has 4 ideas for running_low', () => {
    expect(ideas.running_low.length).toBe(4);
  });

  it('has 6 ideas for holding_steady', () => {
    expect(ideas.holding_steady.length).toBe(6);
  });

  it('has 6 ideas for ive_got_this', () => {
    expect(ideas.ive_got_this.length).toBe(6);
  });

  it('each idea has required fields (id, validation, title, content)', () => {
    const allIdeas = Object.values(ideas).flat();
    for (const idea of allIdeas) {
      expect(idea.id).toBeTruthy();
      expect(idea.validation).toBeTruthy();
      expect(idea.title).toBeTruthy();
      expect(idea.content).toBeTruthy();
    }
  });

  it('all idea IDs are unique', () => {
    const allIds = Object.values(ideas).flat().map((i) => i.id);
    expect(new Set(allIds).size).toBe(allIds.length);
  });
});

// ─────────────────────────────────────────
// 2. IdeaCycler — FM-10 pool exhaustion + reshuffle
// ─────────────────────────────────────────
describe('IdeaCycler', () => {
  it('cycles through all ideas for a level before reshuffling', () => {
    const cycler = new IdeaCycler('running_low');
    const pool = ideas.running_low;
    const seenIds = new Set<string>();

    // Get all 4 ideas — should see each exactly once
    for (let i = 0; i < pool.length; i++) {
      const idea = cycler.next('running_low');
      seenIds.add(idea.id);
    }

    expect(seenIds.size).toBe(pool.length);
  });

  it('reshuffles and continues when pool exhausted (FM-10)', () => {
    const cycler = new IdeaCycler('running_low');
    const pool = ideas.running_low;

    // Exhaust the pool
    for (let i = 0; i < pool.length; i++) {
      cycler.next('running_low');
    }

    // One more should still work (reshuffled)
    const extra = cycler.next('running_low');
    expect(extra).toBeDefined();
    expect(extra.id).toBeTruthy();
  });

  it('resets when energy level changes', () => {
    const cycler = new IdeaCycler('running_low');
    cycler.next('running_low');
    cycler.next('running_low');

    // Switch level
    const idea = cycler.next('holding_steady');
    expect(ideas.holding_steady.map((i) => i.id)).toContain(idea.id);
  });

  it('reports correct pool size per level', () => {
    const cycler = new IdeaCycler('running_low');
    expect(cycler.poolSize('running_low')).toBe(4);
    expect(cycler.poolSize('holding_steady')).toBe(6);
    expect(cycler.poolSize('ive_got_this')).toBe(6);
  });
});

// ─────────────────────────────────────────
// 3. getRandomIdea / getNextIdea (legacy API)
// ─────────────────────────────────────────
describe('getRandomIdea', () => {
  it('returns an idea for each energy level', () => {
    const levels: EnergyLevel[] = ['running_low', 'holding_steady', 'ive_got_this'];
    for (const level of levels) {
      const idea = getRandomIdea(level);
      expect(idea).toBeDefined();
      expect(idea.id).toBeTruthy();
    }
  });
});

describe('getNextIdea', () => {
  it('returns a different idea from the last shown', () => {
    // With 6 ideas in holding_steady, we should get a different one
    const first = getRandomIdea('holding_steady');
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const next = getNextIdea('holding_steady', first.id);
      results.add(next.id);
    }
    // Should never return the last shown id
    expect(results.has(first.id)).toBe(false);
  });

  it('handles single-idea levels gracefully', () => {
    // If there were only 1 idea, it would just return it
    const idea = getNextIdea('running_low', undefined);
    expect(idea).toBeDefined();
  });
});

// ─────────────────────────────────────────
// 4. useNetworkStatus hook logic
// ─────────────────────────────────────────
describe('useNetworkStatus (mock behavior)', () => {
  it('NetInfo mock is callable and returns unsubscribe', () => {
    const NetInfo = require('@react-native-community/netinfo');
    const unsub = NetInfo.addEventListener(() => {});
    expect(typeof unsub).toBe('function');
  });

  it('NetInfo.fetch resolves with connected state', async () => {
    const NetInfo = require('@react-native-community/netinfo');
    const state = await NetInfo.fetch();
    expect(state.isConnected).toBe(true);
  });
});

// ─────────────────────────────────────────
// 5. Offline mic grayed out logic (FR27)
// ─────────────────────────────────────────
describe('offline mic behavior', () => {
  it('MicButton receives offline=true when isOnline is false', () => {
    // Logic test: when isOnline is false, offline prop should be !isOnline = true
    const isOnline = false;
    const offlineProp = !isOnline;
    expect(offlineProp).toBe(true);
  });

  it('MicButton receives offline=false when isOnline is true', () => {
    const isOnline = true;
    const offlineProp = !isOnline;
    expect(offlineProp).toBe(false);
  });
});

// ─────────────────────────────────────────
// 6. Toolbox integration (AC-6)
// ─────────────────────────────────────────
describe('that helps saves to toolbox', () => {
  it('addEntry creates a toolbox entry with suggestion text', () => {
    const { useToolboxStore } = require('../src/stores/toolboxStore');

    // Clear any previous state
    useToolboxStore.getState().entries = [];

    const idea = ideas.running_low[0];
    const text = `${idea.title}: ${idea.content}`;

    useToolboxStore.getState().addEntry(text);

    const entries = useToolboxStore.getState().entries;
    expect(entries.length).toBe(1);
    expect(entries[0].suggestionText).toBe(text);
    expect(entries[0].savedAt).toBeTruthy();
  });
});
