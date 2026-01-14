# ADR 0013: Error Handling Phase 1 — Libs & Services

## Status

Proposed — 2026-01-12

## Context

This ADR is **Phase 1** of error handling improvements. The full scope was documented in ADR-0013 but was too large for a single migration. This phase focuses on:

1. **Error type system** (`src/libs/error/*`)
2. **Service layer** error wrapping

Later phases will address Application layer error authority and UI consumption.

### Current Problems (Service Layer Focus)

1. **Double logging**: `AppError` constructor logs automatically, AND services log before throwing
2. **Wrong error domains**: Homegate uses `NexusErrorType` for its errors
3. **Lost stack traces**: Some code paths lose the original call stack
4. **Inconsistent service patterns**: Some services log, some don't; some wrap errors, some let them bubble

### Evidence

```typescript
// homegate.ts - uses WRONG error type
throw createNexusError(NexusErrorType.SERVICE_UNAVAILABLE, 'Failed to validate SMS code', ...);

// LocalPostService - double logging
Libs.Logger.error('Failed to read post counts', { postId, error });
throw Libs.createDatabaseError(...); // ← AppError constructor ALSO logs

// AppError constructor logs on creation
constructor(...) {
  this.logError(); // Every error logs, even if caught and handled
}
```

## Decision

### 1. Category-Based Error Types

Replace service-specific enums with **failure domain categories**. A 503 from Nexus should be handled the same as a 503 from Homegate—the service is context for logging, not a different error type.

```typescript
// src/libs/error/error.types.ts

/**
 * Error categories represent WHAT KIND of failure occurred.
 * Used for retry decisions, UI routing, and error handling logic.
 */
export enum ErrorCategory {
  Network = 'network',       // Connection issues: DNS, offline, connection refused
  Timeout = 'timeout',       // Request timeouts (408, network timeout)
  Server = 'server',         // Server errors (5xx) from any remote service
  Client = 'client',         // Client errors (4xx) - bad request, not found, conflict
  Auth = 'auth',             // Authentication/authorization (401, 403)
  RateLimit = 'rateLimit',   // Rate limiting (429) - special handling for retry-after
  Validation = 'validation', // Input validation failures (local, before request)
  Database = 'database',     // Local storage failures (Dexie/IndexedDB)
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
}
```

### 2. AppError as Class (Type-Safe, Preserving Stack Traces)

Keep `AppError` as a class extending `Error` to preserve stack traces. Remove constructor logging. **Use 7 core properties**—optional fields go into a generic `context` object. **Category-code relationship is enforced at compile time** via discriminated union types.

```typescript
// src/libs/error/error.ts

/**
 * Application error with category-based typing.
 * 
 * IMPORTANT: Does NOT log on construction. Logging happens in Application layer.
 */
export class AppError extends Error {
  // WHAT kind of failure — used for decision logic (retry, routing, login redirect)
  readonly category: ErrorCategory;
  
  // WHICH specific error — enables precise handling (NOT_FOUND → empty state, CONFLICT → merge dialog)
  readonly code: ErrorCode;
  
  // WHERE it happened (service) — for logging, filtering, debugging ("all Homegate errors")
  readonly service: ErrorService;
  
  // WHERE it happened (operation) — traces exact code path ("readDetails", "verifySmsCode")
  readonly operation: string;
  
  // EXTRA data — generic bag for variable context (endpoint, table, statusCode, retryAfter, etc.)
  readonly context?: Record<string, unknown>;
  
  // ROOT cause — preserves original thrown value for debugging (can be any thrown value, not just Error)
  readonly cause?: unknown;
  
  // TRACE ID — correlates all errors/logs from a single user operation (set by Application layer)
  readonly traceId?: string;

  constructor(params: AppErrorParams) {
    super(params.message);
    this.name = 'AppError';
    this.category = params.category;
    this.code = params.code;
    this.service = params.service;
    this.operation = params.operation;
    this.context = params.context;
    this.cause = params.cause;
    this.traceId = params.traceId;
    
    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
    
    // Capture stack trace, excluding constructor
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
    
    // NO logging here - that's Application layer's job (Phase 2)
  }
}

import type { ErrorCodeByCategory } from './error.codes';

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
```

