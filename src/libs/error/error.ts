import {
  Logger,
  NexusErrorType,
  type AppErrorType,
  type HomeserverErrorType,
  type CommonErrorType,
  type DatabaseErrorType,
  SanitizationErrorType,
} from '@/libs';

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

    switch (true) {
      case this.statusCode >= 500:
        Logger.error(`[${this.type}] ${this.message}`, errorContext);
        break;
      case this.statusCode >= 400:
        Logger.warn(`[${this.type}] ${this.message}`, errorContext);
        break;
      default:
        Logger.info(`[${this.type}] ${this.message}`, errorContext);
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
  statusCode: number,
  data?: Record<string, unknown>,
): AppError {
  return new AppError(type, message, statusCode, data);
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

export function createSanitizationError(
  type: SanitizationErrorType,
  message: string,
  statusCode?: number,
  details?: Record<string, unknown>,
): AppError {
  return new AppError(type, message, statusCode, details);
}
