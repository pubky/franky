import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { TimelineRepliesWithParent } from './RepliesWithParent';
import * as Core from '@/core';
import * as Hooks from '@/hooks';

// Mock dependencies
vi.mock('dexie-react-hooks');
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useStreamPagination: vi.fn(),
    usePostNavigation: vi.fn(),
    useInfiniteScroll: vi.fn(),
  };
});

// Mock components
vi.mock('@/atoms', () => ({
  Container: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="container" {...props}>
      {children}
    </div>
  ),
  PostThreadSpacer: () => <div data-testid="post-thread-spacer" />,
}));

vi.mock('@/molecules', () => ({
  TimelineLoading: () => <div data-testid="timeline-loading">Loading...</div>,
  TimelineInitialError: ({ message }: { message: string }) => (
    <div data-testid="timeline-initial-error">Error: {message}</div>
  ),
  TimelineEmpty: () => <div data-testid="timeline-empty">No replies</div>,
  TimelineLoadingMore: () => <div data-testid="timeline-loading-more">Loading more...</div>,
  TimelineError: ({ message }: { message: string }) => <div data-testid="timeline-error">Error: {message}</div>,
  TimelineEndMessage: () => <div data-testid="timeline-end-message">End of replies</div>,
}));

vi.mock('@/organisms', () => ({
  PostMain: ({ postId, onClick, isReply }: { postId: string; onClick: () => void; isReply: boolean }) => (
    <div data-testid={`post-${postId}`} onClick={onClick} data-is-reply={isReply} />
  ),
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
    if (!hasItems) return <div data-testid="timeline-empty">No replies</div>;
    return <>{children}</>;
  },
}));

const mockUseLiveQuery = vi.mocked(useLiveQuery);
const mockUseStreamPagination = vi.mocked(Hooks.useStreamPagination);
const mockUsePostNavigation = vi.mocked(Hooks.usePostNavigation);
const mockUseInfiniteScroll = vi.mocked(Hooks.useInfiniteScroll);

