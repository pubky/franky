import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostHeaderUserInfo } from './PostHeaderUserInfo';
import * as Libs from '@/libs';

// Mock hooks
const mockUseUserProfile = vi.fn();
const mockUseIsFollowing = vi.fn();
const mockUseFollowUser = vi.fn();
const mockUseAuthStore = vi.fn();
const mockUseProfileStats = vi.fn();
const mockUseProfileConnections = vi.fn();
const mockUseCurrentUserProfile = vi.fn();

vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useUserProfile: () => mockUseUserProfile(),
    useIsFollowing: () => mockUseIsFollowing(),
    useFollowUser: () => mockUseFollowUser(),
    useProfileStats: () => mockUseProfileStats(),
    useProfileConnections: () => mockUseProfileConnections(),
    useCurrentUserProfile: () => mockUseCurrentUserProfile(),
    CONNECTION_TYPE: {
      FOLLOWERS: 'followers',
      FOLLOWING: 'following',
      FRIENDS: 'friends',
    },
  };
});

vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    useAuthStore: () => mockUseAuthStore(),
  };
});

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
    Typography: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <p data-testid="typography" className={className}>
        {children}
      </p>
    ),
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
    PostHeaderUserInfoPopoverWrapper: ({
      children,
      userId: _userId,
      userName,
      avatarUrl: _avatarUrl,
      formattedPublicKey,
    }: {
      children: React.ReactNode;
      userId: string;
      userName: string;
      avatarUrl?: string;
      formattedPublicKey: string;
    }) => (
      <div data-testid="popover" data-hover="true">
        <div data-testid="popover-trigger" data-as-child="true">
          {children}
        </div>
        <div data-testid="popover-content" data-side="top" data-side-offset="8">
          <div data-testid="popover-inner-content">
            <div data-testid="avatar" />
            <div>{userName}</div>
            <div>@{formattedPublicKey}</div>
          </div>
        </div>
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

describe('PostHeaderUserInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    mockUseAuthStore.mockReturnValue({ currentUserPubky: 'currentUser123' });
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

  it('renders user name and public key', () => {
    render(<PostHeaderUserInfo userId="userpubkykey" userName="Test User" />);

    expect(screen.getByTestId('popover')).toBeInTheDocument();
    expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
    const avatars = screen.getAllByTestId('avatar');
    expect(avatars.length).toBeGreaterThan(0);
    expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);
    // formatPublicKey returns first 8 chars, so "userpubk"
    expect(screen.getAllByText(/@userpubk/).length).toBeGreaterThan(0);
  });

  it('renders avatar with image when avatarUrl is provided', () => {
    render(<PostHeaderUserInfo userId="user123" userName="Test User" avatarUrl="https://example.com/avatar.png" />);

    const avatarImages = screen.getAllByTestId('avatar-image');
    expect(avatarImages.length).toBeGreaterThan(0);
    expect(avatarImages[0]).toHaveAttribute('src', 'https://example.com/avatar.png');
    expect(avatarImages[0]).toHaveAttribute('alt', 'Test User');
  });

  it('renders character limit when provided', () => {
    render(<PostHeaderUserInfo userId="user123" userName="Test User" characterLimit={{ count: 50, max: 280 }} />);

    expect(screen.getByText('50/280')).toBeInTheDocument();
  });

  it('does not render character limit when not provided', () => {
    render(<PostHeaderUserInfo userId="user123" userName="Test User" />);

    expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument();
  });

  it('formats public key correctly', () => {
    const formatSpy = vi.spyOn(Libs, 'formatPublicKey');
    formatSpy.mockReturnValue('userpubk');

    render(<PostHeaderUserInfo userId="userpubkykey" userName="Test User" />);

    expect(formatSpy).toHaveBeenCalledWith({ key: 'userpubkykey', length: 8 });
    expect(screen.getAllByText('@userpubk').length).toBeGreaterThan(0);

    formatSpy.mockRestore();
  });

  it('renders popover content with user info', () => {
    render(<PostHeaderUserInfo userId="user123" userName="Test User" />);

    const content = screen.getByTestId('popover-content');
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

    render(<PostHeaderUserInfo userId="user123" userName="Test User" />);

    expect(screen.getByText('This is a test bio')).toBeInTheDocument();
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

    render(<PostHeaderUserInfo userId="user123" userName="Test User" />);

    const typographies = screen.getAllByTestId('typography');
    const bioTypography = typographies.find((el) => el.textContent && el.textContent.length > 20);
    expect(bioTypography).toBeUndefined();
  });

  it('shows Follow button when not current user', () => {
    mockUseAuthStore.mockReturnValue({ currentUserPubky: 'currentUser123' });
    mockUseIsFollowing.mockReturnValue({
      isFollowing: false,
      isLoading: false,
    });

    render(<PostHeaderUserInfo userId="otherUser123" userName="Other User" />);

    const followButton = screen.getByTestId('button');
    expect(followButton).toBeInTheDocument();
    expect(followButton).toHaveAttribute('aria-label', 'Follow');
  });

  it('does not show Follow button when viewing own profile', () => {
    mockUseAuthStore.mockReturnValue({ currentUserPubky: 'user123' });

    render(<PostHeaderUserInfo userId="user123" userName="Test User" />);

    const buttons = screen.queryAllByTestId('button');
    expect(buttons.length).toBe(0);
  });

  it('shows Following state when already following', () => {
    mockUseAuthStore.mockReturnValue({ currentUserPubky: 'currentUser123' });
    mockUseIsFollowing.mockReturnValue({
      isFollowing: true,
      isLoading: false,
    });

    render(<PostHeaderUserInfo userId="otherUser123" userName="Other User" />);

    const followButton = screen.getByTestId('button');
    expect(followButton).toHaveAttribute('aria-label', 'Unfollow');
  });

  it('calls toggleFollow when Follow button is clicked', async () => {
    const mockToggleFollow = vi.fn().mockResolvedValue(undefined);
    mockUseAuthStore.mockReturnValue({ currentUserPubky: 'currentUser123' });
    mockUseIsFollowing.mockReturnValue({
      isFollowing: false,
      isLoading: false,
    });
    mockUseFollowUser.mockReturnValue({
      toggleFollow: mockToggleFollow,
      isUserLoading: vi.fn(() => false),
    });

    render(<PostHeaderUserInfo userId="otherUser123" userName="Other User" />);

    const followButton = screen.getByTestId('button');
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(mockToggleFollow).toHaveBeenCalledWith('otherUser123', false);
    });
  });

  it('disables Follow button when loading', () => {
    const mockIsUserLoading = vi.fn(() => true);
    mockUseAuthStore.mockReturnValue({ currentUserPubky: 'currentUser123' });
    mockUseIsFollowing.mockReturnValue({
      isFollowing: false,
      isLoading: true,
    });
    mockUseFollowUser.mockReturnValue({
      toggleFollow: vi.fn(),
      isUserLoading: mockIsUserLoading,
    });

    render(<PostHeaderUserInfo userId="otherUser123" userName="Other User" />);

    const followButton = screen.getByTestId('button');
    expect(followButton).toBeDisabled();
  });

  it('renders without popover when showPopover is false', () => {
    render(<PostHeaderUserInfo userId="user123" userName="Test User" showPopover={false} />);

    expect(screen.queryByTestId('popover')).not.toBeInTheDocument();
    expect(screen.queryByTestId('popover-trigger')).not.toBeInTheDocument();
    expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
    const avatars = screen.getAllByTestId('avatar');
    expect(avatars.length).toBeGreaterThan(0);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders with popover when showPopover is true', () => {
    render(<PostHeaderUserInfo userId="user123" userName="Test User" showPopover={true} />);

    expect(screen.getByTestId('popover')).toBeInTheDocument();
    expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('popover-content')).toBeInTheDocument();
  });

  it('renders with popover by default when showPopover is not provided', () => {
    render(<PostHeaderUserInfo userId="user123" userName="Test User" />);

    expect(screen.getByTestId('popover')).toBeInTheDocument();
    expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('popover-content')).toBeInTheDocument();
  });
});

