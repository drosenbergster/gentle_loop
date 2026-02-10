/**
 * Story 1.6: API Proxy — Tag Parsing, Context Building & Types
 *
 * Tests the response_type tag parsing logic (mirrored from Edge Function),
 * AI types correctness, and context message building format.
 *
 * FM-1:  Tag parsing for [SUGGESTION], [PAUSE], [QUESTION], [OUT_OF_IDEAS]
 * SQ-1:  Fallback to "suggestion" when tag missing/malformed
 * ARCH-9: Structured context format
 */

import type {
  ResponseType,
  AIRequestPayload,
  AIResponse,
  AIErrorResponse,
} from '../src/types/ai';

// ─────────────────────────────────────────
// Mirror the tag parsing logic from the Edge Function
// so we can test it in the Jest environment.
// ─────────────────────────────────────────

const TAG_REGEX = /^\[(SUGGESTION|PAUSE|QUESTION|OUT_OF_IDEAS)\]\s*/i;

const TAG_TO_RESPONSE_TYPE: Record<string, ResponseType> = {
  SUGGESTION: 'suggestion',
  PAUSE: 'pause',
  QUESTION: 'question',
  OUT_OF_IDEAS: 'out_of_ideas',
};

function parseResponseTag(rawContent: string): {
  responseType: ResponseType;
  cleanText: string;
} {
  const match = rawContent.match(TAG_REGEX);

  if (match) {
    const tag = match[1].toUpperCase();
    const responseType = TAG_TO_RESPONSE_TYPE[tag] ?? 'suggestion';
    const cleanText = rawContent.replace(TAG_REGEX, '').trim();
    return { responseType, cleanText };
  }

  return { responseType: 'suggestion', cleanText: rawContent.trim() };
}

// ─────────────────────────────────────────
// Mirror the context building logic
// ─────────────────────────────────────────

function buildUserMessage(payload: AIRequestPayload): string {
  let toolboxSection = '(none)';
  if (payload.toolbox_entries && payload.toolbox_entries.length > 0) {
    const entries = payload.toolbox_entries.slice(-15).reverse();
    toolboxSection = entries
      .map((e) => {
        const date = e.savedAt ? e.savedAt.split('T')[0] : 'unknown';
        return `- "${e.suggestionText}" (saved: ${date})`;
      })
      .join('\n');
  }

  const historySection = payload.conversation_history || '(none)';

  return [
    '[Context]',
    `Energy: ${payload.energy_level}`,
    `Request: ${payload.request_type}`,
    `Toolbox:`,
    toolboxSection,
    '',
    '[Conversation History]',
    historySection,
    '',
    '[Caregiver]',
    payload.caregiver_message,
  ].join('\n');
}

// ─────────────────────────────────────────
// 1. Tag Parsing (FM-1)
// ─────────────────────────────────────────

describe('parseResponseTag', () => {
  it('parses [SUGGESTION] tag', () => {
    const result = parseResponseTag(
      '[SUGGESTION] Try finger foods on a bright plate.',
    );
    expect(result.responseType).toBe('suggestion');
    expect(result.cleanText).toBe('Try finger foods on a bright plate.');
  });

  it('parses [PAUSE] tag', () => {
    const result = parseResponseTag(
      "[PAUSE] You've already tried three times. That's enough for now. Step away, grab a glass of water.",
    );
    expect(result.responseType).toBe('pause');
    expect(result.cleanText).toContain("You've already tried three times");
  });

  it('parses [QUESTION] tag', () => {
    const result = parseResponseTag(
      "[QUESTION] These suggestions aren't landing. What would actually help you right now?",
    );
    expect(result.responseType).toBe('question');
    expect(result.cleanText).toContain("aren't landing");
  });

  it('parses [OUT_OF_IDEAS] tag', () => {
    const result = parseResponseTag(
      "[OUT_OF_IDEAS] I've shared what I know for this one. Check your Toolbox.",
    );
    expect(result.responseType).toBe('out_of_ideas');
    expect(result.cleanText).toContain("I've shared what I know");
  });

  it('handles lowercase tags', () => {
    const result = parseResponseTag(
      '[suggestion] Try putting on some music.',
    );
    expect(result.responseType).toBe('suggestion');
    expect(result.cleanText).toBe('Try putting on some music.');
  });

  it('handles mixed case tags', () => {
    const result = parseResponseTag(
      '[Pause] Take a breath.',
    );
    expect(result.responseType).toBe('pause');
    expect(result.cleanText).toBe('Take a breath.');
  });

  it('strips tag and extra whitespace', () => {
    const result = parseResponseTag(
      '[SUGGESTION]   Extra spaces here.  ',
    );
    expect(result.responseType).toBe('suggestion');
    expect(result.cleanText).toBe('Extra spaces here.');
  });
});

// ─────────────────────────────────────────
// 2. Fallback behavior (SQ-1)
// ─────────────────────────────────────────