describe('TimelineRepliesWithParent', () => {
  const mockStreamId = 'author_replies:test-user-id' as Core.PostStreamId;
  const mockNavigateToPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useStreamPagination
    mockUseStreamPagination.mockReturnValue({
      postIds: [],
      loading: false,
      loadingMore: false,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
      refresh: vi.fn(),
    });

    // Mock usePostNavigation
    mockUsePostNavigation.mockReturnValue({
      navigateToPost: mockNavigateToPost,
    });

    // Mock useInfiniteScroll
    mockUseInfiniteScroll.mockReturnValue({
      sentinelRef: { current: null },
    });

    // Mock useLiveQuery
    mockUseLiveQuery.mockReturnValue(null);
  });

  describe('Loading States', () => {
    it('should render loading state initially', () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: [],
        loading: true,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelineRepliesWithParent streamId={mockStreamId} />);

      expect(screen.getByTestId('timeline-loading')).toBeInTheDocument();
    });

    it('should render loading more indicator when paginating', () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: ['author1:reply1'],
        loading: false,
        loadingMore: true,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelineRepliesWithParent streamId={mockStreamId} />);

      expect(screen.getByTestId('timeline-loading-more')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should render empty state when no replies', () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: [],
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: false,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelineRepliesWithParent streamId={mockStreamId} />);

      expect(screen.getByTestId('timeline-empty')).toBeInTheDocument();
    });

    it('should render end message when no more replies to load', () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: ['author1:reply1'],
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: false,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelineRepliesWithParent streamId={mockStreamId} />);

      expect(screen.getByTestId('timeline-end-message')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('should render error state on initial fetch failure', () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: [],
        loading: false,
        loadingMore: false,
        error: 'Network error',
        hasMore: false,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelineRepliesWithParent streamId={mockStreamId} />);

      expect(screen.getByTestId('timeline-initial-error')).toBeInTheDocument();
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    it('should show error message when pagination fails', () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: ['author1:reply1'],
        loading: false,
        loadingMore: false,
        error: 'Pagination failed',
        hasMore: false,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      render(<TimelineRepliesWithParent streamId={mockStreamId} />);

      expect(screen.getByTestId('timeline-error')).toBeInTheDocument();
    });
  });

  describe('Reply Rendering', () => {
    it('should render replies without parent when no parent found', async () => {
      const mockReplyIds = ['author1:reply1', 'author2:reply2'];

      mockUseStreamPagination.mockReturnValue({
        postIds: mockReplyIds,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      // Mock useLiveQuery to return null (no parent)
      mockUseLiveQuery.mockReturnValue(null);

      render(<TimelineRepliesWithParent streamId={mockStreamId} />);

      await waitFor(() => {
        mockReplyIds.forEach((replyId) => {
          expect(screen.getByTestId(`post-${replyId}`)).toBeInTheDocument();
        });
      });
    });

    it('should render replies with parent when parent exists', async () => {
      const mockReplyIds = ['author1:reply1'];
      const mockParentId = 'author2:parent1';

      mockUseStreamPagination.mockReturnValue({
        postIds: mockReplyIds,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      // Mock useLiveQuery to handle multiple calls:
      // 1st call: parentPostId from relationships
      // 2nd call: parentPost from database
      // 3rd call: previousParentPost
      mockUseLiveQuery
        .mockReturnValueOnce(mockParentId) // 1st: parentPostId
        .mockReturnValueOnce({ id: mockParentId }) // 2nd: parentPost
        .mockReturnValueOnce(null); // 3rd: previousParentPost

      render(<TimelineRepliesWithParent streamId={mockStreamId} />);

      await waitFor(() => {
        expect(screen.getByTestId(`post-${mockParentId}`)).toBeInTheDocument();
        expect(screen.getByTestId(`post-${mockReplyIds[0]}`)).toBeInTheDocument();
      });
    });

    it('should render reply with isReply=true', async () => {
      const mockReplyIds = ['author1:reply1'];

      mockUseStreamPagination.mockReturnValue({
        postIds: mockReplyIds,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      mockUseLiveQuery.mockReturnValue(null);

      render(<TimelineRepliesWithParent streamId={mockStreamId} />);

      await waitFor(() => {
        const replyPost = screen.getByTestId(`post-${mockReplyIds[0]}`);
        expect(replyPost).toHaveAttribute('data-is-reply', 'true');
      });
    });

    it('should render parent with isReply=false', async () => {
      const mockReplyIds = ['author1:reply1'];
      const mockParentId = 'author2:parent1';

      mockUseStreamPagination.mockReturnValue({
        postIds: mockReplyIds,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      // Mock useLiveQuery to handle multiple calls:
      // 1st call: parentPostId from relationships
      // 2nd call: parentPost from database
      // 3rd call: previousParentPost
      mockUseLiveQuery
        .mockReturnValueOnce(mockParentId) // 1st: parentPostId
        .mockReturnValueOnce({ id: mockParentId }) // 2nd: parentPost
        .mockReturnValueOnce(null); // 3rd: previousParentPost

      render(<TimelineRepliesWithParent streamId={mockStreamId} />);

      await waitFor(() => {
        const parentPost = screen.getByTestId(`post-${mockParentId}`);
        expect(parentPost).toHaveAttribute('data-is-reply', 'false');
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to post when clicked', async () => {
      const mockReplyIds = ['author1:reply1'];

      mockUseStreamPagination.mockReturnValue({
        postIds: mockReplyIds,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      mockUseLiveQuery.mockReturnValue(null);

      render(<TimelineRepliesWithParent streamId={mockStreamId} />);

      await waitFor(() => {
        const post = screen.getByTestId(`post-${mockReplyIds[0]}`);
        post.click();
      });

      expect(mockNavigateToPost).toHaveBeenCalledWith(mockReplyIds[0]);
    });
  });

  describe('Infinite Scroll', () => {
    it('should configure infinite scroll with correct parameters', () => {
      const mockLoadMore = vi.fn();
      mockUseStreamPagination.mockReturnValue({
        postIds: ['author1:reply1'],
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: mockLoadMore,
        refresh: vi.fn(),
      });

      render(<TimelineRepliesWithParent streamId={mockStreamId} />);

      expect(mockUseInfiniteScroll).toHaveBeenCalledWith({
        onLoadMore: mockLoadMore,
        hasMore: true,
        isLoading: false,
        threshold: 3000,
        debounceMs: 20,
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

      const { container } = render(<TimelineRepliesWithParent streamId={mockStreamId} />);

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for empty state', () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: [],
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: false,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      const { container } = render(<TimelineRepliesWithParent streamId={mockStreamId} />);

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for error state', () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: [],
        loading: false,
        loadingMore: false,
        error: 'Network error',
        hasMore: false,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      const { container } = render(<TimelineRepliesWithParent streamId={mockStreamId} />);

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot with replies', () => {
      mockUseStreamPagination.mockReturnValue({
        postIds: ['author1:reply1', 'author2:reply2'],
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: true,
        loadMore: vi.fn(),
        refresh: vi.fn(),
      });

      mockUseLiveQuery.mockReturnValue(null);

      const { container } = render(<TimelineRepliesWithParent streamId={mockStreamId} />);

      expect(container).toMatchSnapshot();
    });
  });
});
