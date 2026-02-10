# Handoff Prompt — gentle_loop Implementation Kickoff

> **Copy everything below the line into a new agent session to continue.**

---

## Context

You are picking up the **gentle_loop** project at the start of Phase 4 (Implementation). All planning is complete and validated. Your job is to execute the BMAD implementation workflows to build this app story by story.

**gentle_loop** is a React Native (Expo) mobile app for dementia family caregivers. It provides a calming anchor experience and AI-powered situational guidance through voice interaction. The core loop: open app → see anchor image → hold mic → describe situation → get short AI suggestion → save what works to a personal Toolbox.

## What's Been Completed (Phase 3 — Solutioning)

All planning artifacts are finalized and validated in `_bmad-output/planning-artifacts/`:

- **PRD** (`prd.md`) — 46 functional requirements, 18 non-functional requirements
- **Technical Architecture** (`technical-architecture.md`) — Full stack spec, Zustand stores, API proxy pseudocode, component architecture
- **Epics & Stories** (`epics.md`) — 5 epics, 25 stories with detailed BDD acceptance criteria, enriched by 5 rounds of advanced elicitation (42 improvements applied)
- **UX Design** (`ux-design-specification.md`) — All interaction states, card variants, accessibility, Settings layout
- **AI System Prompt** (`ai-system-prompt-production.md`) — Production LLM prompt with response tagging, energy routing, conversation flow
- **Implementation Readiness Report** (`implementation-readiness-report-2026-02-09.md`) — 100% FR coverage, 0 critical issues, READY status
- **Implementation Handoff** (`implementation-handoff.md`) — Full technical reference for the dev agent

## What To Do Now

Execute these BMAD workflows **in order**. Each workflow has its own instructions file — read and follow it completely.

### Step 1: Sprint Planning

Run the sprint planning workflow to generate the sprint status tracking file.

```
Workflow: _bmad/bmm/workflows/4-implementation/sprint-planning/workflow.yaml
Instructions: _bmad/bmm/workflows/4-implementation/sprint-planning/instructions.md
```

This reads `epics.md`, extracts all 25 stories, and creates `_bmad-output/implementation-artifacts/sprint-status.yaml` with every story in `backlog` status.

### Step 2: Create Story (Story 1.1 — STT Spike)

Run the create-story workflow to transform the first story into a developer-ready story file.

```
Workflow: _bmad/bmm/workflows/4-implementation/create-story/workflow.yaml
Instructions: _bmad/bmm/workflows/4-implementation/create-story/instructions.xml
```

This takes Story 1.1 (STT Provider Evaluation Spike) from epics.md, enriches it with context from all planning artifacts, creates a comprehensive story file in the implementation-artifacts folder, and marks it `ready-for-dev`.

**Story 1.1 is the critical-path first story.** It evaluates on-device STT (Apple Speech / Google Speech) vs. Whisper API. All voice stories depend on this decision. Timeboxed to 2 days.

### Step 3: Dev Story (Implement Story 1.1)

Run the dev-story workflow to implement the story.

```
Workflow: _bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml
Instructions: _bmad/bmm/workflows/4-implementation/dev-story/instructions.xml
```

This picks up the `ready-for-dev` story, follows its tasks/subtasks in red-green-refactor cycle, writes tests, and marks it `review` when complete.

### Step 4: Code Review

Run code-review after implementation (ideally with a different LLM).

```
Workflow: _bmad/bmm/workflows/4-implementation/code-review/workflow.yaml
Instructions: _bmad/bmm/workflows/4-implementation/code-review/instructions.xml
```

### Then Repeat Steps 2–4 for each subsequent story.

## Implementation Order (25 Stories)

Epic 1 Group A (Foundation): 1.1 → 1.2 → 1.3 → 1.4 → 1.5
Epic 1 Group B (Voice+AI): 1.6 → 1.7 → 1.8 (Phase A then B)
Epic 1 Group C (Polish): 1.9 → 1.10 → 1.11 → 1.12 → 1.13
Epic 2 (Onboarding): 2.1 → 2.2 → 2.3
Epic 3 (Energy/Timer): 3.1 → 3.2 → 3.3
Epic 4 (Toolbox UI): 4.1 → 4.2 → 4.3
Epic 5 (Smart Behaviors): 5.1 → 5.2 → 5.3

## Critical Architecture Decisions (Don't Deviate)

1. **Stack:** React Native (Expo), TypeScript, Expo Router, React Native Paper, Zustand, MMKV
2. **No auth, no backend:** Local-first. Only server component is 1 Supabase Edge Function for API proxy.
3. **API key never in client:** LLM key + system prompt live as env vars on the Edge Function.
4. **response_type tags:** LLM prepends `[SUGGESTION]`/`[PAUSE]`/`[QUESTION]`/`[OUT_OF_IDEAS]`. Proxy strips tag, returns `response_type` field. Default to `"suggestion"` if tag missing.
5. **Energy is 3 discrete positions:** "running_low" / "holding_steady" / "ive_got_this". No continuous slider.
6. **Toolbox:** 50 entry cap (MMKV), AI context sends 15 most recent, FIFO when full, warn at 45.
7. **Conversation state is in-memory only:** Zustand, not persisted. App restart = fresh thread.
8. **Conversation truncation:** Keep system prompt + first turn + last 2 turns, drop middle.

## BMAD Config

The BMAD config is at `_bmad/bmm/config.yaml`:
- project_name: gentle_loop
- planning_artifacts: `_bmad-output/planning-artifacts`
- implementation_artifacts: `_bmad-output/implementation-artifacts`
- user_name: Fam
- communication_language: English

## Start Now

Begin by reading and executing the sprint-planning workflow (Step 1 above). After that completes, proceed to create-story for Story 1.1.
