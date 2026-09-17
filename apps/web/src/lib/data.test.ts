import { describe, expect, it } from 'vitest';
import { isSeedFallbackEnabled } from './data';

describe('seed fallback policy', () => {
  it('is available during development', () => expect(isSeedFallbackEnabled(true, undefined)).toBe(true));
  it('requires explicit opt-in outside development', () => {
    expect(isSeedFallbackEnabled(false, undefined)).toBe(false);
    expect(isSeedFallbackEnabled(false, 'true')).toBe(true);
  });
});
