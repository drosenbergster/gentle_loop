import * as fs from 'fs';
import * as path from 'path';

const EVAL_DOC_PATH = path.resolve(
  __dirname,
  '../../_bmad-output/planning-artifacts/stt-evaluation-results.md'
);

describe('STT Evaluation Document', () => {
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(EVAL_DOC_PATH, 'utf-8');
  });

  it('exists at the expected path', () => {
    expect(fs.existsSync(EVAL_DOC_PATH)).toBe(true);
  });

  it('contains the Recommendation section', () => {
    expect(content).toContain('## Recommendation');
  });

  it('contains the Decision Matrix section', () => {
    expect(content).toContain('## Decision Matrix');
  });

  it('contains the Detailed Analysis section', () => {
    expect(content).toContain('## Detailed Analysis');
  });

  it('covers latency analysis', () => {
    expect(content).toContain('Latency');
  });

  it('covers offline capability', () => {
    expect(content).toContain('Offline Capability');
    expect(content).toMatch(/offline/i);
  });

  it('covers accuracy analysis', () => {
    expect(content).toContain('Accuracy');
  });

  it('covers cost analysis', () => {
    expect(content).toContain('Cost');
    expect(content).toContain('$0.006');
  });

  it('contains platform notes', () => {
    expect(content).toContain('Platform Notes');
    expect(content).toContain('iOS');
    expect(content).toContain('Android');
  });

  it('contains a clear provider recommendation', () => {
    expect(content).toMatch(/\*\*Provider:\*\*/);
  });

  it('references the Story 1.1 spike', () => {
    expect(content).toContain('1.1');
    expect(content).toContain('STT Provider Evaluation Spike');
  });

  it('contains the risk mitigation section', () => {
    expect(content).toContain('## Risk Mitigation');
  });

  it('contains the validation plan', () => {
    expect(content).toContain('## Validation Plan');
  });
});
