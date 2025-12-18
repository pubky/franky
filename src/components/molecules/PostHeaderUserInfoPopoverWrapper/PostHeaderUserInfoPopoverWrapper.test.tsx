import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostHeaderUserInfoPopoverWrapper } from './PostHeaderUserInfoPopoverWrapper';
import { PostHeaderUserInfo } from '../PostHeaderUserInfo';

// Mock hooks
const mockUseUserProfile = vi.fn();
const mockUseIsFollowing = vi.fn();
const mockUseFollowUser = vi.fn();
const mockUseCurrentUserProfile = vi.fn();
const mockUseProfileStats = vi.fn();
const mockUseProfileConnections = vi.fn();

vi.mock('@/hooks', () => ({
  useUserProfile: () => mockUseUserProfile(),
  useIsFollowing: () => mockUseIsFollowing(),
  useFollowUser: () => mockUseFollowUser(),
  useCurrentUserProfile: () => mockUseCurrentUserProfile(),
  useProfileStats: () => mockUseProfileStats(),
  useProfileConnections: () => mockUseProfileConnections(),
  CONNECTION_TYPE: {
    FOLLOWERS: 'followers',
    FOLLOWING: 'following',
    FRIENDS: 'friends',
  },
}));

// Mock atoms
vi.mock('@/atoms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/atoms')>();
  return {
    ...actual,
    Popover: ({ children, hover }: { children: React.ReactNode; hover?: boolean }) => (
      <div data-testid="popover" data-hover={hover}>
        {children}
      </div>
    ),
    PopoverTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
      <div data-testid="popover-trigger" data-as-child={asChild}>
        {children}
      </div>
    ),
    PopoverContent: ({
      children,
      className,
      side,
      sideOffset,
    }: {
      children: React.ReactNode;
      className?: string;
      side?: string;
      sideOffset?: number;
    }) => (
      <div data-testid="popover-content" className={className} data-side={side} data-side-offset={sideOffset}>
        {children}
      </div>
    ),
    Container: ({
      children,
      className,
      overrideDefaults,
    }: {
      children: React.ReactNode;
      className?: string;
      overrideDefaults?: boolean;
    }) => (
      <div data-testid="container" className={className} data-override-defaults={overrideDefaults}>
        {children}
      </div>
    ),
    Typography: ({
      children,
      className,
      as: Tag = 'p',
      overrideDefaults,
    }: {
      children: React.ReactNode;
      className?: string;
      as?: string;
      overrideDefaults?: boolean;
    }) => {
      const Component = Tag as keyof JSX.IntrinsicElements;
      return (
        <Component data-testid="typography" className={className} data-override-defaults={overrideDefaults}>
          {children}
        </Component>
      );
    },
    Button: ({
      children,
      variant,
      size,
      className,
      onClick,
      disabled,
      'aria-label': ariaLabel,
    }: {
      children: React.ReactNode;
      variant?: string;
      size?: string;
      className?: string;
      onClick?: (e: React.MouseEvent) => void;
      disabled?: boolean;
      'aria-label'?: string;
    }) => (
      <button
        data-testid="button"
        data-variant={variant}
        data-size={size}
        className={className}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    ),
  };
});

// Mock molecules
vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    AvatarWithFallback: ({ avatarUrl, name, size }: { avatarUrl?: string; name: string; size?: string }) => (
      <div data-testid="avatar" data-size={size}>
        {avatarUrl ? <img data-testid="avatar-image" src={avatarUrl} alt={name} /> : null}
        <div data-testid="avatar-fallback">{name.substring(0, 2).toUpperCase()}</div>
      </div>
    ),
    PostHeaderUserInfo: ({ userName }: { userId: string; userName: string }) => (
      <div data-testid="post-header-user-info">{userName}</div>
    ),
    AvatarGroup: ({ items, totalCount, maxAvatars }: { items: unknown[]; totalCount: number; maxAvatars?: number }) => (
      <div data-testid="avatar-group" data-total-count={totalCount} data-max-avatars={maxAvatars}>
        {items.map((item: { id: string; name?: string }, index: number) => (
          <div key={item.id || index} data-testid={`avatar-item-${index}`}>
            {item.name || item.id}
          </div>
        ))}
      </div>
    ),
  };
});

