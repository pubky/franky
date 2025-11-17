import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SinglePost } from './SinglePost';
import * as Core from '@/core';

// Mock next/navigation
const mockUseParams = vi.fn();
vi.mock('next/navigation', () => ({
  useParams: () => mockUseParams(),
}));

// Mock Atoms - render actual content for better testing
vi.mock('@/atoms', () => ({
  Container: vi.fn(({ children, className, size }) => (
    <div className={className} data-size={size}>
      {children}
    </div>
  )),
}));

// Mock Organisms - render actual content for better testing
vi.mock('@/organisms', () => ({
  SinglePost: vi.fn(({ postId, clickable, isReply, onClick }) => (
    <div
      data-testid="single-post"
      data-post-id={postId}
      data-clickable={clickable}
      data-is-reply={isReply}
      onClick={onClick}
    >
      <div>Post Content for {postId}</div>
      <div>Clickable: {clickable ? 'Yes' : 'No'}</div>
      <div>Is Reply: {isReply ? 'Yes' : 'No'}</div>
    </div>
  )),
  SinglePostReplies: vi.fn(({ postId }) => (
    <div data-testid="single-post-replies" data-post-id={postId}>
      <div>Replies for {postId}</div>
    </div>
  )),
  SinglePostReplyInput: vi.fn(({ postId }) => (
    <div data-testid="single-post-reply-input" data-post-id={postId}>
      <div>Reply Input for {postId}</div>
    </div>
  )),
}));

// Mock Core
vi.mock('@/core', () => ({
  buildCompositeId: vi.fn(),
}));

const mockBuildCompositeId = vi.mocked(Core.buildCompositeId);

describe('SinglePost Template', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({
      postId: 'test-post-123',
      userId: 'test-user-456',
    });
    mockBuildCompositeId.mockImplementation(({ pubky, id }) => `${pubky}:${id}`);
  });

  it('renders post content', () => {
    render(<SinglePost />);

    expect(screen.getByText('Post Content for test-user-456:test-post-123')).toBeInTheDocument();
  });

  it('renders replies section', () => {
    render(<SinglePost />);

    expect(screen.getByText('Replies for test-user-456:test-post-123')).toBeInTheDocument();
  });

  it('renders reply input section', () => {
    render(<SinglePost />);

    expect(screen.getByText('Reply Input for test-user-456:test-post-123')).toBeInTheDocument();
  });

  it('renders with default clickable state', () => {
    render(<SinglePost />);

    expect(screen.getByText('Clickable: No')).toBeInTheDocument();
    expect(screen.getByText('Is Reply: No')).toBeInTheDocument();
  });

  it('handles clickable prop', () => {
    render(<SinglePost clickable={true} />);

    expect(screen.getByText('Clickable: Yes')).toBeInTheDocument();
  });

  it('handles isReply prop', () => {
    render(<SinglePost isReply={true} />);

    expect(screen.getByText('Is Reply: Yes')).toBeInTheDocument();
  });

  it('handles onClick interaction', () => {
    const mockOnClick = vi.fn();
    render(<SinglePost onClick={mockOnClick} />);

    const postElement = screen.getByTestId('single-post');
    fireEvent.click(postElement);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('updates content when URL parameters change', () => {
    const { rerender } = render(<SinglePost />);

    expect(screen.getByText('Post Content for test-user-456:test-post-123')).toBeInTheDocument();

    // Change URL parameters
    mockUseParams.mockReturnValue({
      postId: 'new-post-789',
      userId: 'new-user-101',
    });

    rerender(<SinglePost />);

    expect(screen.getByText('Post Content for new-user-101:new-post-789')).toBeInTheDocument();
    expect(screen.getByText('Replies for new-user-101:new-post-789')).toBeInTheDocument();
    expect(screen.getByText('Reply Input for new-user-101:new-post-789')).toBeInTheDocument();
  });

  it('handles empty URL parameters', () => {
    mockUseParams.mockReturnValue({
      postId: '',
      userId: '',
    });
    mockBuildCompositeId.mockReturnValue(':');

    render(<SinglePost />);

    expect(screen.getByText('Post Content for :')).toBeInTheDocument();
    expect(screen.getByText('Replies for :')).toBeInTheDocument();
    expect(screen.getByText('Reply Input for :')).toBeInTheDocument();
  });

  it('handles all props together', () => {
    const mockOnClick = vi.fn();
    render(<SinglePost clickable={true} isReply={true} onClick={mockOnClick} />);

    expect(screen.getByText('Clickable: Yes')).toBeInTheDocument();
    expect(screen.getByText('Is Reply: Yes')).toBeInTheDocument();

    const postElement = screen.getByTestId('single-post');
    fireEvent.click(postElement);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('handles buildCompositeId errors', () => {
    mockBuildCompositeId.mockImplementation(() => {
      throw new Error('Invalid post ID');
    });

    expect(() => render(<SinglePost />)).toThrow('Invalid post ID');
  });
});
