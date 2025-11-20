import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { TimelinePosts } from './Posts';
import * as Core from '@/core';
import * as Hooks from '@/hooks';

// Mock dependencies
vi.mock('next/navigation');
vi.mock('dexie-react-hooks');
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useStreamIdFromFilters: vi.fn(),
    useInfiniteScroll: vi.fn(),
  };
});
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    Logger: {
      error: vi.fn(),
    },
  };
});

// Mock components
vi.mock('@/atoms', () => ({
  Container: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="container" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/molecules', () => ({
  TimelineLoading: () => <div data-testid="timeline-loading">Loading...</div>,
  TimelineInitialError: ({ message }: { message: string }) => (
    <div data-testid="timeline-initial-error">Error: {message}</div>
  ),
  TimelineEmpty: () => <div data-testid="timeline-empty">No posts</div>,
  TimelineLoadingMore: () => <div data-testid="timeline-loading-more">Loading more...</div>,
  TimelineError: ({ message }: { message: string }) => <div data-testid="timeline-error">Error: {message}</div>,
  TimelineEndMessage: () => <div data-testid="timeline-end-message">End of timeline</div>,
}));

vi.mock('@/organisms', () => ({
  PostMain: ({ postId, onClick, ...props }: { postId: string; onClick: () => void; [key: string]: unknown }) => (
    <div data-testid={`post-${postId}`} onClick={onClick} {...props} />
  ),
  TimelinePostReplies: ({ postId }: { postId: string }) => <div data-testid={`replies-${postId}`} />,
}));

const mockPush = vi.fn();
const mockUseLiveQuery = vi.mocked(useLiveQuery);
const mockUseRouter = vi.mocked(useRouter);
const mockUseStreamIdFromFilters = vi.mocked(Hooks.useStreamIdFromFilters);
const mockUseInfiniteScroll = vi.mocked(Hooks.useInfiniteScroll);

