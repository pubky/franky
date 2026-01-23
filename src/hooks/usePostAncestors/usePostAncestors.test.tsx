import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePostAncestors } from './usePostAncestors';

// Hoist mock data for useLiveQuery
const { mockQueryResult, setMockQueryResult } = vi.hoisted(() => {
  const queryResultData = {
    current: undefined as { ancestors: { postId: string; userId: string }[]; hasError: boolean } | undefined,
  };
  return {
    mockQueryResult: queryResultData,
    setMockQueryResult: (
      value: { ancestors: { postId: string; userId: string }[]; hasError: boolean } | undefined,
    ) => {
      queryResultData.current = value;
    },
  };
});

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn((_queryFn, _deps) => {
    return mockQueryResult.current;
  }),
}));

// Mock Core
const { mockGetRelationships, mockBuildCompositeIdFromPubkyUri, mockParseCompositeId } = vi.hoisted(() => ({
  mockGetRelationships: vi.fn(),
  mockBuildCompositeIdFromPubkyUri: vi.fn(),
  mockParseCompositeId: vi.fn(),
}));

vi.mock('@/core', async () => {
  const actual = await vi.importActual('@/core');
  return {
    ...actual,
    PostController: {
      getRelationships: mockGetRelationships,
    },
    buildCompositeIdFromPubkyUri: mockBuildCompositeIdFromPubkyUri,
    parseCompositeId: mockParseCompositeId,
    CompositeIdDomain: {
      POSTS: 'posts',
    },
  };
});

describe('usePostAncestors', () => {
  const mockPostId = 'user3:post3';

  beforeEach(() => {
    vi.clearAllMocks();
    setMockQueryResult(undefined);
    mockParseCompositeId.mockImplementation((id: string) => {
      const [pubky, postId] = id.split(':');
      return { pubky, id: postId };
    });
  });

  it('returns isLoading true when query result is undefined', () => {
    setMockQueryResult(undefined);

    const { result } = renderHook(() => usePostAncestors(mockPostId));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.ancestors).toEqual([]);
    expect(result.current.hasError).toBe(false);
  });

  it('returns empty ancestors for root post (no parents)', () => {
    // Root post has only itself in the ancestors array
    setMockQueryResult({
      ancestors: [{ postId: 'user1:post1', userId: 'user1' }],
      hasError: false,
    });

    const { result } = renderHook(() => usePostAncestors('user1:post1'));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.ancestors).toEqual([{ postId: 'user1:post1', userId: 'user1' }]);
    expect(result.current.hasError).toBe(false);
  });

  it('returns ancestor chain for reply post', () => {
    // Reply chain: root -> parent -> current
    setMockQueryResult({
      ancestors: [
        { postId: 'user1:post1', userId: 'user1' }, // Root (John)
        { postId: 'user2:post2', userId: 'user2' }, // Parent (Satoshi)
        { postId: 'user3:post3', userId: 'user3' }, // Current (Anna)
      ],
      hasError: false,
    });

    const { result } = renderHook(() => usePostAncestors(mockPostId));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.ancestors).toHaveLength(3);
    expect(result.current.ancestors[0]).toEqual({ postId: 'user1:post1', userId: 'user1' });
    expect(result.current.ancestors[1]).toEqual({ postId: 'user2:post2', userId: 'user2' });
    expect(result.current.ancestors[2]).toEqual({ postId: 'user3:post3', userId: 'user3' });
    expect(result.current.hasError).toBe(false);
  });

  it('returns hasError true when fetching fails', () => {
    setMockQueryResult({
      ancestors: [],
      hasError: true,
    });

    const { result } = renderHook(() => usePostAncestors(mockPostId));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.ancestors).toEqual([]);
    expect(result.current.hasError).toBe(true);
  });

  it('returns empty ancestors when postId is null', () => {
    setMockQueryResult({
      ancestors: [],
      hasError: false,
    });

    const { result } = renderHook(() => usePostAncestors(null));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.ancestors).toEqual([]);
  });

  it('returns empty ancestors when postId is undefined', () => {
    setMockQueryResult({
      ancestors: [],
      hasError: false,
    });

    const { result } = renderHook(() => usePostAncestors(undefined));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.ancestors).toEqual([]);
  });

  it('handles deep reply chains', () => {
    // Deep chain with 5 ancestors
    const deepChain = [
      { postId: 'user1:post1', userId: 'user1' },
      { postId: 'user2:post2', userId: 'user2' },
      { postId: 'user3:post3', userId: 'user3' },
      { postId: 'user4:post4', userId: 'user4' },
      { postId: 'user5:post5', userId: 'user5' },
    ];

    setMockQueryResult({
      ancestors: deepChain,
      hasError: false,
    });

    const { result } = renderHook(() => usePostAncestors('user5:post5'));

    expect(result.current.ancestors).toHaveLength(5);
    expect(result.current.ancestors[0].postId).toBe('user1:post1');
    expect(result.current.ancestors[4].postId).toBe('user5:post5');
  });

  it('preserves ancestor order from root to current', () => {
    setMockQueryResult({
      ancestors: [
        { postId: 'root:post', userId: 'root' },
        { postId: 'middle:post', userId: 'middle' },
        { postId: 'current:post', userId: 'current' },
      ],
      hasError: false,
    });

    const { result } = renderHook(() => usePostAncestors('current:post'));

    // First should be root, last should be current
    expect(result.current.ancestors[0].userId).toBe('root');
    expect(result.current.ancestors[result.current.ancestors.length - 1].userId).toBe('current');
  });
});
