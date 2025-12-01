import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProfileConnections, CONNECTION_TYPE } from './useProfileConnections';

// Mock Core
const mockCurrentUserPubky = 'user123';
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    useAuthStore: vi.fn(() => ({
      currentUserPubky: mockCurrentUserPubky,
    })),
    StreamUserController: {
      getOrFetchStreamSlice: vi.fn().mockResolvedValue({
        nextPageIds: [],
        skip: 0,
      }),
    },
    UserDetailsModel: {
      table: {
        where: vi.fn(() => ({
          anyOf: vi.fn(() => ({
            toArray: vi.fn().mockResolvedValue([]),
          })),
        })),
      },
    },
    UserCountsModel: {
      table: {
        where: vi.fn(() => ({
          anyOf: vi.fn(() => ({
            toArray: vi.fn().mockResolvedValue([]),
          })),
        })),
      },
    },
  };
});

// Mock Config
vi.mock('@/config', () => ({
  NEXUS_USERS_PER_PAGE: 20,
}));

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn((queryFn, deps, defaultValue) => defaultValue),
}));

describe('useProfileConnections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty connections array initially for FOLLOWERS', async () => {
    const { result } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FOLLOWERS));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.connections).toHaveLength(0);
    expect(result.current.count).toBe(0);
  });

  it('returns empty connections array initially for FOLLOWING', async () => {
    const { result } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FOLLOWING));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.connections).toHaveLength(0);
    expect(result.current.count).toBe(0);
  });

  it('returns empty connections array initially for FRIENDS', async () => {
    const { result } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FRIENDS));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.connections).toHaveLength(0);
    expect(result.current.count).toBe(0);
  });

  it('provides loadMore and refresh functions', async () => {
    const { result } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FOLLOWERS));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.loadMore).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
  });

  it('has correct initial state', async () => {
    const { result } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FOLLOWERS));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isLoadingMore).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.hasMore).toBe(false); // No results means no more
  });

  it('returns count matching connections length', async () => {
    const { result } = renderHook(() => useProfileConnections(CONNECTION_TYPE.FOLLOWERS));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.count).toBe(result.current.connections.length);
  });
});
