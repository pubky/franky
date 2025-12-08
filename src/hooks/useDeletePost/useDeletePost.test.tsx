import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDeletePost } from './useDeletePost';
import * as Core from '@/core';
import * as Organisms from '@/organisms';

// Mock Core
const mockDelete = vi.fn();
vi.mock('@/core', () => ({
  PostController: {
    delete: vi.fn(),
  },
}));

// Mock molecules (useToast)
const mockToast = vi.fn();
vi.mock('@/molecules', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock organisms (useTimelineFeedContext)
const mockRemovePosts = vi.fn();
const mockPrependPosts = vi.fn();
const mockTimelineFeed = {
  removePosts: mockRemovePosts,
  prependPosts: mockPrependPosts,
};

vi.mock('@/organisms', () => ({
  useTimelineFeedContext: vi.fn(),
}));

describe('useDeletePost', () => {
  const mockPostId = 'author:post-123';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Core.PostController.delete).mockImplementation(mockDelete);
    vi.mocked(Organisms.useTimelineFeedContext).mockReturnValue(mockTimelineFeed);
  });

  it('returns isDeleting false initially', () => {
    const { result } = renderHook(() => useDeletePost(mockPostId));
    expect(result.current.isDeleting).toBe(false);
  });

  it('returns deletePost function', () => {
    const { result } = renderHook(() => useDeletePost(mockPostId));
    expect(typeof result.current.deletePost).toBe('function');
  });

  it('optimistically removes post from timeline feed', async () => {
    mockDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeletePost(mockPostId));

    await act(async () => {
      await result.current.deletePost();
    });

    expect(mockRemovePosts).toHaveBeenCalledWith(mockPostId);
    expect(mockRemovePosts).toHaveBeenCalledBefore(mockDelete as unknown as () => Promise<void>);
  });

  it('calls PostController.delete with correct postId', async () => {
    mockDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeletePost(mockPostId));

    await act(async () => {
      await result.current.deletePost();
    });

    expect(Core.PostController.delete).toHaveBeenCalledWith({
      compositePostId: mockPostId,
    });
  });

  it('shows success toast on successful deletion', async () => {
    mockDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeletePost(mockPostId));

    await act(async () => {
      await result.current.deletePost();
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Post deleted',
      description: 'Your post has been deleted',
    });
  });

  it('sets isDeleting to true during deletion', async () => {
    let resolveDelete: () => void;
    const deletePromise = new Promise<void>((resolve) => {
      resolveDelete = resolve;
    });
    mockDelete.mockReturnValue(deletePromise);

    const { result } = renderHook(() => useDeletePost(mockPostId));

    act(() => {
      result.current.deletePost();
    });

    await waitFor(() => {
      expect(result.current.isDeleting).toBe(true);
    });

    await act(async () => {
      resolveDelete!();
      await deletePromise;
    });

    await waitFor(() => {
      expect(result.current.isDeleting).toBe(false);
    });
  });

  it('restores post to timeline feed on deletion failure', async () => {
    const error = new Error('Deletion failed');
    mockDelete.mockRejectedValue(error);

    const { result } = renderHook(() => useDeletePost(mockPostId));

    await act(async () => {
      await result.current.deletePost();
    });

    expect(mockPrependPosts).toHaveBeenCalledWith(mockPostId);
    expect(mockPrependPosts).toHaveBeenCalledAfter(mockDelete as unknown as () => Promise<void>);
  });

  it('shows error toast on deletion failure', async () => {
    const error = new Error('Deletion failed');
    mockDelete.mockRejectedValue(error);

    const { result } = renderHook(() => useDeletePost(mockPostId));

    await act(async () => {
      await result.current.deletePost();
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to delete post. Please try again.',
      className: 'destructive border-destructive bg-destructive text-destructive-foreground',
    });
  });

  it('sets isDeleting to false after deletion failure', async () => {
    const error = new Error('Deletion failed');
    mockDelete.mockRejectedValue(error);

    const { result } = renderHook(() => useDeletePost(mockPostId));

    await act(async () => {
      await result.current.deletePost();
    });

    expect(result.current.isDeleting).toBe(false);
  });

  it('does not remove post if already deleting', async () => {
    let resolveDelete: () => void;
    const deletePromise = new Promise<void>((resolve) => {
      resolveDelete = resolve;
    });
    mockDelete.mockReturnValue(deletePromise);

    const { result } = renderHook(() => useDeletePost(mockPostId));

    // Start first deletion
    act(() => {
      result.current.deletePost();
    });

    // Try to delete again while first is in progress
    await act(async () => {
      await result.current.deletePost();
    });

    // Should only remove once
    expect(mockRemovePosts).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveDelete!();
      await deletePromise;
    });
  });

  it('works without timeline feed context', async () => {
    vi.mocked(Organisms.useTimelineFeedContext).mockReturnValue(null);
    mockDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeletePost(mockPostId));

    await act(async () => {
      await result.current.deletePost();
    });

    expect(mockRemovePosts).not.toHaveBeenCalled();
    expect(mockPrependPosts).not.toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Post deleted',
      description: 'Your post has been deleted',
    });
  });
});
