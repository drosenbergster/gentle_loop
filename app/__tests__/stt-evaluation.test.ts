import {
  measureLatency,
  calculateWordAccuracy,
  buildComparisonResult,
  generateSummary,
  formatEvaluationDocument,
  type STTResult,
  type ComparisonResult,
} from '../src/services/stt-evaluation';

describe('measureLatency', () => {
  it('returns result and latency in ms', async () => {
    const { result, latencyMs } = await measureLatency(async () => {
      await new Promise((r) => setTimeout(r, 50));
      return 'done';
    });
    expect(result).toBe('done');
    expect(latencyMs).toBeGreaterThanOrEqual(40);
    expect(latencyMs).toBeLessThan(200);
  });

  it('correctly measures near-instant operations', async () => {
    const { result, latencyMs } = await measureLatency(async () => 42);
    expect(result).toBe(42);
    expect(latencyMs).toBeGreaterThanOrEqual(0);
    expect(latencyMs).toBeLessThan(50);
  });
});

describe('calculateWordAccuracy', () => {
  it('returns 100% for exact match', () => {
    expect(calculateWordAccuracy('hello world', 'hello world')).toBe(100);
  });

  it('returns 100% for case-insensitive match', () => {
    expect(calculateWordAccuracy('Hello World', 'hello world')).toBe(100);
  });

  it('ignores punctuation', () => {
    expect(
      calculateWordAccuracy("hello, world!", "hello world")
    ).toBe(100);
  });

  it('returns 0% for completely wrong transcript', () => {
    expect(calculateWordAccuracy('xyz abc', 'hello world')).toBe(0);
  });

  it('returns 0% for empty transcript with non-empty ground truth', () => {
    expect(calculateWordAccuracy('', 'hello world')).toBe(0);
  });

  it('returns 100% for both empty', () => {
    expect(calculateWordAccuracy('', '')).toBe(100);
  });

  it('calculates partial match correctly', () => {
    // "mom won't eat" vs "mom won't eat dinner" -> 3/4 = 75%
    const accuracy = calculateWordAccuracy("mom won't eat", "mom won't eat dinner");
    expect(accuracy).toBe(75);
  });

  it('handles extra words in transcript (capped at 100%)', () => {
    // transcript has all ground truth words plus extras
    const accuracy = calculateWordAccuracy(
      'hello beautiful world today',
      'hello world'
    );
    expect(accuracy).toBe(100);
  });
});

describe('buildComparisonResult', () => {
  const mockOnDevice: STTResult = {
    provider: 'on-device',
    transcript: 'mom is getting agitated',
    latencyMs: 350,
    success: true,
  };

  const mockWhisper: STTResult = {
    provider: 'whisper-api',
    transcript: 'mom is getting agitated and pacing',
    latencyMs: 1200,
    success: true,
  };

  it('builds a comparison result with accuracy', () => {
    const result = buildComparisonResult(
      'sample-1',
      'Calm description',
      'mom is getting agitated and pacing',
      mockOnDevice,
      mockWhisper
    );

    expect(result.sampleId).toBe('sample-1');
    expect(result.onDeviceAccuracy).toBeGreaterThan(0);
    expect(result.whisperAccuracy).toBe(100);
    expect(result.onDevice.latencyMs).toBe(350);
    expect(result.whisperApi.latencyMs).toBe(1200);
  });

  it('sets accuracy to 0 for failed results', () => {
    const failedResult: STTResult = {
      provider: 'on-device',
      transcript: '',
      latencyMs: 0,
      success: false,
      error: 'Recognition failed',
    };

    const successWhisper: STTResult = {
      provider: 'whisper-api',
      transcript: 'mom is getting agitated and pacing',
      latencyMs: 1200,
      success: true,
    };

    const result = buildComparisonResult(
      'sample-2',
      'Noisy background',
      'mom is getting agitated and pacing',
      failedResult,
      successWhisper
    );

    expect(result.onDeviceAccuracy).toBe(0);
    expect(result.whisperAccuracy).toBe(100);
  });
});

describe('generateSummary', () => {
  const makeResult = (
    onDeviceAccuracy: number,
    whisperAccuracy: number,
    onDeviceLatency: number,
    whisperLatency: number
  ): ComparisonResult => ({
    sampleId: 'test',
    sampleDescription: 'test sample',
    groundTruth: 'test words',
    onDevice: {
      provider: 'on-device',
      transcript: 'test words',
      latencyMs: onDeviceLatency,
      success: true,
    },
    whisperApi: {
      provider: 'whisper-api',
      transcript: 'test words',
      latencyMs: whisperLatency,
      success: true,
    },
    onDeviceAccuracy,
    whisperAccuracy,
  });

  it('recommends on-device when accuracy is acceptable', () => {
    const results = [
      makeResult(85, 90, 300, 1500),
      makeResult(80, 88, 350, 1400),
      makeResult(82, 92, 280, 1600),
    ];

    const summary = generateSummary(results);
    expect(summary.recommendation).toBe('on-device');
    expect(summary.totalSamples).toBe(3);
    expect(summary.onDeviceAvgLatencyMs).toBeLessThan(summary.whisperAvgLatencyMs);
  });

  it('recommends whisper when on-device accuracy is too low', () => {
    const results = [
      makeResult(40, 90, 300, 1500),
      makeResult(45, 88, 350, 1400),
      makeResult(35, 92, 280, 1600),
    ];

    const summary = generateSummary(results);
    expect(summary.recommendation).toBe('whisper-api');
  });

  it('returns inconclusive when both have issues', () => {
    const results = [
      makeResult(40, 45, 300, 1500),
      makeResult(35, 40, 350, 1400),
    ];

    const summary = generateSummary(results);
    expect(summary.recommendation).toBe('inconclusive');
  });

  it('handles empty results', () => {
    const summary = generateSummary([]);
    expect(summary.totalSamples).toBe(0);
    expect(summary.recommendation).toBe('inconclusive');
  });
});

describe('formatEvaluationDocument', () => {
  it('produces markdown with required sections', () => {
    const results: ComparisonResult[] = [
      {
        sampleId: 'S1',
        sampleDescription: 'Calm speech',
        groundTruth: 'hello world',
        onDevice: { provider: 'on-device', transcript: 'hello world', latencyMs: 300, success: true },
        whisperApi: { provider: 'whisper-api', transcript: 'hello world', latencyMs: 1200, success: true },
        onDeviceAccuracy: 100,
        whisperAccuracy: 100,
      },
    ];

    const summary = generateSummary(results);
    const doc = formatEvaluationDocument(summary, results);

    expect(doc).toContain('# STT Provider Evaluation Results');
    expect(doc).toContain('## Recommendation');
    expect(doc).toContain('## Summary Metrics');
    expect(doc).toContain('## Detailed Results');
    expect(doc).toContain('## Platform Notes');
    expect(doc).toContain('Avg Latency');
    expect(doc).toContain('Avg Accuracy');
    expect(doc).toContain('Offline Capable');
    expect(doc).toContain('Cost per Request');
  });
});
