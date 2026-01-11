# Error Handling (TBD)

## Goals

- Give every layer in `src/core` a predictable error contract built on top of `AppError`.
- Preserve rich context (status codes, identifiers, payload hints) so callers can act intelligently.
- Log each failure exactly once while keeping retry and UX logic deterministic.

## Current Pain Points

- Layers mix raw `Error`, `AppError`, and plain strings, forcing callers to guess the shape.
- Context disappears on rethrow (`throw error`) leaving no trace of table names, URLs, or inputs.
- Both low-level services and controllers log the same issue, inflating telemetry and hiding sequence of events.
- Retry loops do not inspect error type or status, so transient and fatal cases are treated identically.

## Layered Strategy

Adopt layer-specific helpers that always return an `AppError` subclass/factory result before crossing the boundary. Downstream code can safely switch on `error instanceof AppError` and the `type` enum, while each layer keeps vocabulary relevant to its responsibilities.

### Rationale

- **Consistency**: everything bubbling up is one shape (`AppError`) so tests/UI only need to handle the enumerated types.
- **Context preservation**: each layer adds the data it uniquely owns (e.g., models know table names, services know URLs).
- **Logging discipline**: log inside the error factory (or in one calling site) and rely on `details` for observability. Higher layers avoid duplicate logging.

## Conventions per Layer

### Models

- Never throw raw errors; wrap with `createDatabaseError(DatabaseErrorType.UPSERT_FAILED, ...)` and include `table`, `id`.
- Skip logging—let services decide when/how to record the incident.

### Local Services

- Catch model exceptions only to append context (`service: 'LocalStreamPostsService', action: 'persistPosts'`).
- Re-throw the same `AppError` instance to avoid losing stack traces.
- For unexpected input validation issues, issue `createCommonError(CommonErrorType.INVALID_INPUT, ...)`.

### Remote Services

- Guard all fetch requests with `ensureHttpResponseOk` and `parseResponseOrThrow` to produce `AppError` automatically.
- Attach metadata such as `endpoint`, `method`, `status`, `bodyPreview`, `pubky`.
- Differentiate transient errors (`SERVICE_UNAVAILABLE`, `NETWORK_ERROR`) from fatal ones to support smarter retries.

### Application Layer

- Treat incoming `AppError` as canonical. Re-throw unless you need to map to a stricter domain error (e.g., converting a homeserver 404 into `SanitizationErrorType.POST_NOT_FOUND`).
- Guard orchestrated operations with try/catch to ensure any stray `Error` becomes `createCommonError(CommonErrorType.UNEXPECTED_ERROR, ...)`.
- When retries are required, inspect `error.type` and abort immediately on non-transient types.

### Controllers

- Wrap entry points with a small helper that normalizes anything non-`AppError`.
- Convert `AppError` to UI/API responses (status code, toast copy) using `ErrorMessages` enums.
- Avoid logging beyond the first handler—delegate to a centralized reporter that consumes the `details` payload.

## Logging & Telemetry

- Logging should happen once, ideally inside the error factory or the closest layer that has full context.
- Use structured logging (`{ type, statusCode, details, stack }`) so monitoring tools can aggregate by `error.type`.
- Surface a `traceId` (or reuse request IDs) in `details` when available to connect cross-layer events.

## Retry Guidance

- Define a `isTransient(error: AppError)` utility that checks `error.type` against a whitelist (`SERVICE_UNAVAILABLE`, `NETWORK_ERROR`, etc.).
- Replace ad-hoc retry loops (e.g., `BootstrapApplication.authorizeAndBootstrap`) with a shared helper that aborts on non-transient types and records attempt count in `details`.

## Migration Checklist

1. **Audit**: search for `throw new Error` / `throw error` in `src/core` and replace with appropriate factory calls.
2. **Normalize services**: ensure Nexus/Homeserver functions never leak raw `Response` failures—use `queryNexus` or wrap the result.
3. **Adopt helpers**: add small layer-specific wrappers (e.g., `LocalStreamError.serviceFailure(...)`) that delegate to `createDatabaseError` but enforce consistent `details` shape.
4. **Update tests**: assert on `error.type` and `statusCode` rather than string matching the message.
5. **Document UI mapping**: maintain a table linking `AppError.type` to user-facing copy from `ErrorMessages`.

## Open Questions

- Would a `Result<T, AppError>` style return improve readability for high-volume paths (https://www.youtube.com/shorts/54wm66X-FR8), or stick with exceptions?
