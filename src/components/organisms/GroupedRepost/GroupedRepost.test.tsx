import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroupedRepost } from './GroupedRepost';
import type { GroupedRepostEntry } from '@/hooks/useGroupedPosts';

// Use real libs, only stub cn for deterministic class joining
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  };
});

// Mock atoms
vi.mock('@/atoms', () => ({
  Card: ({
    children,
    className,
    ...props
  }: React.PropsWithChildren<{ className?: string; [key: string]: unknown }>) => (
    <div data-testid="card" data-class-name={className} {...props}>
      {children}
    </div>
  ),
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
  Typography: ({ children, as, className }: { children: React.ReactNode; as?: string; className?: string }) => {
    const Tag = (as || 'p') as keyof JSX.IntrinsicElements;
    return (
      <Tag data-testid="typography" data-as={as} className={className}>
        {children}
      </Tag>
    );
  },
  Button: ({
    children,
    onClick,
    disabled,
    className,
    'aria-label': ariaLabel,
    ...props
  }: React.PropsWithChildren<{
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    'aria-label'?: string;
    [key: string]: unknown;
  }>) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  ReposterAvatar: ({ reposterId, index }: { reposterId: string; index: number }) => (
    <div data-testid="reposter-avatar" data-reposter-id={reposterId} data-index={index}>
      ReposterAvatar {reposterId}
    </div>
  ),
  PostPreviewCard: ({ postId, ...props }: { postId: string; [key: string]: unknown }) => (
    <div data-testid="post-preview-card" data-post-id={postId} {...props}>
      PostPreviewCard {postId}
    </div>
  ),
}));

// Mock hooks
const mockUseCurrentUserProfile = vi.fn();
const mockUsePostDetails = vi.fn();
const mockUseFetchPost = vi.fn();
const mockUseUserDetails = vi.fn();
const mockUseDeletePost = vi.fn();
const mockCalculateReposterDisplay = vi.fn();
const mockRenderReposterText = vi.fn();

vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useCurrentUserProfile: () => mockUseCurrentUserProfile(),
    usePostDetails: (postId: string | null) => mockUsePostDetails(postId),
    useFetchPost: () => mockUseFetchPost(),
    useUserDetails: (userId: string | null) => mockUseUserDetails(userId),
    useDeletePost: (postId: string) => mockUseDeletePost(postId),
    calculateReposterDisplay: (params: unknown) => mockCalculateReposterDisplay(params),
    renderReposterText: (params: unknown) => mockRenderReposterText(params),
  };
});

// Mock Repeat icon from libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    Repeat: ({ className, 'aria-label': ariaLabel }: { className?: string; 'aria-label'?: string }) => (
      <svg data-testid="repeat-icon" className={className} aria-label={ariaLabel}>
        <title>Repeat</title>
      </svg>
    ),
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  };
});

const mockFetchPost = vi.fn();
const mockDeletePost = vi.fn();

