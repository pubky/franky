import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET, OPTIONS } from './route';
import * as Core from '@/core';
import * as Libs from '@/libs';

const testData = {
  nameOwner: 'John Doe',
  originalContentUrls: 'https://example.com/original',
  briefDescription: 'Original artwork',
  infringingContentUrl: 'https://example.com/infringing',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phoneNumber: '123-456-7890',
  streetAddress: '123 Main St',
  country: 'United States',
  city: 'New York',
  stateProvince: 'NY',
  zipCode: '10001',
  signature: 'John Doe',
  isRightsOwner: true,
  isReportingOnBehalf: false,
};

const createPostRequest = (body: Record<string, unknown>) => {
  return new NextRequest('http://localhost:3000/api/copyright', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};

describe('API Route: /api/copyright', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Core.CopyrightController, 'submit').mockResolvedValue(undefined);
  });

  describe('POST', () => {
    it('should successfully submit copyright request', async () => {
      const request = createPostRequest(testData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Success');
      expect(Core.CopyrightController.submit).toHaveBeenCalledWith(testData);
    });

    it('should handle AppError from controller layer with correct status code', async () => {
      const appError = new Libs.AppError('INVALID_INPUT', 'Validation failed', 400);
      vi.spyOn(Core.CopyrightController, 'submit').mockRejectedValue(appError);

      const request = createPostRequest(testData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should handle AppError with different status codes', async () => {
      const appError = new Libs.AppError('INTERNAL_ERROR', 'Server error', 500);
      vi.spyOn(Core.CopyrightController, 'submit').mockRejectedValue(appError);

      const request = createPostRequest(testData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Server error');
    });

    it('should handle unexpected errors with 500 status', async () => {
      vi.spyOn(Core.CopyrightController, 'submit').mockRejectedValue(new Error('Unexpected error'));

      const request = createPostRequest(testData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal Server Error');
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
