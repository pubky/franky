import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Config from '@/config';
import * as Libs from '@/libs';
import {
  buildNexusUrl,
  buildCdnUrl,
  buildUrlWithQuery,
  createFetchOptions,
  ensureHttpResponseOk,
  parseResponseOrThrow,
  queryNexus,
  HTTP_METHODS,
} from './nexus.utils';

describe('nexus.utils', () => {
  describe('buildNexusUrl', () => {
    it('should build correct Nexus URL', () => {
      expect(buildNexusUrl('v0/users')).toBe(`${Config.NEXUS_URL}/v0/users`);
    });
  });

  describe('buildCdnUrl', () => {
    it('should build correct CDN URL', () => {
      expect(buildCdnUrl('avatar/user123')).toBe(`${Config.CDN_URL}/avatar/user123`);
    });
  });

  describe('buildUrlWithQuery', () => {
    it('should build URL with query parameters', () => {
      const result = buildUrlWithQuery('v0/posts', { limit: 10, offset: 0 });
      expect(result).toContain('limit=10');
      expect(result).toContain('offset=0');
    });

    it('should exclude path parameters from query string', () => {
      const result = buildUrlWithQuery('v0/posts', { post_id: '123', limit: 10 }, ['post_id']);
      expect(result).not.toContain('post_id');
      expect(result).toContain('limit=10');
    });

    it('should exclude undefined and null values', () => {
      const result = buildUrlWithQuery('v0/posts', { limit: 10, offset: undefined, filter: null });
      expect(result).toContain('limit=10');
      expect(result).not.toContain('offset');
      expect(result).not.toContain('filter');
    });
  });

  describe('createFetchOptions', () => {
    it('should create GET options with default headers', () => {
      const result = createFetchOptions('GET');
      expect(result.method).toBe(HTTP_METHODS.GET);
      expect(result.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(result.body).toBeUndefined();
    });

    it('should create POST options with body', () => {
      const body = JSON.stringify({ key: 'value' });
      const result = createFetchOptions('POST', body);
      expect(result.method).toBe(HTTP_METHODS.POST);
      expect(result.body).toBe(body);
    });
  });

  describe('ensureHttpResponseOk', () => {
    it('should not throw for successful response', () => {
      const response = { ok: true, status: 200, statusText: 'OK' } as Response;
      expect(() => ensureHttpResponseOk(response)).not.toThrow();
    });

    it('should throw error for failed responses', () => {
      const response = { ok: false, status: 400, statusText: 'Bad Request' } as Response;
      expect(() => ensureHttpResponseOk(response)).toThrow();
      try {
        ensureHttpResponseOk(response);
      } catch (error) {
        expect(error).toMatchObject({
          type: Libs.NexusErrorType.INVALID_REQUEST,
          statusCode: 400,
        });
      }
    });
  });

  describe('parseResponseOrThrow', () => {
    const createMockResponse = (overrides: Partial<Response> = {}) =>
      ({
        status: 200,
        headers: { get: vi.fn() },
        text: vi.fn().mockResolvedValue(''),
        ...overrides,
      }) as unknown as Response;

    it('should return undefined for 204 No Content', async () => {
      const response = createMockResponse({ status: 204 });
      expect(await parseResponseOrThrow(response)).toBeUndefined();
    });

    it('should return undefined for empty text', async () => {
      const response = createMockResponse({ text: vi.fn().mockResolvedValue('') });
      expect(await parseResponseOrThrow(response)).toBeUndefined();
    });

    it('should parse valid JSON response', async () => {
      const mockData = { id: '123', name: 'test' };
      const response = createMockResponse({
        text: vi.fn().mockResolvedValue(JSON.stringify(mockData)),
      });
      expect(await parseResponseOrThrow<typeof mockData>(response)).toEqual(mockData);
    });

    it('should throw INVALID_RESPONSE error for invalid JSON', async () => {
      const response = createMockResponse({ text: vi.fn().mockResolvedValue('invalid json {') });
      await expect(parseResponseOrThrow(response)).rejects.toMatchObject({
        type: Libs.NexusErrorType.INVALID_RESPONSE,
        statusCode: 500,
      });
    });
  });

  describe('queryNexus', () => {
    const mockFetch = vi.fn();
    const createMockResponse = (overrides: Partial<Response> = {}) => ({
      ok: true,
      status: 200,
      headers: { get: vi.fn() },
      text: vi.fn().mockResolvedValue(''),
      ...overrides,
    });

    beforeEach(() => {
      vi.clearAllMocks();
      global.fetch = mockFetch;
    });

    it('should fetch and parse JSON response successfully', async () => {
      const mockData = { id: '123', name: 'test' };
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ text: vi.fn().mockResolvedValue(JSON.stringify(mockData)) }),
      );

      const result = await queryNexus<typeof mockData>('https://example.com/api/test');
      expect(result).toEqual(mockData);
    });

    it('should use POST method with body when provided', async () => {
      const body = JSON.stringify({ key: 'value' });
      const mockData = { success: true };
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ text: vi.fn().mockResolvedValue(JSON.stringify(mockData)) }),
      );

      await queryNexus('https://example.com/api/test', 'POST', body);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/api/test',
        expect.objectContaining({ method: 'POST', body }),
      );
    });

    it('should return undefined for empty response', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ status: 204 }));
      expect(await queryNexus('https://example.com/api/test')).toBeUndefined();
    });

    it('should propagate errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: { get: vi.fn() },
      });

      await expect(queryNexus('https://example.com/api/test')).rejects.toMatchObject({
        type: Libs.NexusErrorType.INVALID_REQUEST,
        statusCode: 400,
      });
    });
  });
});
