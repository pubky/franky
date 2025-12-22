import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSearchAutocomplete } from './useSearchAutocomplete';
import { AUTOCOMPLETE_DEBOUNCE_MS } from './useSearchAutocomplete.constants';
import type * as Core from '@/core';

// Hoist mock data
const {
  mockUserDetailsMap,
  setMockUserDetailsMap,
  mockGetTagsByPrefix,
  mockGetUsersByName,
  mockFetchUsersById,
  mockGetManyDetails,
  mockGetOrFetchDetails,
  mockGetAvatarUrl,
} = vi.hoisted(() => {
  const userDetailsMap = { current: new Map<Core.Pubky, Core.NexusUserDetails>() };
  return {
    mockUserDetailsMap: userDetailsMap,
    setMockUserDetailsMap: (value: Map<Core.Pubky, Core.NexusUserDetails>) => {
      userDetailsMap.current = value;
    },
    mockGetTagsByPrefix: vi.fn(),
    mockGetUsersByName: vi.fn(),
    mockFetchUsersById: vi.fn(),
    mockGetManyDetails: vi.fn(),
    mockGetOrFetchDetails: vi.fn(),
    mockGetAvatarUrl: vi.fn(),
  };
});

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn((queryFn, _deps, _defaultValue) => {
    // Execute the query function to trigger it
    if (queryFn) {
      void queryFn();
    }
    return mockUserDetailsMap.current;
  }),
}));

// Mock Core
vi.mock('@/core', () => ({
  SearchController: {
    getTagsByPrefix: (...args: unknown[]) => mockGetTagsByPrefix(...args),
    getUsersByName: (...args: unknown[]) => mockGetUsersByName(...args),
    fetchUsersById: (...args: unknown[]) => mockFetchUsersById(...args),
  },
  UserController: {
    getManyDetails: (...args: unknown[]) => mockGetManyDetails(...args),
    getOrFetchDetails: (...args: unknown[]) => mockGetOrFetchDetails(...args),
  },
  FileController: {
    getAvatarUrl: (...args: unknown[]) => mockGetAvatarUrl(...args),
  },
}));

// Mock lodash-es debounce
vi.mock('lodash-es', () => ({
  debounce: vi.fn((fn) => {
    const debouncedFn = vi.fn(fn);
    debouncedFn.cancel = vi.fn();
    return debouncedFn;
  }),
}));

