# ADR 0015: Centralized Error Handling Architecture

## Status

Accepted — 2026-01-14

## Context

### Problem Statement

A modern client-side application interacting with multiple remote services (Nexus, Homeserver, Homegate, Exchangerate, Chatwoot) and local storage (Dexie/IndexedDB) requires a unified error handling strategy that:

1. **Enables deterministic retry logic** — TanStack Query must decide retry behavior based on error semantics, not string parsing
2. **Supports observability** — Future Sentry integration requires structured error data with correlation IDs
3. **Maintains stack traces** — Debugging requires full call stacks from origin to handler
4. **Decouples error production from consumption** — Services throw errors; Application/UI layers decide how to handle them

### Architectural Constraints

The local-first architecture requires errors to distinguish between local (Dexie/IndexedDB) failures and remote service failures. With multiple remote services, a 503 from Nexus must be distinguishable from a 503 from Homegate for logging purposes, even though retry logic treats them identically. TanStack Query integration requires the HTTP status code to be in a predictable location (`context.statusCode`) for retry decisions. Future Sentry integration requires structured properties (`traceId`, `service`, `operation`) for error correlation across the application.

### Design Principle: Error Bubbling

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                 ERROR FLOW DIAGRAM                                    │
├───────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│   THROW HERE                      ENRICH HERE                     HANDLE HERE         │
│   ──────────                      ───────────                     ───────────         │
│                                                                                       │
│  ┌───────────────────┐  throw   ┌───────────────────┐  throw   ┌───────────────────┐ │
│  │  SERVICE / MODEL  │ ───────► │    APPLICATION    │ ───────► │        UI         │ │
│  │      LAYER        │ AppError │       LAYER       │ AppError │       LAYER       │ │
│  └───────────────────┘          └───────────────────┘          └───────────────────┘ │
│           │                              │                              │             │
│           │                              │                              │             │
│   • Wrap all errors              • Log errors                  • Show toast          │
│   • NO logging                   • Add traceId                 • Map to i18n         │
│   • Set service/operation        • Coordinate retries          • Redirect on 401     │
│   • Preserve cause               • Cross-domain handling       • Empty states        │
│                                                                                       │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

**Key Principle**: Errors are thrown at the lowest layer where they originate and bubble up unchanged until a handler decides what to do. Services NEVER log; Application layer is the single logging point (TBD).

---

## Decision

### 1. Error Taxonomy

#### 1.1 Error Categories (WHAT kind of failure)

Categories drive retry decisions and UI routing. They are semantic, not service-specific.

```typescript
// src/libs/error/error.types.ts
enum ErrorCategory {
  Network    = 'network',     // Connection-level: DNS, offline, connection refused
  Timeout    = 'timeout',     // Request/gateway timeout (408, 504, AbortSignal)
  Server     = 'server',      // 5xx from ANY remote service
  Client     = 'client',      // 4xx (400, 404, 409, 410, 413, 422)
  Auth       = 'auth',        // Authentication failures (401, 403)
  RateLimit  = 'rateLimit',   // 429 — special handling for retry-after
  Validation = 'validation',  // Local validation before request
  Database   = 'database',    // Dexie/IndexedDB failures
}
```

#### 1.2 Error Codes (WHICH specific error)

Codes enable precise UI handling (e.g., NOT_FOUND → empty state, CONFLICT → merge dialog).

```typescript
// src/libs/error/error.codes.ts
enum NetworkErrorCode    { OFFLINE, DNS_FAILED, CONNECTION_REFUSED, CONNECTION_RESET, CONNECTION_FAILED }
enum TimeoutErrorCode    { REQUEST_TIMEOUT, GATEWAY_TIMEOUT, REQUEST_ABORTED }
enum ServerErrorCode     { INTERNAL_ERROR, BAD_GATEWAY, SERVICE_UNAVAILABLE, UNKNOWN_ERROR, INVALID_RESPONSE }
enum ClientErrorCode     { BAD_REQUEST, NOT_FOUND, CONFLICT, GONE, UNPROCESSABLE, PAYLOAD_TOO_LARGE }
enum AuthErrorCode       { UNAUTHORIZED, FORBIDDEN, SESSION_EXPIRED, INVALID_TOKEN }
enum RateLimitErrorCode  { RATE_LIMITED, BLOCKED }
enum ValidationErrorCode { INVALID_INPUT, MISSING_FIELD, TYPE_ERROR, FORMAT_ERROR }
enum DatabaseErrorCode   { QUERY_FAILED, WRITE_FAILED, DELETE_FAILED, RECORD_NOT_FOUND, TRANSACTION_FAILED, SCHEMA_ERROR, INIT_FAILED, INTEGRITY_ERROR }
```

