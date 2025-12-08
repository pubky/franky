import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostContent } from './PostContent';
import * as Molecules from '@/molecules';

// Mock hooks used by PostContent
const mockUsePostDetails = vi.fn();
const mockUseRepostInfo = vi.fn();
const mockUseFetchPost = vi.fn();

vi.mock('@/hooks', async () => {
  const actual = await vi.importActual('@/hooks');
  return {
    ...actual,
    usePostDetails: (postId: string | null) => mockUsePostDetails(postId),
    useRepostInfo: (postId: string) => mockUseRepostInfo(postId),
    useFetchPost: () => mockUseFetchPost(),
  };
});

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

// Mock molecules - PostText, PostLinkEmbeds
vi.mock('@/molecules', () => ({
  PostText: vi.fn(({ content }: { content: string }) => <div data-testid="post-text">{content}</div>),
  PostLinkEmbeds: vi.fn(() => null),
}));

// Mock organisms - PostHeader, PostContent (for repost preview)
vi.mock('@/organisms', () => ({
  PostHeader: vi.fn(({ postId }: { postId: string }) => <div data-testid="post-header">PostHeader {postId}</div>),
  PostContent: vi.fn(({ postId }: { postId: string }) => <div data-testid="post-content">PostContent {postId}</div>),
}));

// Mock libs
vi.mock('@/libs', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

const mockPostText = vi.mocked(Molecules.PostText);

describe('PostContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    mockUsePostDetails.mockReturnValue({
      postDetails: { content: 'Mock content' },
      isLoading: false,
    });
    mockUseRepostInfo.mockReturnValue({
      isRepost: false,
      repostAuthorId: null,
      isCurrentUserRepost: false,
      originalPostId: null,
      isLoading: false,
    });
    mockUseFetchPost.mockReturnValue({
      fetchPost: vi.fn(),
      isFetching: false,
    });
  });

  it('renders content when postDetails are available', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: { content: 'Feed post content' },
      isLoading: false,
    });

    render(<PostContent postId="post-123" />);

    expect(screen.getByTestId('container')).toBeInTheDocument();
  });

  it('shows loading when postDetails are not yet available', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: null,
      isLoading: true,
    });

    const { container } = render(<PostContent postId="post-123" />);

    expect(container.firstChild).toHaveTextContent('Loading content...');
  });

  it('calls usePostDetails with correct postId', () => {
    render(<PostContent postId="post-abc" />);

    expect(mockUsePostDetails).toHaveBeenCalledWith('post-abc');
  });

  it('calls PostText with correct content prop', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: { content: 'Test post content' },
      isLoading: false,
    });

    render(<PostContent postId="post-123" />);

    expect(mockPostText).toHaveBeenCalled();
    expect(mockPostText.mock.calls[0][0]).toEqual({ content: 'Test post content' });
  });

  it('renders repost preview when isRepost is true', () => {
    mockUsePostDetails
      .mockReturnValueOnce({
        postDetails: { content: 'Repost comment' },
        isLoading: false,
      })
      .mockReturnValueOnce({
        postDetails: { content: 'Original post content' },
        isLoading: false,
      });
    mockUseRepostInfo.mockReturnValue({
      isRepost: true,
      repostAuthorId: 'reposter-id',
      isCurrentUserRepost: false,
      originalPostId: 'original-author:original-post',
      isLoading: false,
    });

    render(<PostContent postId="reposter-id:repost-post" />);

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('post-header')).toHaveTextContent('PostHeader original-author:original-post');
  });

  it('does not render repost preview when isRepost is false', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: { content: 'Regular post' },
      isLoading: false,
    });
    mockUseRepostInfo.mockReturnValue({
      isRepost: false,
      repostAuthorId: null,
      isCurrentUserRepost: false,
      originalPostId: null,
      isLoading: false,
    });

    render(<PostContent postId="post-123" />);

    expect(screen.queryByTestId('card')).not.toBeInTheDocument();
  });

  it('does not render repost preview when originalPostId is null', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: { content: 'Repost without original' },
      isLoading: false,
    });
    mockUseRepostInfo.mockReturnValue({
      isRepost: true,
      repostAuthorId: 'reposter-id',
      isCurrentUserRepost: false,
      originalPostId: null,
      isLoading: false,
    });

    render(<PostContent postId="reposter-id:repost-post" />);

    expect(screen.queryByTestId('card')).not.toBeInTheDocument();
  });

  it('does not render repost comment when content is empty', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: { content: '' },
      isLoading: false,
    });
    mockUseRepostInfo.mockReturnValue({
      isRepost: true,
      repostAuthorId: 'reposter-id',
      isCurrentUserRepost: false,
      originalPostId: 'original-author:original-post',
      isLoading: false,
    });

    render(<PostContent postId="reposter-id:repost-post" />);

    expect(mockPostText).not.toHaveBeenCalled();
  });

  it('renders repost comment when content is not empty', () => {
    mockUsePostDetails
      .mockReturnValueOnce({
        postDetails: { content: 'My comment on this repost' },
        isLoading: false,
      })
      .mockReturnValueOnce({
        postDetails: { content: 'Original content' },
        isLoading: false,
      });
    mockUseRepostInfo.mockReturnValue({
      isRepost: true,
      repostAuthorId: 'reposter-id',
      isCurrentUserRepost: false,
      originalPostId: 'original-author:original-post',
      isLoading: false,
    });

    render(<PostContent postId="reposter-id:repost-post" />);

    expect(mockPostText).toHaveBeenCalled();
    expect(mockPostText.mock.calls[0][0]).toEqual({ content: 'My comment on this repost' });
  });

  it('calls useRepostInfo with correct postId', () => {
    render(<PostContent postId="post-xyz" />);

    expect(mockUseRepostInfo).toHaveBeenCalledWith('post-xyz');
  });

  it('calls usePostDetails twice when repost has originalPostId', () => {
    mockUsePostDetails
      .mockReturnValueOnce({
        postDetails: { content: 'Repost comment' },
        isLoading: false,
      })
      .mockReturnValueOnce({
        postDetails: { content: 'Original content' },
        isLoading: false,
      });
    mockUseRepostInfo.mockReturnValue({
      isRepost: true,
      repostAuthorId: 'reposter-id',
      isCurrentUserRepost: false,
      originalPostId: 'original-author:original-post',
      isLoading: false,
    });

    render(<PostContent postId="reposter-id:repost-post" />);

    expect(mockUsePostDetails).toHaveBeenCalledWith('reposter-id:repost-post');
    expect(mockUsePostDetails).toHaveBeenCalledWith('original-author:original-post');
  });
});

