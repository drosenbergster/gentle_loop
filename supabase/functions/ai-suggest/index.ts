/**
 * ai-suggest — Supabase Edge Function
 *
 * Secure proxy between gentle_loop mobile app and Anthropic Claude API.
 *
 * ARCH-9:  Structured context payload (energy, request_type, toolbox, history, message)
 * ARCH-10: System prompt stored as environment variable
 * ARCH-11: response_type metadata in every response
 * ARCH-12: Per-device rate limiting (soft cap)
 * FM-1:    Parses [SUGGESTION]/[PAUSE]/[CRISIS]/[QUESTION]/[OUT_OF_IDEAS] tags from LLM response
 * SQ-1:    Missing/malformed tag defaults to "suggestion" with warning log
 * FR40:    API key never exposed in responses
 * NFR10:   No credentials in error messages
 * SEC-C2:  CORS restricted to allowed origins
 * SEC-C3:  JWT identity extraction for rate limiting
 * SEC-C4:  Request body size limits enforced
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type EnergyLevel = "running_low" | "holding_steady" | "ive_got_this";
type RequestType = "initial" | "another" | "follow_up" | "timer_follow_up";
type ResponseType = "suggestion" | "pause" | "crisis" | "question" | "out_of_ideas";

interface AIRequestPayload {
  energy_level: EnergyLevel;
  request_type: RequestType;
  caregiver_message: string;
  toolbox_entries?: Array<{ suggestionText: string; savedAt: string }>;
  conversation_history?: string;
  device_id?: string;
}

interface AIResponse {
  suggestion: string;
  response_type: ResponseType;
}

interface ErrorResponse {
  error: string;
  code: string;
}

// ─────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-3-5-haiku-20241022";
const MAX_TOKENS = 180; // Increased from 120: crisis responses may use up to 60 words (~90 tokens)
const TEMPERATURE = 0.7;

// Rate limiting: soft cap per device (ARCH-12)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per device
const RATE_LIMIT_SOFT_CAP = 8; // Warning after 8 requests

// In-memory rate limit store (resets on cold start — acceptable for MVP)
const rateLimitMap = new Map<
  string,
  { count: number; windowStart: number; warned: boolean }
>();

// Request size limits (SEC-C4)
const MAX_BODY_SIZE_BYTES = 100_000; // 100KB
const MAX_CAREGIVER_MESSAGE_LENGTH = 2_000;
const MAX_CONVERSATION_HISTORY_LENGTH = 10_000;
const MAX_TOOLBOX_ENTRIES = 15;
const MAX_TOOLBOX_ENTRY_TEXT_LENGTH = 500;

// Valid energy levels and request types for input validation
const VALID_ENERGY_LEVELS: EnergyLevel[] = [
  "running_low",
  "holding_steady",
  "ive_got_this",
];
const VALID_REQUEST_TYPES: RequestType[] = [
  "initial",
  "another",
  "follow_up",
  "timer_follow_up",
];

// ─────────────────────────────────────────
// Tag Parsing (FM-1, SQ-1)
// ─────────────────────────────────────────

const TAG_REGEX = /^\[(SUGGESTION|PAUSE|CRISIS|QUESTION|OUT_OF_IDEAS)\]\s*/i;

const TAG_TO_RESPONSE_TYPE: Record<string, ResponseType> = {
  SUGGESTION: "suggestion",
  PAUSE: "pause",
  CRISIS: "crisis",
  QUESTION: "question",
  OUT_OF_IDEAS: "out_of_ideas",
};

/**
 * Parse the structured response tag from the LLM output.
 * Returns { responseType, cleanText }.
 * Defaults to "suggestion" if tag is missing or malformed (SQ-1).
 */
function parseResponseTag(rawContent: string): {
  responseType: ResponseType;
  cleanText: string;
} {
  const match = rawContent.match(TAG_REGEX);

  if (match) {
    const tag = match[1].toUpperCase();
    const responseType = TAG_TO_RESPONSE_TYPE[tag] ?? "suggestion";
    const cleanText = rawContent.replace(TAG_REGEX, "").trim();
    return { responseType, cleanText };
  }

  // Tag missing or malformed — default to suggestion, log warning (SQ-1)
  console.warn(
    `[ai-suggest] LLM response missing structured tag. First 80 chars: "${rawContent.substring(0, 80)}"`,
  );
  return { responseType: "suggestion", cleanText: rawContent.trim() };
}

// ─────────────────────────────────────────
// Context Building (ARCH-9)
// ─────────────────────────────────────────

/**
 * Build the structured user message from the client payload.
 * Follows the format defined in the technical architecture.
 */
function buildUserMessage(payload: AIRequestPayload): string {
  // Toolbox serialization (plain text, most recent first, cap at 15)
  let toolboxSection = "(none)";
  if (payload.toolbox_entries && payload.toolbox_entries.length > 0) {
    const entries = payload.toolbox_entries.slice(-15).reverse(); // Most recent first
    toolboxSection = entries
      .map((e) => {
        const date = e.savedAt ? e.savedAt.split("T")[0] : "unknown";
        return `- "${e.suggestionText}" (saved: ${date})`;
      })
      .join("\n");
  }

  const historySection = payload.conversation_history || "(none)";

  return [
    "[Context]",
    `Energy: ${payload.energy_level}`,
    `Request: ${payload.request_type}`,
    `Toolbox:`,
    toolboxSection,
    "",
    "[Conversation History]",
    historySection,
    "",
    "[Caregiver]",
    payload.caregiver_message,
  ].join("\n");
}

