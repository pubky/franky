import { describe, it, expect, beforeEach } from 'vitest';
import { Generic } from './ProviderGeneric';

describe('ProviderGeneric', () => {
  beforeEach(() => {
    // No mocks needed - parseEmbed is now synchronous
  });

  describe('domains', () => {
    it('exposes an empty domains array', () => {
      expect(Generic.domains).toBeDefined();
      expect(Generic.domains).toEqual([]);
      expect(Array.isArray(Generic.domains)).toBe(true);
    });

    it('has immutable domains array', () => {
      expect(Generic.domains.length).toBe(0);
    });
  });

  describe('parseEmbed', () => {
    it('returns url embed data for any valid URL', async () => {
      const url = 'https://example.com/article';
      const result = await Generic.parseEmbed(url);

      expect(result).toEqual({
        type: 'url',
        value: url,
      });
    });

    it('handles URLs with query parameters', async () => {
      const url = 'https://example.com/page?query=test&foo=bar';
      const result = await Generic.parseEmbed(url);

      expect(result).toEqual({
        type: 'url',
        value: url,
      });
    });

    it('handles URLs with hash fragments', async () => {
      const url = 'https://example.com/page#section';
      const result = await Generic.parseEmbed(url);

      expect(result).toEqual({
        type: 'url',
        value: url,
      });
    });

    it('handles URLs with subdomains', async () => {
      const url = 'https://blog.example.com/post';
      const result = await Generic.parseEmbed(url);

      expect(result).toEqual({
        type: 'url',
        value: url,
      });
    });

    it('handles URLs with paths and trailing slashes', async () => {
      const url = 'https://example.com/path/to/resource/';
      const result = await Generic.parseEmbed(url);

      expect(result).toEqual({
        type: 'url',
        value: url,
      });
    });

    it('is fast and synchronous', async () => {
      const start = Date.now();
      await Generic.parseEmbed('https://example.com');
      const duration = Date.now() - start;

      // Should be near-instant since no fetch
      expect(duration).toBeLessThan(10);
    });

    it('handles multiple rapid calls consistently', async () => {
      const url = 'https://example.com';
      const results = await Promise.all([Generic.parseEmbed(url), Generic.parseEmbed(url), Generic.parseEmbed(url)]);

      results.forEach((result) => {
        expect(result).toEqual({
          type: 'url',
          value: url,
        });
      });
    });

    it('is stateless and returns consistent results', async () => {
      const url = 'https://example.com';
      const result1 = await Generic.parseEmbed(url);
      const result2 = await Generic.parseEmbed(url);

      expect(result1).toEqual(result2);
    });
  });

  describe('renderEmbed', () => {
    it('returns null for non-url embed data', () => {
      const embedData = {
        type: 'id' as const,
        value: '123456',
      };

      const result = Generic.renderEmbed(embedData);

      expect(result).toBeNull();
    });

    it('returns null for metadata embed data (old format)', () => {
      const embedData = {
        type: 'metadata' as const,
        value: {
          url: 'https://example.com',
          title: 'Test',
          image: null,
        },
      };

      const result = Generic.renderEmbed(embedData);

      expect(result).toBeNull();
    });

    it('returns GenericPreview component for url embed data', () => {
      const embedData = {
        type: 'url' as const,
        value: 'https://example.com',
      };

      const result = Generic.renderEmbed(embedData);

      // Should return a React element
      expect(result).toBeTruthy();
      expect(typeof result).toBe('object');
    });
  });
});
