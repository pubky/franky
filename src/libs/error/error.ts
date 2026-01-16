import {
  NexusErrorType,
  type AppErrorType,
  type HomeserverErrorType,
  type CommonErrorType,
  type DatabaseErrorType,
  SanitizationErrorType,
  ErrorCategory,
  ErrorService,
} from './error.types';
import type { ErrorCode, ErrorCodeByCategory } from './error.codes';

// =============================================================================
// AppError System
// =============================================================================

/**
 * Generic base type that enforces category-code relationship.
 */
type BaseAppErrorParams<C extends ErrorCategory> = {
  category: C;
  code: ErrorCodeByCategory[C];
  message: string;
  service: ErrorService;
  operation: string;
  context?: Record<string, unknown>;
  cause?: unknown;
  traceId?: string;
};

/**
 * Union of all valid category-code combinations.
 * Compile-time enforcement: cannot create Network error with Database code.
 */
export type AppErrorParams = {
  [C in ErrorCategory]: BaseAppErrorParams<C>;
}[ErrorCategory];

/**
 * Application error with category-based typing.
 *
 * IMPORTANT: Does NOT log on construction. Logging happens in Application layer (Phase 2).
 *
 * Supports both:
 * - NEW: Category-based errors via AppErrorParams
 * - LEGACY: Type-based errors via (type, message, statusCode, details) - deprecated
 */
export class AppError extends Error {
  // ==========================================================================
  // NEW properties
  // ==========================================================================

  /** WHAT kind of failure — used for decision logic (retry, routing, login redirect) */
  readonly category?: ErrorCategory;

  /** WHICH specific error — enables precise handling (NOT_FOUND → empty state, CONFLICT → merge dialog) */
  readonly code?: ErrorCode;

  /** WHERE it happened (service) — for logging, filtering, debugging ("all Homegate errors") */
  readonly service?: ErrorService;

  /** WHERE it happened (operation) — traces exact code path ("readDetails", "verifySmsCode") */
  readonly operation?: string;

  /** EXTRA data — generic bag for variable context (endpoint, table, statusCode, retryAfter, etc.) */
  readonly context?: Record<string, unknown>;

  /** ROOT cause — preserves original thrown value for debugging (can be any thrown value, not just Error) */
  readonly cause?: unknown;

  /** TRACE ID — correlates all errors/logs from a single user operation*/
  traceId?: string;

  // ==========================================================================
  // LEGACY properties (deprecated - will be removed in Phase 2)
  // ==========================================================================

  /**
   * @deprecated Use `category` and `code` instead. Will be removed in Phase 2.
   */
  public readonly type?: AppErrorType;

  /**
   * @deprecated Use `context` instead. Will be removed in Phase 2.
   */
  public readonly details?: Record<string, unknown>;

  /**
   * @deprecated Use `context.statusCode` instead. Will be removed in Phase 2.
   */
  public readonly statusCode?: number;

  /**
   * Creates an AppError.
   *
   * NEW usage (recommended):
   * ```typescript
   * new AppError({
   *   category: ErrorCategory.Database,
   *   code: 'QUERY_FAILED',
   *   message: 'Failed to read post',
   *   service: ErrorService.Local,
   *   operation: 'readDetails',
   *   context: { table: 'postDetails', postId },
   *   cause: originalError,
   * });
   * ```
   *
   * LEGACY usage (deprecated):
   * ```typescript
   * new AppError(DatabaseErrorType.QUERY_FAILED, 'Failed to read post', 500, { postId });
   * ```
   */
  constructor(params: AppErrorParams);
  /** @deprecated Use object params instead. Will be removed in Phase 2. */
  constructor(type: AppErrorType, message: string, statusCode?: number, details?: Record<string, unknown>);
  constructor(
    paramsOrType: AppErrorParams | AppErrorType,
    message?: string,
    statusCode?: number,
    details?: Record<string, unknown>,
  ) {
    // NEW: Object-based params
    if (typeof paramsOrType === 'object' && 'category' in paramsOrType) {
      super(paramsOrType.message);
      this.name = 'AppError';
      this.category = paramsOrType.category;
      this.code = paramsOrType.code;
      this.service = paramsOrType.service;
      this.operation = paramsOrType.operation;
      this.context = paramsOrType.context;
      this.cause = paramsOrType.cause;
      this.traceId = paramsOrType.traceId;

      // Maintain proper prototype chain
      Object.setPrototypeOf(this, AppError.prototype);

      // Capture stack trace, excluding constructor
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, AppError);
      }

      // NO logging here - that's Application layer's job (Phase 2)
      return;
    }

    // LEGACY: Positional params (deprecated)
    super(message!);
    this.type = paramsOrType as AppErrorType;
    this.details = details;
    this.statusCode = statusCode ?? 500;
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);

    // Capture stack trace for legacy errors too
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    // NO logging here - removed to fix double-logging issue
    // Legacy code that depends on constructor logging will need to add explicit logging
  }

  // ==========================================================================
  // Enrichment Methods
  // ==========================================================================

  /**
   * Sets the trace ID for error correlation.
   *
   * @param id - The trace ID to correlate this error with other logs/errors in the same operation
   * @returns this - For chaining (e.g., `throw toAppError(e, service, op).setTraceId(id)`)
   *
   * @example
   * ```typescript
   * catch (error) {
   *   const appError = toAppError(error, ErrorService.Nexus, 'fetchPost');
   *   appError.setTraceId(currentTraceId);
   *   Logger.error(appError);
   *   throw appError;
   * }
   *
   * // Or inline:
   * throw toAppError(error, service, operation).setTraceId(traceId);
   * ```
   */
  setTraceId(id: string): this {
    this.traceId = id;
    return this;
  }
}

// =============================================================================
// LEGACY Factories (deprecated - use Err.* from error.factories.ts instead)
// =============================================================================

/**
 * Generic factory that creates typed error creator functions
 * Reduces duplication while maintaining type safety for each error domain
 *
 * @deprecated Use Err.* factories from error.factories.ts instead. Will be removed in Phase 2.
 */
function createErrorFactory<T extends AppErrorType>() {
  return (type: T, message: string, statusCode?: number, details?: Record<string, unknown>): AppError => {
    return new AppError(type, message, statusCode, details);
  };
}

/**
 * @deprecated Use Err.server() or Err.client() instead. Will be removed in Phase 2.
 */
export const createNexusError = createErrorFactory<NexusErrorType>();

/**
 * @deprecated Use Err.server() or Err.auth() instead. Will be removed in Phase 2.
 */
export const createHomeserverError = createErrorFactory<HomeserverErrorType>();

/**
 * @deprecated Use Err.validation() or Err.server() instead. Will be removed in Phase 2.
 */
export const createCommonError = createErrorFactory<CommonErrorType>();

/**
 * @deprecated Use Err.database() instead. Will be removed in Phase 2.
 */
export const createDatabaseError = createErrorFactory<DatabaseErrorType>();

/**
 * @deprecated Use Err.client() instead. Will be removed in Phase 2.
 */
export const createSanitizationError = createErrorFactory<SanitizationErrorType>();

/**
 * Type guard to check if an error is an AppError
 * @param error - The error to check
 * @returns True if the error is an AppError instance
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
