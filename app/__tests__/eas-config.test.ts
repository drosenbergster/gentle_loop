/**
 * Tests for EAS Build configuration
 *
 * Validates: all 3 build profiles exist with env blocks.
 */

import * as fs from 'fs';
import * as path from 'path';

describe('EAS Build Configuration', () => {
  let easConfig: any;

  beforeAll(() => {
    const easPath = path.resolve(__dirname, '..', 'eas.json');
    const raw = fs.readFileSync(easPath, 'utf-8');
    easConfig = JSON.parse(raw);
  });

  it('should have a build section', () => {
    expect(easConfig.build).toBeDefined();
  });

  it('should have a development profile', () => {
    expect(easConfig.build.development).toBeDefined();
  });

  it('should have a preview profile', () => {
    expect(easConfig.build.preview).toBeDefined();
  });

  it('should have a production profile', () => {
    expect(easConfig.build.production).toBeDefined();
  });

  it('development profile should have EXPO_PUBLIC_API_PROXY_URL env', () => {
    expect(easConfig.build.development.env).toBeDefined();
    expect(easConfig.build.development.env.EXPO_PUBLIC_API_PROXY_URL).toBeTruthy();
  });

  it('preview profile should have EXPO_PUBLIC_API_PROXY_URL env', () => {
    expect(easConfig.build.preview.env).toBeDefined();
    expect(easConfig.build.preview.env.EXPO_PUBLIC_API_PROXY_URL).toBeTruthy();
  });

  it('production profile should have EXPO_PUBLIC_API_PROXY_URL env', () => {
    expect(easConfig.build.production.env).toBeDefined();
    expect(easConfig.build.production.env.EXPO_PUBLIC_API_PROXY_URL).toBeTruthy();
  });
});