describe('PostContent - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot with single-line content', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: { content: 'Single line post' },
      isLoading: false,
    });
    mockUseRepostInfo.mockReturnValue({
      isRepost: false,
      repostAuthorId: null,
      isCurrentUserRepost: false,
      originalPostId: null,
      isLoading: false,
    });
    mockUseFetchPost.mockReturnValue({
      fetchPost: vi.fn(),
      isFetching: false,
    });

    const { container } = render(<PostContent postId="post-123" />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with multiline content (preserves newlines)', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: { content: 'Line 1\nLine 2\nLine 3' },
      isLoading: false,
    });
    mockUseRepostInfo.mockReturnValue({
      isRepost: false,
      repostAuthorId: null,
      isCurrentUserRepost: false,
      originalPostId: null,
      isLoading: false,
    });
    mockUseFetchPost.mockReturnValue({
      fetchPost: vi.fn(),
      isFetching: false,
    });

    const { container } = render(<PostContent postId="post-123" />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with repost', () => {
    mockUsePostDetails
      .mockReturnValueOnce({
        postDetails: { content: 'Repost comment' },
        isLoading: false,
      })
      .mockReturnValueOnce({
        postDetails: { content: 'Original post' },
        isLoading: false,
      });
    mockUseRepostInfo.mockReturnValue({
      isRepost: true,
      repostAuthorId: 'reposter-id',
      isCurrentUserRepost: false,
      originalPostId: 'original-author:original-post',
      isLoading: false,
    });
    mockUseFetchPost.mockReturnValue({
      fetchPost: vi.fn(),
      isFetching: false,
    });

    const { container } = render(<PostContent postId="reposter-id:repost-post" />);

    expect(container.firstChild).toMatchSnapshot();
  });
});
