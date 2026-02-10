/**
 * AI Service Client
 *
 * Communicates with the ai-suggest Supabase Edge Function.
 * Builds structured context payloads (ARCH-9) and handles responses.
 *
 * FR40: API key never in client — all calls go through the proxy.
 * ARCH-9: Structured context payload.
 */

import type {
  AIRequestPayload,
  AIResponse,
  AIErrorResponse,
  RequestType,
  ResponseType,
} from '../types/ai';
import type { EnergyLevel } from '../theme/colors';
import type { ToolboxEntry } from '../types/toolbox';

// ─────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────

/** Supabase Edge Function URL — from env; in dev (Metro) fallback so app runs without .env */
const DEFAULT_DEV_API_URL = 'https://amghuhcisazsxsqrrmep.supabase.co/functions/v1';
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_PROXY_URL ??
  (__DEV__ ? DEFAULT_DEV_API_URL : undefined);
if (!API_BASE_URL) {
  throw new Error('EXPO_PUBLIC_API_PROXY_URL environment variable is required.');
}

const AI_SUGGEST_URL = `${API_BASE_URL}/ai-suggest`;

/** Supabase anon key — from env; in dev (Metro) fallback so app runs without .env */
const DEFAULT_DEV_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ2h1aGNpc2F6c3hzcXJybWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2ODI2NTksImV4cCI6MjA4NjI1ODY1OX0.MAoI2mmcgtlWXYVsTuGw52BNXJfaRp0YznOGHG2i_sU';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? (__DEV__ ? DEFAULT_DEV_ANON_KEY : undefined);
if (!SUPABASE_ANON_KEY) {
  throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable is required.');
}

/** Request timeout in ms (NFR3: suggestion within 3 seconds) */
const REQUEST_TIMEOUT_MS = 10_000;

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface AIRequestContext {
  energyLevel: EnergyLevel;
  requestType: RequestType;
  caregiverMessage: string;
  toolboxEntries: ToolboxEntry[];
  conversationHistory?: string;
  deviceId?: string;
}

export interface AISuggestion {
  text: string;
  responseType: ResponseType;
  rateLimitWarning?: boolean;
}

export class AIServiceError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'AIServiceError';
    this.code = code;
  }
}

// ─────────────────────────────────────────
// Client
// ─────────────────────────────────────────

/**
 * Send a request to the AI proxy and get a suggestion.
 * Throws AIServiceError on failure with user-friendly message.
 */
export async function getAISuggestion(
  context: AIRequestContext,
): Promise<AISuggestion> {
  const payload: AIRequestPayload = {
    energy_level: context.energyLevel,
    request_type: context.requestType,
    caregiver_message: context.caregiverMessage,
    toolbox_entries: context.toolboxEntries.map((e) => ({
      suggestionText: e.suggestionText,
      savedAt: e.savedAt,
    })),
    conversation_history: context.conversationHistory,
    device_id: context.deviceId,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(AI_SUGGEST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorBody: AIErrorResponse | undefined;
      try {
        errorBody = await response.json();
      } catch {
        // ignore parse error
      }

      const message =
        errorBody?.error ?? 'Something went wrong getting a suggestion.';
      const code = errorBody?.code ?? 'UNKNOWN_ERROR';
      throw new AIServiceError(message, code);
    }

    const data: AIResponse = await response.json();

    return {
      text: data.suggestion,
      responseType: data.response_type,
      rateLimitWarning: data.rate_limit_warning,
    };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof AIServiceError) {
      throw err;
    }

    if (err instanceof Error && err.name === 'AbortError') {
      throw new AIServiceError(
        'The request took too long. Please try again.',
        'TIMEOUT',
      );
    }

    throw new AIServiceError(
      'Could not reach the server. Please check your connection and try again.',
      'NETWORK_ERROR',
    );
  }
}
