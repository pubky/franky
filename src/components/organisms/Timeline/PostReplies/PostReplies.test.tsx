import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { TimelinePostReplies } from './PostReplies';
import * as Core from '@/core';

// Mock dependencies
vi.mock('dexie-react-hooks');
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
}));

const mockUseLiveQuery = vi.mocked(useLiveQuery);

describe('TimelinePostReplies', () => {
  const mockPostId = 'author:post123';
  const mockOnPostClick = vi.fn();

  const mockReplyIds = ['author:reply1', 'author:reply2', 'author:reply3'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render nothing when there are no replies', () => {
      // Mock post counts with 0 replies
      mockUseLiveQuery
        .mockReturnValueOnce({ id: mockPostId, replies: 0, tags: 0, unique_tags: 0, reposts: 0 })
        .mockReturnValueOnce([]);

      const { container } = render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      expect(container.firstChild).toBeNull();
    });

    it('should render replies when post has replies', async () => {
      // Mock post counts with 3 replies
      mockUseLiveQuery
        .mockReturnValueOnce({ id: mockPostId, replies: 3, tags: 0, unique_tags: 0, reposts: 0 })
        .mockReturnValueOnce(mockReplyIds);

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        // Should render 3 PostMain components (one for each reply)
        const replies = screen.getAllByTestId(/^post-main-/);
        expect(replies).toHaveLength(3);
      });
    });

    it('should render PostThreadSpacer for each reply', async () => {
      mockUseLiveQuery
        .mockReturnValueOnce({ id: mockPostId, replies: 3, tags: 0, unique_tags: 0, reposts: 0 })
        .mockReturnValueOnce(mockReplyIds);

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        const spacers = screen.getAllByTestId(/^post-thread-spacer/);
        expect(spacers).toHaveLength(3);
      });
    });

    it('should render nothing when replyIds array is empty', () => {
      mockUseLiveQuery
        .mockReturnValueOnce({ id: mockPostId, replies: 1, tags: 0, unique_tags: 0, reposts: 0 })
        .mockReturnValueOnce([]);

      const { container } = render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      expect(container.firstChild).toBeNull();
    });

    it('should render with correct container styling', async () => {
      mockUseLiveQuery
        .mockReturnValueOnce({ id: mockPostId, replies: 1, tags: 0, unique_tags: 0, reposts: 0 })
        .mockReturnValueOnce(['author:reply1']);

      const { container } = render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        const containerDiv = container.querySelector('.ml-3');
        expect(containerDiv).toBeInTheDocument();
      });
    });
  });

  describe('Reply Properties', () => {
    it('should mark all replies with isReply=true', async () => {
      mockUseLiveQuery
        .mockReturnValueOnce({ id: mockPostId, replies: 2, tags: 0, unique_tags: 0, reposts: 0 })
        .mockReturnValueOnce(['author:reply1', 'author:reply2']);

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        const replies = screen.getAllByTestId(/^post-main-/);
        replies.forEach((reply) => {
          expect(reply).toHaveAttribute('data-is-reply', 'true');
        });
      });
    });

    it('should mark last reply with isLastReply=true', async () => {
      mockUseLiveQuery
        .mockReturnValueOnce({ id: mockPostId, replies: 3, tags: 0, unique_tags: 0, reposts: 0 })
        .mockReturnValueOnce(mockReplyIds);

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        const replies = screen.getAllByTestId(/^post-main-/);
        const lastReply = replies[replies.length - 1];
        expect(lastReply).toHaveAttribute('data-is-last-reply', 'true');
      });
    });

    it('should not mark first and middle replies as last', async () => {
      mockUseLiveQuery
        .mockReturnValueOnce({ id: mockPostId, replies: 3, tags: 0, unique_tags: 0, reposts: 0 })
        .mockReturnValueOnce(mockReplyIds);

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
      mockUseLiveQuery
        .mockReturnValueOnce({ id: mockPostId, replies: 1, tags: 0, unique_tags: 0, reposts: 0 })
        .mockReturnValueOnce(['author:reply1']);

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        const reply = screen.getByTestId('post-main-author:reply1');
        reply.click();
      });

      expect(mockOnPostClick).toHaveBeenCalledWith('author:reply1');
    });

    it('should call onPostClick with correct IDs for multiple replies', async () => {
      mockUseLiveQuery
        .mockReturnValueOnce({ id: mockPostId, replies: 3, tags: 0, unique_tags: 0, reposts: 0 })
        .mockReturnValueOnce(mockReplyIds);

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
      mockUseLiveQuery
        .mockReturnValueOnce({ id: mockPostId, replies: 0, tags: 0, unique_tags: 0, reposts: 0 })
        .mockReturnValueOnce([]);

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      expect(mockUseLiveQuery).toHaveBeenCalledWith(expect.any(Function), [mockPostId]);
    });

    it('should fetch replies when post has replies', async () => {
      mockUseLiveQuery
        .mockReturnValueOnce({ id: mockPostId, replies: 3, tags: 0, unique_tags: 0, reposts: 0 })
        .mockReturnValueOnce(mockReplyIds);

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        expect(mockUseLiveQuery).toHaveBeenCalledWith(
          expect.any(Function),
          [mockPostId, 3], // Should watch reply count
          [],
        );
      });
    });

    it('should not fetch replies when count is zero', () => {
      mockUseLiveQuery
        .mockReturnValueOnce({ id: mockPostId, replies: 0, tags: 0, unique_tags: 0, reposts: 0 })
        .mockReturnValueOnce([]);

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      // Should still call useLiveQuery but return empty array
      expect(mockUseLiveQuery).toHaveBeenCalledTimes(2);
    });
  });

  describe('Limit Behavior', () => {
    it('should render maximum of 3 replies', async () => {
      mockUseLiveQuery
        .mockReturnValueOnce({ id: mockPostId, replies: 10, tags: 0, unique_tags: 0, reposts: 0 })
        .mockReturnValueOnce(mockReplyIds);

      render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        const replies = screen.getAllByTestId(/^post-main-/);
        expect(replies).toHaveLength(3);
      });
    });
  });

  describe('Key Generation', () => {
    it('should generate unique keys for each reply', async () => {
      mockUseLiveQuery
        .mockReturnValueOnce({ id: mockPostId, replies: 3, tags: 0, unique_tags: 0, reposts: 0 })
        .mockReturnValueOnce(mockReplyIds);

      const { container } = render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        const fragments = container.querySelectorAll('[data-testid*="post-main"]');
        expect(fragments).toHaveLength(3);
      });
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot when rendering no replies', () => {
      mockUseLiveQuery
        .mockReturnValueOnce({ id: mockPostId, replies: 0, tags: 0, unique_tags: 0, reposts: 0 })
        .mockReturnValueOnce([]);

      const { container } = render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot when rendering replies', async () => {
      mockUseLiveQuery
        .mockReturnValueOnce({ id: mockPostId, replies: 3, tags: 0, unique_tags: 0, reposts: 0 })
        .mockReturnValueOnce(mockReplyIds);

      const { container } = render(<TimelinePostReplies postId={mockPostId} onPostClick={mockOnPostClick} />);

      await waitFor(() => {
        expect(screen.getAllByTestId(/^post-main-/)).toHaveLength(3);
      });

      expect(container).toMatchSnapshot();
    });
  });
});
