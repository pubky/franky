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
    useStreamPagination: vi.fn(),
    usePostNavigation: vi.fn(),
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
  TimelineStateWrapper: ({
    loading,
    error,
    hasItems,
    children,
  }: {
    loading: boolean;
    error: string | null;
    hasItems: boolean;
    children: React.ReactNode;
  }) => {
    if (loading) return <div data-testid="timeline-loading">Loading...</div>;
    if (error && !hasItems) return <div data-testid="timeline-initial-error">Error: {error}</div>;
    if (!hasItems) return <div data-testid="timeline-empty">No posts</div>;
    return <>{children}</>;
  },
}));

const mockPush = vi.fn();
const mockUseLiveQuery = vi.mocked(useLiveQuery);
const mockUseRouter = vi.mocked(useRouter);
const mockUseStreamIdFromFilters = vi.mocked(Hooks.useStreamIdFromFilters);
const mockUseInfiniteScroll = vi.mocked(Hooks.useInfiniteScroll);
const mockUseStreamPagination = vi.mocked(Hooks.useStreamPagination);
const mockUsePostNavigation = vi.mocked(Hooks.usePostNavigation);

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

    // Mock useStreamPagination
    mockUseStreamPagination.mockReturnValue({
      postIds: mockPostIds,
      loading: false,
      loadingMore: false,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
      refresh: vi.fn(),
    });

    // Mock usePostNavigation
    mockUsePostNavigation.mockReturnValue({
      navigateToPost: mockPush,
    });

    // Mock useLiveQuery to return no replies by default
    mockUseLiveQuery.mockReturnValue({ id: 'test', replies: 0, tags: 0, unique_tags: 0, reposts: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading States', () => {
    it('should render loading state initially', async () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: [],
        loading: true,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelinePosts />);

      expect(screen.getByTestId('timeline-loading')).toBeInTheDocument();
    });

    it('should render posts after successful fetch', async () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: mockPostIds,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument();
      });
    });

    it('should show loading more indicator when paginating', async () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: mockPostIds,
        loading: false,
        loadingMore: true,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.getByTestId('timeline-loading-more')).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should render empty state when no posts are returned', async () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: [],
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: false,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.getByTestId('timeline-empty')).toBeInTheDocument();
      });
    });

    it('should render end message when no more posts to load', async () => {
      const fewPosts = ['author1:post1', 'author2:post2']; // Less than NEXUS_POSTS_PER_PAGE

      mockUseStreamPagination.mockReturnValue({
        postIds: fewPosts,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: false,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.getByTestId('timeline-end-message')).toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('should render error state on initial fetch failure', async () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: [],
        loading: false,
        loadingMore: false,
        error: 'Network error',
        hasMore: false,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.getByTestId('timeline-initial-error')).toBeInTheDocument();
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should show error message when pagination fails', async () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: mockPostIds,
        loading: false,
        loadingMore: false,
        error: 'Pagination failed',
        hasMore: false,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.getByTestId('timeline-error')).toBeInTheDocument();
      });
    });

    it('should stop loading more posts after pagination error', async () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: mockPostIds,
        loading: false,
        loadingMore: false,
        error: 'Pagination failed',
        hasMore: false,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        const { hasMore } = mockUseInfiniteScroll.mock.calls[0][0];
        expect(hasMore).toBe(false);
      });
    });
  });

  describe('Post Rendering', () => {
    it('should render all fetched posts', async () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: mockPostIds,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        mockPostIds.forEach((postId) => {
          expect(screen.getByTestId(`post-${postId}`)).toBeInTheDocument();
        });
      });
    });

    it('should render PostWithReplies for each post', async () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: mockPostIds,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        const postContainers = screen.getAllByTestId(/^post-/);
        expect(postContainers).toHaveLength(mockPostIds.length);
      });
    });

    it('should render posts with correct keys', async () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: mockPostIds,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
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
      mockUseStreamPagination.mockReturnValue({
        postIds: ['author1:post123'],
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        const post = screen.getByTestId('post-author1:post123');
        post.click();
      });

      expect(mockPush).toHaveBeenCalledWith('author1:post123');
    });

    it('should navigate with correct URL format for different posts', async () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: mockPostIds,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        const post1 = screen.getByTestId('post-author1:post1');
        post1.click();
      });

      expect(mockPush).toHaveBeenCalledWith('author1:post1');
    });
  });

  describe('Pagination', () => {
    it('should call loadMore when infinite scroll triggers', async () => {
      const mockLoadMore = vi.fn();
      mockUseStreamPagination.mockReturnValue({
        postIds: mockPostIds,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: mockLoadMore,
        refresh: vi.fn(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.getByTestId('post-author1:post1')).toBeInTheDocument();
      });

      // Trigger load more
      const { onLoadMore } = mockUseInfiniteScroll.mock.calls[0][0];
      await onLoadMore();

      expect(mockLoadMore).toHaveBeenCalled();
    });

    it('should pass hasMore to infinite scroll hook', async () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: mockPostIds,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: false,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        const { hasMore } = mockUseInfiniteScroll.mock.calls[0][0];
        expect(hasMore).toBe(false);
      });
    });

    it('should pass loadingMore to infinite scroll hook', async () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: mockPostIds,
        loading: false,
        loadingMore: true,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        const { isLoading } = mockUseInfiniteScroll.mock.calls[0][0];
        expect(isLoading).toBe(true);
      });
    });
  });

  describe('Stream Changes', () => {
    it('should use streamId from filters when not provided', async () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: mockPostIds,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelinePosts />);

      await waitFor(() => {
        expect(mockUseStreamPagination).toHaveBeenCalledWith({
          streamId: mockStreamId,
        });
      });
    });

    it('should use provided streamId prop over filters', async () => {
      const customStreamId = Core.PostStreamTypes.POPULARITY_ALL_ALL;
      mockUseStreamPagination.mockReturnValue({
        postIds: mockPostIds,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelinePosts streamId={customStreamId} />);

      await waitFor(() => {
        expect(mockUseStreamPagination).toHaveBeenCalledWith({
          streamId: customStreamId,
        });
      });
    });
  });

  describe('Infinite Scroll Configuration', () => {
    it('should configure infinite scroll with correct parameters', async () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: mockPostIds,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
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
      mockUseStreamPagination.mockReturnValue({
        postIds: mockPostIds,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
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
      mockUseStreamPagination.mockReturnValue({
        postIds: [],
        loading: true,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      const { container } = render(<TimelinePosts />);

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for empty state', async () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: [],
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: false,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      const { container } = render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.getByTestId('timeline-empty')).toBeInTheDocument();
      });

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for error state', async () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: [],
        loading: false,
        loadingMore: false,
        error: 'Network error',
        hasMore: false,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      const { container } = render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.getByTestId('timeline-initial-error')).toBeInTheDocument();
      });

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot with posts', async () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: mockPostIds,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      const { container } = render(<TimelinePosts />);

      await waitFor(() => {
        expect(screen.queryByTestId('timeline-loading')).not.toBeInTheDocument();
      });

      expect(container).toMatchSnapshot();
    });
  });
});
