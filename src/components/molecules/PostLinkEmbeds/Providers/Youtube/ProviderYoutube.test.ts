import { describe, it, expect } from 'vitest';
import { Youtube } from './ProviderYoutube';

describe('ProviderYoutube', () => {
  describe('isDomain', () => {
    it('returns true for youtube.com domains', () => {
      expect(Youtube.isDomain('youtube.com')).toBe(true);
      expect(Youtube.isDomain('www.youtube.com')).toBe(true);
      expect(Youtube.isDomain('m.youtube.com')).toBe(true);
      expect(Youtube.isDomain('youtube-nocookie.com')).toBe(true);
      expect(Youtube.isDomain('www.youtube-nocookie.com')).toBe(true);
    });

    it('returns true for youtu.be domain', () => {
      expect(Youtube.isDomain('youtu.be')).toBe(true);
    });

    it('returns false for non-YouTube domains', () => {
      expect(Youtube.isDomain('vimeo.com')).toBe(false);
      expect(Youtube.isDomain('twitch.tv')).toBe(false);
      expect(Youtube.isDomain('example.com')).toBe(false);
    });

    it('is case-insensitive', () => {
      expect(Youtube.isDomain('YouTube.com')).toBe(true);
      expect(Youtube.isDomain('YOUTUBE.COM')).toBe(true);
      expect(Youtube.isDomain('YouTu.be')).toBe(true);
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
  });
});
