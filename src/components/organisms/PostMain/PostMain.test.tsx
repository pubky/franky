import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostMain } from './PostMain';
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

// Minimal atoms used by PostMain
vi.mock('@/atoms', () => ({
  Container: ({
    children,
    className,
    onClick,
    ...props
  }: React.PropsWithChildren<{ className?: string; onClick?: () => void; [key: string]: unknown }>) => (
    <div data-testid="container" data-class-name={className} onClick={onClick} {...props}>
      {children}
    </div>
  ),
  Card: vi.fn(({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" data-class-name={className}>
      {children}
    </div>
  )),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" data-class-name={className}>
      {children}
    </div>
  ),
  PostThreadConnector: ({ height, variant }: { height: number; variant?: string }) => (
    <div data-testid="thread-connector" data-height={height} data-variant={variant}>
      ThreadConnector
    </div>
  ),
}));

// Stub organisms composed inside PostMain
vi.mock('@/organisms', () => ({
  PostHeader: ({ postId }: { postId: string }) => <div data-testid="post-header">PostHeader {postId}</div>,
  PostContent: ({ postId }: { postId: string }) => <div data-testid="post-content">PostContent {postId}</div>,
  PostActionsBar: ({ postId, className }: { postId: string; className?: string }) => (
    <div data-testid="post-actions" data-class-name={className}>
      Actions {postId}
    </div>
  ),
}));

// Stub molecules used by PostMain
vi.mock('@/molecules', () => ({
  PostTagsList: ({ postId }: { postId: string }) => <div data-testid="post-tags-list">PostTagsList {postId}</div>,
}));

// Keep Core shape only for potential spying if needed
vi.mock('@/core', () => ({
  PostTagsModel: {
    findById: vi.fn(),
  },
}));

// Mock useElementHeight hook
vi.mock('@/hooks', () => ({
  useElementHeight: vi.fn(() => ({
    ref: vi.fn(),
    height: 150,
  })),
}));

const mockUseLiveQuery = vi.mocked(useLiveQuery);

describe('PostMain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header, content, tags and actions', () => {
    mockUseLiveQuery.mockReturnValue({ tags: [{ label: 'alpha' }, { label: 'beta' }] });

    render(<PostMain postId="post-123" />);

    expect(screen.getByTestId('post-header')).toHaveTextContent('PostHeader post-123');
    expect(screen.getByTestId('post-content')).toHaveTextContent('PostContent post-123');
    expect(screen.getByTestId('post-tags-list')).toHaveTextContent('PostTagsList post-123');
    expect(screen.getByTestId('post-actions')).toBeInTheDocument();
  });

  it('invokes onClick handler when clickable area is clicked', () => {
    mockUseLiveQuery.mockReturnValue({ tags: [] });
    const onClick = vi.fn();

    render(<PostMain postId="post-abc" onClick={onClick} />);

    // Click the cursor-pointer div (second child of relative container)
    const clickableArea = screen.getByTestId('card').parentElement;
    if (clickableArea) {
      fireEvent.click(clickableArea);
      expect(onClick).toHaveBeenCalledTimes(1);
    }
  });

  it('does not render thread connector when isReply is false', () => {
    mockUseLiveQuery.mockReturnValue({ tags: [] });

    render(<PostMain postId="post-123" isReply={false} />);

    expect(screen.queryByTestId('thread-connector')).not.toBeInTheDocument();
  });

  it('renders thread connector when isReply is true', () => {
    mockUseLiveQuery.mockReturnValue({ tags: [] });

    render(<PostMain postId="post-123" isReply={true} />);

    const connector = screen.getByTestId('thread-connector');
    expect(connector).toBeInTheDocument();
    expect(connector).toHaveAttribute('data-height', '150');
    expect(connector).toHaveAttribute('data-variant', 'regular');
  });
});

describe('PostMain - Snapshots', () => {
  it('matches snapshot with tags', () => {
    mockUseLiveQuery.mockReturnValue({ tags: [{ label: 'alpha' }, { label: 'beta' }, { label: 'gamma' }] });

    const { container } = render(<PostMain postId="post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without tags', () => {
    mockUseLiveQuery.mockReturnValue({ tags: [] });

    const { container } = render(<PostMain postId="post-789" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with isReply true', () => {
    mockUseLiveQuery.mockReturnValue({ tags: [{ label: 'alpha' }] });

    const { container } = render(<PostMain postId="post-reply-123" isReply={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with isReply false', () => {
    mockUseLiveQuery.mockReturnValue({ tags: [{ label: 'alpha' }] });

    const { container } = render(<PostMain postId="post-no-reply-456" isReply={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
