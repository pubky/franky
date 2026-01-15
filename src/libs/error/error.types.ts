// =============================================================================
// NEW ERROR SYSTEM (Phase 1) - Category-based error types
// =============================================================================

/**
 * Error categories represent WHAT KIND of failure occurred.
 * Used for retry decisions, UI routing, and error handling logic.
 */
export enum ErrorCategory {
  Network = 'network', // Connection issues: DNS, offline, connection refused
  Timeout = 'timeout', // Request timeouts (408, network timeout)
  Server = 'server', // Server errors (5xx) from any remote service
  Client = 'client', // Client errors (4xx) - bad request, not found, conflict
  Auth = 'auth', // Authentication/authorization (401, 403)
  RateLimit = 'rateLimit', // Rate limiting (429) - special handling for retry-after
  Validation = 'validation', // Input validation failures (local, before request)
  Database = 'database', // Local storage failures (Dexie/IndexedDB)
}

/**
 * Services that can produce errors.
 * Used for logging context, NOT for error handling decisions.
 */
export enum ErrorService {
  Nexus = 'nexus',
  Homeserver = 'homeserver',
  Homegate = 'homegate',
  Exchangerate = 'exchangerate',
  Chatwoot = 'chatwoot',
  Local = 'local',
  PubkyAppSpecs = 'pubky-app-specs',
}

// =============================================================================
// LEGACY ERROR TYPES (Deprecated - will be removed in Phase 2)
// =============================================================================

/**
 * @deprecated Use ErrorCategory and Err.* factories instead. Will be removed in Phase 2.
 */
export enum NexusErrorType {
  INVALID_REQUEST = 'INVALID_REQUEST', // 400
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND', // 404
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED', // 429
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR', // 500
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE', // 503
  BOOTSTRAP_FAILED = 'BOOTSTRAP_FAILED',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  NO_CONTENT = 'NO_CONTENT', // 204
}

/**
 * @deprecated Use ErrorCategory and Err.* factories instead. Will be removed in Phase 2.
 */
export enum HomeserverErrorType {
  SIGNUP_FAILED = 'SIGNUP_FAILED',
  SIGNIN_FAILED = 'SIGNIN_FAILED',
  FETCH_FAILED = 'FETCH_FAILED',
  LOGOUT_FAILED = 'LOGOUT_FAILED',
  INVALID_HOMESERVER_KEY = 'INVALID_HOMESERVER_KEY',
  INVALID_PUBLIC_KEY = 'INVALID_PUBLIC_KEY',
  INVALID_SECRET_KEY = 'INVALID_SECRET_KEY',
  INVALID_SIGNUP_TOKEN = 'Invalid token',
  CREATE_POST_FAILED = 'CREATE_POST_FAILED',
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  USER_ALREADY_EXISTS = 'User already exists',
  AUTH_REQUEST_FAILED = 'AUTH_REQUEST_FAILED',
  PUT_FAILED = 'PUT_FAILED',
  DELETE_FAILED = 'DELETE_FAILED',
}

/**
 * @deprecated Use ErrorCategory and Err.* factories instead. Will be removed in Phase 2.
 */
export enum DatabaseErrorType {
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  SAVE_FAILED = 'SAVE_FAILED',
  UPDATE_FAILED = 'UPDATE_FAILED',
  UPSERT_FAILED = 'UPSERT_FAILED',
  DELETE_FAILED = 'DELETE_FAILED',
  CREATE_FAILED = 'CREATE_FAILED',
  FIND_FAILED = 'FIND_FAILED',
  BULK_OPERATION_FAILED = 'BULK_OPERATION_FAILED',
  QUERY_FAILED = 'QUERY_FAILED',

  // Database initialization error types
  DB_INIT_FAILED = 'DB_INIT_FAILED',
  DB_OPEN_FAILED = 'DB_OPEN_FAILED',
  DB_DELETE_FAILED = 'DB_DELETE_FAILED',
  DB_SCHEMA_ERROR = 'DB_SCHEMA_ERROR',
}

/**
 * @deprecated Use ErrorCategory and Err.* factories instead. Will be removed in Phase 2.
 */
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

/**
 * @deprecated Use ErrorCategory and Err.* factories instead. Will be removed in Phase 2.
 */
export enum SanitizationErrorType {
  POST_NOT_FOUND = 'POST_NOT_FOUND',
}

/**
 * @deprecated Use ErrorCategory instead. Will be removed in Phase 2.
 */
export type AppErrorType =
  | NexusErrorType
  | DatabaseErrorType
  | CommonErrorType
  | HomeserverErrorType
  | SanitizationErrorType;
