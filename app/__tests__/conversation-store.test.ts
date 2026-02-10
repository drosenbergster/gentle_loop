/**
 * Story 1.8: Conversation Store Tests
 *
 * Tests:
 * - Thread lifecycle (add turns, clear)
 * - History string formatting (ARCH-9)
 * - Truncation algorithm (FM-6)
 * - Out of ideas detection
 * - Turn counting
 * - In-memory only (ARCH-4)
 */

import { useConversationStore } from '../src/stores/conversationStore';

// Reset store before each test
beforeEach(() => {
  useConversationStore.getState().clearThread();
});

describe('conversation thread lifecycle', () => {
  it('starts with empty inactive thread', () => {
    const state = useConversationStore.getState();
    expect(state.thread.turns.length).toBe(0);
    expect(state.thread.isActive).toBe(false);
  });

  it('activates on first caregiver turn', () => {
    useConversationStore.getState().addCaregiverTurn("She won't eat.");
    const state = useConversationStore.getState();
    expect(state.thread.isActive).toBe(true);
    expect(state.thread.turns.length).toBe(1);
    expect(state.thread.turns[0].role).toBe('caregiver');
  });

  it('adds assistant turn with responseType', () => {
    useConversationStore.getState().addCaregiverTurn("She won't eat.");
    useConversationStore
      .getState()
      .addAssistantTurn('Try finger foods.', 'suggestion');
    const state = useConversationStore.getState();
    expect(state.thread.turns.length).toBe(2);
    expect(state.thread.turns[1].role).toBe('assistant');
    expect(state.thread.turns[1].responseType).toBe('suggestion');
  });

  it('clears thread completely', () => {
    useConversationStore.getState().addCaregiverTurn('Help.');
    useConversationStore.getState().addAssistantTurn('Try this.', 'suggestion');
    useConversationStore.getState().clearThread();
    const state = useConversationStore.getState();
    expect(state.thread.turns.length).toBe(0);
    expect(state.thread.isActive).toBe(false);
  });
});

describe('history string formatting', () => {
  it('returns empty string for no turns', () => {
    expect(useConversationStore.getState().getHistoryString()).toBe('');
  });

  it('formats a single exchange', () => {
    useConversationStore.getState().addCaregiverTurn("She won't eat.");
    useConversationStore.getState().addAssistantTurn('Try finger foods.', 'suggestion');
    const history = useConversationStore.getState().getHistoryString();
    expect(history).toContain("Caregiver: She won't eat.");
    expect(history).toContain('You: Try finger foods.');
  });

  it('formats multiple exchanges in order', () => {
    useConversationStore.getState().addCaregiverTurn('Help me.');
    useConversationStore.getState().addAssistantTurn('Try A.', 'suggestion');
    useConversationStore
      .getState()
      .addCaregiverTurn('[requested another suggestion]');
    useConversationStore.getState().addAssistantTurn('Try B.', 'suggestion');
    const history = useConversationStore.getState().getHistoryString();
    expect(history).toContain('Caregiver: Help me.');
    expect(history).toContain('You: Try A.');
    expect(history).toContain('You: Try B.');
  });
});

describe('truncation (FM-6)', () => {
  it('does not truncate 3 exchanges (6 turns)', () => {
    for (let i = 1; i <= 3; i++) {
      useConversationStore.getState().addCaregiverTurn(`Message ${i}`);
      useConversationStore.getState().addAssistantTurn(`Reply ${i}`, 'suggestion');
    }
    const history = useConversationStore.getState().getHistoryString();
    expect(history).not.toContain('omitted');
    expect(history).toContain('Message 1');
    expect(history).toContain('Message 3');
  });

  it('truncates when more than 6 turns, keeping first + last 2 exchanges', () => {
    for (let i = 1; i <= 5; i++) {
      useConversationStore.getState().addCaregiverTurn(`Message ${i}`);
      useConversationStore.getState().addAssistantTurn(`Reply ${i}`, 'suggestion');
    }
    const history = useConversationStore.getState().getHistoryString();
    // First exchange preserved
    expect(history).toContain('Message 1');
    expect(history).toContain('Reply 1');
    // Last 2 exchanges preserved
    expect(history).toContain('Message 4');
    expect(history).toContain('Message 5');
    // Middle omitted
    expect(history).toContain('omitted');
  });
});

describe('turn counting', () => {
  it('counts assistant turns as conversation turns', () => {
    expect(useConversationStore.getState().getTurnCount()).toBe(0);

    useConversationStore.getState().addCaregiverTurn('Help.');
    expect(useConversationStore.getState().getTurnCount()).toBe(0);

    useConversationStore.getState().addAssistantTurn('Try this.', 'suggestion');
    expect(useConversationStore.getState().getTurnCount()).toBe(1);

    useConversationStore.getState().addCaregiverTurn('Another.');
    useConversationStore.getState().addAssistantTurn('Try that.', 'suggestion');
    expect(useConversationStore.getState().getTurnCount()).toBe(2);
  });
});

describe('out of ideas detection', () => {
  it('returns false when no turns', () => {
    expect(useConversationStore.getState().isOutOfIdeas()).toBe(false);
  });

  it('returns false for suggestion response', () => {
    useConversationStore.getState().addCaregiverTurn('Help.');
    useConversationStore.getState().addAssistantTurn('Try this.', 'suggestion');
    expect(useConversationStore.getState().isOutOfIdeas()).toBe(false);
  });

  it('returns true for out_of_ideas response', () => {
    useConversationStore.getState().addCaregiverTurn('Help.');
    useConversationStore
      .getState()
      .addAssistantTurn("I've shared what I know.", 'out_of_ideas');
    expect(useConversationStore.getState().isOutOfIdeas()).toBe(true);
  });

  it('returns false after out_of_ideas then new suggestion', () => {
    useConversationStore.getState().addCaregiverTurn('Help.');
    useConversationStore
      .getState()
      .addAssistantTurn("I've shared what I know.", 'out_of_ideas');
    useConversationStore.getState().addCaregiverTurn('New context.');
    useConversationStore.getState().addAssistantTurn('New idea.', 'suggestion');
    expect(useConversationStore.getState().isOutOfIdeas()).toBe(false);
  });
});
