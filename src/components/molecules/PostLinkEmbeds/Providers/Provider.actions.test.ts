import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchOpenGraphMetadata } from './Provider.actions';

describe('Provider.actions', () => {
  describe('fetchOpenGraphMetadata', () => {
    let mockFetch: ReturnType<typeof vi.fn>;
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
      // Store original fetch
      originalFetch = global.fetch;

      // Create mock fetch
      mockFetch = vi.fn();
      global.fetch = mockFetch as unknown as typeof fetch;

      // Reset all mocks
      vi.clearAllMocks();
    });

    afterEach(() => {
      // Restore original fetch
      global.fetch = originalFetch;
      vi.restoreAllMocks();
    });

    describe('input validation', () => {
      it('returns null for empty string', async () => {
        const result = await fetchOpenGraphMetadata('');
        expect(result).toBeNull();
        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('returns null for non-string input', async () => {
        // @ts-expect-error - testing runtime behavior
        const result = await fetchOpenGraphMetadata(123);
        expect(result).toBeNull();
        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('returns null for null input', async () => {
        // @ts-expect-error - testing runtime behavior
        const result = await fetchOpenGraphMetadata(null);
        expect(result).toBeNull();
        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('returns null for undefined input', async () => {
        // @ts-expect-error - testing runtime behavior
        const result = await fetchOpenGraphMetadata(undefined);
        expect(result).toBeNull();
        expect(mockFetch).not.toHaveBeenCalled();
      });
    });

    describe('URL safety checks', () => {
      it('returns null for localhost URLs', async () => {
        const result = await fetchOpenGraphMetadata('http://localhost:3000');
        expect(result).toBeNull();
        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('returns null for private IP addresses', async () => {
        const result = await fetchOpenGraphMetadata('http://192.168.1.1');
        expect(result).toBeNull();
        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('proceeds to fetch for valid public URLs', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({
            'content-type': 'text/html',
          }),
          text: async () => '<html><head><title>Test</title></head></html>',
        });

        await fetchOpenGraphMetadata('https://example.com');
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    describe('fetch behavior', () => {
      it('includes correct headers in fetch request', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({
            'content-type': 'text/html',
          }),
          text: async () => '<html><head><title>Test</title></head></html>',
        });

        await fetchOpenGraphMetadata('https://example.com');

        expect(mockFetch).toHaveBeenCalledWith(
          'https://example.com',
          expect.objectContaining({
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
              Accept: 'text/html',
            },
            redirect: 'follow',
            next: { revalidate: 3600 },
          }),
        );
      });

      it('includes AbortController signal for timeout', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({
            'content-type': 'text/html',
          }),
          text: async () => '<html><head><title>Test</title></head></html>',
        });

        await fetchOpenGraphMetadata('https://example.com');

        expect(mockFetch).toHaveBeenCalledWith(
          'https://example.com',
          expect.objectContaining({
            signal: expect.any(AbortSignal),
          }),
        );
      });

      it('returns null when fetch is aborted (timeout)', async () => {
        mockFetch.mockRejectedValue(new Error('AbortError'));

        const result = await fetchOpenGraphMetadata('https://slow-site.com');
        expect(result).toBeNull();
      });

      it('returns null when network error occurs', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toBeNull();
      });
    });

    describe('response validation', () => {
      it('returns null when response is not ok', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          headers: new Headers(),
        });

        const result = await fetchOpenGraphMetadata('https://example.com/not-found');
        expect(result).toBeNull();
      });

      it('returns null when content-type is missing', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers(),
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toBeNull();
      });

      it('returns null when content-type is not text/html', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({
            'content-type': 'application/json',
          }),
        });

        const result = await fetchOpenGraphMetadata('https://example.com/api');
        expect(result).toBeNull();
      });

      it('accepts content-type with charset', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({
            'content-type': 'text/html; charset=utf-8',
          }),
          text: async () => '<html><head><title>Test</title></head></html>',
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).not.toBeNull();
      });

      it('returns null when content-length exceeds 5MB limit', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({
            'content-type': 'text/html',
            'content-length': String(6 * 1024 * 1024), // 6MB
          }),
        });

        const result = await fetchOpenGraphMetadata('https://example.com/huge-page');
        expect(result).toBeNull();
      });

      it('proceeds when content-length is exactly 5MB', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({
            'content-type': 'text/html',
            'content-length': String(5 * 1024 * 1024), // 5MB
          }),
          text: async () => '<html><head><title>Large Page</title></head></html>',
        });

        const result = await fetchOpenGraphMetadata('https://example.com/large');
        expect(result).not.toBeNull();
      });

      it('proceeds when content-length is not present', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({
            'content-type': 'text/html',
          }),
          text: async () => '<html><head><title>No Length Header</title></head></html>',
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).not.toBeNull();
      });
    });

    describe('OpenGraph metadata extraction', () => {
      it('extracts og:title from property attribute', async () => {
        const html = `
          <html>
            <head>
              <meta property="og:title" content="OpenGraph Title" />
            </head>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toEqual({
          url: 'https://example.com',
          title: 'OpenGraph Title',
          image: null,
        });
      });

      it('extracts og:title from name attribute as fallback', async () => {
        const html = `
          <html>
            <head>
              <meta name="og:title" content="Name Attribute Title" />
            </head>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toEqual({
          url: 'https://example.com',
          title: 'Name Attribute Title',
          image: null,
        });
      });

      it('falls back to title tag when og:title is missing', async () => {
        const html = `
          <html>
            <head>
              <title>Page Title</title>
            </head>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toEqual({
          url: 'https://example.com',
          title: 'Page Title',
          image: null,
        });
      });

      it('trims whitespace from title', async () => {
        const html = `
          <html>
            <head>
              <title>  Title With Whitespace  </title>
            </head>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toEqual({
          url: 'https://example.com',
          title: 'Title With Whitespace',
          image: null,
        });
      });

      it('returns null title when no title metadata exists', async () => {
        const html = '<html><head></head></html>';

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toEqual({
          url: 'https://example.com',
          title: null,
          image: null,
        });
      });

      it('extracts og:image from property attribute', async () => {
        const html = `
          <html>
            <head>
              <meta property="og:image" content="https://example.com/image.jpg" />
            </head>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toEqual({
          url: 'https://example.com',
          title: null,
          image: 'https://example.com/image.jpg',
        });
      });

      it('extracts og:image from name attribute as fallback', async () => {
        const html = `
          <html>
            <head>
              <meta name="og:image" content="https://example.com/image.png" />
            </head>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toEqual({
          url: 'https://example.com',
          title: null,
          image: 'https://example.com/image.png',
        });
      });

      it('extracts both title and image', async () => {
        const html = `
          <html>
            <head>
              <meta property="og:title" content="Full Metadata" />
              <meta property="og:image" content="https://example.com/full.jpg" />
            </head>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toEqual({
          url: 'https://example.com',
          title: 'Full Metadata',
          image: 'https://example.com/full.jpg',
        });
      });
    });

    describe('image URL normalization', () => {
      it('converts relative image URL to absolute URL', async () => {
        const html = `
          <html>
            <head>
              <meta property="og:image" content="/images/photo.jpg" />
            </head>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toEqual({
          url: 'https://example.com',
          title: null,
          image: 'https://example.com/images/photo.jpg',
        });
      });

      it('converts relative image URL without leading slash', async () => {
        const html = `
          <html>
            <head>
              <meta property="og:image" content="photo.jpg" />
            </head>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com/page');
        expect(result).toEqual({
          url: 'https://example.com/page',
          title: null,
          image: 'https://example.com/photo.jpg',
        });
      });

      it('validates absolute image URLs', async () => {
        const html = `
          <html>
            <head>
              <meta property="og:image" content="https://cdn.example.com/image.jpg" />
            </head>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toEqual({
          url: 'https://example.com',
          title: null,
          image: 'https://cdn.example.com/image.jpg',
        });
      });

      it('returns null image when absolute URL points to localhost', async () => {
        const html = `
          <html>
            <head>
              <meta property="og:image" content="http://localhost:3000/image.jpg" />
            </head>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toEqual({
          url: 'https://example.com',
          title: null,
          image: null,
        });
      });

      it('handles malformed image URLs gracefully', async () => {
        const html = `
          <html>
            <head>
              <meta property="og:image" content="not a valid url at all" />
            </head>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toEqual({
          url: 'https://example.com',
          title: null,
          image: 'https://example.com/not%20a%20valid%20url%20at%20all',
        });
      });
    });

    describe('error handling', () => {
      it('returns null when HTML parsing fails', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => {
            throw new Error('Failed to read response body');
          },
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toBeNull();
      });

      it('returns null when fetch throws an error', async () => {
        mockFetch.mockRejectedValue(new Error('DNS resolution failed'));

        const result = await fetchOpenGraphMetadata('https://nonexistent-domain.xyz');
        expect(result).toBeNull();
      });

      it('handles cheerio parsing errors gracefully', async () => {
        // Return malformed HTML that might cause parsing issues
        const html = '<html><head><meta property="og:title" content=';

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        // Should not throw, cheerio is resilient but we should handle gracefully
        expect(result).toBeDefined();
      });
    });

    describe('edge cases', () => {
      it('handles empty HTML document', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => '',
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toEqual({
          url: 'https://example.com',
          title: null,
          image: null,
        });
      });

      it('handles HTML with only whitespace', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => '   \n\t  ',
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toEqual({
          url: 'https://example.com',
          title: null,
          image: null,
        });
      });

      it('handles empty og:title content', async () => {
        const html = `
          <html>
            <head>
              <meta property="og:title" content="" />
            </head>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toEqual({
          url: 'https://example.com',
          title: null,
          image: null,
        });
      });

      it('handles empty og:image content', async () => {
        const html = `
          <html>
            <head>
              <meta property="og:image" content="" />
            </head>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toEqual({
          url: 'https://example.com',
          title: null,
          image: null,
        });
      });

      it('prioritizes og:title over regular title tag', async () => {
        const html = `
          <html>
            <head>
              <title>Regular Title</title>
              <meta property="og:title" content="OpenGraph Title" />
            </head>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result?.title).toBe('OpenGraph Title');
      });

      it('handles multiple og:title tags (uses first one)', async () => {
        const html = `
          <html>
            <head>
              <meta property="og:title" content="First Title" />
              <meta property="og:title" content="Second Title" />
            </head>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result?.title).toBe('First Title');
      });

      it('handles URLs with query parameters', async () => {
        const html = '<html><head><title>Query Params</title></head></html>';

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com/page?foo=bar&baz=qux');
        expect(result).toEqual({
          url: 'https://example.com/page?foo=bar&baz=qux',
          title: 'Query Params',
          image: null,
        });
      });

      it('handles URLs with hash fragments', async () => {
        const html = '<html><head><title>Hash Fragment</title></head></html>';

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com/page#section');
        expect(result).toEqual({
          url: 'https://example.com/page#section',
          title: 'Hash Fragment',
          image: null,
        });
      });
    });

    describe('real-world scenarios', () => {
      it('handles typical blog post with full metadata', async () => {
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>How to Test Server Actions | Dev Blog</title>
              <meta property="og:title" content="How to Test Server Actions" />
              <meta property="og:image" content="https://cdn.example.com/blog/testing-guide.jpg" />
              <meta property="og:description" content="Learn best practices for testing Next.js server actions" />
            </head>
            <body>
              <article>Content here</article>
            </body>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com/blog/testing-guide');
        expect(result).toEqual({
          url: 'https://example.com/blog/testing-guide',
          title: 'How to Test Server Actions',
          image: 'https://cdn.example.com/blog/testing-guide.jpg',
        });
      });

      it('handles page with only title tag (no OpenGraph)', async () => {
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Simple Page</title>
            </head>
            <body>
              <h1>Welcome</h1>
            </body>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        expect(result).toEqual({
          url: 'https://example.com',
          title: 'Simple Page',
          image: null,
        });
      });

      it('handles page with protocol-relative image URL', async () => {
        const html = `
          <html>
            <head>
              <meta property="og:image" content="//cdn.example.com/image.jpg" />
            </head>
          </html>
        `;

        mockFetch.mockResolvedValue({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => html,
        });

        const result = await fetchOpenGraphMetadata('https://example.com');
        // Protocol-relative URLs (starting with //) inherit the protocol from the base URL
        // They are correctly converted to absolute URLs: //cdn.example.com -> https://cdn.example.com
        expect(result).toEqual({
          url: 'https://example.com',
          title: null,
          image: 'https://cdn.example.com/image.jpg',
        });
      });
    });
  });
});
