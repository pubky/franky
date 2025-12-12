import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostPreviewCard } from './PostPreviewCard';
import * as Hooks from '@/hooks';

// Mock organisms
vi.mock('@/organisms', () => ({
  PostHeader: vi.fn(({ postId }: { postId: string }) => (
    <div data-testid="post-header" data-post-id={postId}>
      PostHeader {postId}
    </div>
  )),
  PostContent: vi.fn(({ postId, isRepostPreview }: { postId: string; isRepostPreview?: boolean }) => (
    <div data-testid="post-content" data-post-id={postId} data-is-repost-preview={isRepostPreview}>
      PostContent {postId} {isRepostPreview ? 'preview' : ''}
    </div>
  )),
}));

vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    RepostHeader: vi.fn(({ isUndoing }: { isUndoing?: boolean }) => (
      <div data-testid="repost-header" data-is-undoing={isUndoing}>
        RepostHeader
      </div>
    )),
  };
});

// Mock atoms
vi.mock('@/atoms', () => ({
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

// Mock libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  };
});

vi.mock('@/hooks', () => ({
  useRepostInfo: vi.fn(),
  useDeletePost: vi.fn(),
}));

const mockUseRepostInfo = vi.mocked(Hooks.useRepostInfo);
const mockUseDeletePost = vi.mocked(Hooks.useDeletePost);

describe('PostPreviewCard', () => {
  it('renders with required props', () => {
    mockUseRepostInfo.mockReturnValue({
      isRepost: false,
      repostAuthorId: null,
      isCurrentUserRepost: false,
      originalPostId: null,
      isLoading: false,
    });
    mockUseDeletePost.mockReturnValue({
      deletePost: vi.fn(),
      isDeleting: false,
    });
    render(<PostPreviewCard postId="test-post-123" />);

    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByTestId('post-header')).toBeInTheDocument();
    expect(screen.getByTestId('post-content')).toBeInTheDocument();
  });

  it('applies CardContent classes', () => {
    mockUseRepostInfo.mockReturnValue({
      isRepost: false,
      repostAuthorId: null,
      isCurrentUserRepost: false,
      originalPostId: null,
      isLoading: false,
    });
    mockUseDeletePost.mockReturnValue({
      deletePost: vi.fn(),
      isDeleting: false,
    });
    render(<PostPreviewCard postId="test-post-123" />);
    const cardContent = screen.getByTestId('card-content');

    expect(cardContent).toHaveClass('flex flex-col gap-4 p-6');
  });

  it('renders children when provided', () => {
    mockUseRepostInfo.mockReturnValue({
      isRepost: false,
      repostAuthorId: null,
      isCurrentUserRepost: false,
      originalPostId: null,
      isLoading: false,
    });
    mockUseDeletePost.mockReturnValue({
      deletePost: vi.fn(),
      isDeleting: false,
    });
    render(
      <PostPreviewCard postId="test-post-123">
        <div data-testid="footer">Footer content</div>
      </PostPreviewCard>,
    );

    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toHaveTextContent('Footer content');
  });

  it('does not render children when not provided', () => {
    mockUseRepostInfo.mockReturnValue({
      isRepost: false,
      repostAuthorId: null,
      isCurrentUserRepost: false,
      originalPostId: null,
      isLoading: false,
    });
    mockUseDeletePost.mockReturnValue({
      deletePost: vi.fn(),
      isDeleting: false,
    });
    render(<PostPreviewCard postId="test-post-123" />);

    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });
});

describe('PostPreviewCard - Snapshots', () => {
  it('matches snapshot with default props', () => {
    mockUseRepostInfo.mockReturnValue({
      isRepost: false,
      repostAuthorId: null,
      isCurrentUserRepost: false,
      originalPostId: null,
      isLoading: false,
    });
    mockUseDeletePost.mockReturnValue({
      deletePost: vi.fn(),
      isDeleting: false,
    });
    const { container } = render(<PostPreviewCard postId="snapshot-post-id" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with children', () => {
    mockUseRepostInfo.mockReturnValue({
      isRepost: false,
      repostAuthorId: null,
      isCurrentUserRepost: false,
      originalPostId: null,
      isLoading: false,
    });
    mockUseDeletePost.mockReturnValue({
      deletePost: vi.fn(),
      isDeleting: false,
    });
    const { container } = render(
      <PostPreviewCard postId="snapshot-post-id">
        <div>Footer content</div>
      </PostPreviewCard>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders repost header when post is a repost', () => {
    const deletePost = vi.fn();
    mockUseRepostInfo.mockReturnValue({
      isRepost: true,
      repostAuthorId: 'current-user',
      isCurrentUserRepost: true,
      originalPostId: 'original:post',
      isLoading: false,
    });
    mockUseDeletePost.mockReturnValue({
      deletePost,
      isDeleting: false,
    });

    render(<PostPreviewCard postId="repost-1" />);

    expect(screen.getByTestId('repost-header')).toBeInTheDocument();
    expect(screen.getByTestId('post-content')).toHaveAttribute('data-is-repost-preview', 'false');
  });

  it('does not render repost header when reposted by someone else', () => {
    mockUseRepostInfo.mockReturnValue({
      isRepost: true,
      repostAuthorId: 'other-user',
      isCurrentUserRepost: false,
      originalPostId: 'original:post',
      isLoading: false,
    });
    mockUseDeletePost.mockReturnValue({
      deletePost: vi.fn(),
      isDeleting: false,
    });

    render(<PostPreviewCard postId="repost-2" />);

    expect(screen.queryByTestId('repost-header')).not.toBeInTheDocument();
  });
});
