import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTagged } from './useTagged';
import * as Core from '@/core';

// Hoist mock functions before vi.mock
const mockMocks = vi.hoisted(() => {
  const mockGetTags = vi.fn();
  const mockFetchTags = vi.fn();
  const mockUpsertTags = vi.fn();
  const mockGetCounts = vi.fn();
  const mockTagCreate = vi.fn();
  const mockTagDelete = vi.fn();
  return {
    mockGetTags,
    mockFetchTags,
    mockUpsertTags,
    mockGetCounts,
    mockTagCreate,
    mockTagDelete,
  };
});

// Mock Core modules
vi.mock('@/core', async () => {
  const actual = await vi.importActual<typeof import('@/core')>('@/core');
  return {
    ...actual,
    UserController: {
      getTags: mockMocks.mockGetTags,
      fetchTags: mockMocks.mockFetchTags,
      upsertTags: mockMocks.mockUpsertTags,
      getCounts: mockMocks.mockGetCounts,
    },
    TagController: {
      commitCreate: mockMocks.mockTagCreate,
      commitDelete: mockMocks.mockTagDelete,
    },
    useAuthStore: vi.fn(
      (selector?: (state: { currentUserPubky: string; selectCurrentUserPubky: () => string }) => unknown) => {
        const mockState = {
          currentUserPubky: 'mock-current-user',
          selectCurrentUserPubky: () => 'mock-current-user',
        };
        return selector ? selector(mockState) : mockState;
      },
    ),
  };
});

// Mock useProfileStats
vi.mock('@/hooks/useProfileStats', () => ({
  useProfileStats: vi.fn(() => ({
    stats: { uniqueTags: 0, posts: 0, replies: 0, followers: 0, following: 0, friends: 0, notifications: 0 },
    isLoading: false,
  })),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

// Mock dexie-react-hooks
let mockLocalTags: Core.NexusTag[] | null = null;

const mockUseLiveQuery = vi.fn(<T,>(queryFn: () => Promise<T> | T, deps: unknown[], defaultValue: T): T => {
  // For getTags query
  if (deps && deps[0] && typeof deps[0] === 'string') {
    return (mockLocalTags !== null ? mockLocalTags : defaultValue) as T;
  }
  // For getCounts query (from useProfileStats)
  return defaultValue;
});

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: <T,>(queryFn: () => Promise<T> | T, deps: unknown[], defaultValue: T): T =>
    mockUseLiveQuery(queryFn, deps, defaultValue) as T,
}));

describe('useTagged', () => {
  const mockUserId = 'test-user-pubky';

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalTags = null;
    mockMocks.mockGetTags.mockResolvedValue([]);
    mockMocks.mockFetchTags.mockResolvedValue([]);
    mockMocks.mockUpsertTags.mockResolvedValue(undefined);
    mockMocks.mockGetCounts.mockResolvedValue({
      tagged: 0,
      tags: 0,
      unique_tags: 0,
      posts: 0,
      replies: 0,
      following: 0,
      followers: 0,
      friends: 0,
      bookmarks: 0,
    });
    mockMocks.mockTagCreate.mockResolvedValue(undefined);
    mockMocks.mockTagDelete.mockResolvedValue(undefined);
  });

  it('returns empty data when userId is null', () => {
    const { result } = renderHook(() => useTagged(null));
    expect(result.current.tags).toHaveLength(0);
    expect(result.current.count).toBe(0);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.isLoadingMore).toBe(false);
    expect(typeof result.current.handleTagAdd).toBe('function');
    expect(typeof result.current.handleTagToggle).toBe('function');
    expect(typeof result.current.loadMore).toBe('function');
  });

  it('returns empty data when userId is undefined', () => {
    const { result } = renderHook(() => useTagged(undefined));
    expect(result.current.tags).toHaveLength(0);
    expect(result.current.count).toBe(0);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.isLoadingMore).toBe(false);
    expect(typeof result.current.handleTagAdd).toBe('function');
    expect(typeof result.current.handleTagToggle).toBe('function');
    expect(typeof result.current.loadMore).toBe('function');
  });

  it('calls UserController.fetchTags with correct params', async () => {
    renderHook(() => useTagged(mockUserId));

    await waitFor(() => {
      expect(mockMocks.mockFetchTags).toHaveBeenCalled();
    });

    expect(mockMocks.mockFetchTags).toHaveBeenCalledWith({
      user_id: mockUserId,
      viewer_id: 'mock-current-user',
      limit_tags: 20,
      skip_tags: 0,
    });
  });

  it('handleTagAdd returns error when tag label is empty', async () => {
    mockLocalTags = [];
    const { result } = renderHook(() => useTagged(mockUserId));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const addResult = await result.current.handleTagAdd('');

    expect(addResult.success).toBe(false);
    expect(addResult.error).toBe('Tag label cannot be empty');
  });

  it('handleTagAdd returns error when userId is null', async () => {
    const { result } = renderHook(() => useTagged(null));

    const addResult = await result.current.handleTagAdd('ethereum');

    expect(addResult.success).toBe(false);
    expect(addResult.error).toBe('User ID is required');
  });

  it('handleTagAdd calls TagController.create with correct params', async () => {
    mockLocalTags = [];
    const { result } = renderHook(() => useTagged(mockUserId));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const addResult = await result.current.handleTagAdd('ethereum');

    expect(addResult.success).toBe(true);
    expect(mockMocks.mockTagCreate).toHaveBeenCalledWith({
      taggedId: mockUserId,
      label: 'ethereum',
      taggerId: 'mock-current-user',
      taggedKind: Core.TagKind.USER,
    });
  });
});