**Why 7 properties?**

| Property | Purpose |
|----------|---------|
| `category` | Retry decisions, routing (`isRetryable()`) |
| `code` | Specific error identification |
| `service` | Which service produced the error (for logging/filtering) |
| `operation` | Which operation failed (for logging) |
| `context` | All optional data: endpoint, table, statusCode, retryAfter, etc. |
| `cause` | Original thrown value for debugging (typed as `unknown` to capture non-Error throws) |
| `traceId` | Correlates all errors/logs from a single user operation for debugging |

### 3. Error Codes (by Domain)

```typescript
// src/libs/error/error.codes.ts

// Network errors (connection-level failures)
export type NetworkErrorCode =
  | 'OFFLINE'
  | 'DNS_FAILED'
  | 'CONNECTION_REFUSED'
  | 'CONNECTION_RESET';

// Timeout errors
export type TimeoutErrorCode =
  | 'REQUEST_TIMEOUT'
  | 'GATEWAY_TIMEOUT';

// Server errors (5xx from any service)
export type ServerErrorCode =
  | 'INTERNAL_ERROR'
  | 'BAD_GATEWAY'
  | 'SERVICE_UNAVAILABLE'
  | 'UNKNOWN_ERROR';

// Client errors (4xx)
export type ClientErrorCode =
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'GONE'
  | 'UNPROCESSABLE';

// Auth errors
export type AuthErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'SESSION_EXPIRED'
  | 'INVALID_TOKEN';

// Rate limit errors
export type RateLimitErrorCode =
  | 'RATE_LIMITED'
  | 'BLOCKED';

// Validation errors (local, before request)
export type ValidationErrorCode =
  | 'INVALID_INPUT'
  | 'MISSING_FIELD'
  | 'TYPE_ERROR'
  | 'FORMAT_ERROR';

// Database errors (local storage)
export type DatabaseErrorCode =
  | 'QUERY_FAILED'
  | 'WRITE_FAILED'
  | 'DELETE_FAILED'
  | 'RECORD_NOT_FOUND'
  | 'TRANSACTION_FAILED'
  | 'SCHEMA_ERROR'
  | 'INIT_FAILED';

export type ErrorCode =
  | NetworkErrorCode
  | TimeoutErrorCode
  | ServerErrorCode
  | ClientErrorCode
  | AuthErrorCode
  | RateLimitErrorCode
  | ValidationErrorCode
  | DatabaseErrorCode;

/**
 * Maps each category to its valid error codes.
 * Single source of truth for category-code relationships.
 */
export type ErrorCodeByCategory = {
  [ErrorCategory.Network]: NetworkErrorCode;
  [ErrorCategory.Timeout]: TimeoutErrorCode;
  [ErrorCategory.Server]: ServerErrorCode;
  [ErrorCategory.Client]: ClientErrorCode;
  [ErrorCategory.Auth]: AuthErrorCode;
  [ErrorCategory.RateLimit]: RateLimitErrorCode;
  [ErrorCategory.Validation]: ValidationErrorCode;
  [ErrorCategory.Database]: DatabaseErrorCode;
};
```

### 4. Error Factories

```typescript
// src/libs/error/error.factories.ts

type FactoryParams = {
  service: ErrorService;
  operation: string;
  cause?: unknown;
  context?: Record<string, unknown>;  // endpoint, table, statusCode, retryAfter, etc.
  traceId?: string;  // Correlates errors across the call chain
};

/**
 * Error factories organized by category.
 * Context object holds all optional/category-specific data.
 */
export const Err = {
  network: (code: NetworkErrorCode, message: string, params: FactoryParams): AppError =>
    new AppError({ category: ErrorCategory.Network, code, message, ...params }),

  timeout: (code: TimeoutErrorCode, message: string, params: FactoryParams): AppError =>
    new AppError({ category: ErrorCategory.Timeout, code, message, ...params }),

  server: (code: ServerErrorCode, message: string, params: FactoryParams): AppError =>
    new AppError({ category: ErrorCategory.Server, code, message, ...params }),

  client: (code: ClientErrorCode, message: string, params: FactoryParams): AppError =>
    new AppError({ category: ErrorCategory.Client, code, message, ...params }),

  auth: (code: AuthErrorCode, message: string, params: FactoryParams): AppError =>
    new AppError({ category: ErrorCategory.Auth, code, message, ...params }),

  rateLimit: (code: RateLimitErrorCode, message: string, params: FactoryParams): AppError =>
    new AppError({ category: ErrorCategory.RateLimit, code, message, ...params }),

  validation: (code: ValidationErrorCode, message: string, params: FactoryParams): AppError =>
    new AppError({ category: ErrorCategory.Validation, code, message, ...params }),

  database: (code: DatabaseErrorCode, message: string, params: FactoryParams): AppError =>
    new AppError({ category: ErrorCategory.Database, code, message, ...params }),
};
```

