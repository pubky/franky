import { parseResponseOrThrow } from '@/core/services/nexus/nexus.utils';
import * as Libs from '@/libs';
import { Session, type AuthFlow } from '@synonymdev/pubky';
import type { CancelableAuthApproval, PubPath } from './homeserver.types';
import { HomeserverAction } from './homeserver.types';
import { createCanceledError, handleError, isRetryableRelayPollError } from './error.utils';

// Re-export error utilities for backwards compatibility
export {
  AUTH_FLOW_CANCELED_ERROR_NAME,
  createCanceledError,
  handleError,
  isRetryableRelayPollError,
} from './error.utils';

// URL protocol constants
const PUBKY_PROTOCOL = 'pubky://';
const PUBKYAUTH_PROTOCOL = 'pubkyauth://';
export const PUBKY_PREFIX = 'pubky';
const PUBKY_HOSTNAME_PREFIX = '_pubky.';

/**
 * Checks if a URL is an HTTP or HTTPS URL
 * @param url - The URL to check
 * @returns True if the URL is HTTP/HTTPS, false otherwise
 */
export const isHttpUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Extracts the pathname from various URL formats.
 *
 * Supported formats:
 * - `/pub/path` → `/pub/path` (relative path, returned as-is)
 * - `pubky://z32id/pub/path` → `/pub/path`
 * - `pubkyz32id/pub/path` → `/pub/path` (compact format)
 * - `https://example.com/pub/path` → `/pub/path`
 *
 * @param url - The URL to extract pathname from
 * @returns The pathname if found, null otherwise
 */
export const toPathname = (url: string): string | null => {
  if (url.startsWith('/')) return url;

  if (url.startsWith(PUBKY_PROTOCOL)) {
    const rest = url.slice(PUBKY_PROTOCOL.length);
    const idx = rest.indexOf('/');
    return idx === -1 ? null : rest.slice(idx);
  }

  if (url.startsWith(PUBKY_PREFIX) && !url.startsWith(PUBKYAUTH_PROTOCOL)) {
    const idx = url.indexOf('/', PUBKY_PREFIX.length);
    return idx === -1 ? null : url.slice(idx);
  }

  if (isHttpUrl(url)) {
    try {
      return new URL(url).pathname || null;
    } catch {
      return null;
    }
  }

  return null;
};

/**
 * Extracts the Pubky z32 identifier from various URL formats.
 *
 * Supported formats:
 * - `pubky://z32id/path` → `z32id`
 * - `pubkyz32id/path` → `z32id` (compact format)
 * - `https://_pubky.z32id/path` → `z32id` (HTTP with pubky hostname)
 *
 * @param url - The URL to extract Pubky identifier from
 * @returns The Pubky z32 identifier if found, null otherwise
 */
export const extractPubkyZ32 = (url: string): string | null => {
  if (url.startsWith(PUBKY_PROTOCOL)) {
    const rest = url.slice(PUBKY_PROTOCOL.length);
    const idx = rest.indexOf('/');
    return (idx === -1 ? rest : rest.slice(0, idx)) || null;
  }

  if (url.startsWith(PUBKY_PREFIX) && !url.startsWith(PUBKYAUTH_PROTOCOL)) {
    const rest = url.slice(PUBKY_PREFIX.length);
    const idx = rest.indexOf('/');
    return (idx === -1 ? rest : rest.slice(0, idx)) || null;
  }

  if (isHttpUrl(url)) {
    try {
      const { hostname } = new URL(url);
      return hostname.startsWith(PUBKY_HOSTNAME_PREFIX) ? hostname.slice(PUBKY_HOSTNAME_PREFIX.length) || null : null;
    } catch {
      return null;
    }
  }

  return null;
};

/**
 * Parses a response as JSON, returning undefined if parsing fails with INVALID_RESPONSE error
 * @param response - The response to parse
 * @returns The parsed JSON data or undefined if parsing fails with INVALID_RESPONSE
 */
export const parseResponseOrUndefined = async <T>(response: Response): Promise<T | undefined> => {
  try {
    return await parseResponseOrThrow<T>(response);
  } catch (error) {
    if (error instanceof Libs.AppError && error.type === Libs.NexusErrorType.INVALID_RESPONSE) {
      return undefined;
    }
    throw error;
  }
};

/**
 * Creates a cancelable auth approval wrapper around an AuthFlow.
 * Pubky rc7: awaitApproval consumes the WASM handle, so we use tryPollOnce to keep flow.free() usable.
 * @param flow - The auth flow to wrap
 * @param options - Optional configuration with poll interval in milliseconds
 * @returns CancelableAuthApproval with awaitApproval promise and cancel function
 */
