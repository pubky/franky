'use client';

import { useEffect, useRef, useState } from 'react';
import type { AuthFlow, Session } from '@synonymdev/pubky';

import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';

import type { UseAuthUrlOptions, UseAuthUrlReturn } from './useAuthUrl.types';

const MAX_RETRY_ATTEMPTS = 3;

/**
 * Manages the authentication URL lifecycle for Pubky Ring authorization.
 *
 * Handles:
 * - Auth URL generation with automatic retries and exponential backoff
 * - Request deduplication to prevent race conditions
 * - Component mounting guards to prevent state updates after unmount
 * - Async approval promise handling and session initialization
 * - Error handling with user-facing toast notifications
 *
 * @example
 * ```tsx
 * const { url, isLoading, fetchUrl } = useAuthUrl();
 *
 * return (
 *   <div>
 *     {isLoading ? (
 *       <Spinner />
 *     ) : (
 *       <QRCodeSVG value={url} />
 *     )}
 *     <button onClick={fetchUrl}>Refresh</button>
 *   </div>
 * );
 * ```
 */
export function useAuthUrl(options: UseAuthUrlOptions = {}): UseAuthUrlReturn {
  const { autoFetch = true } = options;

  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const currentSession = Core.useAuthStore((state) => state.session);

  // Ref to track if component is still mounted (prevents state updates after unmount)
  const isMountedRef = useRef(true);

  // Ref to track the latest request (prevents race conditions with stale requests)
  const activeRequestRef = useRef<symbol | null>(null);

  // Ref to track if URL generation is in progress (including retries)
  const isGeneratingRef = useRef(false);

  // Ref to track retry attempts
  const retryCountRef = useRef(0);

  // Ref to track the active auth flow, so we can stop WASM polling on unmount/replacement.
  const activeAuthFlowRef = useRef<AuthFlow | null>(null);

  const freeActiveAuthFlow = () => {
    const flow = activeAuthFlowRef.current;
    activeAuthFlowRef.current = null;
    if (!flow) return;
    try {
      flow.free();
    } catch {
      // Ignore double-free or already-finalized WASM objects.
    }
  };

  // If the user becomes authenticated through another pathway (mnemonic, recovery file, etc.),
  // stop any in-flight auth polling immediately.
  useEffect(() => {
    if (currentSession) {
      freeActiveAuthFlow();
    }
  }, [currentSession]);

  /**
   * Fetches the authorization URL from the auth controller.
   * Implements retry logic with exponential backoff.
   * Handles the approval promise for session initialization.
   */
  const fetchUrl = async (options?: { viaRetry?: boolean }): Promise<void> => {
    // Create unique request identifier for deduplication
    const requestId = Symbol('fetchUrl');
    activeRequestRef.current = requestId;
    isGeneratingRef.current = true;

    // Only reset UI state on initial call (not on retries)
    if (!options?.viaRetry) {
      setIsLoading(true);
      setUrl('');
    }

    let willRetry = false;

    try {
      // If a previous flow is still active (e.g. user refreshed the QR),
      // drop it so we don't keep polling forever.
      freeActiveAuthFlow();

      // Request auth URL from controller
      const { authorizationUrl, awaitApproval, authFlow } = await Core.AuthController.getAuthUrl();
      const freeThisFlow = () => {
        try {
          authFlow.free();
        } catch {
          // Ignore double-free or already-finalized WASM objects.
        } finally {
          if (activeAuthFlowRef.current === authFlow) {
            activeAuthFlowRef.current = null;
          }
        }
      };

      // If this request is already stale/unmounted, free immediately.
      if (activeRequestRef.current !== requestId || !isMountedRef.current) {
        freeThisFlow();
        return;
      }

      activeAuthFlowRef.current = authFlow;

      if (!authorizationUrl) {
        freeThisFlow();
        isGeneratingRef.current = false;
        if (isMountedRef.current) setIsLoading(false);
        return;
      }

      // Attach handlers to approval promise to avoid unhandled rejections
      // even if component unmounts. This ensures proper cleanup.
      awaitApproval
        .then(async (session: Session) => {
          // Ignore if unmounted or superseded by newer request
          if (activeRequestRef.current !== requestId || !isMountedRef.current) {
            return;
          }

          try {
            await Core.AuthController.initializeAuthenticatedSession({ session });
          } catch (error) {
            Libs.Logger.error('Failed to persist session and check profile:', error);
            if (!isMountedRef.current) return;

            Molecules.toast({
              title: 'Sign in failed. Please try again.',
              description: 'Unable to complete authorization with Pubky Ring. Please try again.',
            });
          }
        })
        .catch((error: unknown) => {
          // Authorization rejected or transport failure
          if (
            typeof error === 'object' &&
            error !== null &&
            'name' in error &&
            (error as { name?: unknown }).name === 'AuthFlowCanceled'
          ) {
            return;
          }

          Libs.Logger.error('Authorization promise rejected:', error);
          if (!isMountedRef.current || activeRequestRef.current !== requestId) return;

          Molecules.toast({
            title: 'Authorization was not completed',
            description: 'The signer did not complete authorization. Please try again.',
          });
        })
        .finally(() => {
          freeThisFlow();
        });

      // Guard against late responses from previous calls
      if (activeRequestRef.current !== requestId || !isMountedRef.current) {
        return;
      }

      // Success: reset retry count and set URL
      retryCountRef.current = 0;
      setUrl(authorizationUrl);
    } catch (error) {
      // Increment retry count and attempt retry if under limit
      retryCountRef.current += 1;
      const attempts = retryCountRef.current;

      Libs.Logger.error(`Failed to generate auth URL (attempt ${attempts} of ${MAX_RETRY_ATTEMPTS}):`, error);

      if (attempts < MAX_RETRY_ATTEMPTS) {
        // Only retry if this request is still the latest one and the component is mounted.
        // Prevents stale retries from older requests and retries continuing after unmount.
        if (!isMountedRef.current || activeRequestRef.current !== requestId) {
          return;
        }

        willRetry = true;
        // Bounded exponential backoff: 250ms, 500ms, capped at 1000ms
        const delayMs = Math.min(1000, 250 * attempts);
        await new Promise((resolve) => setTimeout(resolve, delayMs));

        if (!isMountedRef.current || activeRequestRef.current !== requestId) {
          return;
        }
        await fetchUrl({ viaRetry: true });
      } else if (isMountedRef.current) {
        // Max retries reached, show error to user
        Molecules.toast({
          title: 'QR code generation failed',
          description: 'Unable to generate sign-in QR code. Please refresh and try again.',
        });
      }
    } finally {
      // Only clear loading state if not immediately retrying and this is the latest request
      if (!willRetry && activeRequestRef.current === requestId) {
        isGeneratingRef.current = false;
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    }
  };

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (!autoFetch) return;

    isMountedRef.current = true;
    void fetchUrl();

    return () => {
      // Cleanup: mark component as unmounted and clear refs
      freeActiveAuthFlow();
      isMountedRef.current = false;
      activeRequestRef.current = null;
      isGeneratingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  return {
    url,
    isLoading,
    isGenerating: isGeneratingRef.current,
    fetchUrl,
    retryCount: retryCountRef.current,
  };
}
