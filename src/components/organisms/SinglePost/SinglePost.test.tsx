import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SinglePost } from './SinglePost';

// Mock the atoms
vi.mock('@/atoms', () => ({
  Card: vi.fn(({ children, className, onClick, ref }) => (
    <div data-testid="card" className={className} onClick={onClick} ref={ref}>
      {children}
    </div>
  )),
  Container: vi.fn(({ children, className, onClick }) => (
    <div data-testid="container" className={className} onClick={onClick}>
      {children}
    </div>
  )),
  ReplyLine: vi.fn(({ height }) => (
    <div data-testid="reply-line" data-height={height}>
      ReplyLine
    </div>
  )),
}));

// Mock the molecules
vi.mock('@/molecules', () => ({
  PostDeleted: vi.fn(() => <div data-testid="post-deleted">Post Deleted</div>),
}));

// Mock the organisms
vi.mock('@/organisms', () => ({
  SinglePostUserDetails: vi.fn(({ postId }) => (
    <div data-testid="single-post-user-details" data-post-id={postId}>
      User Details
    </div>
  )),
  SinglePostContent: vi.fn(({ postId }) => (
    <div data-testid="single-post-content" data-post-id={postId}>
      Post Content
    </div>
  )),
  SinglePostTags: vi.fn(({ postId }) => (
    <div data-testid="single-post-tags" data-post-id={postId}>
      Post Tags
    </div>
  )),
  SinglePostCounts: vi.fn(({ postId }) => (
    <div data-testid="single-post-counts" data-post-id={postId}>
      Post Counts
    </div>
  )),
}));

// Mock usePostDetails hook
const mockUsePostDetails = vi.fn();
vi.mock('@/hooks', async () => {
  const actual = await vi.importActual('@/hooks');
  return {
    ...actual,
    usePostDetails: () => mockUsePostDetails(),
  };
});

// Mock isPostDeleted function
const mockIsPostDeleted = vi.fn();
vi.mock('@/libs', () => ({
  isPostDeleted: (content: string | undefined) => mockIsPostDeleted(content),
}));

// Mock ResizeObserver for useElementHeight
const mockResizeObserverInstance = {
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
};

class MockResizeObserver {
  constructor() {
    return mockResizeObserverInstance;
  }
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

// Mock getBoundingClientRect for useElementHeight
Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
  writable: true,
  value: vi.fn(() => ({
    height: 100,
    width: 200,
    top: 0,
    left: 0,
    bottom: 100,
    right: 200,
    x: 0,
    y: 0,
    toJSON: vi.fn(),
  })),
});

