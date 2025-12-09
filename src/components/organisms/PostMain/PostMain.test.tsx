import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Hooks from '@/hooks';
import { PostMain } from './PostMain';

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
    overrideDefaults,
    ...props
  }: React.PropsWithChildren<{
    className?: string;
    onClick?: () => void;
    overrideDefaults?: boolean;
    [key: string]: unknown;
  }>) => (
    <div
      data-testid="container"
      data-class-name={className}
      data-override-defaults={overrideDefaults}
      onClick={onClick}
      {...props}
    >
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
  Typography: ({ children, as, className }: { children: React.ReactNode; as?: string; className?: string }) => {
    const Tag = (as || 'p') as keyof JSX.IntrinsicElements;
    return (
      <Tag data-testid="typography" data-as={as} className={className}>
        {children}
      </Tag>
    );
  },
}));

// Stub organisms composed inside PostMain
vi.mock('@/organisms', () => ({
  PostHeader: ({ postId }: { postId: string }) => <div data-testid="post-header">PostHeader {postId}</div>,
  PostContent: ({ postId }: { postId: string }) => <div data-testid="post-content">PostContent {postId}</div>,
  PostActionsBar: ({
    postId,
    className,
    onReplyClick,
    onRepostClick,
  }: {
    postId: string;
    className?: string;
    onReplyClick?: () => void;
    onRepostClick?: () => void;
  }) => (
    <div data-testid="post-actions" data-class-name={className}>
      Actions {postId}
      {onReplyClick && <button onClick={onReplyClick}>Reply</button>}
      {onRepostClick && <button onClick={onRepostClick}>Repost</button>}
    </div>
  ),
  DialogReply: ({
    postId,
    open,
    onOpenChangeAction,
  }: {
    postId: string;
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
  }) => (
    <div data-testid="dialog-reply" data-post-id={postId} data-open={open} onClick={() => onOpenChangeAction(false)}>
      DialogReply
    </div>
  ),
  DialogRepost: ({
    postId,
    open,
    onOpenChangeAction,
  }: {
    postId: string;
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
  }) => (
    <div data-testid="dialog-repost" data-post-id={postId} data-open={open} onClick={() => onOpenChangeAction(false)}>
      DialogRepost
    </div>
  ),
}));

// Stub molecules used by PostMain
vi.mock('@/molecules', () => ({
  PostTagsList: ({ postId }: { postId: string }) => <div data-testid="post-tags-list">PostTagsList {postId}</div>,
  ReposterAvatar: ({ reposterId, index }: { reposterId: string; index: number }) => (
    <div data-testid="reposter-avatar" data-reposter-id={reposterId} data-index={index}>
      ReposterAvatar {reposterId}
    </div>
  ),
  PostPreviewCard: vi.fn(({ postId, children }) => (
    <div data-testid="post-preview-card" data-post-id={postId}>
      <div data-testid="post-preview-card-header">PostHeader {postId}</div>
      <div data-testid="post-preview-card-content">PostContent {postId}</div>
      {children}
    </div>
  )),
}));

// Mock useLiveQuery from dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

// Mock useElementHeight hook and other hooks
vi.mock('@/hooks', () => ({
  useElementHeight: vi.fn(() => ({
    ref: vi.fn(),
    height: 150,
  })),
  useCurrentUserProfile: vi.fn(() => ({
    currentUserPubky: 'test-user-id',
    userDetails: { name: 'Test User' },
  })),
  useUserDetails: vi.fn(() => ({
    userDetails: { name: 'Test User' },
    isLoading: false,
  })),
  useRepostInfo: vi.fn(() => ({
    isRepost: false,
    repostAuthorId: null,
    isCurrentUserRepost: false,
    originalPostId: null,
    isLoading: false,
  })),
  usePostDetails: vi.fn(() => ({
    postDetails: null,
    isLoading: false,
  })),
  useAvatarUrl: vi.fn(() => undefined),
  useDeletePost: vi.fn(() => ({
    deletePost: vi.fn(),
    isDeleting: false,
  })),
  useRepostText: vi.fn(() => ({
    repostText: 'You reposted',
    isLoading: false,
  })),
}));

const mockUseRepostInfo = vi.mocked(Hooks.useRepostInfo);
const mockUseLiveQuery = vi.mocked(useLiveQuery);
const mockUseRepostText = vi.mocked(Hooks.useRepostText);

describe('PostMain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: not a repost
    mockUseRepostInfo.mockReturnValue({
      isRepost: false,
      repostAuthorId: null,
      isCurrentUserRepost: false,
      originalPostId: null,
      isLoading: false,
    });
    mockUseLiveQuery.mockReturnValue({ reposted: null });
    mockUseRepostText.mockReturnValue({
      repostText: 'You reposted',
      isLoading: false,
    });
  });

  it('renders header, content, tags and actions', () => {
    render(<PostMain postId="post-123" />);

    expect(screen.getByTestId('post-preview-card-header')).toHaveTextContent('PostHeader post-123');
    expect(screen.getByTestId('post-preview-card-content')).toHaveTextContent('PostContent post-123');
    expect(screen.getByTestId('post-tags-list')).toHaveTextContent('PostTagsList post-123');
    expect(screen.getByTestId('post-actions')).toBeInTheDocument();
  });

  it('invokes onClick handler when clickable area is clicked', () => {
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
    render(<PostMain postId="post-123" isReply={false} />);

    expect(screen.queryByTestId('thread-connector')).not.toBeInTheDocument();
  });

  it('renders thread connector when isReply is true', () => {
    render(<PostMain postId="post-123" isReply={true} />);

    const connector = screen.getByTestId('thread-connector');
    expect(connector).toBeInTheDocument();
    expect(connector).toHaveAttribute('data-height', '150');
    expect(connector).toHaveAttribute('data-variant', 'regular');
  });
});

describe('PostMain - Snapshots', () => {
  it('matches snapshot with tags', () => {
    const { container } = render(<PostMain postId="post-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without tags', () => {
    const { container } = render(<PostMain postId="post-789" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with isReply true', () => {
    const { container } = render(<PostMain postId="post-reply-123" isReply={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with isReply false', () => {
    const { container } = render(<PostMain postId="post-no-reply-456" isReply={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