describe('PostHeaderUserInfo - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue({ currentUserPubky: 'currentUser123' });
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
      <PostHeaderUserInfo
        userId="snapshotUserKey"
        userName="Snapshot User"
        avatarUrl="https://example.com/avatar.png"
        characterLimit={{ count: 150, max: 280 }}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without avatarUrl', () => {
    const { container } = render(
      <PostHeaderUserInfo userId="snapshotUserKey" userName="Snapshot User" characterLimit={{ count: 50, max: 280 }} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot without character count', () => {
    const { container } = render(
      <PostHeaderUserInfo
        userId="snapshotUserKey"
        userName="Snapshot User"
        avatarUrl="https://example.com/avatar.png"
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with minimal props', () => {
    const { container } = render(<PostHeaderUserInfo userId="user123" userName="Test User" />);
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

    const { container } = render(<PostHeaderUserInfo userId="snapshotUserKey" userName="Snapshot User" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for current user (no Follow button)', () => {
    mockUseAuthStore.mockReturnValue({ currentUserPubky: 'snapshotUserKey' });

    const { container } = render(<PostHeaderUserInfo userId="snapshotUserKey" userName="Snapshot User" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when following', () => {
    mockUseIsFollowing.mockReturnValue({
      isFollowing: true,
      isLoading: false,
    });

    const { container } = render(<PostHeaderUserInfo userId="otherUser123" userName="Other User" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