describe('TimelinePosts', () => {
  const mockStreamId = Core.PostStreamTypes.TIMELINE_ALL_ALL;
  const mockPostIds = ['author1:post1', 'author2:post2', 'author3:post3'];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock router
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);

    // Mock stream ID
    mockUseStreamIdFromFilters.mockReturnValue(mockStreamId);

    // Mock infinite scroll
    mockUseInfiniteScroll.mockReturnValue({
      sentinelRef: { current: null },
    });

    // Mock useLiveQuery to return no replies by default
    mockUseLiveQuery.mockReturnValue({ id: 'test', replies: 0, tags: 0, unique_tags: 0, reposts: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading States', () => {
    it('should render loading state initially', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      render(<TimelinePosts />);

      expect(screen.getByTestId('timeline-loading')).toBeInTheDocument();
    });

    it('should render posts after successful fetch', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValueOnce({
        nextPageIds: mockPostIds,
        timestamp: Date.now(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument();
      });
    });

    it('should show loading more indicator when paginating', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice')
        .mockResolvedValueOnce({
          nextPageIds: mockPostIds,
          timestamp: Date.now(),
        })
        .mockImplementation(() => new Promise(() => {})); // Never resolves for pagination

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument();
      });

      // Trigger pagination
      const { onLoadMore } = mockUseInfiniteScroll.mock.calls[0][0];
      onLoadMore();

      await waitFor(() => {
        expect(screen.getByTestId('timeline-loading-more')).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should render empty state when no posts are returned', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValueOnce({
        nextPageIds: [],
        timestamp: undefined,
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.getByTestId('timeline-empty')).toBeInTheDocument();
      });
    });

    it('should render end message when no more posts to load', async () => {
      const fewPosts = ['author1:post1', 'author2:post2']; // Less than NEXUS_POSTS_PER_PAGE

      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValueOnce({
        nextPageIds: fewPosts,
        timestamp: Date.now(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.getByTestId('timeline-end-message')).toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('should render error state on initial fetch failure', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockRejectedValueOnce(new Error('Network error'));

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.getByTestId('timeline-initial-error')).toBeInTheDocument();
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should show error message when pagination fails', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice')
        .mockResolvedValueOnce({
          nextPageIds: mockPostIds,
          timestamp: Date.now(),
        })
        .mockRejectedValueOnce(new Error('Pagination failed'));

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument();
      });

      // Trigger pagination
      const { onLoadMore } = mockUseInfiniteScroll.mock.calls[0][0];
      await onLoadMore();

      await waitFor(() => {
        expect(screen.getByTestId('timeline-error')).toBeInTheDocument();
      });
    });

    it('should stop loading more posts after pagination error', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice')
        .mockResolvedValueOnce({
          nextPageIds: mockPostIds,
          timestamp: Date.now(),
        })
        .mockRejectedValueOnce(new Error('Pagination failed'));

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument();
      });

      // Trigger pagination
      const { onLoadMore } = mockUseInfiniteScroll.mock.calls[0][0];
      await onLoadMore();

      await waitFor(() => {
        const { hasMore } = mockUseInfiniteScroll.mock.calls[mockUseInfiniteScroll.mock.calls.length - 1][0];
        expect(hasMore).toBe(false);
      });
    });
  });

  describe('Post Rendering', () => {
    it('should render all fetched posts', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValueOnce({
        nextPageIds: mockPostIds,
        timestamp: Date.now(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        mockPostIds.forEach((postId) => {
          expect(screen.getByTestId(`post-${postId}`)).toBeInTheDocument();
        });
      });
    });

    it('should render PostWithReplies for each post', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValueOnce({
        nextPageIds: mockPostIds,
        timestamp: Date.now(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        const postContainers = screen.getAllByTestId(/^post-/);
        expect(postContainers).toHaveLength(mockPostIds.length);
      });
    });

    it('should render posts with correct keys', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValueOnce({
        nextPageIds: mockPostIds,
        timestamp: Date.now(),
      });

      const { container } = render(<TimelinePosts />);

      await waitFor(() => {
        const posts = container.querySelectorAll('[data-testid^="post-"]');
        expect(posts).toHaveLength(mockPostIds.length);
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to post detail when post is clicked', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValueOnce({
        nextPageIds: ['author1:post123'],
        timestamp: Date.now(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        const post = screen.getByTestId('post-author1:post123');
        post.click();
      });

      expect(mockPush).toHaveBeenCalledWith('/post/author1/post123');
    });

    it('should navigate with correct URL format for different posts', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValueOnce({
        nextPageIds: mockPostIds,
        timestamp: Date.now(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        const post1 = screen.getByTestId('post-author1:post1');
        post1.click();
      });

      expect(mockPush).toHaveBeenCalledWith('/post/author1/post1');
    });
  });

  describe('Pagination', () => {
    it('should load more posts when scrolling', async () => {
      const initialPosts = ['author1:post1', 'author2:post2'];
      const morePosts = ['author3:post3', 'author4:post4'];

      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice')
        .mockResolvedValueOnce({
          nextPageIds: initialPosts,
          timestamp: 1000,
        })
        .mockResolvedValueOnce({
          nextPageIds: morePosts,
          timestamp: 2000,
        });

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.getByTestId('post-author1:post1')).toBeInTheDocument();
      });

      // Trigger load more
      const { onLoadMore } = mockUseInfiniteScroll.mock.calls[0][0];
      await onLoadMore();

      await waitFor(() => {
        expect(screen.getByTestId('post-author3:post3')).toBeInTheDocument();
        expect(screen.getByTestId('post-author4:post4')).toBeInTheDocument();
      });
    });

    it('should deduplicate posts when pagination returns duplicates', async () => {
      const initialPosts = ['author1:post1', 'author2:post2'];
      const duplicatePosts = ['author2:post2', 'author3:post3']; // post2 is duplicate

      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice')
        .mockResolvedValueOnce({
          nextPageIds: initialPosts,
          timestamp: 1000,
        })
        .mockResolvedValueOnce({
          nextPageIds: duplicatePosts,
          timestamp: 2000,
        });

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.getByTestId('post-author1:post1')).toBeInTheDocument();
      });

      const { onLoadMore } = mockUseInfiniteScroll.mock.calls[0][0];
      await onLoadMore();

      await waitFor(() => {
        const post2Elements = screen.getAllByTestId('post-author2:post2');
        expect(post2Elements).toHaveLength(1); // Should only have one instance
      });
    });

    it('should pass correct pagination parameters for engagement streams', async () => {
      mockUseStreamIdFromFilters.mockReturnValue(Core.PostStreamTypes.POPULARITY_ALL_ALL);

      const spy = vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: mockPostIds,
        timestamp: undefined,
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument();
      });

      const { onLoadMore } = mockUseInfiniteScroll.mock.calls[0][0];
      await onLoadMore();

      await waitFor(() => {
        expect(spy).toHaveBeenNthCalledWith(2, {
          streamId: Core.PostStreamTypes.POPULARITY_ALL_ALL,
          lastPostId: undefined, // Engagement streams don't use lastPostId for pagination
          streamTail: 3, // Should use count for engagement (skip)
        });
      });
    });
  });

  describe('Stream Changes', () => {
    it('should refetch posts when streamId changes', async () => {
      const spy = vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: mockPostIds,
        timestamp: Date.now(),
      });

      const { rerender } = render(<TimelinePosts />);

      await waitFor(() => {
        expect(spy).toHaveBeenCalledTimes(1);
      });

      // Change stream
      mockUseStreamIdFromFilters.mockReturnValue(Core.PostStreamTypes.POPULARITY_ALL_ALL);
      rerender(<TimelinePosts />);

      await waitFor(() => {
        expect(spy).toHaveBeenCalledTimes(2);
      });
    });

    it('should clear posts when streamId changes', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice')
        .mockResolvedValueOnce({
          nextPageIds: ['author1:post1'],
          timestamp: Date.now(),
        })
        .mockResolvedValueOnce({
          nextPageIds: ['author2:post2'],
          timestamp: Date.now(),
        });

      const { rerender } = render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.getByTestId('post-author1:post1')).toBeInTheDocument();
      });

      // Change stream
      mockUseStreamIdFromFilters.mockReturnValue(Core.PostStreamTypes.POPULARITY_ALL_ALL);
      rerender(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.queryByTestId('post-author1:post1')).not.toBeInTheDocument();
        expect(screen.getByTestId('post-author2:post2')).toBeInTheDocument();
      });
    });
  });

  describe('Infinite Scroll Configuration', () => {
    it('should configure infinite scroll with correct parameters', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: mockPostIds,
        timestamp: Date.now(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(mockUseInfiniteScroll).toHaveBeenCalledWith({
          onLoadMore: expect.any(Function),
          hasMore: expect.any(Boolean),
          isLoading: expect.any(Boolean),
          threshold: 3000,
          debounceMs: 20,
        });
      });
    });

    it('should render sentinel element for infinite scroll', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: mockPostIds,
        timestamp: Date.now(),
      });

      const { container } = render(<TimelinePosts />);

      await waitFor(() => {
        const sentinel = container.querySelector('.h-\\[20px\\]');
        expect(sentinel).toBeInTheDocument();
      });
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot for loading state', () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockImplementation(() => new Promise(() => {}));

      const { container } = render(<TimelinePosts />);

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for empty state', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: [],
        timestamp: undefined,
      });

      const { container } = render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.getByTestId('timeline-empty')).toBeInTheDocument();
      });

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for error state', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockRejectedValue(new Error('Network error'));

      const { container } = render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.getByTestId('timeline-initial-error')).toBeInTheDocument();
      });

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot with posts', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: mockPostIds,
        timestamp: Date.now(),
      });

      const { container } = render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument();
      });

      expect(container).toMatchSnapshot();
    });
  });
});
