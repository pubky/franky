import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useParentPostDeleted } from './useParentPostDeleted';

// Mock @/core
const mockGetDetails = vi.fn();
vi.mock('@/core', () => ({
  PostController: {
    getDetails: (params: { compositeId: string }) => mockGetDetails(params),
  },
}));

// Mock @/libs
const mockIsPostDeleted = vi.fn();
vi.mock('@/libs', () => ({
  isPostDeleted: (content: string | undefined) => mockIsPostDeleted(content),
}));

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (queryFn: () => Promise<unknown>, _deps: unknown[], defaultValue: unknown) => {
    // Execute the query function to trigger it
    queryFn();
    // Return the mock value based on what mockGetDetails returns
    const result = mockGetDetails.mock.results[mockGetDetails.mock.results.length - 1];
    return result?.value ?? defaultValue;
  },
}));

describe('useParentPostDeleted', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDetails.mockReturnValue(null);
    mockIsPostDeleted.mockReturnValue(false);
  });

  it('returns loading state initially when compositeId is null', () => {
    const { result } = renderHook(() => useParentPostDeleted(null));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isParentDeleted).toBe(false);
  });

  it('returns false when parent post is not deleted', () => {
    const mockPost = {
      id: 'post-123',
      author_id: 'user-123',
      content: 'Test post content',
      indexed_at: '2024-01-01T00:00:00.000Z',
    };
    mockGetDetails.mockReturnValue(mockPost);
    mockIsPostDeleted.mockReturnValue(false);

    const { result } = renderHook(() => useParentPostDeleted('user-123:post-123'));

    expect(result.current.isParentDeleted).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(mockIsPostDeleted).toHaveBeenCalledWith('Test post content');
  });

  it('returns true when parent post is deleted', () => {
    const mockPost = {
      id: 'post-123',
      author_id: 'user-123',
      content: '[DELETED]',
      indexed_at: '2024-01-01T00:00:00.000Z',
    };
    mockGetDetails.mockReturnValue(mockPost);
    mockIsPostDeleted.mockReturnValue(true);

    const { result } = renderHook(() => useParentPostDeleted('user-123:post-123'));

    expect(result.current.isParentDeleted).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(mockIsPostDeleted).toHaveBeenCalledWith('[DELETED]');
  });

  it('calls PostController.getDetails with correct compositeId', () => {
    const mockPost = {
      id: 'post-456',
      author_id: 'user-456',
      content: 'Another test post',
      indexed_at: '2024-01-02T00:00:00.000Z',
    };
    mockGetDetails.mockReturnValue(mockPost);
    mockIsPostDeleted.mockReturnValue(false);

    renderHook(() => useParentPostDeleted('user-456:post-456'));

    expect(mockGetDetails).toHaveBeenCalledWith({ compositeId: 'user-456:post-456' });
  });

  it('returns false when post is not found (null from DB)', () => {
    mockGetDetails.mockReturnValue(null);
    mockIsPostDeleted.mockReturnValue(false);

    const { result } = renderHook(() => useParentPostDeleted('user-999:post-999'));

    expect(result.current.isLoading).toBe(true);
    expect(mockIsPostDeleted).toHaveBeenCalledWith(undefined);
  });

  it('does not call getDetails when compositeId is null', () => {
    renderHook(() => useParentPostDeleted(null));

    expect(mockGetDetails).not.toHaveBeenCalled();
  });

  it('does not call getDetails when compositeId is undefined', () => {
    renderHook(() => useParentPostDeleted(undefined));

    expect(mockGetDetails).not.toHaveBeenCalled();
  });
});
