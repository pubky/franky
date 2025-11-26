import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchOpenGraphMetadata } from './Provider.actions';

/**
 * Tests for fetchOpenGraphMetadata Server Action
 *
 * This function now delegates to /api/og-metadata for security.
 * Security tests (SSRF, DNS rebinding, etc.) are in route.test.ts.
 * These tests verify the delegation behavior and response handling.
 */
describe('Provider.actions', () => {
  describe('fetchOpenGraphMetadata', () => {
    let mockFetch: ReturnType<typeof vi.fn>;
    let originalFetch: typeof global.fetch;
    let originalEnv: string | undefined;

    beforeEach(() => {
      // Store original fetch and env
      originalFetch = global.fetch;
      originalEnv = process.env.NEXT_PUBLIC_APP_URL;

      // Create mock fetch
      mockFetch = vi.fn();
      global.fetch = mockFetch as unknown as typeof fetch;

      // Set test environment
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

      // Reset all mocks
      vi.clearAllMocks();
    });

    afterEach(() => {
      // Restore original fetch and env
      global.fetch = originalFetch;
      process.env.NEXT_PUBLIC_APP_URL = originalEnv;
      vi.restoreAllMocks();
    });

    // Helper function to create API response mock
    const mockApiSuccess = (data: Record<string, unknown>) => {
      return {
        ok: true,
        status: 200,
        json: () => Promise.resolve(data),
      };
    };

    const mockApiError = (status: number) => {
      return {
        ok: false,
        status,
        json: () => Promise.resolve({ error: 'Error' }),
      };
    };

    describe('Input Validation', () => {
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

    describe('API Route Delegation', () => {
      it('calls the API route with correct URL and method', async () => {
        mockFetch.mockResolvedValue(
          mockApiSuccess({
            url: 'https://example.com',
            title: 'Example Title',
            image: 'https://example.com/image.jpg',
          }),
        );

        await fetchOpenGraphMetadata('https://example.com');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/og-metadata',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: 'https://example.com' }),
            next: { revalidate: 3600 },
          }),
        );
      });

      it('uses NEXT_PUBLIC_APP_URL for API base URL', async () => {
        process.env.NEXT_PUBLIC_APP_URL = 'https://myapp.com';

        mockFetch.mockResolvedValue(
          mockApiSuccess({
            url: 'https://example.com',
            title: 'Test',
            image: null,
          }),
        );

        await fetchOpenGraphMetadata('https://example.com');

        expect(mockFetch).toHaveBeenCalledWith('https://myapp.com/api/og-metadata', expect.anything());
      });

      it('includes cache revalidation config', async () => {
        mockFetch.mockResolvedValue(
          mockApiSuccess({
            url: 'https://example.com',
            title: 'Test',
            image: null,
          }),
        );

        await fetchOpenGraphMetadata('https://example.com');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            next: { revalidate: 3600 }, // 1 hour cache
          }),
        );
      });
    });

    describe('Response Handling', () => {
      it('returns metadata when API succeeds', async () => {
        mockFetch.mockResolvedValue(
          mockApiSuccess({
            url: 'https://example.com',
            title: 'Example Domain',
            image: 'https://example.com/og-image.jpg',
          }),
        );

        const result = await fetchOpenGraphMetadata('https://example.com');

        expect(result).toEqual({
          url: 'https://example.com',
          title: 'Example Domain',
          image: 'https://example.com/og-image.jpg',
        });
      });

      it('returns null when API returns error status', async () => {
        mockFetch.mockResolvedValue(mockApiError(403)); // SSRF blocked

        const result = await fetchOpenGraphMetadata('http://192.168.1.1');

        expect(result).toBeNull();
      });

      it('returns null when API returns 400', async () => {
        mockFetch.mockResolvedValue(mockApiError(400)); // Invalid URL

        const result = await fetchOpenGraphMetadata('invalid-url');

        expect(result).toBeNull();
      });

      it('returns null when API returns 500', async () => {
        mockFetch.mockResolvedValue(mockApiError(500)); // Internal error

        const result = await fetchOpenGraphMetadata('https://example.com');

        expect(result).toBeNull();
      });

      it('handles missing title gracefully', async () => {
        mockFetch.mockResolvedValue(
          mockApiSuccess({
            url: 'https://example.com',
            title: null,
            image: 'https://example.com/image.jpg',
          }),
        );

        const result = await fetchOpenGraphMetadata('https://example.com');

        expect(result).toEqual({
          url: 'https://example.com',
          title: null,
          image: 'https://example.com/image.jpg',
        });
      });

      it('handles missing image gracefully', async () => {
        mockFetch.mockResolvedValue(
          mockApiSuccess({
            url: 'https://example.com',
            title: 'Example',
            image: null,
          }),
        );

        const result = await fetchOpenGraphMetadata('https://example.com');

        expect(result).toEqual({
          url: 'https://example.com',
          title: 'Example',
          image: null,
        });
      });

      it('returns null for malformed API response', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: () => Promise.resolve('not an object'),
        });

        const result = await fetchOpenGraphMetadata('https://example.com');

        expect(result).toBeNull();
      });

      it('returns null for null API response', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: () => Promise.resolve(null),
        });

        const result = await fetchOpenGraphMetadata('https://example.com');

        expect(result).toBeNull();
      });
    });

    describe('Error Handling', () => {
      it('returns null when fetch throws network error', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        const result = await fetchOpenGraphMetadata('https://example.com');

        expect(result).toBeNull();
      });

      it('returns null when fetch throws timeout error', async () => {
        mockFetch.mockRejectedValue(new Error('Timeout'));

        const result = await fetchOpenGraphMetadata('https://example.com');

        expect(result).toBeNull();
      });

      it('returns null when JSON parsing fails', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: () => Promise.reject(new Error('Invalid JSON')),
        });

        const result = await fetchOpenGraphMetadata('https://example.com');

        expect(result).toBeNull();
      });
    });

    describe('URL Normalization', () => {
      it('preserves the original URL in response', async () => {
        const originalUrl = 'https://example.com/path?query=1';

        mockFetch.mockResolvedValue(
          mockApiSuccess({
            url: originalUrl,
            title: 'Test',
            image: null,
          }),
        );

        const result = await fetchOpenGraphMetadata(originalUrl);

        expect(result?.url).toBe(originalUrl);
      });

      it('falls back to input URL if API response missing URL', async () => {
        const inputUrl = 'https://example.com';

        mockFetch.mockResolvedValue(
          mockApiSuccess({
            // url intentionally missing
            title: 'Test',
            image: null,
          }),
        );

        const result = await fetchOpenGraphMetadata(inputUrl);

        expect(result?.url).toBe(inputUrl);
      });
    });
  });
});