**Usage examples:**

```typescript
// Remote service error
throw Err.server('SERVICE_UNAVAILABLE', 'Service unavailable', {
  service: ErrorService.Homegate,
  operation: 'verifySmsCode',
  context: { endpoint: url, statusCode: 503 },
});

// Database error
throw Err.database('QUERY_FAILED', 'Failed to read post', {
  service: ErrorService.Local,
  operation: 'readDetails',
  context: { table: 'postDetails', postId },
  cause: error,
});

// Rate limit with retry-after
throw Err.rateLimit('RATE_LIMITED', 'Too many requests', {
  service: ErrorService.Homegate,
  operation: 'sendSmsCode',
  context: { endpoint: url, retryAfter: 60 },
});
```

### 5. HTTP Response Helper

```typescript
// src/libs/error/error.http.ts

/**
 * Creates appropriate AppError from HTTP response.
 * Use this in remote services to standardize HTTP error handling.
 */
export function fromHttpResponse(
  response: Response,
  service: ErrorService,
  operation: string,
  endpoint: string,
): AppError {
  const { status, statusText } = response;
  const message = statusText || 'Request failed';
  const params = { service, operation, context: { endpoint, statusCode: status } };

  // 5xx Server Errors
  if (status >= 500) {
    if (status === 504) {
      return Err.timeout('GATEWAY_TIMEOUT', message, params);
    }
    const code = status === 503 ? 'SERVICE_UNAVAILABLE'
               : status === 502 ? 'BAD_GATEWAY'
               : 'INTERNAL_ERROR';
    return Err.server(code, message, params);
  }

  // 429 Rate Limited
  if (status === 429) {
    const retryAfter = response.headers.get('retry-after');
    return Err.rateLimit('RATE_LIMITED', message, {
      ...params,
      context: { ...params.context, retryAfter: retryAfter ? parseInt(retryAfter) : undefined },
    });
  }

  // 401/403 Auth Errors
  if (status === 401) return Err.auth('UNAUTHORIZED', message, params);
  if (status === 403) return Err.auth('FORBIDDEN', message, params);

  // 408 Timeout
  if (status === 408) return Err.timeout('REQUEST_TIMEOUT', message, params);

  // 404 Not Found
  if (status === 404) return Err.client('NOT_FOUND', message, params);

  // 409 Conflict
  if (status === 409) return Err.client('CONFLICT', message, params);

  // Other 4xx
  if (status >= 400) {
    return Err.client('BAD_REQUEST', message, params);
  }

  // Fallback
  return Err.server('UNKNOWN_ERROR', message, params);
}
```

### 6. Error Utilities

