import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostContent } from './PostContent';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';

// Mock hooks used by PostContent
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    usePostDetails: vi.fn(),
    useRepostInfo: vi.fn(),
    useDeletePost: vi.fn(),
  };
});

// Mock core model used by PostContent
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    PostController: {
      getPostDetails: vi.fn().mockResolvedValue({ content: 'Mock content' }),
    },
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
  Typography: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span data-testid="typography" className={className}>
      {children}
    </span>
  ),
  Button: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button data-testid="button" onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  PostHeader: vi.fn(() => null),
}));

// Mock molecules - PostText, PostLinkEmbeds
vi.mock('@/molecules', () => ({
  // Return null for easier call assertions
  PostText: vi.fn(() => null),
  PostLinkEmbeds: vi.fn(() => null),
  PostPreviewCard: vi.fn(() => <div data-testid="post-preview-card" />),
  RepostHeader: vi.fn(({ children }: { children?: React.ReactNode }) => (
    <div data-testid="repost-header">{children}</div>
  )),
}));

const mockUsePostDetails = vi.mocked(Hooks.usePostDetails);
const mockUseRepostInfo = vi.mocked(Hooks.useRepostInfo);
const mockUseDeletePost = vi.mocked(Hooks.useDeletePost);
const mockPostText = vi.mocked(Molecules.PostText);
const mockPostLinkEmbeds = vi.mocked(Molecules.PostLinkEmbeds);

describe('PostContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    mockUsePostDetails.mockReturnValue({
      postDetails: { content: 'Mock content' },
      isLoading: false,
    });
    mockUseRepostInfo.mockReturnValue({
      isRepost: false,
      originalPostId: null,
      isCurrentUserRepost: false,
    });
    mockUseDeletePost.mockReturnValue({
      deletePost: vi.fn(),
      isDeleting: false,
    });
  });

  it('renders content when postDetails are available', () => {
    const mockPostDetails = { content: 'Feed post content' };
    mockUsePostDetails.mockReturnValue({
      postDetails: mockPostDetails,
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

  it('calls usePostDetails with correct id', () => {
    const mockPostDetails = { content: 'Hello' };
    mockUsePostDetails.mockReturnValue({
      postDetails: mockPostDetails,
      isLoading: false,
    });

    render(<PostContent postId="post-abc" />);

    // Verify that usePostDetails was called with the correct postId
    expect(mockUsePostDetails).toHaveBeenCalledWith('post-abc');
  });

  it('calls PostText with correct content prop', () => {
    const mockPostDetails = { content: 'Test post content' };
    mockUsePostDetails.mockReturnValue({
      postDetails: mockPostDetails,
      isLoading: false,
    });

    render(<PostContent postId="post-123" />);

    expect(mockPostText).toHaveBeenCalledWith({ content: 'Test post content' }, undefined);
  });

  it('calls PostLinkEmbeds with correct content prop', () => {
    const mockPostDetails = { content: 'Test post content' };
    mockUsePostDetails.mockReturnValue({
      postDetails: mockPostDetails,
      isLoading: false,
    });

    render(<PostContent postId="post-123" />);

    expect(mockPostLinkEmbeds).toHaveBeenCalledWith({ content: 'Test post content' }, undefined);
  });

  it('renders repost preview when reposted by current user', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: { content: '' },
      isLoading: false,
    });
    mockUseRepostInfo.mockReturnValue({
      isRepost: true,
      originalPostId: 'orig-post',
      isCurrentUserRepost: true,
    });
    mockUseDeletePost.mockReturnValue({
      deletePost: vi.fn(),
      isDeleting: false,
    });

    render(<PostContent postId="repost-1" />);

    expect(screen.getByTestId('post-preview-card')).toBeInTheDocument();
  });

  it('updates query when postId changes', () => {
    const mockPostDetails1 = { content: 'First post' };
    const mockPostDetails2 = { content: 'Second post' };
    mockUsePostDetails.mockReturnValue({
      postDetails: mockPostDetails1,
      isLoading: false,
    });

    const { rerender } = render(<PostContent postId="post-1" />);

    expect(mockUsePostDetails).toHaveBeenCalledWith('post-1');

    mockUsePostDetails.mockReturnValue({
      postDetails: mockPostDetails2,
      isLoading: false,
    });
    rerender(<PostContent postId="post-2" />);

    expect(mockUsePostDetails).toHaveBeenCalledWith('post-2');
  });
});

describe('PostContent - Snapshots', () => {
  // Use real PostText and PostLinkEmbeds for snapshot tests
  beforeEach(async () => {
    vi.clearAllMocks();
    const actual = await vi.importActual<typeof import('@/molecules')>('@/molecules');
    // Replace the mock implementations with real ones for snapshots
    vi.mocked(Molecules.PostText).mockImplementation(actual.PostText);
    vi.mocked(Molecules.PostLinkEmbeds).mockImplementation(actual.PostLinkEmbeds);

    // Set up default hook mocks
    mockUsePostDetails.mockReturnValue({
      postDetails: { content: 'Mock content' },
      isLoading: false,
    });
    mockUseRepostInfo.mockReturnValue({
      isRepost: false,
      originalPostId: null,
    });
  }, 30000); // Increase timeout to 30 seconds

  it('matches snapshot with single-line content', () => {
    const mockPostDetails = { content: 'One liner' };
    mockUsePostDetails.mockReturnValue({
      postDetails: mockPostDetails,
      isLoading: false,
    });

    const { container } = render(<PostContent postId="post-1" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with multiline content (preserves newlines)', () => {
    const mockPostDetails = { content: 'Line 1\nLine 2\n\nLine 3' };
    mockUsePostDetails.mockReturnValue({
      postDetails: mockPostDetails,
      isLoading: false,
    });

    const { container } = render(<PostContent postId="post-2" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty content', () => {
    const mockPostDetails = { content: '' };
    mockUsePostDetails.mockReturnValue({
      postDetails: mockPostDetails,
      isLoading: false,
    });

    const { container } = render(<PostContent postId="post-3" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with loading state', () => {
    mockUsePostDetails.mockReturnValue({
      postDetails: null,
      isLoading: true,
    });

    const { container } = render(<PostContent postId="post-loading" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with very long content', () => {
    const longContent = 'A'.repeat(1000) + ' ' + 'B'.repeat(1000);
    const mockPostDetails = { content: longContent };
    mockUsePostDetails.mockReturnValue({
      postDetails: mockPostDetails,
      isLoading: false,
    });

    const { container } = render(<PostContent postId="post-5" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with special characters in content', () => {
    const mockPostDetails = { content: 'Content with <tags> & "quotes" & \'apostrophes\'' };
    mockUsePostDetails.mockReturnValue({
      postDetails: mockPostDetails,
      isLoading: false,
    });

    const { container } = render(<PostContent postId="post-6" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
