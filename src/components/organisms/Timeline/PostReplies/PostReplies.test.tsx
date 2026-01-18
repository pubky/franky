import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { TimelinePostReplies } from './PostReplies';
import * as Core from '@/core';

// Mock dependencies
vi.mock('dexie-react-hooks');
vi.mock('@/libs', async () => {
  const actual = await vi.importActual('@/libs');
  return {
    ...actual,
    Logger: {
      error: vi.fn(),
    },
  };
});

// Mock usePostDetails hook
const mockUsePostDetails = vi.fn();
const mockUseMutedUsers = vi.fn();
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    usePostDetails: (postId: string) => mockUsePostDetails(postId),
    useMutedUsers: () => mockUseMutedUsers(),
  };
});

// Mock components
vi.mock('@/atoms', () => ({
  Container: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="container" {...props}>
      {children}
    </div>
  ),
  PostThreadSpacer: ({ ...props }: { [key: string]: unknown }) => <div data-testid="post-thread-spacer" {...props} />,
}));

vi.mock('@/organisms', () => ({
  PostMain: ({
    postId,
    isReply,
    isLastReply,
    onClick,
    ...props
  }: {
    postId: string;
    isReply: boolean;
    isLastReply: boolean;
    onClick: () => void;
    [key: string]: unknown;
  }) => (
    <div
      data-testid={`post-main-${postId}`}
      data-is-reply={String(isReply)}
      data-is-last-reply={String(isLastReply)}
      onClick={onClick}
      {...props}
    />
  ),
  QuickReply: ({ parentPostId }: { parentPostId: string }) => <div data-testid={`quick-reply-${parentPostId}`} />,
}));

const mockUseLiveQuery = vi.mocked(useLiveQuery);

