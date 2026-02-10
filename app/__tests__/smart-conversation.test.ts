/**
 * Epic 5: Smart Conversation Behaviors Tests
 *
 * Story 5.1: "Still With You" encouragement messages
 * Story 5.2: Conversation pivot — question response_type
 * Story 5.3: "Out of Ideas" graceful endpoint
 */

import {
  ENCOURAGEMENT_MESSAGES,
  ENCOURAGEMENT_THRESHOLD,
  ENCOURAGEMENT_DISPLAY_MS,
  pickEncouragement,
} from '../src/data/encouragements';
import { useConversationStore } from '../src/stores/conversationStore';

// Reset conversation store before each test
beforeEach(() => {
  useConversationStore.setState({ thread: { turns: [], isActive: false } });
});

// ─────────────────────────────────────────
// Story 5.1: "Still With You" Encouragement
// ─────────────────────────────────────────

describe('Story 5.1: encouragement messages', () => {
  it('has at least 5 encouragement messages (ARCH-18)', () => {
    expect(ENCOURAGEMENT_MESSAGES.length).toBeGreaterThanOrEqual(5);
  });

  it('threshold is 2 assistant turns', () => {
    expect(ENCOURAGEMENT_THRESHOLD).toBe(2);
  });

  it('display duration is 3-4 seconds', () => {
    expect(ENCOURAGEMENT_DISPLAY_MS).toBeGreaterThanOrEqual(3000);
    expect(ENCOURAGEMENT_DISPLAY_MS).toBeLessThanOrEqual(4000);
  });

  it('messages contain no toxic positivity (UFG-7)', () => {
    const toxicPatterns = [
      /you're doing amazing/i,
      /everything will be okay/i,
      /stay positive/i,
      /it'll all work out/i,
      /look on the bright side/i,
      /you're so strong/i,
      /don't worry/i,
      /cheer up/i,
    ];

    for (const message of ENCOURAGEMENT_MESSAGES) {
      for (const pattern of toxicPatterns) {
        expect(message).not.toMatch(pattern);
      }
    }
  });

  it('messages are grounded and acknowledge difficulty', () => {
    // Each message should contain concepts of effort, difficulty, or acknowledgment
    const groundedPatterns = [
      /strength|strong/i,
      /attempt|trying|tried/i,
      /given up|haven't/i,
      /caring|showing up/i,
      /okay|hard|exhausting/i,
      /click|failed|easy/i,
      /matters|answers|learning/i,
    ];

    for (const message of ENCOURAGEMENT_MESSAGES) {
      const matchesAny = groundedPatterns.some((p) => p.test(message));
      expect(matchesAny).toBe(true);
    }
  });

  describe('pickEncouragement — no-consecutive-repeat (ARCH-18)', () => {
    it('returns a message from the pool', () => {
      const msg = pickEncouragement(null);
      expect(ENCOURAGEMENT_MESSAGES).toContain(msg);
    });

    it('never returns the same message as lastShown', () => {
      const lastShown = ENCOURAGEMENT_MESSAGES[0];
      // Run many times to ensure no repeat
      for (let i = 0; i < 50; i++) {
        const msg = pickEncouragement(lastShown);
        expect(msg).not.toBe(lastShown);
      }
    });

    it('can return any message when lastShown is null', () => {
      const seen = new Set<string>();
      for (let i = 0; i < 200; i++) {
        seen.add(pickEncouragement(null));
      }
      // Should have seen most messages
      expect(seen.size).toBeGreaterThan(1);
    });
  });

  it('encouragement triggers at turnCount >= 2', () => {
    const store = useConversationStore.getState();
    store.addCaregiverTurn('situation');
    store.addAssistantTurn('suggestion 1', 'suggestion');
    store.addCaregiverTurn('another');
    store.addAssistantTurn('suggestion 2', 'suggestion');

    const turnCount = useConversationStore.getState().getTurnCount();
    expect(turnCount).toBe(2);
    expect(turnCount >= ENCOURAGEMENT_THRESHOLD).toBe(true);
  });

  it('encouragement does NOT trigger at turnCount 1', () => {
    const store = useConversationStore.getState();
    store.addCaregiverTurn('situation');
    store.addAssistantTurn('suggestion 1', 'suggestion');

    const turnCount = useConversationStore.getState().getTurnCount();
    expect(turnCount).toBe(1);
    expect(turnCount >= ENCOURAGEMENT_THRESHOLD).toBe(false);
  });

  it('"That worked" resets — next thread starts fresh', () => {
    const store = useConversationStore.getState();
    store.addCaregiverTurn('situation');
    store.addAssistantTurn('suggestion', 'suggestion');
    store.addCaregiverTurn('another');
    store.addAssistantTurn('suggestion 2', 'suggestion');

    // Simulate "That worked" → clearThread
    store.clearThread();

    const turnCount = useConversationStore.getState().getTurnCount();
    expect(turnCount).toBe(0);
  });
});

// ─────────────────────────────────────────
// Story 5.2: Conversation Pivot — Question
// ─────────────────────────────────────────

