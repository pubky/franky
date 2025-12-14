import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostMain } from './PostMain';
import { POST_THREAD_CONNECTOR_VARIANTS } from '@/components/atoms/PostThreadConnector/PostThreadConnector.constants';

// Use vi.hoisted to define mock functions before vi.mock calls (which are hoisted)
const { mockIsPostDeleted } = vi.hoisted(() => ({
  mockIsPostDeleted: vi.fn(() => false),
}));

// Use real libs, only stub cn for deterministic class joining and isPostDeleted for control
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
    isPostDeleted: mockIsPostDeleted,
  };
});

// Minimal atoms used by PostMain
vi.mock('@/atoms', async () => {
  const { POST_THREAD_CONNECTOR_VARIANTS } =
    await import('@/components/atoms/PostThreadConnector/PostThreadConnector.constants');
  return {
    Container: (
      props: React.PropsWithChildren<{
        className?: string;
        onClick?: () => void;
        overrideDefaults?: boolean;
        [key: string]: unknown;
      }>,
    ) => {
      const { children, className, onClick, overrideDefaults, ...rest } = props;
      return (
        <div
          data-testid="container"
          data-class-name={className}
          data-override-defaults={overrideDefaults}
          onClick={onClick}
          {...rest}
        >
          {children}
        </div>
      );
    },
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
    POST_THREAD_CONNECTOR_VARIANTS,
  };
});

// Stub organisms composed inside PostMain
vi.mock('@/organisms', () => ({
  PostHeader: ({ postId }: { postId: string }) => <div data-testid="post-header">PostHeader {postId}</div>,
  PostContent: ({ postId }: { postId: string }) => <div data-testid="post-content">PostContent {postId}</div>,
  PostActionsBar: ({
    postId,
    className,
    onReplyClick,
  }: {
    postId: string;
    className?: string;
    onReplyClick?: () => void;
  }) => (
    <div data-testid="post-actions" data-class-name={className}>
      Actions {postId}
      {onReplyClick && <button onClick={onReplyClick}>Reply</button>}
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
  ClickableTagsList: ({ taggedId }: { taggedId: string }) => (
    <div data-testid="clickable-tags-list">ClickableTagsList {taggedId}</div>
  ),
}));

// Stub molecules used by PostMain
vi.mock('@/molecules', () => ({
  PostDeleted: () => <div data-testid="post-deleted">PostDeleted</div>,
}));

// Mock hooks
vi.mock('@/hooks', () => ({
  useElementHeight: vi.fn(() => ({
    ref: vi.fn(),
    height: 150,
  })),
  usePostDetails: vi.fn(() => ({
    postDetails: { content: 'Some post content' },
  })),
}));

describe('PostMain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPostDeleted.mockReturnValue(false);
  });

  it('renders header, content, tags and actions', () => {
    render(<PostMain postId="post-123" />);

    expect(screen.getByTestId('post-header')).toHaveTextContent('PostHeader post-123');
    expect(screen.getByTestId('post-content')).toHaveTextContent('PostContent post-123');
    expect(screen.getByTestId('clickable-tags-list')).toHaveTextContent('ClickableTagsList post-123');
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
    expect(connector).toHaveAttribute('data-variant', POST_THREAD_CONNECTOR_VARIANTS.REGULAR);
  });

  it('renders PostDeleted when post is deleted', () => {
    mockIsPostDeleted.mockReturnValue(true);

    render(<PostMain postId="post-deleted" />);

    expect(screen.getByTestId('post-deleted')).toBeInTheDocument();
    expect(screen.queryByTestId('post-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('post-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('clickable-tags-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('post-actions')).not.toBeInTheDocument();
  });

  it('renders normal content when post is not deleted', () => {
    mockIsPostDeleted.mockReturnValue(false);

    render(<PostMain postId="post-normal" />);

    expect(screen.queryByTestId('post-deleted')).not.toBeInTheDocument();
    expect(screen.getByTestId('post-header')).toBeInTheDocument();
    expect(screen.getByTestId('post-content')).toBeInTheDocument();
    expect(screen.getByTestId('clickable-tags-list')).toBeInTheDocument();
    expect(screen.getByTestId('post-actions')).toBeInTheDocument();
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

  it('matches snapshot with deleted post', () => {
    mockIsPostDeleted.mockReturnValue(true);
    const { container } = render(<PostMain postId="post-deleted-123" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
