import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NexusService } from '../nexus';
import { NexusErrorType } from '@/lib/error';

describe('NexusService', () => {
  const mockFetch = vi.fn();
  const userPK = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  describe('bootstrap', () => {
    it('should fetch and return bootstrap data successfully', async () => {
      const mockResponse = {
        user: { id: userPK },
        posts: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await NexusService.bootstrap(userPK);
      expect(result).toEqual(mockResponse);
    });

    it('should throw INVALID_REQUEST error on 400', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(NexusService.bootstrap(userPK)).rejects.toMatchObject({
        type: NexusErrorType.INVALID_REQUEST,
        statusCode: 400,
        details: expect.objectContaining({
          userPK,
          statusCode: 400,
        }),
      });
    });

    it('should throw UNAUTHORIZED error on 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(NexusService.bootstrap(userPK)).rejects.toMatchObject({
        type: NexusErrorType.UNAUTHORIZED,
        statusCode: 401,
      });
    });

    it('should throw RESOURCE_NOT_FOUND error on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(NexusService.bootstrap(userPK)).rejects.toMatchObject({
        type: NexusErrorType.RESOURCE_NOT_FOUND,
        statusCode: 404,
      });
    });

    it('should throw INVALID_RESPONSE error on invalid JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(NexusService.bootstrap(userPK)).rejects.toMatchObject({
        type: NexusErrorType.INVALID_RESPONSE,
        statusCode: 500,
        details: expect.objectContaining({
          userPK,
          error: expect.any(Error),
        }),
      });
    });

    it('should throw NETWORK_ERROR on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      await expect(NexusService.bootstrap(userPK)).rejects.toMatchObject({
        type: NexusErrorType.NETWORK_ERROR,
        statusCode: 500,
        details: expect.objectContaining({
          userPK,
          error: expect.any(Error),
        }),
      });
    });

    it('should throw RATE_LIMIT_EXCEEDED on 429', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      await expect(NexusService.bootstrap(userPK)).rejects.toMatchObject({
        type: NexusErrorType.RATE_LIMIT_EXCEEDED,
        statusCode: 429,
      });
    });

    it('should throw SERVICE_UNAVAILABLE on 503', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

      await expect(NexusService.bootstrap(userPK)).rejects.toMatchObject({
        type: NexusErrorType.SERVICE_UNAVAILABLE,
        statusCode: 503,
      });
    });
  });
});
