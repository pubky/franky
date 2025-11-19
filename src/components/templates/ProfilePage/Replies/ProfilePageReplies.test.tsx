import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfilePageReplies } from './ProfilePageReplies';
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

describe('ProfilePageReplies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(Core.StreamPostsController.getOrFetchStreamSlice).mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    render(<ProfilePageReplies />);

    expect(screen.getByText('Loading posts...')).toBeInTheDocument();
  });

  it('renders replies after loading', async () => {
    const mockPostIds = ['test-user-id:reply1', 'test-user-id:reply2'];

    vi.mocked(Core.StreamPostsController.getOrFetchStreamSlice).mockResolvedValueOnce({
      nextPageIds: mockPostIds,
      timestamp: 123456789,
    });

    render(<ProfilePageReplies />);

    await waitFor(() => {
      expect(Core.StreamPostsController.getOrFetchStreamSlice).toHaveBeenCalledWith({
        streamId: 'author_replies:test-user-id',
        lastPostId: undefined,
        streamTail: 0,
      });
    });
  });

  it('renders empty state when no replies', async () => {
    vi.mocked(Core.StreamPostsController.getOrFetchStreamSlice).mockResolvedValueOnce({
      nextPageIds: [],
      timestamp: undefined,
    });

    render(<ProfilePageReplies />);

    await waitFor(() => {
      expect(screen.getByText('No posts found')).toBeInTheDocument();
    });
  });

  it('renders error state on fetch failure', async () => {
    vi.mocked(Core.StreamPostsController.getOrFetchStreamSlice).mockRejectedValueOnce(
      new Error('Failed to fetch replies'),
    );

    render(<ProfilePageReplies />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch replies/)).toBeInTheDocument();
    });
  });
});