describe('SinglePost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: post is not deleted
    mockUsePostDetails.mockReturnValue({ postDetails: { content: 'Test content' } });
    mockIsPostDeleted.mockReturnValue(false);
  });

  it('renders with required postId prop', () => {
    render(<SinglePost postId="test-post-123" />);

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('single-post-user-details')).toHaveAttribute('data-post-id', 'test-post-123');
    expect(screen.getByTestId('single-post-content')).toHaveAttribute('data-post-id', 'test-post-123');

    const tags = screen.getAllByTestId('single-post-tags');
    expect(tags).toHaveLength(2);
    tags.forEach((tag) => {
      expect(tag).toHaveAttribute('data-post-id', 'test-post-123');
    });

    expect(screen.getByTestId('single-post-counts')).toHaveAttribute('data-post-id', 'test-post-123');
  });

  it('renders without ReplyLine by default', () => {
    render(<SinglePost postId="test-post-123" />);

    // Should not render ReplyLine by default
    expect(screen.queryByTestId('reply-line')).not.toBeInTheDocument();
  });

  it('renders ReplyLine when isReply is true', () => {
    render(<SinglePost postId="test-post-123" isReply={true} />);

    const replyLine = screen.getByTestId('reply-line');
    expect(replyLine).toBeInTheDocument();
  });

  it('handles onClick when clickable is true', () => {
    const handleClick = vi.fn();
    render(<SinglePost postId="test-post-123" clickable={true} onClick={handleClick} />);

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('cursor-pointer');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not handle onClick when clickable is false', () => {
    const handleClick = vi.fn();
    render(<SinglePost postId="test-post-123" clickable={false} onClick={handleClick} />);

    const card = screen.getByTestId('card');
    fireEvent.click(card);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders tags in correct locations for responsive design', () => {
    render(<SinglePost postId="test-post-123" />);

    const tags = screen.getAllByTestId('single-post-tags');
    expect(tags).toHaveLength(2);

    // Mobile tags (block lg:hidden)
    expect(tags[0].parentElement).toHaveClass('block', 'lg:hidden');

    // Desktop tags (hidden lg:block)
    expect(tags[1].parentElement).toHaveClass('hidden', 'lg:block');
  });

  it('integrates with useElementHeight hook correctly', () => {
    render(<SinglePost postId="test-post-123" isReply={true} />);

    // The card should have a ref from useElementHeight
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();

    // ResizeObserver should have been instantiated and observe called
    expect(mockResizeObserverInstance.observe).toHaveBeenCalled();
  });

  describe('deleted post state', () => {
    beforeEach(() => {
      mockIsPostDeleted.mockReturnValue(true);
    });

    it('renders PostDeleted component when post is deleted', () => {
      render(<SinglePost postId="test-post-123" />);

      expect(screen.getByTestId('post-deleted')).toBeInTheDocument();
      expect(screen.queryByTestId('single-post-user-details')).not.toBeInTheDocument();
      expect(screen.queryByTestId('single-post-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('single-post-tags')).not.toBeInTheDocument();
      expect(screen.queryByTestId('single-post-counts')).not.toBeInTheDocument();
    });

    it('renders PostDeleted with ReplyLine when isReply is true', () => {
      render(<SinglePost postId="test-post-123" isReply={true} />);

      expect(screen.getByTestId('post-deleted')).toBeInTheDocument();
      expect(screen.getByTestId('reply-line')).toBeInTheDocument();
    });

    it('still handles onClick when clickable is true and post is deleted', () => {
      const handleClick = vi.fn();
      render(<SinglePost postId="test-post-123" clickable={true} onClick={handleClick} />);

      const card = screen.getByTestId('card');
      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls isPostDeleted with post content', () => {
      mockUsePostDetails.mockReturnValue({ postDetails: { content: 'deleted-content' } });

      render(<SinglePost postId="test-post-123" />);

      expect(mockIsPostDeleted).toHaveBeenCalledWith('deleted-content');
    });

    it('handles undefined postDetails gracefully', () => {
      mockUsePostDetails.mockReturnValue({ postDetails: undefined });
      mockIsPostDeleted.mockReturnValue(false);

      render(<SinglePost postId="test-post-123" />);

      expect(mockIsPostDeleted).toHaveBeenCalledWith(undefined);
    });
  });
});

describe('SinglePost - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePostDetails.mockReturnValue({ postDetails: { content: 'Test content' } });
    mockIsPostDeleted.mockReturnValue(false);
  });

  it('matches snapshot with default props', () => {
    const { container } = render(<SinglePost postId="test-post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with isReply true', () => {
    const { container } = render(<SinglePost postId="test-post-123" isReply={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with clickable true', () => {
    const { container } = render(<SinglePost postId="test-post-123" clickable={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with isReply false explicitly', () => {
    const { container } = render(<SinglePost postId="test-post-123" isReply={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with clickable false explicitly', () => {
    const { container } = render(<SinglePost postId="test-post-123" clickable={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with all props provided', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <SinglePost postId="test-post-123" isReply={true} clickable={true} onClick={handleClick} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with different postId', () => {
    const { container } = render(<SinglePost postId="different-post-id" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when post is deleted', () => {
    mockIsPostDeleted.mockReturnValue(true);
    const { container } = render(<SinglePost postId="test-post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when post is deleted with isReply true', () => {
    mockIsPostDeleted.mockReturnValue(true);
    const { container } = render(<SinglePost postId="test-post-123" isReply={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when post is deleted with clickable true', () => {
    mockIsPostDeleted.mockReturnValue(true);
    const { container } = render(<SinglePost postId="test-post-123" clickable={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
