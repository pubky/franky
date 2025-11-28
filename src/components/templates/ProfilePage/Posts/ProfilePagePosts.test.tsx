import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfilePagePosts } from './ProfilePagePosts';
import * as Hooks from '@/hooks';

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
    useStreamPagination: vi.fn(),
    usePostNavigation: () => ({
      navigateToPost: mockPush,
    }),
  };
});

describe('ProfilePagePosts', () => {
  const mockUseStreamPagination = vi.mocked(Hooks.useStreamPagination);

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock return value
    mockUseStreamPagination.mockReturnValue({
      postIds: [],
      loading: false,
      loadingMore: false,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
      refresh: vi.fn(),
    });
  });

  it('renders loading state initially', () => {
    mockUseStreamPagination.mockReturnValue({
      postIds: [],
      loading: true,
      loadingMore: false,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
      refresh: vi.fn(),
    });

    render(<ProfilePagePosts />);

    expect(screen.getByText('Loading posts...')).toBeInTheDocument();
  });

  it('renders posts after loading', async () => {
    const mockPostIds = ['test-user-id:post1', 'test-user-id:post2'];

    mockUseStreamPagination.mockReturnValue({
      postIds: mockPostIds,
      loading: false,
      loadingMore: false,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
      refresh: vi.fn(),
    });

    render(<ProfilePagePosts />);

    await waitFor(() => {
      expect(mockUseStreamPagination).toHaveBeenCalledWith({
        streamId: 'author:test-user-id',
      });
    });
  });

  it('renders empty state when no posts', async () => {
    mockUseStreamPagination.mockReturnValue({
      postIds: [],
      loading: false,
      loadingMore: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
      refresh: vi.fn(),
    });

    render(<ProfilePagePosts />);

    await waitFor(() => {
      expect(screen.getByText('No posts found')).toBeInTheDocument();
    });
  });

  it('renders error state on fetch failure', async () => {
    mockUseStreamPagination.mockReturnValue({
      postIds: [],
      loading: false,
      loadingMore: false,
      error: 'Failed to fetch posts',
      hasMore: false,
      loadMore: vi.fn(),
      refresh: vi.fn(),
    });

    render(<ProfilePagePosts />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch posts/)).toBeInTheDocument();
    });
  });
});
