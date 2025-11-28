import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfilePageReplies } from './ProfilePageReplies';
import * as Hooks from '@/hooks';
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

describe('ProfilePageReplies', () => {
  const mockUseStreamPagination = vi.mocked(Hooks.useStreamPagination);

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock NexusUserService to prevent database errors
    vi.spyOn(Core.NexusUserService, 'details').mockResolvedValue(undefined);
    vi.spyOn(Core.NexusUserService, 'counts').mockResolvedValue(undefined);
    vi.spyOn(Core.NexusUserService, 'tags').mockResolvedValue([]);

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

    render(<ProfilePageReplies />);

    expect(screen.getByText('Loading posts...')).toBeInTheDocument();
  });

  it('renders replies after loading', async () => {
    const mockPostIds = ['test-user-id:reply1', 'test-user-id:reply2'];

    mockUseStreamPagination.mockReturnValue({
      postIds: mockPostIds,
      loading: false,
      loadingMore: false,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
      refresh: vi.fn(),
    });

    render(<ProfilePageReplies />);

    await waitFor(() => {
      expect(mockUseStreamPagination).toHaveBeenCalledWith({
        streamId: 'author_replies:test-user-id',
      });
    });
  });

  it('renders empty state when no replies', async () => {
    mockUseStreamPagination.mockReturnValue({
      postIds: [],
      loading: false,
      loadingMore: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
      refresh: vi.fn(),
    });

    render(<ProfilePageReplies />);

    await waitFor(() => {
      expect(screen.getByText('No posts found')).toBeInTheDocument();
    });
  });

  it('renders error state on fetch failure', async () => {
    mockUseStreamPagination.mockReturnValue({
      postIds: [],
      loading: false,
      loadingMore: false,
      error: 'An unknown error occurred.',
      hasMore: false,
      loadMore: vi.fn(),
      refresh: vi.fn(),
    });

    render(<ProfilePageReplies />);

    await waitFor(() => {
      expect(screen.getByText(/An unknown error occurred/)).toBeInTheDocument();
    });
  });
});