// ─────────────────────────────────────────
// Rate Limiting (ARCH-12)
// ─────────────────────────────────────────

interface RateLimitResult {
  allowed: boolean;
  nearCap: boolean;
  remaining: number;
}

function checkRateLimit(rateLimitKey: string): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(rateLimitKey);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    // New window
    rateLimitMap.set(rateLimitKey, {
      count: 1,
      windowStart: now,
      warned: false,
    });
    return {
      allowed: true,
      nearCap: false,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
    };
  }

  entry.count++;

  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, nearCap: true, remaining: 0 };
  }

  const nearCap = entry.count >= RATE_LIMIT_SOFT_CAP;
  if (nearCap && !entry.warned) {
    entry.warned = true;
    console.info(
      `[ai-suggest] Rate limit soft cap reached for: ${rateLimitKey.substring(0, 16)}...`,
    );
  }

  return {
    allowed: true,
    nearCap,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
  };
}

// ─────────────────────────────────────────
// CORS Headers (SEC-C2: origin-restricted)
// ─────────────────────────────────────────

/**
 * Allowed web origins for CORS. Set via ALLOWED_ORIGINS env var (comma-separated).
 * Mobile app requests have no Origin header and are always allowed.
 * If ALLOWED_ORIGINS is empty, no browser-based cross-origin requests are permitted.
 */
const ALLOWED_ORIGINS: string[] = (() => {
  const raw = Deno.env.get("ALLOWED_ORIGINS") || "";
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
})();

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");

  const baseHeaders: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-device-id",
  };

  // No Origin header = non-browser client (mobile app) — always allowed
  if (!origin) {
    return baseHeaders;
  }

  // Check origin against allowlist
  const isAllowed = ALLOWED_ORIGINS.includes(origin);
  return {
    ...baseHeaders,
    "Access-Control-Allow-Origin": isAllowed ? origin : "null",
    Vary: "Origin",
  };
}

// ─────────────────────────────────────────
// JWT Identity Extraction (SEC-C3)
// ─────────────────────────────────────────

/**
 * Extract a rate-limit key from the JWT in the Authorization header.
 * The JWT is already verified by Supabase's gateway (verify_jwt = true in config.toml).
 * Authenticated users are rate-limited by user ID; anonymous requests by device ID.
 */
function extractRateLimitKey(req: Request, deviceId: string): string {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return `device:${deviceId}`;

  try {
    const token = authHeader.split(" ")[1];
    const payloadB64 = token.split(".")[1];
    const payload = JSON.parse(atob(payloadB64));

    // Authenticated user — rate limit by user ID (not spoofable)
    if (payload.sub && payload.role && payload.role !== "anon") {
      return `user:${payload.sub}`;
    }
  } catch {
    // JWT decode failed — fall through to device-based limiting
  }

  return `device:${deviceId}`;
}

// ─────────────────────────────────────────
// Input Validation (with size limits SEC-C4)
// ─────────────────────────────────────────

function validatePayload(
  body: unknown,
): { valid: true; payload: AIRequestPayload } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object." };
  }

  const b = body as Record<string, unknown>;

  if (!b.energy_level || !VALID_ENERGY_LEVELS.includes(b.energy_level as EnergyLevel)) {
    return {
      valid: false,
      error: `energy_level must be one of: ${VALID_ENERGY_LEVELS.join(", ")}`,
    };
  }

  if (!b.request_type || !VALID_REQUEST_TYPES.includes(b.request_type as RequestType)) {
    return {
      valid: false,
      error: `request_type must be one of: ${VALID_REQUEST_TYPES.join(", ")}`,
    };
  }

  if (!b.caregiver_message || typeof b.caregiver_message !== "string" || b.caregiver_message.trim().length === 0) {
    return {
      valid: false,
      error: "caregiver_message is required and must be a non-empty string.",
    };
  }

  // --- Size limits (SEC-C4) ---
  const caregiverMsg = (b.caregiver_message as string).trim();
  if (caregiverMsg.length > MAX_CAREGIVER_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `caregiver_message exceeds maximum length of ${MAX_CAREGIVER_MESSAGE_LENGTH} characters.`,
    };
  }

  if (typeof b.conversation_history === "string" && b.conversation_history.length > MAX_CONVERSATION_HISTORY_LENGTH) {
    return {
      valid: false,
      error: `conversation_history exceeds maximum length of ${MAX_CONVERSATION_HISTORY_LENGTH} characters.`,
    };
  }

  if (Array.isArray(b.toolbox_entries)) {
    if (b.toolbox_entries.length > MAX_TOOLBOX_ENTRIES) {
      return {
        valid: false,
        error: `toolbox_entries exceeds maximum of ${MAX_TOOLBOX_ENTRIES} entries.`,
      };
    }
    for (const entry of b.toolbox_entries) {
      if (!entry || typeof entry !== "object") {
        return { valid: false, error: "Each toolbox entry must be an object." };
      }
      if (
        typeof entry.suggestionText !== "string" ||
        entry.suggestionText.length > MAX_TOOLBOX_ENTRY_TEXT_LENGTH
      ) {
        return {
          valid: false,
          error: `Each toolbox entry suggestionText must be a string of at most ${MAX_TOOLBOX_ENTRY_TEXT_LENGTH} characters.`,
        };
      }
    }
  }

  return {
    valid: true,
    payload: {
      energy_level: b.energy_level as EnergyLevel,
      request_type: b.request_type as RequestType,
      caregiver_message: caregiverMsg,
      toolbox_entries: Array.isArray(b.toolbox_entries) ? b.toolbox_entries : undefined,
      conversation_history: typeof b.conversation_history === "string" ? b.conversation_history : undefined,
      device_id: typeof b.device_id === "string" ? b.device_id : undefined,
    },
  };
}

