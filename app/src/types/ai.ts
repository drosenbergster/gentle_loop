/**
 * AI Service Types
 *
 * Shared types for communication between the mobile app and the ai-suggest
 * Supabase Edge Function. These mirror the server-side types.
 *
 * ARCH-9:  Structured context payload format
 * ARCH-11: ResponseType metadata
 */

/** Energy level values sent to the AI proxy */
export type EnergyLevel = 'running_low' | 'holding_steady' | 'ive_got_this';

/** Request type indicating the conversation stage */
export type RequestType = 'initial' | 'another' | 'follow_up' | 'timer_follow_up';

/**
 * Response type parsed from the LLM's structured tag by the proxy.
 * - suggestion: Standard practical suggestion
 * - pause: Breathing/timer-eligible suggestion (typically for running_low + initial)
 * - question: Pivot inquiry after ~3-4 declined suggestions
 * - out_of_ideas: No more novel suggestions available
 */
export type ResponseType = 'suggestion' | 'pause' | 'question' | 'out_of_ideas';

/** Payload sent to the ai-suggest Edge Function */
export interface AIRequestPayload {
  energy_level: EnergyLevel;
  request_type: RequestType;
  caregiver_message: string;
  toolbox_entries?: Array<{ suggestionText: string; savedAt: string }>;
  conversation_history?: string;
  device_id?: string;
}

/** Successful response from the ai-suggest Edge Function */
export interface AIResponse {
  suggestion: string;
  response_type: ResponseType;
  rate_limit_warning?: boolean;
}

/** Error response from the ai-suggest Edge Function */
export interface AIErrorResponse {
  error: string;
  code: string;
}

/** All possible error codes returned by the proxy */
export type AIErrorCode =
  | 'METHOD_NOT_ALLOWED'
  | 'INVALID_JSON'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'SERVICE_UNAVAILABLE'
  | 'LLM_RATE_LIMITED'
  | 'LLM_ERROR'
  | 'LLM_PARSE_ERROR'
  | 'INTERNAL_ERROR';
