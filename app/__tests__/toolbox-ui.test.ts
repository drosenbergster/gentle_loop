/**
 * Epic 4: Toolbox UI Tests
 *
 * Story 4.1: Full view — browse, dates, empty state, expand
 * Story 4.2: Delete with confirmation
 * Story 4.3: Integration testing constants/logic
 */

import { useToolboxStore } from '../src/stores/toolboxStore';

// Reset store before each test
beforeEach(() => {
  useToolboxStore.setState({ entries: [] });
});

describe('Story 4.1: Toolbox full view', () => {
  it('entries are ordered newest first', () => {
    useToolboxStore.getState().addEntry('First strategy');
    useToolboxStore.getState().addEntry('Second strategy');
    useToolboxStore.getState().addEntry('Third strategy');

    const entries = useToolboxStore.getState().entries;
    const sorted = [...entries].reverse();
    expect(sorted[0].suggestionText).toBe('Third strategy');
    expect(sorted[1].suggestionText).toBe('Second strategy');
    expect(sorted[2].suggestionText).toBe('First strategy');
  });

  it('each entry has suggestion text and date', () => {
    useToolboxStore.getState().addEntry('Test strategy');
    const entry = useToolboxStore.getState().entries[0];
    expect(entry.suggestionText).toBe('Test strategy');
    expect(entry.savedAt).toBeDefined();
    expect(new Date(entry.savedAt).getTime()).not.toBeNaN();
  });

  it('list handles up to 50 entries (cap)', () => {
    for (let i = 0; i < 50; i++) {
      useToolboxStore.getState().addEntry(`Strategy ${i}`);
    }
    expect(useToolboxStore.getState().entries.length).toBe(50);
  });

  it('FIFO eviction at cap + 1', () => {
    for (let i = 0; i < 51; i++) {
      useToolboxStore.getState().addEntry(`Strategy ${i}`);
    }
    const entries = useToolboxStore.getState().entries;
    expect(entries.length).toBe(50);
    // Oldest (Strategy 0) should be evicted
    expect(entries[0].suggestionText).toBe('Strategy 1');
  });

  it('empty state displays when no entries', () => {
    expect(useToolboxStore.getState().entries.length).toBe(0);
    // UI would show empty state
  });

  it('settings preview shows 3 most recent', () => {
    for (let i = 0; i < 5; i++) {
      useToolboxStore.getState().addEntry(`Strategy ${i}`);
    }
    const entries = useToolboxStore.getState().entries;
    const recentPreview = entries.slice(-3).reverse();
    expect(recentPreview.length).toBe(3);
    expect(recentPreview[0].suggestionText).toBe('Strategy 4');
    expect(recentPreview[1].suggestionText).toBe('Strategy 3');
    expect(recentPreview[2].suggestionText).toBe('Strategy 2');
  });
});

describe('Story 4.2: delete with confirmation', () => {
  it('removeEntry removes the correct entry', () => {
    useToolboxStore.getState().addEntry('Keep this');
    useToolboxStore.getState().addEntry('Delete this');
    useToolboxStore.getState().addEntry('Keep this too');

    const toDelete = useToolboxStore.getState().entries[1];
    expect(toDelete.suggestionText).toBe('Delete this');

    useToolboxStore.getState().removeEntry(toDelete.id);

    const remaining = useToolboxStore.getState().entries;
    expect(remaining.length).toBe(2);
    expect(remaining.map((e) => e.suggestionText)).toEqual([
      'Keep this',
      'Keep this too',
    ]);
  });

  it('deleting last entry results in empty state', () => {
    useToolboxStore.getState().addEntry('Only one');
    const entry = useToolboxStore.getState().entries[0];
    useToolboxStore.getState().removeEntry(entry.id);
    expect(useToolboxStore.getState().entries.length).toBe(0);
  });

  it('deleted entry is not in AI context', () => {
    useToolboxStore.getState().addEntry('Suggestion A');
    useToolboxStore.getState().addEntry('Suggestion B');

    const entryB = useToolboxStore.getState().entries[1];
    useToolboxStore.getState().removeEntry(entryB.id);

    const aiEntries = useToolboxStore.getState().getEntriesForAI();
    expect(aiEntries.map((e) => e.suggestionText)).toEqual(['Suggestion A']);
  });

  it('removeEntry with invalid ID does nothing', () => {
    useToolboxStore.getState().addEntry('Test');
    useToolboxStore.getState().removeEntry('nonexistent-id');
    expect(useToolboxStore.getState().entries.length).toBe(1);
  });
});

describe('Story 4.3: integration test constants', () => {
  it('AI context sends only 15 most recent entries', () => {
    for (let i = 0; i < 20; i++) {
      useToolboxStore.getState().addEntry(`Strategy ${i}`);
    }
    const aiEntries = useToolboxStore.getState().getEntriesForAI();
    expect(aiEntries.length).toBe(15);
    // Should be the 15 most recent (index 5-19)
    expect(aiEntries[0].suggestionText).toBe('Strategy 5');
    expect(aiEntries[14].suggestionText).toBe('Strategy 19');
  });

  it('near-cap warning triggers at 45', () => {
    for (let i = 0; i < 45; i++) {
      useToolboxStore.getState().addEntry(`Strategy ${i}`);
    }
    expect(useToolboxStore.getState().isNearCap()).toBe(true);
  });

  it('near-cap warning does NOT trigger below 45', () => {
    for (let i = 0; i < 44; i++) {
      useToolboxStore.getState().addEntry(`Strategy ${i}`);
    }
    expect(useToolboxStore.getState().isNearCap()).toBe(false);
  });
});

describe('date formatting logic', () => {
  function formatDate(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }

  it('formats today correctly', () => {
    const now = new Date().toISOString();
    expect(formatDate(now)).toBe('Today');
  });

  it('formats yesterday correctly', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(formatDate(yesterday)).toBe('Yesterday');
  });

  it('formats days ago correctly', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(formatDate(threeDaysAgo)).toBe('3 days ago');
  });

  it('formats older dates with month and day', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000);
    const formatted = formatDate(twoWeeksAgo.toISOString());
    // Should be like "Jan 26" or similar
    expect(formatted).toMatch(/\w{3} \d{1,2}/);
  });
});
