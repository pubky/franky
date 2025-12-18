import type { AuthFlow, Session } from '@synonymdev/pubky';

import * as Libs from '@/libs';

export const AUTH_FLOW_CANCELED_ERROR_NAME = 'AuthFlowCanceled';

type RetryableStatusCode = 408 | 429 | 500 | 502 | 503 | 504;

const getStatusCode = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) return undefined;
  if (!('data' in error)) return undefined;
  const data = (error as { data?: unknown }).data;
  if (typeof data !== 'object' || data === null) return undefined;
  if (!('statusCode' in data)) return undefined;
  const statusCode = (data as { statusCode?: unknown }).statusCode;
  return typeof statusCode === 'number' ? statusCode : undefined;
};

const isRetryableRelayPollError = (error: unknown): boolean => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: unknown }).name === 'RequestError'
  ) {
    const statusCode = getStatusCode(error);
    if (!statusCode) return true;
    return ([408, 429, 500, 502, 503, 504] as RetryableStatusCode[]).includes(statusCode as RetryableStatusCode);
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('timed out') || message.includes('timeout')) return true;
    if (message.includes('504') || message.includes('gateway')) return true;
  }

  return false;
};

const createCanceledError = (): Error => {
  const error = new Error('Auth flow canceled');
  error.name = AUTH_FLOW_CANCELED_ERROR_NAME;
  return error;
};

export type CancelableAuthApproval = {
  awaitApproval: Promise<Session>;
  cancel: () => void;
};

/**
 * Creates a cancelable approval promise for an AuthFlow.
 *
 * Why not use `flow.awaitApproval()`?
 * - In Pubky rc7, `awaitApproval()` consumes the WASM handle (`__destroy_into_raw()`), so the JS `AuthFlow`
 *   cannot be `free()`'d afterwards.
 * - In React dev (StrictMode), mount/unmount cycles can leave long-polling relay requests alive even after
 *   the component unmounts. Using `tryPollOnce()` keeps the handle free-able so we can cancel cleanly.
 */
export function createCancelableAuthApproval(
  flow: AuthFlow,
  options?: { pollIntervalMs?: number },
): CancelableAuthApproval {
  const pollIntervalMs = options?.pollIntervalMs ?? 2_000;

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

    for (;;) {
      if (canceled) throw createCanceledError();

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
}