**Type Safety**: Category-code relationships are enforced at compile time via `ErrorCodeByCategory`:

```typescript
type ErrorCodeByCategory = {
  [ErrorCategory.Network]: NetworkErrorCode;
  [ErrorCategory.Database]: DatabaseErrorCode;
  // ... compile-time enforcement: cannot create Network error with Database code
};
```

#### 1.3 Error Services (WHERE it originated)

Services are for logging/filtering, NOT for error handling decisions.

```typescript
enum ErrorService {
  Nexus        = 'nexus',
  Homeserver   = 'homeserver',
  Homegate     = 'homegate',
  Exchangerate = 'exchangerate',
  Chatwoot     = 'chatwoot',
  Local        = 'local',
}
```

---

### 2. AppError Class Structure

```typescript
// src/libs/error/error.ts
class AppError extends Error {
  // === DECISION PROPERTIES ===
  readonly category: ErrorCategory;        // Retry logic, routing
  readonly code: ErrorCode;                // Precise UI handling

  // === CONTEXT PROPERTIES ===
  readonly service: ErrorService;          // Logging, Sentry tags
  readonly operation: string;              // Code path tracing
  readonly context?: Record<string, unknown>; // statusCode, endpoint, table, retryAfter
  readonly cause?: unknown;                // Original error for debugging
  readonly traceId?: string;               // Sentry correlation ID
}
```

**Constructor does NOT log** — logging is the Application layer's responsibility.

---

### 3. Service Layer Patterns

#### 3.1 Pattern A: Remote Service with HTTP (Recommended)

Use `safeFetch` + `httpResponseToError` for all HTTP-based services.

```typescript
// src/core/services/homegate/homegate.ts
export class HomegateService {
  static async verifySmsCode(phoneNumber: string, code: string): Promise<TVerifySmsCodeResult> {
    const url = homegateApi.validateSmsCode();
    
    // 1. safeFetch wraps fetch() and converts network errors to AppError
    const response = await safeFetch(
      url,
      { method: HttpMethod.POST, body: JSON.stringify({ phoneNumber, code }), headers: JSON_HEADERS },
      ErrorService.Homegate,
      'verifySmsCode',
    );

    // 2. Check response status and throw typed error
    if (!response.ok) {
      throw httpResponseToError(response, ErrorService.Homegate, 'verifySmsCode', url);
    }

    // 3. Parse JSON with error handling
    return await parseHomegateResponse<TRawApiResponse>(response, 'verifySmsCode', url);
  }
}
```

#### 3.2 Pattern B: Remote Service via TanStack Query

Use `queryNexus` which wraps `safeFetch` + `httpResponseToError` with TanStack Query retry.

```typescript
// src/core/services/nexus/post/post.ts
export class NexusPostService {
  static async getPost({ compositeId }: TCompositeId): Promise<NexusPost> {
    const { pubky: author_id, id: post_id } = parseCompositeId(compositeId);
    const url = postApi.view({ author_id, post_id });
    
    // queryNexus handles: safeFetch → httpResponseToError → parseResponseOrThrow → retry
    return await queryNexus<NexusPost>(url);
  }
}
```

#### 3.3 Pattern C: Local Database Service

Wrap Dexie operations with `Err.database()`.

```typescript
// src/core/services/local/post/post.ts
export class LocalPostService {
  static async create({ compositePostId, post }: TLocalSavePostParams) {
    try {
      await Core.db.transaction('rw', [...tables], async () => {
        await Promise.all([
          Core.PostDetailsModel.create(postDetails),
          Core.PostRelationshipsModel.create(postRelationships),
          // ...
        ]);
      });
    } catch (error) {
      // NO Logger.error here
      throw Err.database(DatabaseErrorCode.WRITE_FAILED, 'Failed to save post', {
        service: ErrorService.Local,
        operation: 'create',
        context: { compositePostId, kind: post.kind },
        cause: error,
      });
    }
  }
}
```

#### 3.4 Pattern D: SDK/Third-Party Error Transformation

Transform external SDK errors (Pubky SDK) into AppError.

```typescript
// src/core/services/homeserver/error.utils.ts
export const handleError = (
  error: unknown,
  additionalContext: Record<string, unknown> = {},
  statusCode: number = HttpStatusCode.INTERNAL_SERVER_ERROR,
): never => {
  // Pass-through existing AppError
  if (error instanceof AppError) {
    throw error;
  }

  const resolvedStatusCode = extractStatusCode(error) ?? statusCode;

  // Handle Pubky SDK typed errors
  if (isPubkyErrorLike(error)) {
    if (error.name === 'InvalidInput') {
      throw Err.validation(ValidationErrorCode.INVALID_INPUT, error.message, {
        service: ErrorService.Homeserver,
        operation: additionalContext.operation as string ?? 'unknown',
        context: additionalContext,
      });
    }
    if (error.name === 'AuthenticationError' || resolvedStatusCode === HttpStatusCode.UNAUTHORIZED) {
      throw Err.auth(AuthErrorCode.SESSION_EXPIRED, error.message, {
        service: ErrorService.Homeserver,
        operation: additionalContext.operation as string ?? 'unknown',
        context: additionalContext,
      });
    }
  }

  // Map to HTTP status code
  throw httpStatusCodeToError(resolvedStatusCode, error.message, ErrorService.Homeserver, ...);
};
```

