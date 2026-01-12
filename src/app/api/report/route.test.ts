import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET, OPTIONS } from './route';

const testData = {
  userPubky: 'o1gg96ewuojmopcjbz8895478wdtxtzzuxnfjjz8o8e77csa1ngo',
  userName: 'Test User',
  postUrl: 'https://example.com/post/123',
  issueType: 'hate-speech',
  reason: 'This is a test report reason',
};

const createPostRequest = (body: Record<string, unknown>) => {
  return new NextRequest('http://localhost:3000/api/report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};

// Mock Logger
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    Logger: {
      info: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe('API Route: /api/report (stub)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should return success for valid request', async () => {
      const request = createPostRequest({
        pubky: testData.userPubky,
        postUrl: testData.postUrl,
        issueType: testData.issueType,
        reason: testData.reason,
        name: testData.userName,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Success');
    });

    it('should return 400 for missing pubky', async () => {
      const request = createPostRequest({
        postUrl: testData.postUrl,
        issueType: testData.issueType,
        reason: testData.reason,
        name: testData.userName,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
    });

    it('should return 400 for missing postUrl', async () => {
      const request = createPostRequest({
        pubky: testData.userPubky,
        issueType: testData.issueType,
        reason: testData.reason,
        name: testData.userName,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
    });

    it('should return 400 for missing issueType', async () => {
      const request = createPostRequest({
        pubky: testData.userPubky,
        postUrl: testData.postUrl,
        reason: testData.reason,
        name: testData.userName,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
    });

    it('should return 400 for missing reason', async () => {
      const request = createPostRequest({
        pubky: testData.userPubky,
        postUrl: testData.postUrl,
        issueType: testData.issueType,
        name: testData.userName,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
    });

    it('should return 400 for missing name', async () => {
      const request = createPostRequest({
        pubky: testData.userPubky,
        postUrl: testData.postUrl,
        issueType: testData.issueType,
        reason: testData.reason,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
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
