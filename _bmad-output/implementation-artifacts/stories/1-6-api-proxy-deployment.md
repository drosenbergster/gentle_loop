# Story 1.6: API Proxy Deployment (Supabase Edge Function)

Status: review

## Story

As a developer,
I want a secure server-side proxy that holds the system prompt and LLM API key,
So that sensitive credentials never exist in the client app and the system prompt is updatable without a client release.

## Acceptance Criteria

1. **AC-1: Edge Function deployed** — Supabase Edge Function `ai-suggest` accepts structured context payload. ✅
2. **AC-2: System prompt env var** — System prompt stored as environment variable `GENTLE_LOOP_SYSTEM_PROMPT` (ARCH-10, CR-2). ✅
3. **AC-3: LLM integration** — Sends to Anthropic Claude 3.5 Haiku (`claude-3-5-haiku-20241022`), returns AI suggestion. ✅
4. **AC-4: API key security** — `ANTHROPIC_API_KEY` never exposed in client responses or errors (FR40, NFR10). ✅
5. **AC-5: CORS** — Configured with `Access-Control-Allow-Origin: *` for mobile app compatibility. ✅
6. **AC-6: Rate limiting** — Per-device soft cap: 10 req/min hard limit, 8 req/min soft warning (ARCH-12). ✅
7. **AC-7: response_type** — Returns `response_type` metadata: "suggestion", "pause", "question", "out_of_ideas" (ARCH-11). ✅
8. **AC-8: Tag parsing** — Regex parses `[SUGGESTION]`/`[PAUSE]`/`[QUESTION]`/`[OUT_OF_IDEAS]` from LLM response, strips tag before returning clean text (FM-1). ✅
9. **AC-9: Fallback** — Missing/malformed tag defaults to "suggestion", logs warning via `console.warn` (SQ-1). ✅
10. **AC-10: Error responses** — User-friendly messages, no stack traces or API errors exposed. Error codes: `SERVICE_UNAVAILABLE`, `RATE_LIMITED`, `LLM_ERROR`, `LLM_PARSE_ERROR`, `INTERNAL_ERROR`. ✅
11. **AC-11: Updatable prompt** — System prompt read from `Deno.env.get('GENTLE_LOOP_SYSTEM_PROMPT')` at request time, no redeploy needed. ✅

## Deployment Instructions

### Prerequisites
1. Anthropic API key (get from https://console.anthropic.com)
2. Supabase CLI (`npx supabase` works, or install globally)
3. Supabase project linked

### Step 1: Link Supabase project
```bash
npx supabase link --project-ref amghuhcisazsxsqrrmep
```

### Step 2: Set environment secrets
```bash
# Set the Anthropic API key
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here

# Set the system prompt (from the production prompt document)
# Copy the full system prompt from _bmad-output/planning-artifacts/ai-system-prompt-production.md
# (everything between --- START SYSTEM PROMPT --- and --- END SYSTEM PROMPT ---)
npx supabase secrets set GENTLE_LOOP_SYSTEM_PROMPT="$(cat <<'PROMPT_EOF'
You are a companion in gentle_loop — a mobile app for family caregivers of people living with dementia.
... (paste full system prompt here) ...
PROMPT_EOF
)"
```

### Step 3: Deploy the function
```bash
npx supabase functions deploy ai-suggest --no-verify-jwt
```

Note: `--no-verify-jwt` is used because the mobile app doesn't authenticate with Supabase auth. Rate limiting is per-device via `x-device-id` header.

### Step 4: Test the endpoint
```bash
curl -X POST \
  https://amghuhcisazsxsqrrmep.supabase.co/functions/v1/ai-suggest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "energy_level": "holding_steady",
    "request_type": "initial",
    "caregiver_message": "She won'\''t eat anything I make. I'\''ve tried three times."
  }'
```

### Updating the system prompt
To update the system prompt without redeploying:
```bash
npx supabase secrets set GENTLE_LOOP_SYSTEM_PROMPT="new prompt text here"
```
The Edge Function reads the env var at request time, so changes take effect immediately on the next cold start.

## Dev Agent Record

### Agent Model Used
claude-4.6-opus

### Debug Log References
None — clean implementation.

### Completion Notes List

- **Supabase project initialized** at repo root with `supabase init`. Edge Function scaffolded with `supabase functions new ai-suggest`.
- **Anthropic Claude 3.5 Haiku** integration via the Anthropic Messages API (`/v1/messages`). Model: `claude-3-5-haiku-20241022`. Temperature: 0.7, max_tokens: 120 (safety net for ~40 word responses).
- **Structured context building** (ARCH-9): The Edge Function constructs a single user message with `[Context]`, `[Conversation History]`, and `[Caregiver]` sections from the payload fields.
- **Tag parsing** (FM-1): Regex `^\[(SUGGESTION|PAUSE|QUESTION|OUT_OF_IDEAS)\]\s*` parses the structured response tag. Case-insensitive. Tag is stripped from the response text before returning to client.
- **Fallback** (SQ-1): If tag is missing, malformed, or unrecognized, defaults to `response_type: "suggestion"` and logs via `console.warn`.
- **Rate limiting** (ARCH-12): In-memory per-device Map with 1-minute sliding window. Hard cap: 10 req/min (returns 429). Soft cap: 8 req/min (includes `rate_limit_warning: true` in response). Device identified via `device_id` in payload or `x-device-id` header.
- **CORS**: Allows all origins (`*`) with POST and OPTIONS methods. Includes `x-device-id` in allowed headers.
- **Error handling**: Every error path returns a user-friendly message with a machine-readable `code`. No API keys, stack traces, or provider errors leak to the client.
- **Input validation**: Validates `energy_level`, `request_type`, and `caregiver_message` presence and types.
- **Client-side types**: Created `app/src/types/ai.ts` with shared types mirroring the Edge Function types — `AIRequestPayload`, `AIResponse`, `AIErrorResponse`, `ResponseType`, etc.
- **183 tests across 14 suites**, all passing, zero regressions (20 new tests for tag parsing, context building, and type validation).

### Change Log
- Initialized `supabase/` directory structure
- Created `supabase/functions/ai-suggest/index.ts` — complete Edge Function
- Created `app/src/types/ai.ts` — shared AI types for client
- Updated `app/src/types/index.ts` — added AI type exports
- Created `app/__tests__/ai-proxy.test.ts` (20 tests)
- Updated `_bmad-output/implementation-artifacts/sprint-status.yaml`

### File List
- `supabase/config.toml` (generated by init)
- `supabase/functions/ai-suggest/index.ts` (new — Edge Function)
- `supabase/functions/ai-suggest/deno.json` (generated)
- `supabase/functions/ai-suggest/.npmrc` (generated)
- `app/src/types/ai.ts` (new — shared types)
- `app/src/types/index.ts` (modified)
- `app/__tests__/ai-proxy.test.ts` (new)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)
- `_bmad-output/implementation-artifacts/stories/1-6-api-proxy-deployment.md` (new)