describe('GroupedRepost', () => {
  const createMockEntry = (overrides?: Partial<GroupedRepostEntry>): GroupedRepostEntry => ({
    type: 'group',
    groupId: 'grouped-uri-123',
    originalUri: 'pubky://user1/pub/pubky.app/posts/post-123',
    originalPostId: 'user1:post-123',
    postIds: ['user2:repost-1', 'user3:repost-2'],
    representativePostId: 'user2:repost-1',
    reposterIds: ['user2', 'user3'],
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseCurrentUserProfile.mockReturnValue({
      currentUserPubky: 'current-user',
    });

    mockUsePostDetails.mockReturnValue({
      postDetails: null,
      isLoading: false,
    });

    mockUseFetchPost.mockReturnValue({
      fetchPost: mockFetchPost,
    });

    mockUseUserDetails.mockReturnValue({
      userDetails: { name: 'First Reposter', id: 'user2' },
      isLoading: false,
    });

    mockUseDeletePost.mockReturnValue({
      deletePost: mockDeletePost,
      isDeleting: false,
    });

    mockCalculateReposterDisplay.mockReturnValue({
      avatarReposterIds: ['user2', 'user3'],
      avatarOverflowCount: 0,
      firstReposterId: 'user2',
      isCurrentUserReposted: false,
      othersCount: 2,
      totalReposters: 2,
      undoTargets: [],
    });

    mockRenderReposterText.mockReturnValue({
      mobileText: 'First Reposter, others reposted',
      desktopText: 'First Reposter and 1 other reposted this',
    });
  });

  it('renders grouped repost with header and preview', () => {
    const entry = createMockEntry();
    render(<GroupedRepost entry={entry} />);

    expect(screen.getByTestId('grouped-repost')).toBeInTheDocument();
    expect(screen.getByTestId('grouped-repost-header')).toBeInTheDocument();
    expect(screen.getByTestId('grouped-repost-preview')).toBeInTheDocument();
  });

  it('displays reposter text for mobile and desktop', () => {
    const entry = createMockEntry();
    render(<GroupedRepost entry={entry} />);

    const mobileText = screen.getByText('First Reposter, others reposted');
    const desktopText = screen.getByText('First Reposter and 1 other reposted this');

    expect(mobileText).toHaveAttribute('data-as', 'span');
    expect(desktopText).toHaveAttribute('data-as', 'span');
  });

  it('renders repeat icon', () => {
    const entry = createMockEntry();
    render(<GroupedRepost entry={entry} />);

    expect(screen.getByTestId('repeat-icon')).toBeInTheDocument();
    expect(screen.getByTestId('repeat-icon')).toHaveAttribute('aria-label', 'Repeat');
  });

  it('renders reposter avatars when available', () => {
    const entry = createMockEntry();
    mockCalculateReposterDisplay.mockReturnValue({
      avatarReposterIds: ['user2', 'user3'],
      avatarOverflowCount: 0,
      firstReposterId: 'user2',
      isCurrentUserReposted: false,
      othersCount: 2,
      totalReposters: 2,
      undoTargets: [],
    });

    render(<GroupedRepost entry={entry} />);

    const avatars = screen.getAllByTestId('reposter-avatar');
    expect(avatars).toHaveLength(2);
    expect(avatars[0]).toHaveAttribute('data-reposter-id', 'user2');
    expect(avatars[1]).toHaveAttribute('data-reposter-id', 'user3');
  });

  it('renders avatar overflow count when more than 5 reposters', () => {
    const entry = createMockEntry({ reposterIds: ['user2', 'user3', 'user4', 'user5', 'user6', 'user7'] });
    mockCalculateReposterDisplay.mockReturnValue({
      avatarReposterIds: ['user2', 'user3', 'user4', 'user5', 'user6'],
      avatarOverflowCount: 1,
      firstReposterId: 'user2',
      isCurrentUserReposted: false,
      othersCount: 6,
      totalReposters: 6,
      undoTargets: [],
    });

    render(<GroupedRepost entry={entry} />);

    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('shows undo button when current user reposted', () => {
    const entry = createMockEntry();
    mockCalculateReposterDisplay.mockReturnValue({
      avatarReposterIds: ['user2'],
      avatarOverflowCount: 0,
      firstReposterId: 'user2',
      isCurrentUserReposted: true,
      othersCount: 1,
      totalReposters: 2,
      undoTargets: ['current-user:repost-1'],
    });

    render(<GroupedRepost entry={entry} />);

    const undoButton = screen.getByTestId('grouped-repost-undo-button');
    expect(undoButton).toBeInTheDocument();
    expect(undoButton).toHaveTextContent('Undo repost');
    expect(undoButton).toHaveAttribute('aria-label', 'Undo repost');
  });

  it('hides undo button when current user did not repost', () => {
    const entry = createMockEntry();
    mockCalculateReposterDisplay.mockReturnValue({
      avatarReposterIds: ['user2', 'user3'],
      avatarOverflowCount: 0,
      firstReposterId: 'user2',
      isCurrentUserReposted: false,
      othersCount: 2,
      totalReposters: 2,
      undoTargets: [],
    });

    render(<GroupedRepost entry={entry} />);

    expect(screen.queryByTestId('grouped-repost-undo-button')).not.toBeInTheDocument();
  });

  it('calls deletePost for all undo targets when undo button is clicked', async () => {
    const entry = createMockEntry();
    mockCalculateReposterDisplay.mockReturnValue({
      avatarReposterIds: ['user2'],
      avatarOverflowCount: 0,
      firstReposterId: 'user2',
      isCurrentUserReposted: true,
      othersCount: 1,
      totalReposters: 2,
      undoTargets: ['current-user:repost-1', 'current-user:repost-2'],
    });

    mockDeletePost.mockResolvedValue(undefined);

    render(<GroupedRepost entry={entry} />);

    const undoButton = screen.getByTestId('grouped-repost-undo-button');
    fireEvent.click(undoButton);

    await waitFor(() => {
      expect(mockDeletePost).toHaveBeenCalledTimes(2);
      expect(mockDeletePost).toHaveBeenCalledWith('current-user:repost-1');
      expect(mockDeletePost).toHaveBeenCalledWith('current-user:repost-2');
    });
  });

  it('disables undo button while deleting', () => {
    const entry = createMockEntry();
    mockCalculateReposterDisplay.mockReturnValue({
      avatarReposterIds: ['user2'],
      avatarOverflowCount: 0,
      firstReposterId: 'user2',
      isCurrentUserReposted: true,
      othersCount: 1,
      totalReposters: 2,
      undoTargets: ['current-user:repost-1'],
    });

    mockUseDeletePost.mockReturnValue({
      deletePost: mockDeletePost,
      isDeleting: true,
    });

    render(<GroupedRepost entry={entry} />);

    const undoButton = screen.getByTestId('grouped-repost-undo-button');
    expect(undoButton).toBeDisabled();
    expect(undoButton).toHaveTextContent('Undoing...');
    expect(undoButton).toHaveAttribute('aria-label', 'Undoing repost...');
  });

  it('shows error message when originalPostId is null', () => {
    const entry = createMockEntry({ originalPostId: null });
    render(<GroupedRepost entry={entry} />);

    expect(screen.getByTestId('grouped-repost-error')).toBeInTheDocument();
    expect(screen.getByText('Unable to load original post')).toBeInTheDocument();
    expect(screen.queryByTestId('grouped-repost-preview')).not.toBeInTheDocument();
  });

  it('fetches post when originalPostId exists but postDetails is missing', () => {
    const entry = createMockEntry();
    mockUsePostDetails.mockReturnValue({
      postDetails: null,
      isLoading: false,
    });

    render(<GroupedRepost entry={entry} />);

    expect(mockFetchPost).toHaveBeenCalledWith('user1:post-123');
  });

  it('does not fetch post when postDetails already exists', () => {
    const entry = createMockEntry();
    mockUsePostDetails.mockReturnValue({
      postDetails: { id: 'user1:post-123', content: 'Original post' },
      isLoading: false,
    });

    render(<GroupedRepost entry={entry} />);

    expect(mockFetchPost).not.toHaveBeenCalled();
  });

  it('calls calculateReposterDisplay with correct parameters', () => {
    const entry = createMockEntry();
    render(<GroupedRepost entry={entry} />);

    expect(mockCalculateReposterDisplay).toHaveBeenCalledWith({
      reposterIds: ['user2', 'user3'],
      postIds: ['user2:repost-1', 'user3:repost-2'],
      currentUserPubky: 'current-user',
    });
  });

  it('calls renderReposterText with correct parameters', () => {
    const entry = createMockEntry();
    mockUseUserDetails.mockReturnValue({
      userDetails: { name: 'First Reposter', id: 'user2' },
      isLoading: false,
    });

    render(<GroupedRepost entry={entry} />);

    expect(mockRenderReposterText).toHaveBeenCalledWith({
      isCurrentUserReposted: false,
      firstReposterName: 'First Reposter',
      othersCount: 2,
      totalReposters: 2,
    });
  });

  it('uses firstReposterId as fallback when userDetails name is not available', () => {
    const entry = createMockEntry();
    mockUseUserDetails.mockReturnValue({
      userDetails: null,
      isLoading: false,
    });

    render(<GroupedRepost entry={entry} />);

    expect(mockRenderReposterText).toHaveBeenCalledWith({
      isCurrentUserReposted: false,
      firstReposterName: 'user2',
      othersCount: 2,
      totalReposters: 2,
    });
  });
});

describe('GroupedRepost - Snapshots', () => {
  const createMockEntry = (overrides?: Partial<GroupedRepostEntry>): GroupedRepostEntry => ({
    type: 'group',
    groupId: 'grouped-uri-123',
    originalUri: 'pubky://user1/pub/pubky.app/posts/post-123',
    originalPostId: 'user1:post-123',
    postIds: ['user2:repost-1', 'user3:repost-2'],
    representativePostId: 'user2:repost-1',
    reposterIds: ['user2', 'user3'],
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseCurrentUserProfile.mockReturnValue({
      currentUserPubky: 'current-user',
    });

    mockUsePostDetails.mockReturnValue({
      postDetails: null,
      isLoading: false,
    });

    mockUseFetchPost.mockReturnValue({
      fetchPost: mockFetchPost,
    });

    mockUseUserDetails.mockReturnValue({
      userDetails: { name: 'First Reposter', id: 'user2' },
      isLoading: false,
    });

    mockUseDeletePost.mockReturnValue({
      deletePost: mockDeletePost,
      isDeleting: false,
    });

    mockCalculateReposterDisplay.mockReturnValue({
      avatarReposterIds: ['user2', 'user3'],
      avatarOverflowCount: 0,
      firstReposterId: 'user2',
      isCurrentUserReposted: false,
      othersCount: 2,
      totalReposters: 2,
      undoTargets: [],
    });

    mockRenderReposterText.mockReturnValue({
      mobileText: 'First Reposter, others reposted',
      desktopText: 'First Reposter and 1 other reposted this',
    });
  });

  it('matches snapshot with basic grouped repost', () => {
    const entry = createMockEntry();
    const { container } = render(<GroupedRepost entry={entry} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when current user reposted', () => {
    const entry = createMockEntry();
    mockCalculateReposterDisplay.mockReturnValue({
      avatarReposterIds: ['user2'],
      avatarOverflowCount: 0,
      firstReposterId: 'user2',
      isCurrentUserReposted: true,
      othersCount: 1,
      totalReposters: 2,
      undoTargets: ['current-user:repost-1'],
    });

    mockRenderReposterText.mockReturnValue({
      mobileText: 'You, others reposted',
      desktopText: 'You and 1 other reposted this',
    });

    const { container } = render(<GroupedRepost entry={entry} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with avatar overflow', () => {
    const entry = createMockEntry({ reposterIds: ['user2', 'user3', 'user4', 'user5', 'user6', 'user7'] });
    mockCalculateReposterDisplay.mockReturnValue({
      avatarReposterIds: ['user2', 'user3', 'user4', 'user5', 'user6'],
      avatarOverflowCount: 1,
      firstReposterId: 'user2',
      isCurrentUserReposted: false,
      othersCount: 6,
      totalReposters: 6,
      undoTargets: [],
    });

    mockRenderReposterText.mockReturnValue({
      mobileText: 'First Reposter, others reposted',
      desktopText: 'First Reposter and 5 others reposted this',
    });

    const { container } = render(<GroupedRepost entry={entry} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with single reposter', () => {
    const entry = createMockEntry({ reposterIds: ['user2'], postIds: ['user2:repost-1'] });
    mockCalculateReposterDisplay.mockReturnValue({
      avatarReposterIds: ['user2'],
      avatarOverflowCount: 0,
      firstReposterId: 'user2',
      isCurrentUserReposted: false,
      othersCount: 0,
      totalReposters: 1,
      undoTargets: [],
    });

    mockRenderReposterText.mockReturnValue({
      mobileText: 'First Reposter reposted',
      desktopText: 'First Reposter reposted this',
    });

    const { container } = render(<GroupedRepost entry={entry} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when originalPostId is null', () => {
    const entry = createMockEntry({ originalPostId: null });
    const { container } = render(<GroupedRepost entry={entry} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with deleting state', () => {
    const entry = createMockEntry();
    mockCalculateReposterDisplay.mockReturnValue({
      avatarReposterIds: ['user2'],
      avatarOverflowCount: 0,
      firstReposterId: 'user2',
      isCurrentUserReposted: true,
      othersCount: 1,
      totalReposters: 2,
      undoTargets: ['current-user:repost-1'],
    });

    mockUseDeletePost.mockReturnValue({
      deletePost: mockDeletePost,
      isDeleting: true,
    });

    mockRenderReposterText.mockReturnValue({
      mobileText: 'You, others reposted',
      desktopText: 'You and 1 other reposted this',
    });

    const { container } = render(<GroupedRepost entry={entry} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without user name (fallback to ID)', () => {
    const entry = createMockEntry();
    mockUseUserDetails.mockReturnValue({
      userDetails: null,
      isLoading: false,
    });

    mockRenderReposterText.mockReturnValue({
      mobileText: 'user2, others reposted',
      desktopText: 'user2 and 1 other reposted this',
    });

    const { container } = render(<GroupedRepost entry={entry} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
