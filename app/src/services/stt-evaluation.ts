/**
 * STT Evaluation Utilities
 *
 * Provides latency measurement, accuracy comparison, and result formatting
 * for the STT provider evaluation spike (Story 1.1).
 */

export interface STTResult {
  provider: 'on-device' | 'whisper-api';
  transcript: string;
  latencyMs: number;
  success: boolean;
  error?: string;
}

export interface ComparisonResult {
  sampleId: string;
  sampleDescription: string;
  groundTruth: string;
  onDevice: STTResult;
  whisperApi: STTResult;
  onDeviceAccuracy: number; // 0-100%
  whisperAccuracy: number; // 0-100%
}

export interface EvaluationSummary {
  totalSamples: number;
  onDeviceAvgLatencyMs: number;
  whisperAvgLatencyMs: number;
  onDeviceAvgAccuracy: number;
  whisperAvgAccuracy: number;
  onDeviceSuccessRate: number;
  whisperSuccessRate: number;
  recommendation: 'on-device' | 'whisper-api' | 'inconclusive';
  rationale: string;
}

/**
 * Measures the execution time of an async function in milliseconds.
 */
export async function measureLatency<T>(
  fn: () => Promise<T>
): Promise<{ result: T; latencyMs: number }> {
  const start = Date.now();
  const result = await fn();
  const latencyMs = Date.now() - start;
  return { result, latencyMs };
}

/**
 * Calculates word-level accuracy between transcript and ground truth.
 * Uses simple word overlap percentage (sufficient for spike evaluation).
 *
 * @returns Accuracy as percentage 0-100
 */
export function calculateWordAccuracy(
  transcript: string,
  groundTruth: string
): number {
  if (!groundTruth.trim()) return transcript.trim() ? 0 : 100;
  if (!transcript.trim()) return 0;

  const normalize = (text: string): string[] =>
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);

  const truthWords = normalize(groundTruth);
  const transcriptWords = normalize(transcript);

  if (truthWords.length === 0) return 100;

  // Count matching words (order-independent for simple overlap)
  const truthSet = new Set(truthWords);
  const matchCount = transcriptWords.filter((w) => truthSet.has(w)).length;

  // Accuracy = matched words / ground truth words, capped at 100%
  const accuracy = Math.min(100, (matchCount / truthWords.length) * 100);
  return Math.round(accuracy * 10) / 10;
}

/**
 * Builds a comparison result from two STT results and ground truth.
 */
export function buildComparisonResult(
  sampleId: string,
  sampleDescription: string,
  groundTruth: string,
  onDevice: STTResult,
  whisperApi: STTResult
): ComparisonResult {
  return {
    sampleId,
    sampleDescription,
    groundTruth,
    onDevice,
    whisperApi,
    onDeviceAccuracy: onDevice.success
      ? calculateWordAccuracy(onDevice.transcript, groundTruth)
      : 0,
    whisperAccuracy: whisperApi.success
      ? calculateWordAccuracy(whisperApi.transcript, groundTruth)
      : 0,
  };
}

/**
 * Generates an evaluation summary from a list of comparison results.
 */
