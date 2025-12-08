import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReposters } from './useReposters';
import * as Core from '@/core';

// Hoist mock data
const { mockOriginalPost, setMockOriginalPost, mockReposts, setMockReposts } = vi.hoisted(() => {
  const originalPostData = { current: undefined as Core.PostDetailsModelSchema | null | undefined };
  const repostsData = { current: undefined as Core.PostRelationshipsModelSchema[] | undefined };
  return {
    mockOriginalPost: originalPostData,
    setMockOriginalPost: (value: Core.PostDetailsModelSchema | null | undefined) => {
      originalPostData.current = value;
    },
    mockReposts: repostsData,
    setMockReposts: (value: Core.PostRelationshipsModelSchema[] | undefined) => {
      repostsData.current = value;
    },
  };
});

// Track which query is being called
let queryCallIndex = 0;

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn((_queryFn, _deps) => {
    queryCallIndex++;
    // First call is originalPost, second is reposts
    if (queryCallIndex === 1 || queryCallIndex % 2 === 1) {
      return mockOriginalPost.current;
    }
    return mockReposts.current;
  }),
}));

// Mock Core
const { mockFindById, mockGetReposts } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockGetReposts: vi.fn(),
}));

vi.mock('@/core', async () => {
  const actual = await vi.importActual('@/core');
  return {
    ...actual,
    PostDetailsModel: {
      findById: mockFindById,
    },
    PostRelationshipsModel: {
      getReposts: mockGetReposts,
    },
  };
});

describe('useReposters', () => {
  const mockOriginalPostId = 'original-author:original-post';
  const mockOriginalPostUri = 'pubky://post/original-post-uri';

  beforeEach(() => {
    vi.clearAllMocks();
    queryCallIndex = 0; // Reset call index
    setMockOriginalPost(undefined);
    setMockReposts(undefined);
    mockFindById.mockResolvedValue(null);
    mockGetReposts.mockResolvedValue([]);
  });

  it('returns isLoading true when originalPost is undefined', () => {
    setMockOriginalPost(undefined);

    const { result } = renderHook(() => useReposters(mockOriginalPostId));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.reposterIds).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it('returns isLoading true when reposts are undefined', () => {
    setMockOriginalPost({ id: mockOriginalPostId, uri: mockOriginalPostUri } as Core.PostDetailsModelSchema);
    setMockReposts(undefined);

    const { result } = renderHook(() => useReposters(mockOriginalPostId));

    expect(result.current.isLoading).toBe(true);
  });

  it('returns empty arrays when no reposts exist', () => {
    setMockOriginalPost({ id: mockOriginalPostId, uri: mockOriginalPostUri } as Core.PostDetailsModelSchema);
    setMockReposts([]);

    const { result } = renderHook(() => useReposters(mockOriginalPostId));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.reposterIds).toEqual([]);
    expect(result.current.reposters).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it('returns single reposter correctly', () => {
    const repostId = 'reposter1:repost-1';
    const reposts = [{ id: repostId, reposted: mockOriginalPostUri } as Core.PostRelationshipsModelSchema];

    setMockOriginalPost({ id: mockOriginalPostId, uri: mockOriginalPostUri } as Core.PostDetailsModelSchema);
    setMockReposts(reposts);

    const { result } = renderHook(() => useReposters(mockOriginalPostId));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.reposterIds).toEqual(['reposter1']);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.reposters).toEqual([{ repostId, authorId: 'reposter1' }]);
  });

  it('returns multiple unique reposters correctly', () => {
    const reposts = [
      { id: 'reposter1:repost-1', reposted: mockOriginalPostUri },
      { id: 'reposter2:repost-2', reposted: mockOriginalPostUri },
      { id: 'reposter1:repost-3', reposted: mockOriginalPostUri }, // Duplicate author
      { id: 'reposter3:repost-4', reposted: mockOriginalPostUri },
    ] as Core.PostRelationshipsModelSchema[];

    setMockOriginalPost({ id: mockOriginalPostId, uri: mockOriginalPostUri } as Core.PostDetailsModelSchema);
    setMockReposts(reposts);

    const { result } = renderHook(() => useReposters(mockOriginalPostId));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.reposterIds).toEqual(['reposter1', 'reposter2', 'reposter3']);
    expect(result.current.totalCount).toBe(3);
    expect(result.current.reposters).toHaveLength(3);
  });

  it('deduplicates reposters by author ID', () => {
    const reposts = [
      { id: 'user1:repost-1', reposted: mockOriginalPostUri },
      { id: 'user1:repost-2', reposted: mockOriginalPostUri },
      { id: 'user1:repost-3', reposted: mockOriginalPostUri },
      { id: 'user2:repost-4', reposted: mockOriginalPostUri },
    ] as Core.PostRelationshipsModelSchema[];

    setMockOriginalPost({ id: mockOriginalPostId, uri: mockOriginalPostUri } as Core.PostDetailsModelSchema);
    setMockReposts(reposts);

    const { result } = renderHook(() => useReposters(mockOriginalPostId));

    expect(result.current.reposterIds).toEqual(['user1', 'user2']);
    expect(result.current.totalCount).toBe(2);
  });

  it('handles postId with multiple colons correctly', () => {
    const reposts = [
      { id: 'user:with:colons:repost-1', reposted: mockOriginalPostUri },
    ] as Core.PostRelationshipsModelSchema[];

    setMockOriginalPost({ id: mockOriginalPostId, uri: mockOriginalPostUri } as Core.PostDetailsModelSchema);
    setMockReposts(reposts);

    const { result } = renderHook(() => useReposters(mockOriginalPostId));

    // Should extract author as first part before first colon
    expect(result.current.reposterIds).toEqual(['user']);
  });

  it('returns empty arrays when originalPost is null', () => {
    setMockOriginalPost(null);
    setMockReposts([]);

    const { result } = renderHook(() => useReposters(mockOriginalPostId));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.reposterIds).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it('returns empty arrays when originalPost has no URI', () => {
    setMockOriginalPost({ id: mockOriginalPostId, uri: null } as unknown as Core.PostDetailsModelSchema);
    setMockReposts([]);

    const { result } = renderHook(() => useReposters(mockOriginalPostId));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.reposterIds).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it('returns isLoading false when both queries are loaded', () => {
    setMockOriginalPost({ id: mockOriginalPostId, uri: mockOriginalPostUri } as Core.PostDetailsModelSchema);
    setMockReposts([]);

    const { result } = renderHook(() => useReposters(mockOriginalPostId));

    expect(result.current.isLoading).toBe(false);
  });

  it('handles empty string originalPostId', () => {
    setMockOriginalPost(null);
    setMockReposts([]);

    const { result } = renderHook(() => useReposters(''));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.reposterIds).toEqual([]);
  });
});
