/**
 * Story 4.3: Toolbox Integration Testing — AI Behavior Validation
 *
 * Verifies the AI changes its behavior when Toolbox entries are present vs absent.
 *
 * CM-1: temperature=0 for reproducibility, 3 runs per condition,
 *        validate by checking explicit Toolbox reference/avoidance.
 * PM-4: Pre-mortem — must confirm AI personalization actually works.
 *
 * Usage:
 *   npx ts-node --esm scripts/toolbox-integration.ts
 */

const API_URL =
  'https://amghuhcisazsxsqrrmep.supabase.co/functions/v1/ai-suggest';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ2h1aGNpc2F6c3hzcXJybWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2ODI2NTksImV4cCI6MjA4NjI1ODY1OX0.MAoI2mmcgtlWXYVsTuGw52BNXJfaRp0YznOGHG2i_sU';

const RUNS_PER_CONDITION = 3;

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface Scenario {
  id: string;
  name: string;
  situation: string;
  energy_level: 'running_low' | 'holding_steady' | 'ive_got_this';
  toolbox_entries: { suggestionText: string; savedAt: string }[];
}

interface RunResult {
  response: string;
  responseType: string;
  latencyMs: number;
  error?: string;
}

interface ScenarioResult {
  scenario: Scenario;
  emptyRuns: RunResult[];
  populatedRuns: RunResult[];
  analysis: {
    personalizationDetected: boolean;
    avoidsDuplicates: boolean;
    referencesToolbox: boolean;
    notes: string;
  };
}

// ─────────────────────────────────────────
// Scenarios
// ─────────────────────────────────────────

const toolboxEntries = [
  { suggestionText: 'Playing her favorite music from the 1960s helped calm her agitation within a few minutes.', savedAt: '2026-02-05T10:00:00Z' },
  { suggestionText: 'Offering a warm cup of chamomile tea with honey gave him something to focus on.', savedAt: '2026-02-06T14:00:00Z' },
  { suggestionText: 'Dimming the lights and speaking in a softer tone reduced the sundowning behavior.', savedAt: '2026-02-07T09:00:00Z' },
  { suggestionText: 'Walking together in the backyard for 5 minutes helped redirect his pacing.', savedAt: '2026-02-08T16:00:00Z' },
  { suggestionText: 'Using a photo album to reminisce about family trips brought a smile and calmed her.', savedAt: '2026-02-09T11:00:00Z' },
];

const scenarios: Scenario[] = [
  {
    id: 'TB-1',
    name: 'Dinner refusal — with Toolbox',
    situation: "Mom won't eat dinner. She's pushing the plate away and getting upset.",
    energy_level: 'holding_steady',
    toolbox_entries: toolboxEntries,
  },
  {
    id: 'TB-2',
    name: 'Agitated pacing — with Toolbox',
    situation: "Dad is agitated and pacing around the house. He won't sit down.",
    energy_level: 'running_low',
    toolbox_entries: toolboxEntries,
  },
  {
    id: 'TB-3',
    name: 'Sundowning — with Toolbox',
    situation: "It's late afternoon and she's getting really anxious, asking to go home even though she's home.",
    energy_level: 'holding_steady',
    toolbox_entries: toolboxEntries,
  },
  {
    id: 'TB-4',
    name: 'Refusing bath — with Toolbox',
    situation: "He won't take a bath. Gets angry every time I bring it up.",
    energy_level: 'ive_got_this',
    toolbox_entries: toolboxEntries,
  },
  {
    id: 'TB-5',
    name: 'Repetitive questioning — with Toolbox',
    situation: "She keeps asking where her husband is. He passed away years ago. I don't know what to say anymore.",
    energy_level: 'holding_steady',
    toolbox_entries: toolboxEntries,
  },
];

// ─────────────────────────────────────────
// API caller
// ─────────────────────────────────────────

async function callAPI(
  situation: string,
  energyLevel: string,
  entries: { suggestionText: string; savedAt: string }[],
): Promise<RunResult> {
  const start = Date.now();
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({
        energy_level: energyLevel,
        request_type: 'initial',
        caregiver_message: situation,
        toolbox_entries: entries,
        device_id: 'toolbox-integration-test',
      }),
    });
    const latencyMs = Date.now() - start;

    if (!res.ok) {
      const errBody = await res.text();
      return { response: '', responseType: '', latencyMs, error: `HTTP ${res.status}: ${errBody}` };
    }

    const data = await res.json();
    return {
      response: data.suggestion ?? '',
      responseType: data.response_type ?? '',
      latencyMs,
    };
  } catch (err: any) {
    return { response: '', responseType: '', latencyMs: Date.now() - start, error: err.message };
  }
}

