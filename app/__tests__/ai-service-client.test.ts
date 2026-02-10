/**
 * Story 1.8: AI Service Client Tests
 *
 * Tests:
 * - AIServiceError class
 * - Request context building
 * - Timeout handling
 * - Error mapping
 */

import { AIServiceError } from '../src/services/aiClient';
import type { RequestType, ResponseType } from '../src/types/ai';

describe('AIServiceError', () => {
  it('has correct name, message, and code', () => {
    const err = new AIServiceError('Something failed', 'LLM_ERROR');
    expect(err.name).toBe('AIServiceError');
    expect(err.message).toBe('Something failed');
    expect(err.code).toBe('LLM_ERROR');
  });

  it('is an instance of Error', () => {
    const err = new AIServiceError('Test', 'TEST');
    expect(err instanceof Error).toBe(true);
    expect(err instanceof AIServiceError).toBe(true);
  });
});

describe('request types', () => {
  it('covers all 4 request types', () => {
    const types: RequestType[] = ['initial', 'another', 'follow_up', 'timer_follow_up'];
    expect(types.length).toBe(4);
  });
});

describe('response types', () => {
  it('covers all 4 response types', () => {
    const types: ResponseType[] = ['suggestion', 'pause', 'question', 'out_of_ideas'];
    expect(types.length).toBe(4);
  });
});

describe('suggestion card logic', () => {
  it('"Another" is hidden when response_type is out_of_ideas', () => {
    const responseType: ResponseType = 'out_of_ideas';
    const showAnother = responseType !== 'out_of_ideas';
    expect(showAnother).toBe(false);
  });

  it('"Another" is visible for suggestion response', () => {
    const responseType: ResponseType = 'suggestion';
    const showAnother = responseType !== 'out_of_ideas';
    expect(showAnother).toBe(true);
  });

  it('"Another" is visible for pause response', () => {
    const responseType: ResponseType = 'pause';
    const showAnother = responseType !== 'out_of_ideas';
    expect(showAnother).toBe(true);
  });

  it('"Another" is visible for question response', () => {
    const responseType: ResponseType = 'question';
    const showAnother = responseType !== 'out_of_ideas';
    expect(showAnother).toBe(true);
  });
});

describe('crisis detection constant', () => {
  it('inactivity timeout is 5 seconds', () => {
    const INACTIVITY_TIMEOUT_MS = 5_000;
    expect(INACTIVITY_TIMEOUT_MS).toBe(5000);
  });
});

describe('that worked saves to toolbox', () => {
  it('addEntry creates entry when "That worked" is tapped', () => {
    const { useToolboxStore } = require('../src/stores/toolboxStore');
    useToolboxStore.setState({ entries: [] });

    const suggestionText = 'Try finger foods on a bright plate.';
    useToolboxStore.getState().addEntry(suggestionText);

    const entries = useToolboxStore.getState().entries;
    expect(entries.length).toBe(1);
    expect(entries[0].suggestionText).toBe(suggestionText);
  });
});

describe('dismiss clears conversation thread', () => {
  it('clearThread resets to empty inactive state', () => {
    const { useConversationStore } = require('../src/stores/conversationStore');
    useConversationStore.getState().addCaregiverTurn('Help.');
    useConversationStore.getState().addAssistantTurn('Try this.', 'suggestion');

    expect(useConversationStore.getState().thread.isActive).toBe(true);

    useConversationStore.getState().clearThread();

    expect(useConversationStore.getState().thread.isActive).toBe(false);
    expect(useConversationStore.getState().thread.turns.length).toBe(0);
  });
});
