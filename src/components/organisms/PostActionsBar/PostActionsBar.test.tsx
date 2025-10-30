import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostActionsBar } from './PostActionsBar';
import { useLiveQuery } from 'dexie-react-hooks';

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

// Use real libs, only stub cn for deterministic class joining
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  };
});

// Minimal atoms used by PostActionsBar
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="actions-container" data-class-name={className}>
      {children}
    </div>
  ),
  // Fix: Provide a minimal local type for ButtonProps to avoid TypeScript error
  Button: ({
    children,
    onClick,
    className,
    variant,
    size,
    style,
    'aria-label': aria,
  }: {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler;
    className?: string;
    variant?: string;
    size?: string;
    style?: React.CSSProperties;
    'aria-label'?: string;
  }) => (
    <button
      onClick={onClick}
      className={className}
      data-variant={variant}
      data-size={size}
      style={style}
      aria-label={aria}
    >
      {children}
    </button>
  ),
}));

const mockUseLiveQuery = vi.mocked(useLiveQuery);

describe('PostActionsBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while counts are not available', () => {
    mockUseLiveQuery.mockReturnValue(null);

    const { container } = render(<PostActionsBar postId="post-1" />);
    expect(container.firstChild).toHaveTextContent('Loading actions...');
  });

  it('renders all action buttons with counts and aria labels', () => {
    mockUseLiveQuery.mockReturnValue({ tags: 3, replies: 5, reposts: 2 });

    render(<PostActionsBar postId="post-2" />);

    expect(screen.getByRole('button', { name: 'Tag post (3)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reply to post (5)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Repost (2)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bookmark/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More options' })).toBeInTheDocument();
  });

  it('invokes callbacks when buttons are clicked', () => {
    mockUseLiveQuery.mockReturnValue({ tags: 1, replies: 1, reposts: 1 });

    const onTagClick = vi.fn();
    const onReplyClick = vi.fn();
    const onRepostClick = vi.fn();
    const onBookmarkClick = vi.fn();
    const onMoreClick = vi.fn();

    render(
      <PostActionsBar
        postId="post-3"
        onTagClick={onTagClick}
        onReplyClick={onReplyClick}
        onRepostClick={onRepostClick}
        onBookmarkClick={onBookmarkClick}
        onMoreClick={onMoreClick}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Tag post (1)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reply to post (1)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Repost (1)' }));
    fireEvent.click(screen.getByRole('button', { name: /bookmark/i }));
    fireEvent.click(screen.getByRole('button', { name: 'More options' }));

    expect(onTagClick).toHaveBeenCalledTimes(1);
    expect(onReplyClick).toHaveBeenCalledTimes(1);
    expect(onRepostClick).toHaveBeenCalledTimes(1);
    expect(onBookmarkClick).toHaveBeenCalledTimes(1);
    expect(onMoreClick).toHaveBeenCalledTimes(1);
  });
});

describe('PostActionsBar - Snapshots', () => {
  it('matches snapshot with counts', () => {
    mockUseLiveQuery.mockReturnValue({ tags: 7, replies: 8, reposts: 9 });

    const { container } = render(<PostActionsBar postId="post-4" className="extra" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot loading', () => {
    mockUseLiveQuery.mockReturnValue(null);

    const { container } = render(<PostActionsBar postId="post-5" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