// Mock libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
    formatPublicKey: vi.fn(({ key, length }) => key?.substring(0, length) || ''),
  };
});

describe('PostHeaderUserInfoPopoverWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    mockUseCurrentUserProfile.mockReturnValue({ currentUserPubky: 'currentUser123' });
    mockUseUserProfile.mockReturnValue({
      profile: {
        name: 'Test User',
        bio: '',
        avatarUrl: 'https://example.com/avatar.png',
        publicKey: 'pk:user123',
      },
      isLoading: false,
    });
    mockUseIsFollowing.mockReturnValue({
      isFollowing: false,
      isLoading: false,
    });
    mockUseFollowUser.mockReturnValue({
      toggleFollow: vi.fn(),
      isUserLoading: vi.fn(() => false),
    });
    mockUseProfileStats.mockReturnValue({
      stats: {
        followers: 0,
        following: 0,
        posts: 0,
        replies: 0,
        friends: 0,
        uniqueTags: 0,
        notifications: 0,
      },
      isLoading: false,
    });
    mockUseProfileConnections.mockReturnValue({
      connections: [],
      count: 0,
      isLoading: false,
      isLoadingMore: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
      refresh: vi.fn(),
    });
  });

  it('renders popover with trigger and content', () => {
    render(
      <PostHeaderUserInfoPopoverWrapper userId="user123" userName="Test User" formattedPublicKey="user123">
        <PostHeaderUserInfo userId="user123" userName="Test User" />
      </PostHeaderUserInfoPopoverWrapper>,
    );

    const popovers = screen.getAllByTestId('popover');
    expect(popovers.length).toBeGreaterThan(0);
    const triggers = screen.getAllByTestId('popover-trigger');
    expect(triggers.length).toBeGreaterThan(0);
    const contents = screen.getAllByTestId('popover-content');
    expect(contents.length).toBeGreaterThan(0);
  });

  it('renders children as trigger', () => {
    render(
      <PostHeaderUserInfoPopoverWrapper userId="user123" userName="Test User" formattedPublicKey="user123">
        <PostHeaderUserInfo userId="user123" userName="Test User" />
      </PostHeaderUserInfoPopoverWrapper>,
    );

    // Children should be rendered inside the trigger
    const triggers = screen.getAllByTestId('popover-trigger');
    expect(triggers.length).toBeGreaterThan(0);
    // Text appears both in trigger and popover content, so check it exists
    expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);
  });

  it('renders popover content with user info', () => {
    render(
      <PostHeaderUserInfoPopoverWrapper userId="user123" userName="Test User" formattedPublicKey="user123">
        <PostHeaderUserInfo userId="user123" userName="Test User" />
      </PostHeaderUserInfoPopoverWrapper>,
    );

    const contents = screen.getAllByTestId('popover-content');
    const content = contents[contents.length - 1]; // Get the last one (the actual popover content)
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute('data-side', 'top');
    expect(content).toHaveAttribute('data-side-offset', '8');
  });

  it('displays bio when available', () => {
    mockUseUserProfile.mockReturnValue({
      profile: {
        name: 'Test User',
        bio: 'This is a test bio',
        avatarUrl: undefined,
        publicKey: 'pk:user123',
      },
      isLoading: false,
    });

    render(
      <PostHeaderUserInfoPopoverWrapper userId="user123" userName="Test User" formattedPublicKey="user123">
        <PostHeaderUserInfo userId="user123" userName="Test User" />
      </PostHeaderUserInfoPopoverWrapper>,
    );

    const contents = screen.getAllByTestId('popover-content');
    const content = contents[contents.length - 1]; // Get the last one (the actual popover content)
    expect(within(content).getByText('This is a test bio')).toBeInTheDocument();
  });

  it('does not display bio when not available', () => {
    mockUseUserProfile.mockReturnValue({
      profile: {
        name: 'Test User',
        bio: '',
        avatarUrl: undefined,
        publicKey: 'pk:user123',
      },
      isLoading: false,
    });

    render(
      <PostHeaderUserInfoPopoverWrapper userId="user123" userName="Test User" formattedPublicKey="user123">
        <PostHeaderUserInfo userId="user123" userName="Test User" />
      </PostHeaderUserInfoPopoverWrapper>,
    );

    const typographies = screen.getAllByTestId('typography');
    const bioTypography = typographies.find((el) => el.textContent && el.textContent.length > 20);
    expect(bioTypography).toBeUndefined();
  });

  it('shows Follow button when not current user', () => {
    mockUseCurrentUserProfile.mockReturnValue({ currentUserPubky: 'currentUser123' });
    mockUseIsFollowing.mockReturnValue({
      isFollowing: false,
      isLoading: false,
    });

    render(
      <PostHeaderUserInfoPopoverWrapper userId="otherUser123" userName="Other User" formattedPublicKey="otherUse">
        <PostHeaderUserInfo userId="otherUser123" userName="Other User" />
      </PostHeaderUserInfoPopoverWrapper>,
    );

    const contents = screen.getAllByTestId('popover-content');
    const content = contents[contents.length - 1]; // Get the last one (the actual popover content)
    const followButton = within(content).getByTestId('button');
    expect(followButton).toBeInTheDocument();
    expect(followButton).toHaveAttribute('aria-label', 'Follow');
  });

  it('does not show Follow button when viewing own profile', () => {
    mockUseCurrentUserProfile.mockReturnValue({ currentUserPubky: 'user123' });

    render(
      <PostHeaderUserInfoPopoverWrapper userId="user123" userName="Test User" formattedPublicKey="user123">
        <PostHeaderUserInfo userId="user123" userName="Test User" />
      </PostHeaderUserInfoPopoverWrapper>,
    );

    const buttons = screen.queryAllByTestId('button');
    expect(buttons.length).toBe(0);
  });

  it('shows Following state when already following', () => {
    mockUseCurrentUserProfile.mockReturnValue({ currentUserPubky: 'currentUser123' });
    mockUseIsFollowing.mockReturnValue({
      isFollowing: true,
      isLoading: false,
    });

    render(
      <PostHeaderUserInfoPopoverWrapper userId="otherUser123" userName="Other User" formattedPublicKey="otherUse">
        <PostHeaderUserInfo userId="otherUser123" userName="Other User" />
      </PostHeaderUserInfoPopoverWrapper>,
    );

    const contents = screen.getAllByTestId('popover-content');
    const content = contents[contents.length - 1]; // Get the last one (the actual popover content)
    const followButton = within(content).getByTestId('button');
    expect(followButton).toHaveAttribute('aria-label', 'Unfollow');
  });

  it('calls toggleFollow when Follow button is clicked', async () => {
    const mockToggleFollow = vi.fn().mockResolvedValue(undefined);
    mockUseCurrentUserProfile.mockReturnValue({ currentUserPubky: 'currentUser123' });
    mockUseIsFollowing.mockReturnValue({
      isFollowing: false,
      isLoading: false,
    });
    mockUseFollowUser.mockReturnValue({
      toggleFollow: mockToggleFollow,
      isUserLoading: vi.fn(() => false),
    });

    render(
      <PostHeaderUserInfoPopoverWrapper userId="otherUser123" userName="Other User" formattedPublicKey="otherUse">
        <PostHeaderUserInfo userId="otherUser123" userName="Other User" />
      </PostHeaderUserInfoPopoverWrapper>,
    );

    const contents = screen.getAllByTestId('popover-content');
    const content = contents[contents.length - 1]; // Get the last one (the actual popover content)
    const followButton = within(content).getByTestId('button');
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(mockToggleFollow).toHaveBeenCalledWith('otherUser123', false);
    });
  });

  it('disables Follow button when loading', () => {
    const mockIsUserLoading = vi.fn(() => true);
    mockUseCurrentUserProfile.mockReturnValue({ currentUserPubky: 'currentUser123' });
    mockUseIsFollowing.mockReturnValue({
      isFollowing: false,
      isLoading: true,
    });
    mockUseFollowUser.mockReturnValue({
      toggleFollow: vi.fn(),
      isUserLoading: mockIsUserLoading,
    });

    render(
      <PostHeaderUserInfoPopoverWrapper userId="otherUser123" userName="Other User" formattedPublicKey="otherUse">
        <PostHeaderUserInfo userId="otherUser123" userName="Other User" />
      </PostHeaderUserInfoPopoverWrapper>,
    );

    const contents = screen.getAllByTestId('popover-content');
    const content = contents[contents.length - 1]; // Get the last one (the actual popover content)
    const followButton = within(content).getByTestId('button');
    expect(followButton).toBeDisabled();
  });
});