export const createCancelableAuthApproval = (
  flow: AuthFlow,
  options?: { pollIntervalMs?: number; maxPollAttempts?: number },
): CancelableAuthApproval => {
  const pollIntervalMs = options?.pollIntervalMs ?? 2_000;
  const maxPollAttempts = options?.maxPollAttempts ?? 150;

  let canceled = false;
  let freed = false;

  const cancel = () => {
    canceled = true;
    if (freed) return;
    freed = true;
    try {
      flow.free();
    } catch {
      // Ignore double-free or already-finalized WASM objects.
    }
  };

  const awaitApproval = (async () => {
    await Libs.sleep(0);

    let attempts = 0;
    for (;;) {
      if (canceled) throw createCanceledError();
      if (++attempts > maxPollAttempts) {
        throw Libs.createHomeserverError(
          Libs.HomeserverErrorType.AUTH_REQUEST_FAILED,
          'Auth flow timed out after maximum attempts',
          408,
          { maxAttempts: maxPollAttempts },
        );
      }

      try {
        const maybeSession = await flow.tryPollOnce();
        if (maybeSession) return maybeSession;
      } catch (error) {
        if (canceled) throw createCanceledError();
        if (isRetryableRelayPollError(error)) {
          await Libs.sleep(pollIntervalMs);
          continue;
        }
        throw error;
      }

      await Libs.sleep(pollIntervalMs);
    }
  })();

  return {
    awaitApproval: awaitApproval.finally(() => cancel()),
    cancel,
  };
};

/**
 * Resolves an owned session path from a URL.
 * Checks if the URL matches the current session's pubky and is a valid /pub/* path.
 *
 * @param url - The URL to resolve
 * @param session - The current session (or null if not authenticated)
 * @param pubPathPrefix - The pub path prefix constant (e.g., '/pub/')
 * @returns Object with session and path if owned, null otherwise
 */
export const resolveOwnedSessionPath = (
  url: string,
  session: Session | null,
  pubPathPrefix: string,
): { session: Session; path: PubPath<string> } | null => {
  if (!session) return null;

  const pathname = toPathname(url);
  if (!pathname || !pathname.startsWith(pubPathPrefix)) return null;
  const path = pathname as PubPath<string>;

  if (url.startsWith('/')) return { session, path };

  const sessionPubky = session.info?.publicKey?.z32?.();
  if (!sessionPubky) return null;

  const urlPubky = extractPubkyZ32(url);
  if (!urlPubky || urlPubky !== sessionPubky) return null;

  return { session, path };
};

/**
 * Checks if the response indicates a session expiration (401 Unauthorized).
 * If so, throws a SESSION_EXPIRED error with the response message.
 *
 * @param response - The response to check
 * @param url - The URL that was requested
 * @throws {HomeserverError} When response status is 401
 */
export const checkSessionExpiration = async (response: Response, url: string): Promise<void> => {
  if (response.status === 401) {
    let errorMessage = 'Session expired';
    try {
      const text = await response.text();
      if (text) {
        errorMessage = text;
      }
    } catch {
      // Ignore error reading response body
    }
    throw Libs.createHomeserverError(Libs.HomeserverErrorType.SESSION_EXPIRED, errorMessage, 401, { url });
  }
};

/**
 * Asserts that a response is OK, throwing an error if not.
 * Checks for session expiration and throws appropriate errors.
 *
 * @param response - The response to check
 * @param url - The URL that was requested
 * @param errorType - The type of error to throw if not OK
 * @param errorMessage - The error message to use
 * @throws {HomeserverError} When response is not OK
 */
export const assertOk = async (
  response: Response,
  url: string,
  errorType: Libs.HomeserverErrorType,
  errorMessage: string,
): Promise<void> => {
  if (response.ok) return;
  await checkSessionExpiration(response, url);
  throw Libs.createHomeserverError(errorType, errorMessage, response.status, {
    url,
    statusCode: response.status,
    statusText: response.statusText,
  });
};

/**
 * Gets a response from session storage with error handling and validation.
 * Attempts to get the response, handles errors, and asserts the response is OK.
 *
 * @param session - The session to get the response from
 * @param path - The path to get
 * @param url - The URL for error context
 * @returns The response from storage
 * @throws {HomeserverError} When response is not OK or storage.get fails
 */
export const getOwnedResponse = async (session: Session, path: PubPath<string>, url: string): Promise<Response> => {
  const response = await session.storage.get(path).catch((error) =>
    // Transforms the error into an AppError and re-throws to caller
    handleError(error, Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to fetch data', 500, {
      url,
      method: HomeserverAction.GET,
    }),
  );

  await assertOk(response, url, Libs.HomeserverErrorType.FETCH_FAILED, 'Failed to fetch data');
  return response;
};