```typescript
// src/libs/error/error.utils.ts

/**
 * Type guard to check if an error is an AppError.
 */
export const isAppError = (e: unknown): e is AppError => {
  return e instanceof AppError;
};

// Category checks
export const isNetworkError = (e: AppError): boolean => e.category === ErrorCategory.Network;
export const isTimeoutError = (e: AppError): boolean => e.category === ErrorCategory.Timeout;
export const isServerError = (e: AppError): boolean => e.category === ErrorCategory.Server;
export const isClientError = (e: AppError): boolean => e.category === ErrorCategory.Client;
export const isAuthError = (e: AppError): boolean => e.category === ErrorCategory.Auth;
export const isRateLimitError = (e: AppError): boolean => e.category === ErrorCategory.RateLimit;
export const isValidationError = (e: AppError): boolean => e.category === ErrorCategory.Validation;
export const isDatabaseError = (e: AppError): boolean => e.category === ErrorCategory.Database;

/**
 * Should we retry this error?
 * 
 * Retryable: network issues, timeouts, server errors (5xx), rate limits (with backoff)
 * Not retryable: client errors (4xx), auth errors, validation, database
 */
export const isRetryable = (error: AppError): boolean => {
  switch (error.category) {
    case ErrorCategory.Network:
    case ErrorCategory.Timeout:
    case ErrorCategory.Server:
    case ErrorCategory.RateLimit:
      return true;
    case ErrorCategory.Client:
    case ErrorCategory.Auth:
    case ErrorCategory.Validation:
    case ErrorCategory.Database:
      return false;
  }
};

/**
 * Should we redirect to login?
 */
export const requiresLogin = (error: AppError): boolean => {
  return error.category === ErrorCategory.Auth && (
    error.code === 'UNAUTHORIZED' ||
    error.code === 'SESSION_EXPIRED'
  );
};

/**
 * Is this a "not found" error?
 */
export const isNotFound = (error: AppError): boolean => {
  return error.code === 'NOT_FOUND' || error.code === 'RECORD_NOT_FOUND';
};

/**
 * Get retry delay from context (for rate limiting).
 */
export const getRetryAfter = (error: AppError): number | undefined => {
  return error.context?.retryAfter as number | undefined;
};

/**
 * Ensures any error becomes an AppError.
 * Used at service boundaries to normalize unknown errors.
 * 
 * NOTE: Does NOT use fragile string heuristics. Unknown errors become UNKNOWN_ERROR.
 */
export const toAppError = (
  error: unknown,
  service: ErrorService,
  operation: string,
  traceId?: string,
): AppError => {
  if (isAppError(error)) {
    return error;  // Preserve existing AppError as-is; traceId should be set at origin
  }

  const message = error instanceof Error ? error.message : 'An unexpected error occurred';

  return Err.server('UNKNOWN_ERROR', message, { service, operation, cause: error, traceId });
};
```

### 7. Service Layer Rules

Services MUST:
- Wrap all errors into `AppError` using factories or `fromHttpResponse`
- Include correct `service` and `operation` in every error
- Pass through existing `AppError` instances unchanged

Services MUST NOT:
- Call `Logger.error` or `Logger.warn` (Phase 2 moves this to Application)
- Set `displayMessage` (Phase 2: Application layer decides)
- Make retry decisions (Phase 2: Application layer decides)

Services MAY:
- Use `Logger.debug` for success tracing

#### Local Service Pattern

```typescript
// src/core/services/local/post/post.ts

export class LocalPostService {
  static async readDetails({ postId }: { postId: string }) {
    try {
      return await Core.PostDetailsModel.findById(postId);
    } catch (error) {
      // No Logger.error here - that's Application layer's job
      throw Err.database('QUERY_FAILED', 'Failed to read post details', {
        service: ErrorService.Local,
        operation: 'readDetails',
        context: { table: 'postDetails', postId },
        cause: error,
      });
    }
  }
}
```

#### Remote Service Pattern (Nexus, Homeserver, Homegate)

```typescript
// src/core/services/nexus/nexus.utils.ts

export function ensureHttpResponseOk(
  response: Response,
  service: ErrorService,
  operation: string,
  endpoint: string,
): void {
  if (!response.ok) {
    throw fromHttpResponse(response, service, operation, endpoint);
  }
}

// src/core/services/homegate/homegate.ts

export class HomegateService {
  static async verifySmsCode(phoneNumber: string, code: string): Promise<TVerifySmsCodeResult> {
    const url = homegateApi.validateSmsCode();
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, code }),
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      const json = await response.json();
      return {
        valid: json.valid === 'true' || json.valid === true,
        signupCode: json.signupCode,
        homeserverPubky: json.homeserverPubky,
      };
    }
    
    throw fromHttpResponse(response, ErrorService.Homegate, 'verifySmsCode', url);
  }
}
```

### 8. Backward Compatibility

During migration, keep old factories available with deprecation warnings:

```typescript
// src/libs/error/error.legacy.ts

/**
 * @deprecated Use Err.* factories instead. Will be removed in Phase 2.
 */
export const createNexusError = (
  type: NexusErrorType,
  message: string,
  statusCode?: number,
  details?: Record<string, unknown>,
): AppError => {
  console.warn('createNexusError is deprecated. Use Err.* factories.');
  // Map old types to new categories
  const category = mapLegacyType(type);
  // ... conversion logic
};
```

## Consequences

### Positive ✅

- **No double logging**: Removed constructor logging; Application layer (Phase 2) will be single logging point
- **Stack traces preserved**: `AppError` extends `Error`, captures stack
- **Correct service attribution**: Homegate errors use `service: ErrorService.Homegate`
- **Simple decision logic**: `isRetryable(error)` checks `error.category`, no service-specific lists
- **No fragile heuristics**: Unknown errors become `UNKNOWN_ERROR`, no string matching
- **Compile-time type safety**: `ErrorCodeByCategory` mapping prevents invalid category-code combinations

### Negative ❌

- **Migration effort**: ~30 service files need updating
- **Two-phase approach**: Full benefits (single logging, displayMessage) come in Phase 2
- **Temporary duplication**: Legacy factories coexist during migration

### Neutral ⚠️

- **Team learning**: New `Err.*` factory syntax
- **Code reviews**: Need to enforce "no logging in services" during migration

## Migration Plan

### Step 1: Create New Error Types (~1 day)

Create new files, keeping old exports:

```
src/libs/error/
├── error.ts           # AppError class (updated, no constructor logging)
├── error.types.ts     # ErrorCategory, ErrorService (new)
├── error.codes.ts     # ErrorCode union types (new)
├── error.factories.ts # Err.* factories (new)
├── error.http.ts      # fromHttpResponse (new)
├── error.utils.ts     # isRetryable, toAppError, etc. (new)
├── error.legacy.ts    # Old createNexusError, etc. (deprecated)
└── index.ts           # Re-exports both old and new
```

### Step 2: Update Remote Services (~2 days)

Priority order:
1. `nexus.utils.ts` - Update `ensureHttpResponseOk`
2. `homegate.ts` - Fix wrong error types
3. `homeserver.ts` + `error.utils.ts`
4. `exchangerate.ts`
5. `chatwoot.api.ts`

### Step 3: Update Local Services (~2 days)

15 local service files. For each:
1. Replace `createDatabaseError` with `Err.database`
2. Remove `Logger.error` calls
3. Add try-catch to methods missing error handling

### Step 4: Update Tests (~1 day)

Update test assertions to check new error shape:

```typescript
await expect(LocalPostService.readDetails({ postId: '123' }))
  .rejects.toMatchObject({
    category: ErrorCategory.Database,
    code: 'QUERY_FAILED',
    service: ErrorService.Local,
  });
```

### Step 5: Remove Legacy (~Phase 2)

After Application layer migration, remove `error.legacy.ts` and old exports.

## Files to Modify

### New Files
- `src/libs/error/error.types.ts`
- `src/libs/error/error.codes.ts`
- `src/libs/error/error.factories.ts`
- `src/libs/error/error.http.ts`
- `src/libs/error/error.utils.ts`
- `src/libs/error/error.legacy.ts`

### Modified Files
- `src/libs/error/error.ts` (remove constructor logging)
- `src/libs/error/index.ts` (add new exports)
- `src/core/services/nexus/nexus.utils.ts`
- `src/core/services/homegate/homegate.ts`
- `src/core/services/homeserver/homeserver.ts`
- `src/core/services/homeserver/error.utils.ts`
- `src/core/services/exchangerate/exchangerate.ts`
- `src/core/services/chatwoot/chatwoot.api.ts`
- `src/core/services/local/**/*.ts` (15 files)

## Related Decisions

- **ADR-0013**: Full error handling vision (this is Phase 1 of that plan)
- **ADR-0004**: Layering and dependency rules
- **Phase 2 (future)**: Application layer error authority, displayMessage, single logging point

## Open Questions

1. **Should we add ESLint rule now?** Consider `no-restricted-syntax` banning `throw new Error` in services after migration.

2. **Logger.debug in services?** Currently allowed for success tracing. Keep or remove?

3. **Error serialization for Sentry?** May need `toJSON()` method on AppError for error tracking integration.