describe('TimelinePostReplies', () => {
  const mockPostId = 'author:post123';
  const mockOnPostClick = vi.fn();

  const mockReplyIds = ['author:reply1', 'author:reply2', 'author:reply3'];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutedUsers.mockReturnValue({
      mutedUserIds: [],
      mutedUserIdSet: new Set(),
      isMuted: vi.fn(() => false),
      isLoading: false,
    });

    // Mock StreamPostsController.getOrFetchStreamSlice
    vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
      nextPageIds: [],
      timestamp: undefined,
    });

    // Default: post is not deleted
    mockUsePostDetails.mockReturnValue({ postDetails: { content: 'Normal post' }, isLoading: false });

    // Post counts query uses [postId]
    mockUseLiveQuery.mockImplementation((_, deps) => {
      if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
        return { id: mockPostId, replies: 0, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
          typeof useLiveQuery
        >;
      }
      return undefined as unknown as ReturnType<typeof useLiveQuery>;
    });
  });

  describe('Rendering', () => {
    it('should render nothing when there are no replies', () => {
      // Mock post counts with 0 replies
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 0, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      const { container } = render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      expect(container.firstChild).toBeNull();
    });

    it('should render replies when post has replies', async () => {
      // Mock post counts with 3 replies
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 3, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      // Mock getOrFetchStreamSlice to return replies
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: mockReplyIds,
        timestamp: undefined,
      });

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        // Should render 3 PostMain components (one for each reply)
        const replies = screen.getAllByTestId(/^post-main-/);
        expect(replies).toHaveLength(3);
      });
    });

    it('should filter out replies from muted users', async () => {
      mockUseMutedUsers.mockReturnValue({
        mutedUserIds: ['muted-user'],
        mutedUserIdSet: new Set(['muted-user']),
        isMuted: vi.fn((id) => id === 'muted-user'),
        isLoading: false,
      });

      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 2, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: ['muted-user:reply1', 'author:reply2'],
        timestamp: undefined,
      });

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        const replies = screen.getAllByTestId(/^post-main-/);
        expect(replies).toHaveLength(1);
      });
    });

    it('should render PostThreadSpacer for each reply', async () => {
      mockUsePostDetails.mockReturnValue({ postDetails: { content: '[DELETED]' }, isLoading: false });
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 3, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: mockReplyIds,
        timestamp: undefined,
      });

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        const spacers = screen.getAllByTestId(/^post-thread-spacer/);
        expect(spacers).toHaveLength(3);
      });
    });

    it('should render nothing when replyIds array is empty', () => {
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 1, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      // Will return empty array from getOrFetchStreamSlice (default mock)
      const { container } = render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      expect(container.firstChild).toBeNull();
    });

    it('should render with correct container styling', async () => {
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps[1] === 'details') {
          return { id: mockPostId, content: 'hello' } as unknown as ReturnType<typeof useLiveQuery>;
        }
        return { id: mockPostId, replies: 1, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
          typeof useLiveQuery
        >;
      });

      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: ['author:reply1'],
        timestamp: undefined,
      });

      const { container } = render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        const containerDiv = container.querySelector('.ml-3');
        expect(containerDiv).toBeInTheDocument();
      });
    });
  });

  describe('Reply Properties', () => {
    it('should mark all replies with isReply=true', async () => {
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps[1] === 'details') {
          return { id: mockPostId, content: 'hello' } as unknown as ReturnType<typeof useLiveQuery>;
        }
        return { id: mockPostId, replies: 2, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
          typeof useLiveQuery
        >;
      });

      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: ['author:reply1', 'author:reply2'],
        timestamp: undefined,
      });

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        const replies = screen.getAllByTestId(/^post-main-/);
        replies.forEach((reply) => {
          expect(reply).toHaveAttribute('data-is-reply', 'true');
        });
      });
    });

    it('should render QuickReply and keep last preview reply connector open when parent is not deleted', async () => {
      mockUsePostDetails.mockReturnValue({ postDetails: { content: 'Normal post' }, isLoading: false });
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 3, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: mockReplyIds,
        timestamp: undefined,
      });

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        expect(screen.getByTestId(`quick-reply-${mockPostId}`)).toBeInTheDocument();
      });

      const lastPreviewReply = screen.getByTestId('post-main-author:reply3');
      expect(lastPreviewReply).toHaveAttribute('data-is-last-reply', 'false');
    });

    it('should not render QuickReply when parent is deleted', async () => {
      mockUsePostDetails.mockReturnValue({ postDetails: { content: '[DELETED]' }, isLoading: false });
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 3, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: mockReplyIds,
        timestamp: undefined,
      });

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        expect(screen.getAllByTestId(/^post-main-/)).toHaveLength(3);
      });

      expect(screen.queryByTestId(`quick-reply-${mockPostId}`)).not.toBeInTheDocument();
    });

    it('should mark last reply with isLastReply=true', async () => {
      mockUsePostDetails.mockReturnValue({ postDetails: { content: '[DELETED]' }, isLoading: false });
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 3, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: mockReplyIds,
        timestamp: undefined,
      });

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        const replies = screen.getAllByTestId(/^post-main-/);
        const lastReply = replies[replies.length - 1];
        expect(lastReply).toHaveAttribute('data-is-last-reply', 'true');
      });
    });

    it('should not mark first and middle replies as last', async () => {
      mockUsePostDetails.mockReturnValue({ postDetails: { content: '[DELETED]' }, isLoading: false });
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 3, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: mockReplyIds,
        timestamp: undefined,
      });

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        const replies = screen.getAllByTestId(/^post-main-/);
        expect(replies[0]).toHaveAttribute('data-is-last-reply', 'false');
        expect(replies[1]).toHaveAttribute('data-is-last-reply', 'false');
      });
    });
  });

  describe('Click Handling', () => {
    it('should call onPostClick with correct postId when reply is clicked', async () => {
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 1, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: ['author:reply1'],
        timestamp: undefined,
      });

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        const reply = screen.getByTestId('post-main-author:reply1');
        reply.click();
      });

      expect(mockOnPostClick).toHaveBeenCalledWith('author:reply1');
    });

    it('should call onPostClick with correct IDs for multiple replies', async () => {
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 3, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: mockReplyIds,
        timestamp: undefined,
      });

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        const replies = screen.getAllByTestId(/^post-main-/);
        replies[0].click();
        replies[1].click();
        replies[2].click();
      });

      expect(mockOnPostClick).toHaveBeenCalledTimes(3);
      expect(mockOnPostClick).toHaveBeenNthCalledWith(1, 'author:reply1');
      expect(mockOnPostClick).toHaveBeenNthCalledWith(2, 'author:reply2');
      expect(mockOnPostClick).toHaveBeenNthCalledWith(3, 'author:reply3');
    });
  });

  describe('Data Fetching', () => {
    it('should fetch post counts on mount', () => {
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 0, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      expect(mockUseLiveQuery).toHaveBeenCalledWith(expect.any(Function), [mockPostId]);
    });

    it('should call getOrFetchStreamSlice with correct parameters', async () => {
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 5, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      const spy = vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: mockReplyIds,
        timestamp: undefined,
      });

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith({
          streamId: `${Core.StreamSource.REPLIES}:${mockPostId}`,
          streamTail: 0,
          lastPostId: undefined,
          limit: 3, // Should use min(repliesCount, 3)
        });
      });
    });

    it('should use repliesCount as limit when less than 3', async () => {
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 2, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      const spy = vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: ['author:reply1', 'author:reply2'],
        timestamp: undefined,
      });

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith({
          streamId: `${Core.StreamSource.REPLIES}:${mockPostId}`,
          streamTail: 0,
          lastPostId: undefined,
          limit: 2, // Should use repliesCount since it's less than 3
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should return empty array when controller throws error', async () => {
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockRejectedValueOnce(new Error('Database error'));

      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 3, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      const { container } = render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });

  describe('Limit Behavior', () => {
    it('should render maximum of 3 replies', async () => {
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 10, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: mockReplyIds,
        timestamp: undefined,
      });

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        const replies = screen.getAllByTestId(/^post-main-/);
        expect(replies).toHaveLength(3);
      });
    });
  });

  describe('Key Generation', () => {
    it('should generate unique keys for each reply', async () => {
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 3, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: mockReplyIds,
        timestamp: undefined,
      });

      const { container } = render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        const fragments = container.querySelectorAll('[data-testid*="post-main"]');
        expect(fragments).toHaveLength(3);
      });
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot when rendering no replies', () => {
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 0, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      const { container } = render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot when rendering replies', async () => {
      mockUseLiveQuery.mockImplementation((_, deps) => {
        if (Array.isArray(deps) && deps[0] === mockPostId && deps.length === 1) {
          return { id: mockPostId, replies: 3, tags: 0, unique_tags: 0, reposts: 0 } as unknown as ReturnType<
            typeof useLiveQuery
          >;
        }
        return undefined as unknown as ReturnType<typeof useLiveQuery>;
      });

      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: mockReplyIds,
        timestamp: undefined,
      });

      const { container } = render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        expect(screen.getAllByTestId(/^post-main-/)).toHaveLength(3);
      });

      expect(container).toMatchSnapshot();
    });
  });
});
