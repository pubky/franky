# Error Handling

This doc is a practical, repo-specific companion to `.cursor/adr/0015-error-handling-architecture.md`.

## Goals

- Give every layer in `src/core` a predictable error contract built on top of `AppError`.
- Preserve rich context (status codes, identifiers, payload hints) so callers can act intelligently.
- Log each failure exactly once while keeping retry and UX logic deterministic.

## Current Pain Points

- Layers mix raw `Error`, `AppError`, and plain strings, forcing callers to guess the shape.
- Context disappears on rethrow (`throw error`) leaving no trace of table names, URLs, or inputs.
- Both low-level services and controllers log the same issue, inflating telemetry and hiding sequence of events.
- Retry loops do not inspect error type or status, so transient and fatal cases are treated identically.

## Current reality (important)

- ✅ The “new” error system uses `category` + `code` + `service` + `operation` + `context` (`src/libs/error/`).
- ✅ `Err.*` factories currently **log automatically** (`src/libs/error/error.factories.ts`).
- ⚠️ Legacy `AppError.type/statusCode/details` still exist in some paths (Phase 2 migration).
- ⚠️ Sentry + traceId inheritance + log de-duplication are planned but not implemented yet (see ADR 0015 Future Work).

## Layered Strategy

Adopt layer-specific patterns that ensure **anything crossing a boundary is an `AppError`**. Downstream code can safely use `isAppError(...)` and switch on `category`/`code`, without string parsing.

### Rationale

- **Consistency**: everything bubbling up is one shape (`AppError`) so callers handle a stable contract.
- **Context preservation**: each layer adds the data it uniquely owns (e.g., models know table names, services know URLs).
- **Logging discipline**: because `Err.*` logs today, higher layers should avoid re-wrapping an `AppError` with `Err.*` again unless they intentionally want another log entry (until Phase 2 de-dup exists).

## Conventions per Layer

### Models

- Never throw raw errors; wrap with `Err.database(DatabaseErrorCode.*, ...)` and include `table`, `id` (or other identifiers) in `context`.
- Prefer **not** to add extra logging around the same failure (factories log).

### Local Services

- Catch model exceptions only to append context (`service: 'LocalStreamPostsService', action: 'persistPosts'`).
- Re-throw the same `AppError` instance to avoid losing stack traces.
- For input validation issues, throw `Err.validation(ValidationErrorCode.*, ...)`.

### Remote Services

- Guard all fetch requests with `safeFetch` + `httpResponseToError` + `parseResponseOrThrow` to produce `AppError` automatically.
- Attach metadata such as `endpoint`, `method`, `status`, `bodyPreview`, `pubky`.
- Differentiate transient errors (`SERVICE_UNAVAILABLE`, `NETWORK_ERROR`) from fatal ones to support smarter retries.

### Application Layer

- Treat incoming `AppError` as canonical. Re-throw unless you need to map to a stricter domain error (e.g., converting a homeserver 404 into `SanitizationErrorType.POST_NOT_FOUND`).
- Guard orchestrated operations with try/catch to ensure any stray `Error` becomes an `AppError` via `toAppError(...)`.
- When retries are required, prefer using TanStack Query retry configuration (which reads `error.context.statusCode`, with legacy fallback).

### Controllers

- Wrap entry points with a small helper that normalizes anything non-`AppError`.
- Convert `AppError` to UI/API responses (status code, toast copy) using `ErrorMessages` where appropriate.
- Avoid duplicate logging beyond the first handler (factories log).

## Logging & Telemetry

- Logging should happen once; **today this is implemented inside `Err.*` factories**.
- Use structured context (`{ service, operation, category, code, context }`) so monitoring tools can aggregate by semantics.
- Surface a `traceId` in `context` when available; automatic generation/inheritance is planned.

## Retry Guidance

- Prefer TanStack Query retry configuration (`src/libs/query-client/query-client.factory.ts`), which makes decisions from `error.context.statusCode` (legacy fallback supported).
- If you need manual retries, prefer switching on `error.category`/`error.code` (or using `isRetryable(error)`).

## Migration Checklist

1. **Audit**: search for `throw new Error` / `throw error` in `src/core` and replace with appropriate factory calls.
2. **Normalize services**: ensure Nexus/Homeserver functions never leak raw `Response` failures—use `queryNexus` or wrap the result.
3. **Adopt helpers**: add small wrappers only if they reduce repetition, but keep the canonical creation point as `Err.*`.
4. **Update tests**: assert on `error.category`/`error.code` (and optionally `context.statusCode`) rather than string matching.
5. **Document UI mapping**: maintain a table linking `ErrorCategory/ErrorCode` (and legacy types during migration) to user-facing copy from `ErrorMessages`.

## Open Questions

- Would a `Result<T, AppError>` style return improve readability for high-volume paths (https://www.youtube.com/shorts/54wm66X-FR8), or stick with exceptions?
