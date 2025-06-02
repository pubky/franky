import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AppError,
  NexusErrorType,
  DatabaseErrorType,
  CommonErrorType,
  createNexusError,
  createDatabaseError,
  createCommonError,
  mapHttpStatusToNexusErrorType,
} from '../error';
import { Logger, setLogger } from '../logger';

// Create mock before imports using vi.hoisted
const mockLogger = vi.hoisted(() => ({
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}));

// Mock environment variables
vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'development', // Not test environment
    NEXT_PUBLIC_DEBUG_MODE: true,
    VITEST: false,
  },
}));

describe('Error Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const logger = new Logger();
    Object.assign(logger, mockLogger);
    setLogger(logger);
  });

  describe('AppError', () => {
    it('should create an error with correct properties', () => {
      const error = new AppError(NexusErrorType.INVALID_REQUEST, 'Invalid request', 400, { param: 'test' });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.name).toBe('AppError');
      expect(error.type).toBe(NexusErrorType.INVALID_REQUEST);
      expect(error.message).toBe('Invalid request');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ param: 'test' });
    });

    it('should log error with correct level based on status code', () => {
      // 5xx error
      const error500 = new AppError(CommonErrorType.INTERNAL_ERROR, 'Server error', 500);
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[INTERNAL_ERROR] Server error',
        expect.objectContaining({
          type: CommonErrorType.INTERNAL_ERROR,
          statusCode: 500,
          stack: error500.stack,
        }),
      );

      vi.clearAllMocks();

      // 4xx error
      const error400 = new AppError(NexusErrorType.INVALID_REQUEST, 'Bad request', 400);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[INVALID_REQUEST] Bad request',
        expect.objectContaining({
          type: NexusErrorType.INVALID_REQUEST,
          statusCode: 400,
          stack: error400.stack,
        }),
      );

      vi.clearAllMocks();

      // Other
      const error0 = new AppError(CommonErrorType.NETWORK_ERROR, 'Network issue', 0);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[NETWORK_ERROR] Network issue',
        expect.objectContaining({
          type: CommonErrorType.NETWORK_ERROR,
          statusCode: 0,
          stack: error0.stack,
        }),
      );
    });
  });

  describe('Error Creators', () => {
    it('should create Nexus error correctly', () => {
      const error = createNexusError(NexusErrorType.RATE_LIMIT_EXCEEDED, 'Too many requests', 429, { limit: 100 });

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(NexusErrorType.RATE_LIMIT_EXCEEDED);
      expect(error.statusCode).toBe(429);
      expect(error.details).toEqual({ limit: 100 });
    });

    it('should create Database error correctly', () => {
      const error = createDatabaseError(DatabaseErrorType.DB_INIT_FAILED, 'Failed to initialize database', 500, {
        version: 1,
      });

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(DatabaseErrorType.DB_INIT_FAILED);
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual({ version: 1 });
    });

    it('should create Common error correctly', () => {
      const error = createCommonError(CommonErrorType.TIMEOUT, 'Operation timed out', 408, { duration: 5000 });

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(CommonErrorType.TIMEOUT);
      expect(error.statusCode).toBe(408);
      expect(error.details).toEqual({ duration: 5000 });
    });
  });

  describe('HTTP Status Mapping', () => {
    it('should map HTTP status codes to correct Nexus error types', () => {
      expect(mapHttpStatusToNexusErrorType(400)).toBe(NexusErrorType.INVALID_REQUEST);
      expect(mapHttpStatusToNexusErrorType(401)).toBe(NexusErrorType.UNAUTHORIZED);
      expect(mapHttpStatusToNexusErrorType(404)).toBe(NexusErrorType.RESOURCE_NOT_FOUND);
      expect(mapHttpStatusToNexusErrorType(429)).toBe(NexusErrorType.RATE_LIMIT_EXCEEDED);
      expect(mapHttpStatusToNexusErrorType(503)).toBe(NexusErrorType.SERVICE_UNAVAILABLE);
      expect(mapHttpStatusToNexusErrorType(418)).toBe(NexusErrorType.BOOTSTRAP_FAILED); // Default case
    });
  });
});