export function generateSummary(
  results: ComparisonResult[]
): EvaluationSummary {
  const total = results.length;
  if (total === 0) {
    return {
      totalSamples: 0,
      onDeviceAvgLatencyMs: 0,
      whisperAvgLatencyMs: 0,
      onDeviceAvgAccuracy: 0,
      whisperAvgAccuracy: 0,
      onDeviceSuccessRate: 0,
      whisperSuccessRate: 0,
      recommendation: 'inconclusive',
      rationale: 'No samples evaluated.',
    };
  }

  const onDeviceSuccesses = results.filter((r) => r.onDevice.success);
  const whisperSuccesses = results.filter((r) => r.whisperApi.success);

  const avg = (nums: number[]) =>
    nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;

  const onDeviceAvgLatency = avg(
    onDeviceSuccesses.map((r) => r.onDevice.latencyMs)
  );
  const whisperAvgLatency = avg(
    whisperSuccesses.map((r) => r.whisperApi.latencyMs)
  );
  const onDeviceAvgAccuracy = avg(
    onDeviceSuccesses.map((r) => r.onDeviceAccuracy)
  );
  const whisperAvgAccuracy = avg(
    whisperSuccesses.map((r) => r.whisperAccuracy)
  );

  const onDeviceSuccessRate = (onDeviceSuccesses.length / total) * 100;
  const whisperSuccessRate = (whisperSuccesses.length / total) * 100;

  // Recommendation logic
  let recommendation: 'on-device' | 'whisper-api' | 'inconclusive';
  let rationale: string;

  const accuracyDiff = onDeviceAvgAccuracy - whisperAvgAccuracy;
  const latencyDiff = whisperAvgLatency - onDeviceAvgLatency;

  if (onDeviceAvgAccuracy >= 70 && onDeviceSuccessRate >= 80) {
    if (accuracyDiff >= -10) {
      recommendation = 'on-device';
      rationale = `On-device STT is recommended. Accuracy (${onDeviceAvgAccuracy.toFixed(1)}%) is within acceptable range of Whisper (${whisperAvgAccuracy.toFixed(1)}%). On-device is ${onDeviceAvgLatency.toFixed(0)}ms avg vs Whisper ${whisperAvgLatency.toFixed(0)}ms. Free, offline-capable, no network dependency.`;
    } else {
      recommendation = 'whisper-api';
      rationale = `Whisper API is recommended. Accuracy gap is significant: Whisper ${whisperAvgAccuracy.toFixed(1)}% vs on-device ${onDeviceAvgAccuracy.toFixed(1)}%. Whisper latency (${whisperAvgLatency.toFixed(0)}ms) is acceptable for the <2s target.`;
    }
  } else if (whisperAvgAccuracy >= 70 && whisperSuccessRate >= 80) {
    recommendation = 'whisper-api';
    rationale = `Whisper API is recommended. On-device accuracy (${onDeviceAvgAccuracy.toFixed(1)}%) or success rate (${onDeviceSuccessRate.toFixed(0)}%) is below threshold. Whisper provides ${whisperAvgAccuracy.toFixed(1)}% accuracy with ${whisperSuccessRate.toFixed(0)}% success rate.`;
  } else {
    recommendation = 'inconclusive';
    rationale = `Both providers show issues. On-device: ${onDeviceAvgAccuracy.toFixed(1)}% accuracy, ${onDeviceSuccessRate.toFixed(0)}% success. Whisper: ${whisperAvgAccuracy.toFixed(1)}% accuracy, ${whisperSuccessRate.toFixed(0)}% success. Further investigation needed.`;
  }

  return {
    totalSamples: total,
    onDeviceAvgLatencyMs: Math.round(onDeviceAvgLatency),
    whisperAvgLatencyMs: Math.round(whisperAvgLatency),
    onDeviceAvgAccuracy: Math.round(onDeviceAvgAccuracy * 10) / 10,
    whisperAvgAccuracy: Math.round(whisperAvgAccuracy * 10) / 10,
    onDeviceSuccessRate: Math.round(onDeviceSuccessRate * 10) / 10,
    whisperSuccessRate: Math.round(whisperSuccessRate * 10) / 10,
    recommendation,
    rationale,
  };
}

/**
 * Formats an evaluation summary into a markdown document.
 */
export function formatEvaluationDocument(
  summary: EvaluationSummary,
  results: ComparisonResult[]
): string {
  const lines: string[] = [
    '# STT Provider Evaluation Results',
    '',
    `**Date:** ${new Date().toISOString().split('T')[0]}`,
    `**Story:** 1.1 — STT Provider Evaluation Spike`,
    `**Samples Tested:** ${summary.totalSamples}`,
    '',
    '---',
    '',
    '## Recommendation',
    '',
    `**Provider:** ${summary.recommendation === 'on-device' ? 'On-Device (Apple Speech / Google Speech)' : summary.recommendation === 'whisper-api' ? 'Whisper API' : 'Inconclusive'}`,
    '',
    `**Rationale:** ${summary.rationale}`,
    '',
    '---',
    '',
    '## Summary Metrics',
    '',
    '| Metric | On-Device | Whisper API |',
    '|--------|-----------|-------------|',
    `| Avg Latency (ms) | ${summary.onDeviceAvgLatencyMs} | ${summary.whisperAvgLatencyMs} |`,
    `| Avg Accuracy (%) | ${summary.onDeviceAvgAccuracy} | ${summary.whisperAvgAccuracy} |`,
    `| Success Rate (%) | ${summary.onDeviceSuccessRate} | ${summary.whisperSuccessRate} |`,
    '| Offline Capable | Yes | No |',
    '| Cost per Request | Free | $0.006/min |',
    '',
    '---',
    '',
    '## Detailed Results',
    '',
  ];

  for (const r of results) {
    lines.push(`### Sample: ${r.sampleId} — ${r.sampleDescription}`);
    lines.push('');
    lines.push(`**Ground Truth:** "${r.groundTruth}"`);
    lines.push('');
    lines.push('| Provider | Transcript | Latency | Accuracy | Status |');
    lines.push('|----------|-----------|---------|----------|--------|');
    lines.push(
      `| On-Device | "${r.onDevice.transcript}" | ${r.onDevice.latencyMs}ms | ${r.onDeviceAccuracy}% | ${r.onDevice.success ? 'OK' : `Error: ${r.onDevice.error}`} |`
    );
    lines.push(
      `| Whisper | "${r.whisperApi.transcript}" | ${r.whisperApi.latencyMs}ms | ${r.whisperAccuracy}% | ${r.whisperApi.success ? 'OK' : `Error: ${r.whisperApi.error}`} |`
    );
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## Platform Notes');
  lines.push('');
  lines.push(
    '- **iOS:** Uses SFSpeechRecognizer via expo-speech-recognition. On-device mode requires iOS 13+.'
  );
  lines.push(
    '- **Android:** Uses SpeechRecognizer via expo-speech-recognition. On-device availability varies by device/OS.'
  );
  lines.push(
    '- **Whisper API:** OpenAI endpoint, model whisper-1. Requires network. $0.006/minute.'
  );
  lines.push('');

  return lines.join('\n');
}