describe('PostHeaderUserInfoPopoverWrapper - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCurrentUserProfile.mockReturnValue({ currentUserPubky: 'currentUser123' });
    mockUseUserProfile.mockReturnValue({
      profile: {
        name: 'Test User',
        bio: '',
        avatarUrl: 'https://example.com/avatar.png',
        publicKey: 'pk:user123',
      },
      isLoading: false,
    });
    mockUseIsFollowing.mockReturnValue({
      isFollowing: false,
      isLoading: false,
    });
    mockUseFollowUser.mockReturnValue({
      toggleFollow: vi.fn(),
      isUserLoading: vi.fn(() => false),
    });
    mockUseProfileStats.mockReturnValue({
      stats: {
        followers: 0,
        following: 0,
        posts: 0,
        replies: 0,
        friends: 0,
        uniqueTags: 0,
        notifications: 0,
      },
      isLoading: false,
    });
    mockUseProfileConnections.mockReturnValue({
      connections: [],
      count: 0,
      isLoading: false,
      isLoadingMore: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
      refresh: vi.fn(),
    });
  });

  it('matches snapshot with all props', () => {
    const { container } = render(
      <PostHeaderUserInfoPopoverWrapper
        userId="snapshotUserKey"
        userName="Snapshot User"
        avatarUrl="https://example.com/avatar.png"
        formattedPublicKey="snapshotU"
      >
        <PostHeaderUserInfo userId="snapshotUserKey" userName="Snapshot User" />
      </PostHeaderUserInfoPopoverWrapper>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without avatarUrl', () => {
    const { container } = render(
      <PostHeaderUserInfoPopoverWrapper
        userId="snapshotUserKey"
        userName="Snapshot User"
        formattedPublicKey="snapshotU"
      >
        <PostHeaderUserInfo userId="snapshotUserKey" userName="Snapshot User" />
      </PostHeaderUserInfoPopoverWrapper>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with bio', () => {
    mockUseUserProfile.mockReturnValue({
      profile: {
        name: 'Snapshot User',
        bio: 'This is a snapshot bio',
        avatarUrl: undefined,
        publicKey: 'pk:snapshotUserKey',
      },
      isLoading: false,
    });

    const { container } = render(
      <PostHeaderUserInfoPopoverWrapper
        userId="snapshotUserKey"
        userName="Snapshot User"
        formattedPublicKey="snapshotU"
      >
        <PostHeaderUserInfo userId="snapshotUserKey" userName="Snapshot User" />
      </PostHeaderUserInfoPopoverWrapper>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for current user (no Follow button)', () => {
    mockUseCurrentUserProfile.mockReturnValue({ currentUserPubky: 'snapshotUserKey' });

    const { container } = render(
      <PostHeaderUserInfoPopoverWrapper
        userId="snapshotUserKey"
        userName="Snapshot User"
        formattedPublicKey="snapshotU"
      >
        <PostHeaderUserInfo userId="snapshotUserKey" userName="Snapshot User" />
      </PostHeaderUserInfoPopoverWrapper>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when following', () => {
    mockUseIsFollowing.mockReturnValue({
      isFollowing: true,
      isLoading: false,
    });

    const { container } = render(
      <PostHeaderUserInfoPopoverWrapper userId="otherUser123" userName="Other User" formattedPublicKey="otherUse">
        <PostHeaderUserInfo userId="otherUser123" userName="Other User" />
      </PostHeaderUserInfoPopoverWrapper>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
