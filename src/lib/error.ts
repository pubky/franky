import { getLogger } from './logger';

export enum NexusErrorType {
  INVALID_REQUEST = 'INVALID_REQUEST',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  BOOTSTRAP_FAILED = 'BOOTSTRAP_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // TODO: Add more error types
}

export enum HomeserverErrorType {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  MESSAGE_SEND_FAILED = 'MESSAGE_SEND_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SERVER_ERROR = 'SERVER_ERROR',

  // TODO: Add more error types
}

export enum DatabaseErrorType {
  POST_NOT_FOUND = 'POST_NOT_FOUND',
  SAVE_FAILED = 'SAVE_FAILED',
  UPDATE_FAILED = 'UPDATE_FAILED',
  DELETE_FAILED = 'DELETE_FAILED',
  BULK_OPERATION_FAILED = 'BULK_OPERATION_FAILED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  INVALID_DATA = 'INVALID_DATA',
  QUERY_FAILED = 'QUERY_FAILED',

  // Database initialization error types
  DB_INIT_FAILED = 'DB_INIT_FAILED',
  DB_VERSION_MISMATCH = 'DB_VERSION_MISMATCH',
  DB_OPEN_FAILED = 'DB_OPEN_FAILED',
  DB_DELETE_FAILED = 'DB_DELETE_FAILED',
  DB_SCHEMA_ERROR = 'DB_SCHEMA_ERROR',

  // TODO: Add more error types
}

export enum CommonErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',

  // Environment error types
  ENV_VALIDATION_ERROR = 'ENV_VALIDATION_ERROR',
  ENV_MISSING_REQUIRED = 'ENV_MISSING_REQUIRED',
  ENV_INVALID_VALUE = 'ENV_INVALID_VALUE',
  ENV_TYPE_ERROR = 'ENV_TYPE_ERROR',
}

export type AppErrorType = NexusErrorType | HomeserverErrorType | DatabaseErrorType | CommonErrorType;

export class AppError extends Error {
  public readonly type: AppErrorType;
  public readonly details?: Record<string, unknown>;
  public readonly statusCode: number;

  constructor(type: AppErrorType, message: string, statusCode: number = 500, details?: Record<string, unknown>) {
    super(message);
    this.type = type;
    this.details = details;
    this.statusCode = statusCode;
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);

    // Log the error when it's created
    this.logError();
  }

  private logError(): void {
    const errorContext = {
      type: this.type,
      statusCode: this.statusCode,
      details: this.details,
      stack: this.stack,
    };

    const logger = getLogger();

    if (this.statusCode >= 500) {
      logger.error(`[${this.type}] ${this.message}`, errorContext);
    } else if (this.statusCode >= 400) {
      logger.warn(`[${this.type}] ${this.message}`, errorContext);
    } else {
      logger.info(`[${this.type}] ${this.message}`, errorContext);
    }
  }
}

// Helper functions with integrated logging
export function createNexusError(
  type: NexusErrorType,
  message: string,
  statusCode?: number,
  details?: Record<string, unknown>,
): AppError {
  return new AppError(type, message, statusCode, details);
}

/**
 * Maps HTTP status codes to specific Nexus error types
 */
export function mapHttpStatusToNexusErrorType(status: number): NexusErrorType {
  switch (status) {
    case 400:
      return NexusErrorType.INVALID_REQUEST;
    case 401:
      return NexusErrorType.UNAUTHORIZED;
    case 404:
      return NexusErrorType.RESOURCE_NOT_FOUND;
    case 429:
      return NexusErrorType.RATE_LIMIT_EXCEEDED;
    case 503:
      return NexusErrorType.SERVICE_UNAVAILABLE;
    default:
      return NexusErrorType.BOOTSTRAP_FAILED;
  }
}

export function createHomeserverError(
  type: HomeserverErrorType,
  message: string,
  statusCode?: number,
  details?: Record<string, unknown>,
): AppError {
  return new AppError(type, message, statusCode, details);
}

export function createCommonError(
  type: CommonErrorType,
  message: string,
  statusCode?: number,
  details?: Record<string, unknown>,
): AppError {
  return new AppError(type, message, statusCode, details);
}

// Add a helper function for database errors
export function createDatabaseError(
  type: DatabaseErrorType,
  message: string,
  statusCode?: number,
  details?: Record<string, unknown>,
): AppError {
  return new AppError(type, message, statusCode, details);
}
