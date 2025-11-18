import { describe, it, expect } from 'vitest';
import { Youtube } from './ProviderYoutube';

describe('ProviderYoutube', () => {
  describe('domains', () => {
    it('exposes list of supported YouTube domains', () => {
      expect(Youtube.domains).toBeDefined();
      expect(Youtube.domains.length).toBeGreaterThan(0);
      expect(Youtube.domains).toContain('youtube.com');
      expect(Youtube.domains).toContain('www.youtube.com');
      expect(Youtube.domains).toContain('youtu.be');
      expect(Youtube.domains).toContain('m.youtube.com');
      expect(Youtube.domains).toContain('youtube-nocookie.com');
      expect(Youtube.domains).toContain('www.youtube-nocookie.com');
    });

    it('has all domains in lowercase', () => {
      Youtube.domains.forEach((domain) => {
        expect(domain).toBe(domain.toLowerCase());
      });
    });
  });

  describe('parseEmbed', () => {
    describe('valid YouTube URLs', () => {
      it('parses standard watch URL', () => {
        const result = Youtube.parseEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        expect(result).toEqual({
          url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        });
      });

      it('parses youtu.be short URL', () => {
        const result = Youtube.parseEmbed('https://youtu.be/dQw4w9WgXcQ');
        expect(result).toEqual({
          url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        });
      });

      it('parses shorts URL', () => {
        const result = Youtube.parseEmbed('https://www.youtube.com/shorts/dQw4w9WgXcQ');
        expect(result).toEqual({
          url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        });
      });

      it('parses live stream URL', () => {
        const result = Youtube.parseEmbed('https://www.youtube.com/live/dQw4w9WgXcQ');
        expect(result).toEqual({
          url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        });
      });

      it('parses embed URL', () => {
        const result = Youtube.parseEmbed('https://www.youtube.com/embed/dQw4w9WgXcQ');
        expect(result).toEqual({
          url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        });
      });

      it('parses mobile URL', () => {
        const result = Youtube.parseEmbed('https://m.youtube.com/watch?v=dQw4w9WgXcQ');
        expect(result).toEqual({
          url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        });
      });
    });

    describe('timestamps', () => {
      it('parses timestamp in seconds format (123s)', () => {
        const result = Youtube.parseEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=123s');
        expect(result).toEqual({
          url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=123',
        });
      });

      it('parses timestamp in h/m/s format (1h2m3s)', () => {
        const result = Youtube.parseEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1h2m3s');
        expect(result).toEqual({
          url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=3723',
        });
      });

      it('parses timestamp as plain number', () => {
        const result = Youtube.parseEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90');
        expect(result).toEqual({
          url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=90',
        });
      });

      it('parses timestamp in partial h/m/s format (2m30s)', () => {
        const result = Youtube.parseEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=2m30s');
        expect(result).toEqual({
          url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=150',
        });
      });

      it('parses timestamp on youtu.be URL', () => {
        const result = Youtube.parseEmbed('https://youtu.be/dQw4w9WgXcQ?t=123');
        expect(result).toEqual({
          url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=123',
        });
      });
    });

    describe('invalid URLs', () => {
      it('returns null for video ID shorter than 11 characters', () => {
        const result = Youtube.parseEmbed('https://www.youtube.com/watch?v=dQw4w9WgXc');
        expect(result).toBeNull();
      });

      it('returns null for video ID longer than 11 characters', () => {
        const result = Youtube.parseEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQQ');
        expect(result).toBeNull();
      });

      it('returns null for video ID with invalid characters', () => {
        const result = Youtube.parseEmbed('https://www.youtube.com/watch?v=dQw4w9WgX@!');
        expect(result).toBeNull();
      });

      it('returns null for URL without video ID', () => {
        const result = Youtube.parseEmbed('https://www.youtube.com/channel/UC123');
        expect(result).toBeNull();
      });

      it('returns null for non-YouTube URL', () => {
        const result = Youtube.parseEmbed('https://vimeo.com/123456789');
        expect(result).toBeNull();
      });
    });

    describe('malformed URLs', () => {
      it('handles malformed URLs gracefully without crashing', () => {
        // These should not crash, even if URL parser fails
        const malformedUrls = [
          'not-a-url-at-all',
          'ht!tp://invalid',
          'javascript:alert(1)',
          'data:text/html,<script>alert(1)</script>',
          '://missing-protocol',
          'https://',
          'https://youtube.com/watch?v=',
          'youtube.com/watch?v=<script>alert(1)</script>',
        ];

        malformedUrls.forEach((url) => {
          expect(() => Youtube.parseEmbed(url)).not.toThrow();
          const result = Youtube.parseEmbed(url);
          expect(result).toBeNull();
        });
      });

      it('handles URLs with invalid timestamp formats gracefully', () => {
        const invalidTimestamps = [
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=invalid',
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=',
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=hms',
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=-123',
        ];

        invalidTimestamps.forEach((url) => {
          expect(() => Youtube.parseEmbed(url)).not.toThrow();
          const result = Youtube.parseEmbed(url);
          // Should still return valid embed URL without timestamp
          expect(result).toEqual({
            url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
          });
        });
      });
    });

    describe('security: XSS attempts', () => {
      it('rejects video IDs containing script tags', () => {
        const xssAttempts = [
          'https://www.youtube.com/watch?v=<script>alert(1)</script>',
          'https://youtu.be/<script>',
          'https://www.youtube.com/watch?v="><script>alert(1)</script>',
        ];

        xssAttempts.forEach((url) => {
          const result = Youtube.parseEmbed(url);
          expect(result).toBeNull();
        });
      });

      it('rejects video IDs containing HTML entities', () => {
        const htmlEntityAttempts = [
          'https://www.youtube.com/watch?v=&lt;script&gt;',
          'https://www.youtube.com/watch?v=&quot;&gt;&lt;',
        ];

        htmlEntityAttempts.forEach((url) => {
          const result = Youtube.parseEmbed(url);
          expect(result).toBeNull();
        });
      });

      it('only accepts alphanumeric, dash, and underscore in video IDs', () => {
        const validId = 'dQw4w9WgXcQ';
        const validWithDash = 'dQw4w9WgX-Q';
        const validWithUnderscore = 'dQw4w9WgX_Q';

        expect(Youtube.parseEmbed(`https://www.youtube.com/watch?v=${validId}`)).not.toBeNull();
        expect(Youtube.parseEmbed(`https://www.youtube.com/watch?v=${validWithDash}`)).not.toBeNull();
        expect(Youtube.parseEmbed(`https://www.youtube.com/watch?v=${validWithUnderscore}`)).not.toBeNull();

        // Invalid characters should be rejected
        const invalidChars = ['<', '>', '"', "'", '&', ';', '(', ')', '{', '}', '[', ']'];
        invalidChars.forEach((char) => {
          const maliciousId = `dQw4w9WgXc${char}`;
          const result = Youtube.parseEmbed(`https://www.youtube.com/watch?v=${maliciousId}`);
          expect(result).toBeNull();
        });
      });
    });

    describe('concurrent/rapid changes', () => {
      it('handles multiple rapid parseEmbed calls consistently', () => {
        const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        const results = Array.from({ length: 100 }, () => Youtube.parseEmbed(url));

        // All results should be identical
        results.forEach((result) => {
          expect(result).toEqual({
            url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
          });
        });
      });

      it('handles alternating valid/invalid URLs consistently', () => {
        const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        const invalidUrl = 'https://www.youtube.com/watch?v=invalid';

        for (let i = 0; i < 50; i++) {
          const validResult = Youtube.parseEmbed(validUrl);
          const invalidResult = Youtube.parseEmbed(invalidUrl);

          expect(validResult).toEqual({
            url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
          });
          expect(invalidResult).toBeNull();
        }
      });

      it('parseEmbed is stateless and returns consistent results', () => {
        const url1 = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        const url2 = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';

        const result1a = Youtube.parseEmbed(url1);
        const result2 = Youtube.parseEmbed(url2);
        const result1b = Youtube.parseEmbed(url1);

        // Results should not be affected by previous calls
        expect(result1a).toEqual(result1b);
        expect(result1a).toEqual({
          url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        });
        expect(result2).toEqual({
          url: 'https://www.youtube-nocookie.com/embed/jNQXAC9IVRw',
        });
      });
    });
  });
});
