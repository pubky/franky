import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRepostInfo } from './useRepostInfo';
import * as Core from '@/core';

// Hoist mock data
const { mockRelationships, setMockRelationships, mockOriginalPostId, setMockOriginalPostId } = vi.hoisted(() => {
  const relationshipsData = { current: undefined as Core.PostRelationshipsModelSchema | null | undefined };
  const originalPostIdData = { current: undefined as string | null | undefined };
  return {
    mockRelationships: relationshipsData,
    setMockRelationships: (value: Core.PostRelationshipsModelSchema | null | undefined) => {
      relationshipsData.current = value;
    },
    mockOriginalPostId: originalPostIdData,
    setMockOriginalPostId: (value: string | null | undefined) => {
      originalPostIdData.current = value;
    },
  };
});

// Track which query is being called
let queryCallIndex = 0;

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn((_queryFn, _deps) => {
    queryCallIndex++;
    // First call is relationships, second is originalPostId
    if (queryCallIndex === 1 || queryCallIndex % 2 === 1) {
      return mockRelationships.current;
    }
    return mockOriginalPostId.current;
  }),
}));

// Mock Core
const { mockFindById, mockBuildCompositeIdFromPubkyUri } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockBuildCompositeIdFromPubkyUri: vi.fn(),
}));

vi.mock('@/core', async () => {
  const actual = await vi.importActual('@/core');
  return {
    ...actual,
    PostRelationshipsModel: {
      findById: mockFindById,
    },
    buildCompositeIdFromPubkyUri: mockBuildCompositeIdFromPubkyUri,
  };
});

// Mock hooks
const mockCurrentUserPubky = 'current-user-pubky';
vi.mock('@/hooks', async () => {
  const actual = await vi.importActual('@/hooks');
  return {
    ...actual,
    useCurrentUserProfile: vi.fn(() => ({
      currentUserPubky: mockCurrentUserPubky,
    })),
  };
});

describe('useRepostInfo', () => {
  const mockPostId = 'author:post-123';
  const mockRepostedUri = 'pubky://post/original-post-uri';

  beforeEach(() => {
    vi.clearAllMocks();
    queryCallIndex = 0; // Reset call index
    setMockRelationships(undefined);
    setMockOriginalPostId(undefined);
    mockFindById.mockResolvedValue(null);
    mockBuildCompositeIdFromPubkyUri.mockReturnValue('original-author:original-post');
  });

  it('returns isLoading true when relationships are undefined', () => {
    setMockRelationships(undefined);

    const { result } = renderHook(() => useRepostInfo(mockPostId));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isRepost).toBe(false);
    expect(result.current.repostAuthorId).toBe(null);
  });

  it('returns isRepost false when post is not a repost', () => {
    setMockRelationships({ id: mockPostId, reposted: null, replied: null });

    const { result } = renderHook(() => useRepostInfo(mockPostId));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRepost).toBe(false);
    expect(result.current.repostAuthorId).toBe(null);
    expect(result.current.isCurrentUserRepost).toBe(false);
    expect(result.current.originalPostId).toBe(null);
  });

  it('returns isRepost true when post is a repost', () => {
    setMockRelationships({ id: mockPostId, reposted: mockRepostedUri, replied: null });
    setMockOriginalPostId('original-author:original-post');

    const { result } = renderHook(() => useRepostInfo(mockPostId));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRepost).toBe(true);
    expect(result.current.repostAuthorId).toBe('author');
    expect(result.current.originalPostId).toBe('original-author:original-post');
  });

  it('returns repostAuthorId correctly from postId', () => {
    const repostPostId = 'repost-author:repost-post';
    setMockRelationships({ id: repostPostId, reposted: mockRepostedUri, replied: null });
    setMockOriginalPostId('original-author:original-post');

    const { result } = renderHook(() => useRepostInfo(repostPostId));

    expect(result.current.repostAuthorId).toBe('repost-author');
  });

  it('returns isCurrentUserRepost true when current user reposted', () => {
    const currentUserPostId = `${mockCurrentUserPubky}:post-123`;
    setMockRelationships({ id: currentUserPostId, reposted: mockRepostedUri, replied: null });
    setMockOriginalPostId('original-author:original-post');

    const { result } = renderHook(() => useRepostInfo(currentUserPostId));

    expect(result.current.isCurrentUserRepost).toBe(true);
    expect(result.current.repostAuthorId).toBe(mockCurrentUserPubky);
  });

  it('returns isCurrentUserRepost false when different user reposted', () => {
    const otherUserPostId = 'other-user:post-123';
    setMockRelationships({ id: otherUserPostId, reposted: mockRepostedUri, replied: null });
    setMockOriginalPostId('original-author:original-post');

    const { result } = renderHook(() => useRepostInfo(otherUserPostId));

    expect(result.current.isCurrentUserRepost).toBe(false);
    expect(result.current.repostAuthorId).toBe('other-user');
  });

  it('returns originalPostId null when relationships.reposted is null', () => {
    setMockRelationships({ id: mockPostId, reposted: null, replied: null });
    setMockOriginalPostId(null);

    const { result } = renderHook(() => useRepostInfo(mockPostId));

    expect(result.current.originalPostId).toBe(null);
  });

  it('returns originalPostId when relationships.reposted exists', () => {
    const originalPostId = 'original-author:original-post';
    setMockRelationships({ id: mockPostId, reposted: mockRepostedUri, replied: null });
    setMockOriginalPostId(originalPostId);

    const { result } = renderHook(() => useRepostInfo(mockPostId));

    expect(result.current.originalPostId).toBe(originalPostId);
  });

  it('handles postId with multiple colons correctly', () => {
    const complexPostId = 'author:post:with:colons';
    setMockRelationships({ id: complexPostId, reposted: mockRepostedUri, replied: null });
    setMockOriginalPostId('original-author:original-post');

    const { result } = renderHook(() => useRepostInfo(complexPostId));

    // Should extract author as first part before first colon
    expect(result.current.repostAuthorId).toBe('author');
  });

  it('returns isLoading false when relationships are loaded', () => {
    setMockRelationships({ id: mockPostId, reposted: null, replied: null });

    const { result } = renderHook(() => useRepostInfo(mockPostId));

    expect(result.current.isLoading).toBe(false);
  });
});
