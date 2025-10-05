import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { PostReplies } from './PostReplies';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

// Mock Organisms components
vi.mock('@/organisms', () => ({
  Post: vi.fn(({ postId, isReply, clickable, onClick }) => (
    <div
      data-testid={`post-${postId}`}
      data-reply={isReply}
      data-clickable={clickable}
      onClick={onClick}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      Post {postId}
    </div>
  )),
}));

// Mock Atoms components
vi.mock('@/atoms', () => ({
  Container: vi.fn(({ children, className }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  )),
}));

const mockPush = vi.fn();
const mockUseLiveQuery = vi.mocked(useLiveQuery);
const mockUseRouter = vi.mocked(useRouter);

describe('PostReplies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    });
  });

  it('renders without replies', () => {
    mockUseLiveQuery
      .mockReturnValueOnce({ uri: 'test-uri' }) // postDetails
      .mockReturnValueOnce([]); // replyIds

    render(<PostReplies postId="test-post-id" />);

    expect(screen.getByTestId('container')).toBeInTheDocument();
    expect(screen.queryByTestId(/post-/)).not.toBeInTheDocument();
  });

  it('renders replies when available', () => {
    mockUseLiveQuery
      .mockReturnValueOnce({ uri: 'test-uri' }) // postDetails
      .mockReturnValueOnce(['author1:reply1', 'author2:reply2']); // replyIds

    render(<PostReplies postId="test-post-id" />);

    expect(screen.getByTestId('post-author1:reply1')).toBeInTheDocument();
    expect(screen.getByTestId('post-author2:reply2')).toBeInTheDocument();

    // Check that replies are marked as replies and clickable
    expect(screen.getByTestId('post-author1:reply1')).toHaveAttribute('data-reply', 'true');
    expect(screen.getByTestId('post-author1:reply1')).toHaveAttribute('data-clickable', 'true');
  });

  it('navigates to reply when clicked', async () => {
    mockUseLiveQuery
      .mockReturnValueOnce({ uri: 'test-uri' }) // postDetails
      .mockReturnValueOnce(['author1:reply1']); // replyIds

    render(<PostReplies postId="test-post-id" />);

    const replyPost = screen.getByTestId('post-author1:reply1');
    fireEvent.click(replyPost);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/post/author1/reply1');
    });
  });

  it('handles malformed combinedId gracefully', async () => {
    mockUseLiveQuery
      .mockReturnValueOnce({ uri: 'test-uri' }) // postDetails
      .mockReturnValueOnce(['malformed-id-without-colon']); // replyIds

    render(<PostReplies postId="test-post-id" />);

    const replyPost = screen.getByTestId('post-malformed-id-without-colon');
    fireEvent.click(replyPost);

    // Should not navigate when ID is malformed
    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('handles empty segments in combinedId gracefully', async () => {
    mockUseLiveQuery
      .mockReturnValueOnce({ uri: 'test-uri' }) // postDetails
      .mockReturnValueOnce([':reply1', 'author1:']); // replyIds with empty segments

    render(<PostReplies postId="test-post-id" />);

    // Click first reply with empty authorId
    const firstReply = screen.getByTestId('post-:reply1');
    fireEvent.click(firstReply);

    // Click second reply with empty replyPostId
    const secondReply = screen.getByTestId('post-author1:');
    fireEvent.click(secondReply);

    // Should not navigate when segments are empty
    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('maintains proper structure with reply connectors', () => {
    mockUseLiveQuery
      .mockReturnValueOnce({ uri: 'test-uri' }) // postDetails
      .mockReturnValueOnce(['author1:reply1', 'author2:reply2']); // replyIds

    render(<PostReplies postId="test-post-id" />);

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('flex', 'flex-col', 'gap-4');

    // Check that each reply has the proper flex structure for connectors
    const replyContainers = container.querySelectorAll('.flex.gap-4');
    expect(replyContainers).toHaveLength(2);

    replyContainers.forEach((replyContainer) => {
      // Check for connector space
      const connectorSpace = replyContainer.querySelector('.w-8.flex-shrink-0');
      expect(connectorSpace).toBeInTheDocument();

      // Check for reply content area
      const contentArea = replyContainer.querySelector('.flex-1');
      expect(contentArea).toBeInTheDocument();
    });
  });
});
