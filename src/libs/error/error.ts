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

/**
 * Generic factory that creates typed error creator functions
 * Reduces duplication while maintaining type safety for each error domain
 */
function createErrorFactory<T extends AppErrorType>() {
  return (type: T, message: string, statusCode?: number, details?: Record<string, unknown>): AppError => {
    return new AppError(type, message, statusCode, details);
  };
}

// Typed error creators for each domain
export const createNexusError = createErrorFactory<NexusErrorType>();
export const createHomeserverError = createErrorFactory<HomeserverErrorType>();
export const createCommonError = createErrorFactory<CommonErrorType>();
export const createDatabaseError = createErrorFactory<DatabaseErrorType>();
export const createSanitizationError = createErrorFactory<SanitizationErrorType>();

/**
 * Type guard to check if an error is an AppError
 * @param error - The error to check
 * @returns True if the error is an AppError instance
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
