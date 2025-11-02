import * as Libs from '@/libs';

export class AppError extends Error {
  public readonly type: Libs.AppErrorType;
  public readonly details?: Record<string, unknown>;
  public readonly statusCode: number;

  constructor(type: Libs.AppErrorType, message: string, statusCode: number = 500, details?: Record<string, unknown>) {
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
        Libs.Logger.error(`[${this.type}] ${this.message}`, errorContext);
        break;
      case this.statusCode >= 400:
        Libs.Logger.warn(`[${this.type}] ${this.message}`, errorContext);
        break;
      default:
        Libs.Logger.info(`[${this.type}] ${this.message}`, errorContext);
    }
  }
}

// Helper functions with integrated logging
export function createNexusError(
  type: Libs.NexusErrorType,
  message: string,
  statusCode?: number,
  details?: Record<string, unknown>,
): AppError {
  return new AppError(type, message, statusCode, details);
}

/**
 * Maps HTTP status codes to specific Nexus error types
 */
export function mapHttpStatusToNexusErrorType(status: number): Libs.NexusErrorType {
  switch (status) {
    case 400:
      return Libs.NexusErrorType.INVALID_REQUEST;
    case 404:
      return Libs.NexusErrorType.RESOURCE_NOT_FOUND;
    case 429:
      return Libs.NexusErrorType.RATE_LIMIT_EXCEEDED;
    case 503:
      return Libs.NexusErrorType.SERVICE_UNAVAILABLE;
    default:
      return Libs.NexusErrorType.BOOTSTRAP_FAILED;
  }
}

export function createHomeserverError(
  type: Libs.HomeserverErrorType,
  message: string,
  statusCode: number,
  data?: Record<string, unknown>,
): AppError {
  return new AppError(type, message, statusCode, data);
}

export function createCommonError(
  type: Libs.CommonErrorType,
  message: string,
  statusCode?: number,
  details?: Record<string, unknown>,
): AppError {
  return new AppError(type, message, statusCode, details);
}

// Add a helper function for database errors
export function createDatabaseError(
  type: Libs.DatabaseErrorType,
  message: string,
  statusCode?: number,
  details?: Record<string, unknown>,
): AppError {
  return new AppError(type, message, statusCode, details);
}

export function createSanitizationError(
  type: Libs.SanitizationErrorType,
  message: string,
  statusCode?: number,
  details?: Record<string, unknown>,
): AppError {
  return new AppError(type, message, statusCode, details);
}

export function createStateError(
  type: Libs.StateErrorType,
  message: string,
  statusCode?: number,
  details?: Record<string, unknown>,
): AppError {
  return new AppError(type, message, statusCode, details);
}