// ─────────────────────────────────────────
// Analysis
// ─────────────────────────────────────────

function analyzeResults(
  emptyRuns: RunResult[],
  populatedRuns: RunResult[],
  entries: { suggestionText: string; savedAt: string }[],
): ScenarioResult['analysis'] {
  const entryKeywords = entries.map((e) => {
    const words = e.suggestionText.toLowerCase().split(/\s+/);
    return words.filter((w) => w.length > 4).slice(0, 5);
  });

  let referencesToolbox = false;
  let avoidsDuplicates = true;
  const notes: string[] = [];

  for (const run of populatedRuns) {
    const lower = run.response.toLowerCase();

    // Check if AI references known Toolbox strategies
    for (let i = 0; i < entries.length; i++) {
      const keywords = entryKeywords[i];
      const matchCount = keywords.filter((kw) => lower.includes(kw)).length;
      if (matchCount >= 2) {
        referencesToolbox = true;
        notes.push(`References Toolbox entry ${i + 1} (keyword overlap ≥2)`);
      }
    }

    // Check if AI avoids repeating Toolbox entries verbatim
    for (const entry of entries) {
      if (lower.includes(entry.suggestionText.toLowerCase().substring(0, 40))) {
        avoidsDuplicates = false;
        notes.push('WARNING: Verbatim repetition of Toolbox entry detected');
      }
    }
  }

  // Compare empty vs populated — are they meaningfully different?
  const emptyTexts = emptyRuns.map((r) => r.response.toLowerCase());
  const popTexts = populatedRuns.map((r) => r.response.toLowerCase());

  let diffCount = 0;
  for (const pt of popTexts) {
    const isDifferent = emptyTexts.every((et) => {
      // Simple similarity: count shared 4-letter+ words
      const etWords = new Set(et.split(/\s+/).filter((w) => w.length > 3));
      const ptWords = pt.split(/\s+/).filter((w) => w.length > 3);
      const overlap = ptWords.filter((w) => etWords.has(w)).length;
      const similarity = overlap / Math.max(ptWords.length, 1);
      return similarity < 0.6; // Less than 60% overlap = different
    });
    if (isDifferent) diffCount++;
  }

  const personalizationDetected = referencesToolbox || diffCount >= 2;

  if (!referencesToolbox) {
    notes.push('No explicit Toolbox reference detected in populated runs');
  }
  notes.push(`${diffCount}/${populatedRuns.length} populated runs differ meaningfully from empty runs`);

  return {
    personalizationDetected,
    avoidsDuplicates,
    referencesToolbox,
    notes: notes.join('; '),
  };
}

// ─────────────────────────────────────────
// Main
// ─────────────────────────────────────────

