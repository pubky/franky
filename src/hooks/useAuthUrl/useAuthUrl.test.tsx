import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthUrl } from './useAuthUrl';
import type { Session } from '@synonymdev/pubky';

// Types
interface MockAuthUrlResponse {
  authorizationUrl: string;
  awaitApproval: Promise<Session>;
}

// Mock dependencies
const mockToast = vi.fn();
const mockLoggerError = vi.fn();
const mockGetAuthUrl = vi.fn();
const mockInitializeAuthenticatedSession = vi.fn();

vi.mock('@/molecules', () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}));

vi.mock('@/libs', () => ({
  Logger: {
    error: (...args: unknown[]) => mockLoggerError(...args),
  },
}));

vi.mock('@/core', () => ({
  AuthController: {
    getAuthUrl: (...args: unknown[]) => mockGetAuthUrl(...args),
    initializeAuthenticatedSession: (...args: unknown[]) => mockInitializeAuthenticatedSession(...args),
  },
}));

describe('useAuthUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial fetch on mount', () => {
    it('should fetch auth URL automatically on mount', async () => {
      const mockAuthUrl = 'pubkyring://authorize?token=test123';
      const mockAwaitApproval = new Promise<Session>(() => {});

      mockGetAuthUrl.mockResolvedValue({
        authorizationUrl: mockAuthUrl,
        awaitApproval: mockAwaitApproval,
      });

      const { result } = renderHook(() => useAuthUrl());

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.url).toBe('');

      await waitFor(() => {
        expect(result.current.url).toBe(mockAuthUrl);
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetAuthUrl).toHaveBeenCalledTimes(1);
    });

    it('should not fetch on mount if autoFetch is false', async () => {
      const { result } = renderHook(() => useAuthUrl({ autoFetch: false }));

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(true);
        expect(result.current.url).toBe('');
      });

      expect(mockGetAuthUrl).not.toHaveBeenCalled();
    });
  });

  describe('Successful auth URL generation', () => {
    it('should set URL and clear loading state on success', async () => {
      const mockAuthUrl = 'pubkyring://authorize?token=success';
      const mockAwaitApproval = new Promise<Session>(() => {});

      mockGetAuthUrl.mockResolvedValue({
        authorizationUrl: mockAuthUrl,
        awaitApproval: mockAwaitApproval,
      });

      const { result } = renderHook(() => useAuthUrl());

      await waitFor(() => {
        expect(result.current.url).toBe(mockAuthUrl);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.retryCount).toBe(0);
      });
    });

    it('should handle empty authorizationUrl gracefully', async () => {
      mockGetAuthUrl.mockResolvedValue({
        authorizationUrl: '',
        awaitApproval: new Promise<Session>(() => {}),
      });

      const { result } = renderHook(() => useAuthUrl());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.url).toBe('');
      });
    });
  });

  describe('Approval promise handling', () => {
    it('should call initializeAuthenticatedSession when approval succeeds', async () => {
      const mockAuthUrl = 'pubkyring://authorize?token=approval-test';
      const mockSession = { token: 'test-token' } as Session;

      let resolveApproval: (session: Session) => void;
      const mockAwaitApproval = new Promise<Session>((resolve) => {
        resolveApproval = resolve;
      });

      mockGetAuthUrl.mockResolvedValue({
        authorizationUrl: mockAuthUrl,
        awaitApproval: mockAwaitApproval,
      });

      renderHook(() => useAuthUrl());

      await waitFor(() => {
        expect(mockGetAuthUrl).toHaveBeenCalled();
      });

      // Resolve approval
      resolveApproval!(mockSession);

      await waitFor(() => {
        expect(mockInitializeAuthenticatedSession).toHaveBeenCalledWith({
          session: mockSession,
        });
      });
    });

    it('should show toast when approval promise rejects', async () => {
      const mockAuthUrl = 'pubkyring://authorize?token=rejection-test';

      let rejectApproval: (error: Error) => void;
      const mockAwaitApproval = new Promise<Session>((_, reject) => {
        rejectApproval = reject;
      });

      mockGetAuthUrl.mockResolvedValue({
        authorizationUrl: mockAuthUrl,
        awaitApproval: mockAwaitApproval,
      });

      renderHook(() => useAuthUrl());

      await waitFor(() => {
        expect(mockGetAuthUrl).toHaveBeenCalled();
      });

      // Reject approval
      rejectApproval!(new Error('User cancelled'));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Authorization was not completed',
          description: 'The signer did not complete authorization. Please try again.',
        });
      });
    });

    it('should show toast when initializeAuthenticatedSession fails', async () => {
      const mockAuthUrl = 'pubkyring://authorize?token=init-failure';
      const mockSession = { token: 'test-token' } as Session;

      let resolveApproval: (session: Session) => void;
      const mockAwaitApproval = new Promise<Session>((resolve) => {
        resolveApproval = resolve;
      });

      mockGetAuthUrl.mockResolvedValue({
        authorizationUrl: mockAuthUrl,
        awaitApproval: mockAwaitApproval,
      });

      mockInitializeAuthenticatedSession.mockRejectedValue(new Error('Failed to initialize session'));

      renderHook(() => useAuthUrl());

      await waitFor(() => {
        expect(mockGetAuthUrl).toHaveBeenCalled();
      });

      // Resolve approval (but initialization will fail)
      resolveApproval!(mockSession);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Sign in failed. Please try again.',
          description: 'Unable to complete authorization with Pubky Ring. Please try again.',
        });
      });
    });
  });

  describe('Retry logic', () => {
    it('should retry up to 3 times with exponential backoff', async () => {
      // First 2 calls fail, third succeeds
      mockGetAuthUrl
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          authorizationUrl: 'pubkyring://authorize?token=retry-success',
          awaitApproval: new Promise<Session>(() => {}),
        });

      const { result } = renderHook(() => useAuthUrl());

      // Wait for all retries to complete and URL to be set
      await waitFor(
        () => {
          expect(result.current.url).toBe('pubkyring://authorize?token=retry-success');
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 },
      );

      // Should have called getAuthUrl 3 times total (initial + 2 retries)
      expect(mockGetAuthUrl).toHaveBeenCalledTimes(3);
      expect(result.current.retryCount).toBe(0); // Reset after success
    });

    it('should show error toast after max retries', async () => {
      mockGetAuthUrl.mockRejectedValue(new Error('Persistent network error'));

      const { result } = renderHook(() => useAuthUrl());

      // Wait for all retries to exhaust
      await waitFor(
        () => {
          expect(mockToast).toHaveBeenCalledWith({
            title: 'QR code generation failed',
            description: 'Unable to generate sign-in QR code. Please refresh and try again.',
          });
        },
        { timeout: 3000 },
      );

      expect(result.current.isLoading).toBe(false);
      expect(mockGetAuthUrl).toHaveBeenCalledTimes(3); // Initial + 2 retries = 3 total attempts
    });

    it('should log errors during retry attempts', async () => {
      mockGetAuthUrl.mockRejectedValue(new Error('Test error'));

      renderHook(() => useAuthUrl());

      await waitFor(
        () => {
          expect(mockLoggerError).toHaveBeenCalledWith(
            expect.stringContaining('Failed to generate auth URL'),
            expect.any(Error),
          );
        },
        { timeout: 3000 },
      );
    });
  });

  describe('Manual fetchUrl call', () => {
    it('should allow manual refresh via fetchUrl', async () => {
      mockGetAuthUrl.mockResolvedValue({
        authorizationUrl: 'pubkyring://authorize?token=manual',
        awaitApproval: new Promise<Session>(() => {}),
      });

      const { result } = renderHook(() => useAuthUrl({ autoFetch: false }));

      // Initially no URL
      expect(result.current.url).toBe('');

      // Manually call fetchUrl
      await result.current.fetchUrl();

      await waitFor(() => {
        expect(result.current.url).toBe('pubkyring://authorize?token=manual');
      });
    });
  });

  describe('Component unmount cleanup', () => {
    it('should not update state after unmount', async () => {
      const mockAuthUrl = 'pubkyring://authorize?token=unmount-test';

      let resolveGetAuthUrl: (value: MockAuthUrlResponse) => void;
      const pendingPromise = new Promise<MockAuthUrlResponse>((resolve) => {
        resolveGetAuthUrl = resolve;
      });

      mockGetAuthUrl.mockReturnValue(pendingPromise);

      const { result, unmount } = renderHook(() => useAuthUrl());

      // Verify hook is mounted and loading
      expect(result.current.isLoading).toBe(true);

      // Unmount before promise resolves
      unmount();

      // Now resolve the promise
      resolveGetAuthUrl!({
        authorizationUrl: mockAuthUrl,
        awaitApproval: new Promise<Session>(() => {}),
      });

      // Wait a bit to ensure no state updates occur
      await new Promise((resolve) => setTimeout(resolve, 50));

      // State should remain as it was before unmount (loading)
      expect(result.current.isLoading).toBe(true);
      expect(result.current.url).toBe('');
    });
  });

  describe('Request deduplication', () => {
    it('should ignore stale requests when newer request completes first', async () => {
      const firstUrl = 'pubkyring://authorize?token=first';
      const secondUrl = 'pubkyring://authorize?token=second';

      let resolveFirst: (value: MockAuthUrlResponse) => void;
      let resolveSecond: (value: MockAuthUrlResponse) => void;

      const firstPromise = new Promise<MockAuthUrlResponse>((resolve) => {
        resolveFirst = resolve;
      });
      const secondPromise = new Promise<MockAuthUrlResponse>((resolve) => {
        resolveSecond = resolve;
      });

      mockGetAuthUrl.mockReturnValueOnce(firstPromise).mockReturnValueOnce(secondPromise);

      const { result } = renderHook(() => useAuthUrl({ autoFetch: false }));

      // Start first request
      void result.current.fetchUrl();

      await waitFor(() => {
        expect(mockGetAuthUrl).toHaveBeenCalledTimes(1);
      });

      // Start second request
      void result.current.fetchUrl();

      await waitFor(() => {
        expect(mockGetAuthUrl).toHaveBeenCalledTimes(2);
      });

      // Resolve second (newer) request first
      resolveSecond!({
        authorizationUrl: secondUrl,
        awaitApproval: new Promise<Session>(() => {}),
      });

      await waitFor(() => {
        expect(result.current.url).toBe(secondUrl);
      });

      // Now resolve first (stale) request - should be ignored
      resolveFirst!({
        authorizationUrl: firstUrl,
        awaitApproval: new Promise<Session>(() => {}),
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      // URL should still be the second one
      expect(result.current.url).toBe(secondUrl);
    });
  });
});
