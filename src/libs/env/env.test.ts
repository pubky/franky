import { describe, it, expect } from 'vitest';
import { Env } from './env';

/**
 * Tests for NEXT_PUBLIC_PKARR_RELAYS parsing
 *
 * The test config sets NEXT_PUBLIC_PKARR_RELAYS='["http://localhost:8080"]'
 * so we verify that the JSON array format is properly parsed.
 */
describe('NEXT_PUBLIC_PKARR_RELAYS parsing', () => {
  it('should parse PKARR_RELAYS as a string array', () => {
    expect(Array.isArray(Env.NEXT_PUBLIC_PKARR_RELAYS)).toBe(true);
  });

  it('should contain valid relay URLs', () => {
    for (const relay of Env.NEXT_PUBLIC_PKARR_RELAYS) {
      expect(typeof relay).toBe('string');
      // Should not throw when parsing as URL
      expect(() => new URL(relay)).not.toThrow();
    }
  });

  it('should match test config value', () => {
    // Test config sets: '["http://localhost:8080"]'
    expect(Env.NEXT_PUBLIC_PKARR_RELAYS).toEqual(['http://localhost:8080']);
  });
});