describe('parseResponseTag fallback (SQ-1)', () => {
  it('defaults to "suggestion" when no tag present', () => {
    const result = parseResponseTag(
      'Try playing some soothing music.',
    );
    expect(result.responseType).toBe('suggestion');
    expect(result.cleanText).toBe('Try playing some soothing music.');
  });

  it('defaults to "suggestion" for unknown tag format', () => {
    const result = parseResponseTag(
      '[UNKNOWN] Some text here.',
    );
    expect(result.responseType).toBe('suggestion');
    expect(result.cleanText).toBe('[UNKNOWN] Some text here.');
  });

  it('defaults to "suggestion" for malformed tag', () => {
    const result = parseResponseTag(
      'SUGGESTION Try this.',
    );
    expect(result.responseType).toBe('suggestion');
    expect(result.cleanText).toBe('SUGGESTION Try this.');
  });

  it('defaults to "suggestion" for empty string', () => {
    const result = parseResponseTag('');
    expect(result.responseType).toBe('suggestion');
    expect(result.cleanText).toBe('');
  });

  it('defaults to "suggestion" for tag in middle of text', () => {
    const result = parseResponseTag(
      'Some text [SUGGESTION] then more.',
    );
    expect(result.responseType).toBe('suggestion');
    expect(result.cleanText).toBe('Some text [SUGGESTION] then more.');
  });
});

// ─────────────────────────────────────────
// 3. Context Building (ARCH-9)
// ─────────────────────────────────────────

describe('buildUserMessage', () => {
  it('builds a complete structured message', () => {
    const payload: AIRequestPayload = {
      energy_level: 'running_low',
      request_type: 'initial',
      caregiver_message: "She won't eat anything I make.",
      toolbox_entries: [
        {
          suggestionText: 'Try finger foods on a bright plate',
          savedAt: '2026-02-01T10:00:00.000Z',
        },
      ],
      conversation_history: '',
    };

    const msg = buildUserMessage(payload);

    expect(msg).toContain('[Context]');
    expect(msg).toContain('Energy: running_low');
    expect(msg).toContain('Request: initial');
    expect(msg).toContain('Toolbox:');
    expect(msg).toContain('"Try finger foods on a bright plate" (saved: 2026-02-01)');
    expect(msg).toContain('[Caregiver]');
    expect(msg).toContain("She won't eat anything I make.");
  });

  it('shows (none) for empty toolbox', () => {
    const payload: AIRequestPayload = {
      energy_level: 'holding_steady',
      request_type: 'another',
      caregiver_message: 'Something else please.',
    };

    const msg = buildUserMessage(payload);

    expect(msg).toContain('Toolbox:\n(none)');
    expect(msg).toContain('[Conversation History]\n(none)');
  });

  it('caps toolbox at 15 entries, most recent first', () => {
    const entries = Array.from({ length: 20 }, (_, i) => ({
      suggestionText: `Idea ${i + 1}`,
      savedAt: `2026-02-${String(i + 1).padStart(2, '0')}T10:00:00.000Z`,
    }));

    const payload: AIRequestPayload = {
      energy_level: 'ive_got_this',
      request_type: 'initial',
      caregiver_message: 'Help me.',
      toolbox_entries: entries,
    };

    const msg = buildUserMessage(payload);

    // Should only have entries 6-20 (last 15), reversed so 20 is first
    expect(msg).toContain('"Idea 20"');
    expect(msg).toContain('"Idea 6"');
    expect(msg).not.toContain('"Idea 5"');
    expect(msg).not.toContain('"Idea 1"');
  });

  it('includes conversation history when provided', () => {
    const payload: AIRequestPayload = {
      energy_level: 'holding_steady',
      request_type: 'follow_up',
      caregiver_message: 'That didnt work.',
      conversation_history:
        "Caregiver: She won't eat.\nYou: Try finger foods.",
    };

    const msg = buildUserMessage(payload);

    expect(msg).toContain("[Conversation History]\nCaregiver: She won't eat.\nYou: Try finger foods.");
  });
});

// ─────────────────────────────────────────
// 4. Type validation
// ─────────────────────────────────────────

describe('AI types', () => {
  it('AIResponse has required fields', () => {
    const response: AIResponse = {
      suggestion: 'Try this.',
      response_type: 'suggestion',
    };
    expect(response.suggestion).toBe('Try this.');
    expect(response.response_type).toBe('suggestion');
  });

  it('AIResponse can include rate_limit_warning', () => {
    const response: AIResponse = {
      suggestion: 'Try this.',
      response_type: 'suggestion',
      rate_limit_warning: true,
    };
    expect(response.rate_limit_warning).toBe(true);
  });

  it('AIErrorResponse has error and code', () => {
    const err: AIErrorResponse = {
      error: 'Something went wrong.',
      code: 'INTERNAL_ERROR',
    };
    expect(err.error).toBe('Something went wrong.');
    expect(err.code).toBe('INTERNAL_ERROR');
  });

  it('ResponseType union covers all 4 types', () => {
    const types: ResponseType[] = [
      'suggestion',
      'pause',
      'question',
      'out_of_ideas',
    ];
    expect(types.length).toBe(4);
    // If any were invalid, TypeScript would catch it at compile time
  });
});
