import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfilePagePosts } from './ProfilePagePosts';
import * as Core from '@/core';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock useAuthStore
vi.mock('@/core', async () => {
  const actual = await vi.importActual('@/core');
  return {
    ...actual,
    useAuthStore: vi.fn(() => ({
      currentUserPubky: 'test-user-id',
    })),
    StreamPostsController: {
      getOrFetchStreamSlice: vi.fn(),
    },
  };
});

// Mock hooks
vi.mock('@/hooks', async () => {
  const actual = await vi.importActual('@/hooks');
  return {
    ...actual,
    useInfiniteScroll: () => ({
      sentinelRef: { current: null },
    }),
  };
});

describe('ProfilePagePosts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(Core.StreamPostsController.getOrFetchStreamSlice).mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    render(<ProfilePagePosts />);

    expect(screen.getByText('Loading posts...')).toBeInTheDocument();
  });

  it('renders posts after loading', async () => {
    const mockPostIds = ['test-user-id:post1', 'test-user-id:post2'];

    vi.mocked(Core.StreamPostsController.getOrFetchStreamSlice).mockResolvedValueOnce({
      nextPageIds: mockPostIds,
      timestamp: 123456789,
    });

    render(<ProfilePagePosts />);

    await waitFor(() => {
      expect(Core.StreamPostsController.getOrFetchStreamSlice).toHaveBeenCalledWith({
        streamId: 'author:test-user-id',
        lastPostId: undefined,
        streamTail: 0,
      });
    });
  });

  it('renders empty state when no posts', async () => {
    vi.mocked(Core.StreamPostsController.getOrFetchStreamSlice).mockResolvedValueOnce({
      nextPageIds: [],
      timestamp: undefined,
    });

    render(<ProfilePagePosts />);

    await waitFor(() => {
      expect(screen.getByText('No posts found')).toBeInTheDocument();
    });
  });

  it('renders error state on fetch failure', async () => {
    vi.mocked(Core.StreamPostsController.getOrFetchStreamSlice).mockRejectedValueOnce(
      new Error('Failed to fetch posts'),
    );

    render(<ProfilePagePosts />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch posts/)).toBeInTheDocument();
    });
  });
});