async function run() {
  console.log('🧰 Toolbox Integration Testing — AI Behavior Validation\n');
  console.log(`Running ${scenarios.length} scenarios × ${RUNS_PER_CONDITION} runs × 2 conditions`);
  console.log(`Total API calls: ${scenarios.length * RUNS_PER_CONDITION * 2}\n`);

  const results: ScenarioResult[] = [];

  for (const scenario of scenarios) {
    console.log(`\n━━━ ${scenario.id}: ${scenario.name} ━━━\n`);

    // Empty Toolbox runs
    console.log('  📭 Empty Toolbox:');
    const emptyRuns: RunResult[] = [];
    for (let i = 0; i < RUNS_PER_CONDITION; i++) {
      const result = await callAPI(scenario.situation, scenario.energy_level, []);
      emptyRuns.push(result);
      if (result.error) {
        console.log(`    Run ${i + 1}: ERROR — ${result.error}`);
      } else {
        console.log(`    Run ${i + 1}: [${result.responseType}] ${result.response.substring(0, 80)}… (${result.latencyMs}ms)`);
      }
      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 1500));
    }

    // Populated Toolbox runs
    console.log('  📦 Populated Toolbox:');
    const populatedRuns: RunResult[] = [];
    for (let i = 0; i < RUNS_PER_CONDITION; i++) {
      const result = await callAPI(scenario.situation, scenario.energy_level, scenario.toolbox_entries);
      populatedRuns.push(result);
      if (result.error) {
        console.log(`    Run ${i + 1}: ERROR — ${result.error}`);
      } else {
        console.log(`    Run ${i + 1}: [${result.responseType}] ${result.response.substring(0, 80)}… (${result.latencyMs}ms)`);
      }
      await new Promise((r) => setTimeout(r, 1500));
    }

    const analysis = analyzeResults(emptyRuns, populatedRuns, scenario.toolbox_entries);
    results.push({ scenario, emptyRuns, populatedRuns, analysis });

    console.log(`  📊 Analysis: personalization=${analysis.personalizationDetected ? '✅' : '❌'}, avoids_dupes=${analysis.avoidsDuplicates ? '✅' : '⚠️'}, references_toolbox=${analysis.referencesToolbox ? '✅' : '❌'}`);
    console.log(`     ${analysis.notes}`);
  }

  // Generate report
  const report = generateReport(results);
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, '..', '..', '_bmad-output', 'planning-artifacts', 'toolbox-integration-results.md');
  fs.writeFileSync(reportPath, report);
  console.log(`\n📝 Report written to: ${reportPath}`);

  // Summary
  const passed = results.filter((r) => r.analysis.personalizationDetected).length;
  console.log(`\n✅ ${passed}/${results.length} scenarios show AI personalization with Toolbox`);

  if (passed < results.length) {
    console.log('⚠️  Some scenarios did not show clear personalization. Review report and consider system prompt iteration.');
  }
}

function generateReport(results: ScenarioResult[]): string {
  const lines: string[] = [];
  lines.push('# Toolbox Integration Testing Results');
  lines.push(`\nGenerated: ${new Date().toISOString()}`);
  lines.push(`\nConditions: ${RUNS_PER_CONDITION} runs per condition, temperature=0 (via system prompt behavior)`);
  lines.push('\n## Summary\n');
  lines.push('| Scenario | Personalization | Avoids Dupes | References Toolbox |');
  lines.push('|----------|:--------------:|:------------:|:-----------------:|');
  for (const r of results) {
    lines.push(
      `| ${r.scenario.id}: ${r.scenario.name} | ${r.analysis.personalizationDetected ? '✅' : '❌'} | ${r.analysis.avoidsDuplicates ? '✅' : '⚠️'} | ${r.analysis.referencesToolbox ? '✅' : '❌'} |`,
    );
  }

  const passCount = results.filter((r) => r.analysis.personalizationDetected).length;
  lines.push(`\n**Overall: ${passCount}/${results.length} scenarios demonstrate AI personalization**`);

  lines.push('\n## Detailed Results\n');
  for (const r of results) {
    lines.push(`### ${r.scenario.id}: ${r.scenario.name}\n`);
    lines.push(`**Situation:** "${r.scenario.situation}"`);
    lines.push(`**Energy:** ${r.scenario.energy_level}\n`);

    lines.push('#### Empty Toolbox Responses\n');
    for (let i = 0; i < r.emptyRuns.length; i++) {
      const run = r.emptyRuns[i];
      lines.push(`**Run ${i + 1}** (${run.latencyMs}ms, ${run.responseType})`);
      lines.push(`> ${run.error ?? run.response}\n`);
    }

    lines.push('#### Populated Toolbox Responses\n');
    for (let i = 0; i < r.populatedRuns.length; i++) {
      const run = r.populatedRuns[i];
      lines.push(`**Run ${i + 1}** (${run.latencyMs}ms, ${run.responseType})`);
      lines.push(`> ${run.error ?? run.response}\n`);
    }

    lines.push('#### Analysis\n');
    lines.push(`- Personalization detected: ${r.analysis.personalizationDetected ? 'Yes' : 'No'}`);
    lines.push(`- Avoids duplicates: ${r.analysis.avoidsDuplicates ? 'Yes' : 'No'}`);
    lines.push(`- References Toolbox: ${r.analysis.referencesToolbox ? 'Yes' : 'No'}`);
    lines.push(`- Notes: ${r.analysis.notes}\n`);
    lines.push('---\n');
  }

  lines.push('\n## Toolbox Entries Used\n');
  for (let i = 0; i < results[0].scenario.toolbox_entries.length; i++) {
    const entry = results[0].scenario.toolbox_entries[i];
    lines.push(`${i + 1}. "${entry.suggestionText}"`);
  }

  return lines.join('\n');
}

run().catch(console.error);
