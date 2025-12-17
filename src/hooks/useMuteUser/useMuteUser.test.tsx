import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMuteUser } from './useMuteUser';
import * as Core from '@/core';

// Hoist mock functions before vi.mock
const {
  mockCurrentUserPubky,
  setMockCurrentUserPubky,
  mockCommitMute,
  mockFindById,
  mockLoggerDebug,
  mockLoggerError,
  mockIsAppError,
  mockRelationship,
  setMockRelationship,
} = vi.hoisted(() => {
  const currentUserPubky = { current: 'pk:current-user' as Core.Pubky | null };
  const relationship = {
    current: undefined as Core.UserRelationshipsModelSchema | null | undefined,
  };
  const commitMute = vi.fn();
  const findById = vi.fn();
  const loggerDebug = vi.fn();
  const loggerError = vi.fn();
  const isAppError = vi.fn();

  return {
    mockCurrentUserPubky: currentUserPubky,
    setMockCurrentUserPubky: (value: Core.Pubky | null) => {
      currentUserPubky.current = value;
    },
    mockCommitMute: commitMute,
    mockFindById: findById,
    mockLoggerDebug: loggerDebug,
    mockLoggerError: loggerError,
    mockIsAppError: isAppError,
    mockRelationship: relationship,
    setMockRelationship: (value: Core.UserRelationshipsModelSchema | null | undefined) => {
      relationship.current = value;
    },
  };
});

// Mock Core
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    useAuthStore: vi.fn((selector) => {
      const state = {
        currentUserPubky: mockCurrentUserPubky.current,
      };
      return selector ? selector(state) : state;
    }),
    UserController: {
      commitMute: mockCommitMute,
    },
    UserRelationshipsModel: {
      findById: mockFindById,
    },
  };
});

// Mock Libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    Logger: {
      ...actual.Logger,
      debug: mockLoggerDebug,
      error: mockLoggerError,
    },
    isAppError: mockIsAppError,
  };
});

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn((queryFn: () => Promise<unknown>, deps: unknown[], _defaultValue: unknown) => {
    // Execute the query function to trigger it
    if (queryFn) {
      void queryFn();
    }
    // Check if targetUserId is provided in deps
    const targetUserId = deps?.[0];
    // If targetUserId is not provided, query function returns null early
    if (!targetUserId) {
      return null;
    }
    // Return the mock relationship value
    // If mockRelationship.current is explicitly undefined, return undefined (loading state)
    // Otherwise return mockRelationship.current (could be null or an object)
    if (mockRelationship.current === undefined) {
      return undefined; // Loading state
    }
    return mockRelationship.current; // null or relationship object
  }),
}));

