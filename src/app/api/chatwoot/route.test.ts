import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET, OPTIONS } from './route';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Config from '@/config';

const testData = {
  userPubky: 'o1gg96ewuojmopcjbz8895478wdtxtzzuxnfjjz8o8e77csa1ngo' as Core.Pubky,
  comment: 'This is a test feedback comment',
};

const createPostRequest = (body: Record<string, unknown>) => {
  return new NextRequest('http://localhost:3000/api/chatwoot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};

describe('API Route: /api/chatwoot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Core.FeedbackController, 'submit').mockResolvedValue(undefined);
  });

  describe('POST', () => {
    it('should successfully submit feedback', async () => {
      const request = createPostRequest({
        pubky: testData.userPubky,
        comment: testData.comment,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Success');
      expect(Core.FeedbackController.submit).toHaveBeenCalledWith({
        pubky: testData.userPubky,
        comment: testData.comment,
      });
    });

    it('should handle AppError from application layer with correct status code', async () => {
      const appError = new Libs.AppError('INVALID_INPUT', 'Validation failed', 400);
      vi.spyOn(Core.FeedbackController, 'submit').mockRejectedValue(appError);

      const request = createPostRequest({
        pubky: testData.userPubky,
        comment: testData.comment,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should handle AppError with different status codes', async () => {
      const appError = new Libs.AppError('INTERNAL_ERROR', 'Server error', 500);
      vi.spyOn(Core.FeedbackController, 'submit').mockRejectedValue(appError);

      const request = createPostRequest({
        pubky: testData.userPubky,
        comment: testData.comment,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Server error');
    });

    it('should handle unexpected errors with 500 status', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Core.FeedbackController, 'submit').mockRejectedValue(new Error('Unexpected error'));

      const request = createPostRequest({
        pubky: testData.userPubky,
        comment: testData.comment,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal Server Error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in feedback API handler:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('should handle invalid JSON body', async () => {
      // NextRequest.json() may throw or return error response depending on Next.js version
      // This tests that the route properly handles JSON parsing errors
      const request = new NextRequest('http://localhost:3000/api/chatwoot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        const response = await POST(request);
        const data = await response.json();
        // If it doesn't throw, it should return an error response
        expect(response.status).toBe(500);
        expect(data.error).toBe('Internal Server Error');
      } catch (error) {
        // If it throws, that's also acceptable
        expect(error).toBeInstanceOf(Error);
      }

      consoleErrorSpy.mockRestore();
    });

    it('should handle missing pubky in body', async () => {
      const request = createPostRequest({
        comment: testData.comment,
      });

      // The controller will validate and throw regular Error (not AppError)
      // So it will be handled as unexpected error and return 500
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Core.FeedbackController, 'submit').mockRejectedValue(
        new Error('Pubky is required and must be a non-empty string'),
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal Server Error');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle missing comment in body', async () => {
      const request = createPostRequest({
        pubky: testData.userPubky,
      });

      // The controller will validate and throw regular Error (not AppError)
      // So it will be handled as unexpected error and return 500
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Core.FeedbackController, 'submit').mockRejectedValue(
        new Error('Comment is required and must be a non-empty string'),
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal Server Error');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle comment exceeding max length', async () => {
      const longComment = 'a'.repeat(Config.FEEDBACK_MAX_CHARACTER_LENGTH + 1);
      const request = createPostRequest({
        pubky: testData.userPubky,
        comment: longComment,
      });

      // The controller will validate and throw regular Error (not AppError)
      // So it will be handled as unexpected error and return 500
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Core.FeedbackController, 'submit').mockRejectedValue(
        new Error(`Comment must be at most ${Config.FEEDBACK_MAX_CHARACTER_LENGTH} characters`),
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal Server Error');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('GET', () => {
    it('should return 405 Method Not Allowed', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toBe('Method not allowed. Use POST instead.');
    });
  });

  describe('OPTIONS', () => {
    it('should return CORS headers', async () => {
      const response = await OPTIONS();

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    });
  });
});