// ─────────────────────────────────────────
// Main Handler
// ─────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {
  // Compute CORS headers for this request (SEC-C2)
  const corsHeaders = getCorsHeaders(req);

  // Request-scoped error helper (NFR10: no credentials in error messages)
  function errorResponse(
    message: string,
    code: string,
    status: number,
  ): Response {
    const body: ErrorResponse = { error: message, code };
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== "POST") {
    return errorResponse("Method not allowed.", "METHOD_NOT_ALLOWED", 405);
  }

  // --- Request size check (SEC-C4) ---
  const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
  if (contentLength > MAX_BODY_SIZE_BYTES) {
    return errorResponse(
      "Request body too large.",
      "PAYLOAD_TOO_LARGE",
      413,
    );
  }

  // --- Environment check ---
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  const SYSTEM_PROMPT = Deno.env.get("GENTLE_LOOP_SYSTEM_PROMPT");

  if (!ANTHROPIC_API_KEY) {
    console.error("[ai-suggest] ANTHROPIC_API_KEY not configured.");
    return errorResponse(
      "The AI service is temporarily unavailable. Please try again later.",
      "SERVICE_UNAVAILABLE",
      503,
    );
  }

  if (!SYSTEM_PROMPT) {
    console.error("[ai-suggest] GENTLE_LOOP_SYSTEM_PROMPT not configured.");
    return errorResponse(
      "The AI service is temporarily unavailable. Please try again later.",
      "SERVICE_UNAVAILABLE",
      503,
    );
  }

  // --- Parse request body ---
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON in request body.", "INVALID_JSON", 400);
  }

  // --- Validate payload ---
  const validation = validatePayload(body);
  if (!validation.valid) {
    return errorResponse(validation.error, "VALIDATION_ERROR", 400);
  }
  const payload = validation.payload;

  // --- Rate limiting (ARCH-12, SEC-C3) ---
  const deviceId = payload.device_id || req.headers.get("x-device-id") || "anonymous";
  const rateLimitKey = extractRateLimitKey(req, deviceId);
  const rateCheck = checkRateLimit(rateLimitKey);

  if (!rateCheck.allowed) {
    return errorResponse(
      "You're sending requests very quickly. Please wait a moment and try again.",
      "RATE_LIMITED",
      429,
    );
  }

  // --- Build structured user message (ARCH-9) ---
  const userMessage = buildUserMessage(payload);

  // --- Call Anthropic API ---
  try {
    const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!anthropicResponse.ok) {
      const statusCode = anthropicResponse.status;
      console.error(
        `[ai-suggest] Anthropic API error: ${statusCode}`,
        await anthropicResponse.text().catch(() => ""),
      );

      if (statusCode === 429) {
        return errorResponse(
          "The AI service is busy right now. Please try again in a moment.",
          "LLM_RATE_LIMITED",
          503,
        );
      }

      return errorResponse(
        "Something went wrong getting a suggestion. Please try again.",
        "LLM_ERROR",
        502,
      );
    }

    const data = await anthropicResponse.json();

    // Anthropic response format: { content: [{ type: "text", text: "..." }] }
    const rawContent = data?.content?.[0]?.text;

    if (!rawContent || typeof rawContent !== "string") {
      console.error("[ai-suggest] Unexpected Anthropic response format:", JSON.stringify(data).substring(0, 200));
      return errorResponse(
        "Something went wrong getting a suggestion. Please try again.",
        "LLM_PARSE_ERROR",
        502,
      );
    }

    // --- Parse response tag (FM-1, SQ-1) ---
    const { responseType, cleanText } = parseResponseTag(rawContent);

    // --- Build response ---
    const responseBody: AIResponse & { rate_limit_warning?: boolean } = {
      suggestion: cleanText,
      response_type: responseType,
    };

    // Include soft cap warning in response
    if (rateCheck.nearCap) {
      responseBody.rate_limit_warning = true;
    }

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[ai-suggest] Unexpected error:", err);
    return errorResponse(
      "Something went wrong. Please try again.",
      "INTERNAL_ERROR",
      500,
    );
  }
});