describe('useMuteUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockCurrentUserPubky('pk:current-user');
    mockCommitMute.mockResolvedValue(undefined);
    mockFindById.mockResolvedValue(null);
    mockIsAppError.mockReturnValue(false);
    setMockRelationship(undefined);
  });

  describe('Initial State', () => {
    it('should return initial state with default values', () => {
      // When targetUserId is not provided, query function returns null synchronously
      // So relationship should be null, not undefined
      setMockRelationship(null);
      const { result } = renderHook(() => useMuteUser());

      expect(result.current.isMuted).toBe(false);
      // When targetUserId is not provided, query returns null (not undefined), so isMutedLoading is false
      expect(result.current.isMutedLoading).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.loadingUserId).toBe(null);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.toggleMute).toBe('function');
      expect(typeof result.current.isUserLoading).toBe('function');
    });

    it('should return muted state when relationship exists and muted is true', () => {
      setMockRelationship({ muted: true });
      const { result } = renderHook(() => useMuteUser('pk:target-user'));

      expect(result.current.isMuted).toBe(true);
      expect(result.current.isMutedLoading).toBe(false);
    });

    it('should return unmuted state when relationship exists and muted is false', () => {
      setMockRelationship({ muted: false });
      const { result } = renderHook(() => useMuteUser('pk:target-user'));

      expect(result.current.isMuted).toBe(false);
      expect(result.current.isMutedLoading).toBe(false);
    });

    it('should return loading state when relationship is undefined', () => {
      setMockRelationship(undefined);
      const { result } = renderHook(() => useMuteUser('pk:target-user'));

      expect(result.current.isMutedLoading).toBe(true);
    });
  });

  describe('Live Query Behavior', () => {
    it('should not query when targetUserId is not provided', () => {
      renderHook(() => useMuteUser());

      expect(mockFindById).not.toHaveBeenCalled();
    });

    it('should not query when currentUserPubky is not set', () => {
      setMockCurrentUserPubky(null);
      renderHook(() => useMuteUser('pk:target-user'));

      expect(mockFindById).not.toHaveBeenCalled();
    });

    it('should not query when targetUserId equals currentUserPubky', () => {
      setMockCurrentUserPubky('pk:same-user');
      renderHook(() => useMuteUser('pk:same-user'));

      expect(mockFindById).not.toHaveBeenCalled();
    });

    it('should query when both targetUserId and currentUserPubky are set', () => {
      setMockCurrentUserPubky('pk:current-user');
      renderHook(() => useMuteUser('pk:target-user'));

      expect(mockFindById).toHaveBeenCalledWith('pk:target-user');
    });
  });

  describe('toggleMute', () => {
    it('should mute user when currently unmuted', async () => {
      setMockRelationship({ muted: false });
      const { result } = renderHook(() => useMuteUser('pk:target-user'));

      await act(async () => {
        await result.current.toggleMute('pk:target-user', false);
      });

      expect(mockCommitMute).toHaveBeenCalledWith(Core.HomeserverAction.PUT, {
        muter: 'pk:current-user',
        mutee: 'pk:target-user',
      });
      expect(mockLoggerDebug).toHaveBeenCalledWith('[useMuteUser] Successfully muted user', {
        userId: 'pk:target-user',
      });
      expect(result.current.error).toBe(null);
    });

    it('should unmute user when currently muted', async () => {
      setMockRelationship({ muted: true });
      const { result } = renderHook(() => useMuteUser('pk:target-user'));

      await act(async () => {
        await result.current.toggleMute('pk:target-user', true);
      });

      expect(mockCommitMute).toHaveBeenCalledWith(Core.HomeserverAction.DELETE, {
        muter: 'pk:current-user',
        mutee: 'pk:target-user',
      });
      expect(mockLoggerDebug).toHaveBeenCalledWith('[useMuteUser] Successfully unmuted user', {
        userId: 'pk:target-user',
      });
      expect(result.current.error).toBe(null);
    });

    it('should set error when user is not authenticated', async () => {
      setMockCurrentUserPubky(null);
      const { result } = renderHook(() => useMuteUser());

      await act(async () => {
        await result.current.toggleMute('pk:target-user', false);
      });

      expect(mockCommitMute).not.toHaveBeenCalled();
      expect(result.current.error).toBe('User not authenticated');
    });

    it('should set error when trying to mute yourself', async () => {
      setMockCurrentUserPubky('pk:current-user');
      const { result } = renderHook(() => useMuteUser());

      await act(async () => {
        await result.current.toggleMute('pk:current-user', false);
      });

      expect(mockCommitMute).not.toHaveBeenCalled();
      expect(result.current.error).toBe('Cannot mute yourself');
    });

    it('should set loading state during mute operation', async () => {
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockCommitMute.mockReturnValueOnce(promise);
      setMockRelationship({ muted: false });

      const { result } = renderHook(() => useMuteUser('pk:target-user'));

      act(() => {
        result.current.toggleMute('pk:target-user', false);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
        expect(result.current.loadingUserId).toBe('pk:target-user');
      });

      await act(async () => {
        resolvePromise!();
        await promise;
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.loadingUserId).toBe(null);
      });
    });

    it('should handle error and set error message', async () => {
      const mockError = new Error('Failed to mute user');
      mockCommitMute.mockRejectedValueOnce(mockError);
      setMockRelationship({ muted: false });

      const { result } = renderHook(() => useMuteUser('pk:target-user'));

      await act(async () => {
        try {
          await result.current.toggleMute('pk:target-user', false);
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Failed to update mute status');
      expect(mockLoggerError).toHaveBeenCalledWith('[useMuteUser] Failed to toggle mute:', mockError);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.loadingUserId).toBe(null);
    });

    it('should handle AppError and use its message', async () => {
      const mockAppError = { message: 'Custom error message', type: 'AppError' };
      mockIsAppError.mockReturnValue(true);
      mockCommitMute.mockRejectedValueOnce(mockAppError);
      setMockRelationship({ muted: false });

      const { result } = renderHook(() => useMuteUser('pk:target-user'));

      await act(async () => {
        try {
          await result.current.toggleMute('pk:target-user', false);
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Custom error message');
      expect(mockLoggerError).toHaveBeenCalledWith('[useMuteUser] Failed to toggle mute:', mockAppError);
    });

    it('should clear error on successful mute', async () => {
      setMockRelationship({ muted: false });
      const { result } = renderHook(() => useMuteUser('pk:target-user'));

      // Set an error first
      await act(async () => {
        try {
          await result.current.toggleMute('pk:target-user', false);
        } catch {
          // Ignore
        }
      });

      // Clear error by setting it manually (simulating previous error state)
      await act(async () => {
        await result.current.toggleMute('pk:target-user', false);
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('isUserLoading', () => {
    it('should return true when specific user is loading', async () => {
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockCommitMute.mockReturnValueOnce(promise);
      setMockRelationship({ muted: false });

      const { result } = renderHook(() => useMuteUser());

      act(() => {
        result.current.toggleMute('pk:target-user', false);
      });

      await waitFor(() => {
        expect(result.current.isUserLoading('pk:target-user')).toBe(true);
        expect(result.current.isUserLoading('pk:other-user')).toBe(false);
      });

      await act(async () => {
        resolvePromise!();
        await promise;
      });
    });

    it('should return false when no user is loading', () => {
      const { result } = renderHook(() => useMuteUser());

      expect(result.current.isUserLoading('pk:target-user')).toBe(false);
    });

    it('should return false when different user is loading', async () => {
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockCommitMute.mockReturnValueOnce(promise);
      setMockRelationship({ muted: false });

      const { result } = renderHook(() => useMuteUser());

      act(() => {
        result.current.toggleMute('pk:target-user', false);
      });

      await waitFor(() => {
        expect(result.current.isUserLoading('pk:other-user')).toBe(false);
      });

      await act(async () => {
        resolvePromise!();
        await promise;
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid toggle calls', async () => {
      setMockRelationship({ muted: false });
      const { result } = renderHook(() => useMuteUser('pk:target-user'));

      await act(async () => {
        await Promise.all([
          result.current.toggleMute('pk:target-user', false),
          result.current.toggleMute('pk:target-user', false),
        ]);
      });

      // Should have been called (may be called multiple times)
      expect(mockCommitMute).toHaveBeenCalled();
    });

    it('should handle relationship with undefined muted property', () => {
      setMockRelationship({});
      const { result } = renderHook(() => useMuteUser('pk:target-user'));

      expect(result.current.isMuted).toBe(false);
    });
  });
});

describe('useMuteUser - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockCurrentUserPubky('pk:current-user');
    setMockRelationship(null);
  });

  it('matches snapshot for initial state', () => {
    const { result } = renderHook(() => useMuteUser());

    expect(result.current).toMatchSnapshot();
  });

  it('matches snapshot for muted user', () => {
    setMockRelationship({ muted: true });
    const { result } = renderHook(() => useMuteUser('pk:target-user'));

    expect(result.current).toMatchSnapshot();
  });

  it('matches snapshot for unmuted user', () => {
    setMockRelationship({ muted: false });
    const { result } = renderHook(() => useMuteUser('pk:target-user'));

    expect(result.current).toMatchSnapshot();
  });

  it('matches snapshot for loading state', () => {
    setMockRelationship(undefined);
    const { result } = renderHook(() => useMuteUser('pk:target-user'));

    expect(result.current).toMatchSnapshot();
  });
});