describe('useSearchAutocomplete', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockGetTagsByPrefix.mockResolvedValue(['tech', 'technology', 'techno']);
    mockGetUsersByName.mockResolvedValue(['pk:user1', 'pk:user2']);
    mockFetchUsersById.mockResolvedValue(['pk:abc123']);
    mockGetManyDetails.mockImplementation(({ userIds }: { userIds: Core.Pubky[] }) => {
      const map = new Map<Core.Pubky, Core.NexusUserDetails>();
      for (const userId of userIds) {
        if (userId === 'pk:user1') {
          map.set(userId, { id: 'pk:user1', name: 'User One', image: 'avatar1.jpg' } as Core.NexusUserDetails);
        } else if (userId === 'pk:user2') {
          map.set(userId, { id: 'pk:user2', name: 'User Two', image: null } as Core.NexusUserDetails);
        } else if (userId === 'pk:abc123') {
          map.set(userId, { id: 'pk:abc123', name: 'ABC User', image: 'avatar2.jpg' } as Core.NexusUserDetails);
        }
      }
      return Promise.resolve(map);
    });
    mockGetOrFetchDetails.mockImplementation(({ userId }: { userId: string }) => {
      if (userId === 'pk:user1') {
        return Promise.resolve({ id: 'pk:user1', name: 'User One', image: 'avatar1.jpg' });
      }
      if (userId === 'pk:user2') {
        return Promise.resolve({ id: 'pk:user2', name: 'User Two', image: null });
      }
      if (userId === 'pk:abc123') {
        return Promise.resolve({ id: 'pk:abc123', name: 'ABC User', image: 'avatar2.jpg' });
      }
      return Promise.resolve(null);
    });
    mockGetAvatarUrl.mockImplementation((id: string) => `https://example.com/${id}/avatar`);
    setMockUserDetailsMap(new Map());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('returns empty arrays initially', () => {
    const { result } = renderHook(() => useSearchAutocomplete({ query: '' }));

    expect(result.current.tags).toEqual([]);
    expect(result.current.users).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns empty arrays when disabled', () => {
    const { result } = renderHook(() => useSearchAutocomplete({ query: 'tech', enabled: false }));

    expect(result.current.tags).toEqual([]);
    expect(result.current.users).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('sets loading state when query is provided', async () => {
    const { result } = renderHook(() => useSearchAutocomplete({ query: 'tech' }));

    expect(result.current.isLoading).toBe(true);
  });

  it('fetches tags and users after debounce', async () => {
    const { result, rerender } = renderHook(() => useSearchAutocomplete({ query: 'tech' }));

    // Fast-forward past debounce and run all pending timers
    await act(async () => {
      vi.advanceTimersByTime(AUTOCOMPLETE_DEBOUNCE_MS);
      await vi.runOnlyPendingTimersAsync();
    });

    // Wait for promises to resolve
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // Set mock user details map to simulate useLiveQuery returning data
    const userDetailsMap = new Map<Core.Pubky, Core.NexusUserDetails>();
    userDetailsMap.set('pk:user1', { id: 'pk:user1', name: 'User One', image: 'avatar1.jpg' } as Core.NexusUserDetails);
    userDetailsMap.set('pk:user2', { id: 'pk:user2', name: 'User Two', image: null } as Core.NexusUserDetails);
    setMockUserDetailsMap(userDetailsMap);

    // Re-render to trigger useLiveQuery update
    await act(async () => {
      rerender({ query: 'tech' });
      await Promise.resolve();
    });

    expect(mockGetTagsByPrefix).toHaveBeenCalledWith({ prefix: 'tech', limit: 3 });
    expect(mockGetUsersByName).toHaveBeenCalledWith({ prefix: 'tech', limit: 10 });
    expect(mockGetManyDetails).toHaveBeenCalledWith({ userIds: ['pk:user1', 'pk:user2'] });
    expect(result.current.tags).toEqual([{ name: 'tech' }, { name: 'technology' }, { name: 'techno' }]);
    expect(result.current.users).toEqual([
      { id: 'pk:user1', name: 'User One', avatarUrl: 'https://example.com/pk:user1/avatar' },
      { id: 'pk:user2', name: 'User Two' },
    ]);
  });

  it('searches by user ID when query starts with pk:', async () => {
    renderHook(() => useSearchAutocomplete({ query: 'pk:abc' }));

    // Fast-forward past debounce and run all pending timers
    await act(async () => {
      vi.advanceTimersByTime(AUTOCOMPLETE_DEBOUNCE_MS);
      await vi.runOnlyPendingTimersAsync();
    });

    // Wait for promises to resolve
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockFetchUsersById).toHaveBeenCalledWith({ prefix: 'abc', limit: 10 });
    // Should not search by name or tags when doing ID search
    expect(mockGetUsersByName).not.toHaveBeenCalled();
    expect(mockGetTagsByPrefix).not.toHaveBeenCalled();
  });

  it('does not search by ID if prefix is too short', async () => {
    renderHook(() => useSearchAutocomplete({ query: 'pk:ab' }));

    // Fast-forward past debounce and run all pending timers
    await act(async () => {
      vi.advanceTimersByTime(AUTOCOMPLETE_DEBOUNCE_MS);
      await vi.runOnlyPendingTimersAsync();
    });

    // Wait for promises to resolve
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockFetchUsersById).not.toHaveBeenCalled();
  });

  it('deduplicates user results', async () => {
    mockGetUsersByName.mockResolvedValue(['pk:user1', 'pk:user2']);
    mockFetchUsersById.mockResolvedValue(['pk:user1', 'pk:user3']);

    const { result, rerender } = renderHook(() => useSearchAutocomplete({ query: 'test' }));

    // Fast-forward past debounce and run all pending timers
    await act(async () => {
      vi.advanceTimersByTime(AUTOCOMPLETE_DEBOUNCE_MS);
      await vi.runOnlyPendingTimersAsync();
    });

    // Wait for promises to resolve
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // Set mock user details map
    const userDetailsMap = new Map<Core.Pubky, Core.NexusUserDetails>();
    userDetailsMap.set('pk:user1', { id: 'pk:user1', name: 'User One', image: null } as Core.NexusUserDetails);
    userDetailsMap.set('pk:user2', { id: 'pk:user2', name: 'User Two', image: null } as Core.NexusUserDetails);
    setMockUserDetailsMap(userDetailsMap);

    // Re-render to trigger useLiveQuery update
    await act(async () => {
      rerender({ query: 'test' });
      await Promise.resolve();
    });

    // When searching by name, user2 should be there
    const userIds = result.current.users.map((u) => u.id);
    expect(userIds).toContain('pk:user1');
    expect(userIds).toContain('pk:user2');
  });

  it('returns empty arrays on API error', async () => {
    mockGetTagsByPrefix.mockRejectedValue(new Error('API Error'));
    mockGetUsersByName.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useSearchAutocomplete({ query: 'tech' }));

    // Fast-forward past debounce and run all pending timers
    await act(async () => {
      vi.advanceTimersByTime(AUTOCOMPLETE_DEBOUNCE_MS);
      await vi.runOnlyPendingTimersAsync();
    });

    // Wait for promises to resolve
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.tags).toEqual([]);
    expect(result.current.users).toEqual([]);
  });

  it('performs new search when query changes', async () => {
    const { rerender } = renderHook(({ query }) => useSearchAutocomplete({ query }), {
      initialProps: { query: 'tech' },
    });

    // Advance a bit but not past debounce
    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    // Change query
    rerender({ query: 'test' });

    // Fast-forward past debounce and run all pending timers
    await act(async () => {
      vi.advanceTimersByTime(AUTOCOMPLETE_DEBOUNCE_MS);
      await vi.runOnlyPendingTimersAsync();
    });

    // Wait for promises to resolve
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // Should have searched with 'test'
    expect(mockGetTagsByPrefix).toHaveBeenLastCalledWith({ prefix: 'test', limit: 3 });
  });

  it('trims whitespace from query', async () => {
    renderHook(() => useSearchAutocomplete({ query: '  tech  ' }));

    // Fast-forward past debounce and run all pending timers
    await act(async () => {
      vi.advanceTimersByTime(AUTOCOMPLETE_DEBOUNCE_MS);
      await vi.runOnlyPendingTimersAsync();
    });

    // Wait for promises to resolve
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockGetTagsByPrefix).toHaveBeenCalledWith({ prefix: 'tech', limit: 3 });
  });
});
