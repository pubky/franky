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
  mapHttpStatusToNexusErrorType,
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

  describe('mapHttpStatusToNexusErrorType', () => {
    it('should map HTTP status codes to correct Nexus error types', () => {
      expect(mapHttpStatusToNexusErrorType(400)).toBe(Libs.NexusErrorType.INVALID_REQUEST);
      expect(mapHttpStatusToNexusErrorType(404)).toBe(Libs.NexusErrorType.RESOURCE_NOT_FOUND);
      expect(mapHttpStatusToNexusErrorType(429)).toBe(Libs.NexusErrorType.RATE_LIMIT_EXCEEDED);
      expect(mapHttpStatusToNexusErrorType(500)).toBe(Libs.NexusErrorType.INTERNAL_SERVER_ERROR);
      expect(mapHttpStatusToNexusErrorType(503)).toBe(Libs.NexusErrorType.SERVICE_UNAVAILABLE);
      expect(mapHttpStatusToNexusErrorType(418)).toBe(Libs.NexusErrorType.BOOTSTRAP_FAILED); // Default case
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

    it('should throw INVALID_RESPONSE error for 204 No Content with empty body', async () => {
      const response = createMockResponse({ status: 204, text: vi.fn().mockResolvedValue('') });
      await expect(parseResponseOrThrow(response)).rejects.toMatchObject({
        type: Libs.NexusErrorType.INVALID_RESPONSE,
        statusCode: 500,
      });
    });

    it('should throw INVALID_RESPONSE error for empty text', async () => {
      const response = createMockResponse({ text: vi.fn().mockResolvedValue('') });
      await expect(parseResponseOrThrow(response)).rejects.toMatchObject({
        type: Libs.NexusErrorType.INVALID_RESPONSE,
        statusCode: 500,
      });
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

    beforeEach(async () => {
      vi.clearAllMocks();
      global.fetch = mockFetch;
      // Clear query client cache between tests
      const { nexusQueryClient } = await import('./nexus.query-client');
      nexusQueryClient.clear();
    });

    it('should fetch and parse JSON response successfully', async () => {
      const mockData = { id: '123', name: 'test' };
      const url = 'https://example.com/api/test1';
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ text: vi.fn().mockResolvedValue(JSON.stringify(mockData)) }),
      );

      const result = await queryNexus<typeof mockData>(url);
      expect(result).toEqual(mockData);
    });

    it('should use POST method with body when provided', async () => {
      const body = JSON.stringify({ key: 'value' });
      const mockData = { success: true };
      const url = 'https://example.com/api/test2';
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ text: vi.fn().mockResolvedValue(JSON.stringify(mockData)) }),
      );

      await queryNexus(url, 'POST', body);
      expect(mockFetch).toHaveBeenCalledWith(url, expect.objectContaining({ method: 'POST', body }));
    });

    it('should throw INVALID_RESPONSE error for empty response', async () => {
      const url = 'https://example.com/api/test3';
      mockFetch.mockResolvedValueOnce(createMockResponse({ status: 204, text: vi.fn().mockResolvedValue('') }));
      await expect(queryNexus(url)).rejects.toMatchObject({
        type: Libs.NexusErrorType.INVALID_RESPONSE,
        statusCode: 500,
      });
    });

    it('should propagate errors', async () => {
      const errorUrl = 'https://example.com/api/error';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: { get: vi.fn() },
        text: vi.fn().mockResolvedValue(''),
      });

      await expect(queryNexus(errorUrl)).rejects.toMatchObject({
        type: Libs.NexusErrorType.INVALID_REQUEST,
        statusCode: 400,
      });
    });
  });
});