#### 3.5 Pattern E: Control Flow Errors (Not AppError)

Some errors are control flow signals, not actual errors. Use plain Error with named check.

```typescript
// src/core/services/homeserver/error.utils.ts
export const AUTH_FLOW_CANCELED_ERROR_NAME = 'AuthFlowCanceled';

export const createCanceledError = (): Error => {
  const error = new Error('Auth flow canceled');
  error.name = AUTH_FLOW_CANCELED_ERROR_NAME;
  return error;
};

// Usage in calling code:
try {
  await authFlow.awaitApproval();
} catch (error) {
  if (error instanceof Error && error.name === AUTH_FLOW_CANCELED_ERROR_NAME) {
    return; // Normal exit path, not an error
  }
  throw error; // Actual error
}
```

---

### 4. Integration Points

**HTTP Layer** (`src/libs/error/error.http.ts`, `src/libs/http/response.utils.ts`): Provides `safeFetch` for network error interception, `httpResponseToError` for Response-to-AppError conversion, and `parseResponseOrThrow` for JSON parsing. HTTP status codes are automatically mapped to the appropriate category and code.

**TanStack Query** (`src/libs/query-client/query-client.factory.ts`): The QueryClient factory reads `error.context.statusCode` to make retry decisions. Each service configures its own retry limits, non-retryable codes, and exponential backoff delays.

**Utilities** (`src/libs/error/error.utils.ts`): Category predicates (`isNetworkError`, `isAuthError`, etc.), decision helpers (`isRetryable`, `requiresLogin`, `isNotFound`, `getRetryAfter`), and normalization functions (`toAppError`, `getErrorMessage`) support error handling throughout the application.

---

### 5. Sentry Integration Architecture

The error structure is designed for future Sentry integration without requiring changes to existing error creation code. Sentry capture can be added either at the factory level in `error.factories.ts` (centralized) or at the Application layer when logging (distributed).

All `AppError` properties map naturally to Sentry features: `traceId` enables correlation across services for a single user operation, `service` and `category` become tags for dashboard filtering and alerting, `code` enables precise issue grouping, `operation` provides breadcrumb context for debugging, and `cause` preserves the full error chain for root cause analysis. The `context` object supplies structured data including `statusCode`, `endpoint`, and `retryAfter`.

The recommended Sentry fingerprint is `[service, category, code]`, which groups errors by where they occurred and what type of failure while separating different error codes within the same category.

---

### 6. Anti-Patterns to Avoid

Services must never throw raw `Error` objects—always use `Err.*` factories with proper category, code, service, and operation. Network requests must use `safeFetch` instead of raw `fetch()` to ensure network errors are properly typed. Error handling logic should check `error.category` or `error.code` rather than parsing error messages with string matching. Every error must include both `service` and `operation` for proper tracing. Errors should never be swallowed silently—either handle them explicitly or re-throw to let them bubble up.

---

## Consequences

### Positive ✅

- **Single source of truth**: All errors are `AppError` with consistent structure
- **Compile-time type safety**: Invalid category-code combinations fail at build time
- **Deterministic retry logic**: TanStack Query decisions based on `context.statusCode` and `code`
- **Sentry-ready**: `traceId`, `service`, `operation` enable rich error correlation
- **No double-logging**: Constructor removed logging; Application layer is single point
- **Preserved stack traces**: `AppError extends Error` with proper prototype chain

### Negative ❌

- **Verbosity**: Every error throw requires `service`, `operation`, `context`
- **Learning curve**: Team must understand category vs code vs service distinctions

### Neutral ⚠️

- **QueryClient complexity**: Per-service retry configuration adds config overhead

---

## Related Decisions

- **ADR-0004**: Layering and dependency rules (Services → Application → Controllers)
- **ADR-0013**: Error Handling Phase 1 (superseded by this comprehensive ADR)

---

## References

- [TanStack Query Retry Documentation](https://tanstack.com/query/latest/docs/react/guides/query-retries)
- [Sentry JavaScript SDK](https://docs.sentry.io/platforms/javascript/)
- [Error Handling in Distributed Systems](https://www.usenix.org/conference/osdi16/technical-sessions/presentation/yuan)