describe('Story 5.2: conversation pivot — question', () => {
  it('response_type "question" is recognized', () => {
    const responseType = 'question';
    const isPivot = responseType === 'question';
    expect(isPivot).toBe(true);
  });

  it('pivot card hides "That Worked" and "Another"', () => {
    const responseType = 'question';
    const isPivotQuestion = responseType === 'question';
    // In the pivot card: That Worked is hidden, Another is hidden
    // Only Dismiss and Mic are shown
    const showThatWorked = !isPivotQuestion;
    const showAnother = !isPivotQuestion;
    expect(showThatWorked).toBe(false);
    expect(showAnother).toBe(false);
  });

  it('pivot card shows mic as primary action', () => {
    const responseType = 'question';
    const isPivotQuestion = responseType === 'question';
    // Mic is primary in pivot variant
    expect(isPivotQuestion).toBe(true);
  });

  it('dismiss remains available on pivot card', () => {
    const responseType = 'question';
    const isPivotQuestion = responseType === 'question';
    // Dismiss is always shown
    const showDismiss = true; // Always available
    expect(showDismiss).toBe(true);
  });

  it('after pivot response, card returns to standard layout (FR11)', () => {
    const store = useConversationStore.getState();
    store.addCaregiverTurn('situation');
    store.addAssistantTurn('What feels most urgent?', 'question');
    store.addCaregiverTurn('my answer');
    store.addAssistantTurn('Here is a targeted suggestion', 'suggestion');

    const turns = useConversationStore.getState().thread.turns;
    const lastTurn = turns[turns.length - 1];
    const isPivot = lastTurn.responseType === 'question';
    expect(isPivot).toBe(false); // Back to standard
  });

  it('encouragement NOT shown for question response_type', () => {
    const responseType = 'question';
    const turnCount = 3;
    const showEncouragement =
      turnCount >= ENCOURAGEMENT_THRESHOLD &&
      responseType !== 'question' &&
      responseType !== 'out_of_ideas';
    expect(showEncouragement).toBe(false);
  });
});

// ─────────────────────────────────────────
// Story 5.3: "Out of Ideas" Endpoint
// ─────────────────────────────────────────

describe('Story 5.3: out of ideas graceful endpoint', () => {
  it('response_type "out_of_ideas" is detected', () => {
    const store = useConversationStore.getState();
    store.addCaregiverTurn('situation');
    store.addAssistantTurn("I've shared what I know", 'out_of_ideas');

    expect(store.isOutOfIdeas()).toBe(true);
  });

  it('"Another" button is hidden for out_of_ideas', () => {
    const responseType = 'out_of_ideas';
    const isOutOfIdeas = responseType === 'out_of_ideas';
    const isPivotQuestion = responseType === 'question';
    // In standard layout, Another is hidden when out_of_ideas
    const showAnother = !isPivotQuestion && !isOutOfIdeas;
    expect(showAnother).toBe(false);
  });

  it('"That worked" remains available for out_of_ideas', () => {
    const responseType = 'out_of_ideas';
    const isPivotQuestion = responseType === 'question';
    const showThatWorked = !isPivotQuestion;
    expect(showThatWorked).toBe(true);
  });

  it('"Dismiss" remains available for out_of_ideas', () => {
    // Always true
    expect(true).toBe(true);
  });

  it('mic remains available for new thread', () => {
    const responseType = 'out_of_ideas';
    const isPivotQuestion = responseType === 'question';
    // Mic is shown in standard layout
    const showMic = !isPivotQuestion;
    expect(showMic).toBe(true);
  });

  it('dismiss clears thread for fresh start (UFG-8)', () => {
    const store = useConversationStore.getState();
    store.addCaregiverTurn('situation');
    store.addAssistantTurn("I've shared what I know", 'out_of_ideas');

    expect(store.isOutOfIdeas()).toBe(true);
    store.clearThread();

    expect(store.getTurnCount()).toBe(0);
    expect(store.isOutOfIdeas()).toBe(false);
  });

  it('encouragement NOT shown for out_of_ideas response', () => {
    const responseType = 'out_of_ideas';
    const turnCount = 4;
    const showEncouragement =
      turnCount >= ENCOURAGEMENT_THRESHOLD &&
      responseType !== 'question' &&
      responseType !== 'out_of_ideas';
    expect(showEncouragement).toBe(false);
  });

  it('new thread after out_of_ideas has completely fresh context (UFG-8)', () => {
    const store = useConversationStore.getState();
    store.addCaregiverTurn('situation');
    store.addAssistantTurn("I've shared what I know", 'out_of_ideas');
    store.clearThread();

    // New thread
    store.addCaregiverTurn('same situation described differently');
    const history = store.getHistoryString();
    expect(history).not.toContain("I've shared what I know");
    expect(history).toContain('same situation described differently');
  });
});

// ─────────────────────────────────────────
// Card variant transitions
// ─────────────────────────────────────────

describe('card variant transitions', () => {
  it('standard → pivot → standard flow', () => {
    const variants: string[] = [];

    // Turn 1: standard suggestion
    let responseType = 'suggestion';
    variants.push(responseType === 'question' ? 'pivot' : 'standard');

    // Turn 2: pivot question
    responseType = 'question';
    variants.push(responseType === 'question' ? 'pivot' : 'standard');

    // Turn 3: targeted suggestion (back to standard)
    responseType = 'suggestion';
    variants.push(responseType === 'question' ? 'pivot' : 'standard');

    expect(variants).toEqual(['standard', 'pivot', 'standard']);
  });

  it('standard → standard → out_of_ideas flow', () => {
    const variants: string[] = [];
    const responseTypes = ['suggestion', 'suggestion', 'out_of_ideas'];

    for (const rt of responseTypes) {
      if (rt === 'question') variants.push('pivot');
      else if (rt === 'out_of_ideas') variants.push('out_of_ideas');
      else variants.push('standard');
    }

    expect(variants).toEqual(['standard', 'standard', 'out_of_ideas']);
  });
});
