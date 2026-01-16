import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AppError,
  NexusErrorType,
  DatabaseErrorType,
  CommonErrorType,
  createNexusError,
  createDatabaseError,
  createCommonError,
  Logger,
  ErrorCategory,
  ErrorService,
  DatabaseErrorCode,
  Err,
} from '@/libs';

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
    Logger.error = mockLogger.error;
    Logger.warn = mockLogger.warn;
    Logger.info = mockLogger.info;
    Logger.debug = mockLogger.debug;
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

    // NOTE: Logging on construction was intentionally removed to fix double-logging issue.
    // Logging is now the responsibility of the Application layer (see error.ts line 160).
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

  describe('New Error System (Category-based)', () => {
    it('should create error with category and code', () => {
      const error = Err.database(DatabaseErrorCode.QUERY_FAILED, 'Failed to read post', {
        service: ErrorService.Local,
        operation: 'readDetails',
        context: { table: 'postDetails', postId: '123' },
      });

      expect(error).toBeInstanceOf(AppError);
      expect(error.category).toBe(ErrorCategory.Database);
      expect(error.code).toBe(DatabaseErrorCode.QUERY_FAILED);
      expect(error.service).toBe(ErrorService.Local);
      expect(error.operation).toBe('readDetails');
      expect(error.context).toEqual({ table: 'postDetails', postId: '123' });
    });

    it('should preserve cause for debugging', () => {
      const originalError = new Error('Original error');
      const error = Err.database(DatabaseErrorCode.WRITE_FAILED, 'Write failed', {
        service: ErrorService.Local,
        operation: 'create',
        cause: originalError,
      });

      expect(error.cause).toBe(originalError);
    });

    describe('setTraceId', () => {
      it('should set traceId after construction', () => {
        const error = Err.database(DatabaseErrorCode.QUERY_FAILED, 'Query failed', {
          service: ErrorService.Local,
          operation: 'read',
        });

        expect(error.traceId).toBeUndefined();

        error.setTraceId('trace-123');

        expect(error.traceId).toBe('trace-123');
      });

      it('should return this for chaining', () => {
        const error = Err.database(DatabaseErrorCode.QUERY_FAILED, 'Query failed', {
          service: ErrorService.Local,
          operation: 'read',
        });

        const result = error.setTraceId('trace-456');

        expect(result).toBe(error);
        expect(result.traceId).toBe('trace-456');
      });

      it('should allow inline enrichment pattern', () => {
        const traceId = 'inline-trace-789';
        const error = Err.database(DatabaseErrorCode.QUERY_FAILED, 'Query failed', {
          service: ErrorService.Local,
          operation: 'read',
        }).setTraceId(traceId);

        expect(error.traceId).toBe(traceId);
        expect(error.category).toBe(ErrorCategory.Database);
      });

      it('should preserve stack trace when enriching', () => {
        const error = Err.database(DatabaseErrorCode.QUERY_FAILED, 'Query failed', {
          service: ErrorService.Local,
          operation: 'read',
        });
        const originalStack = error.stack;

        error.setTraceId('trace-preserve-stack');

        expect(error.stack).toBe(originalStack);
      });

      it('should allow overwriting traceId', () => {
        const error = Err.database(DatabaseErrorCode.QUERY_FAILED, 'Query failed', {
          service: ErrorService.Local,
          operation: 'read',
          traceId: 'initial-trace',
        });

        expect(error.traceId).toBe('initial-trace');

        error.setTraceId('updated-trace');

        expect(error.traceId).toBe('updated-trace');
      });
    });
  });
});
