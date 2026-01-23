import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageContainer } from './ProfilePageContainer';
import { PROFILE_PAGE_TYPES } from '@/app/profile/types';

// Mock Core
const mockCurrentUserPubky = 'user123';
vi.mock('@/core', () => ({
  useAuthStore: vi.fn(() => ({
    currentUserPubky: mockCurrentUserPubky,
  })),
}));

// Mock Providers
vi.mock('@/providers', () => ({
  useProfileContext: vi.fn(() => ({
    pubky: mockCurrentUserPubky,
    isOwnProfile: true,
    isLoading: false,
  })),
}));

// Mock Hooks
const mockProfile = {
  name: 'Test User',
  bio: 'Test bio',
  publicKey: 'pubkyuser123',
  emoji: '🌴',
  status: 'Available',
  avatarUrl: 'https://example.com/avatar.jpg',
  link: 'https://example.com/profile/user123',
};

const mockStats = {
  notifications: 5,
  posts: 10,
  replies: 3,
  followers: 100,
  following: 50,
  friends: 25,
  tagged: 7,
};

const mockActions = {
  onEdit: vi.fn(),
  onCopyPublicKey: vi.fn(),
  onCopyLink: vi.fn(),
  onSignOut: vi.fn(),
  onStatusClick: vi.fn(),
};

const mockNavigateToPage = vi.fn();
let mockUserNotFound = false;

vi.mock('@/hooks', () => ({
  useProfileHeader: vi.fn(() => ({
    profile: mockProfile,
    stats: mockStats,
    actions: mockActions,
    isLoading: false,
    userNotFound: mockUserNotFound,
  })),
  useProfileNavigation: vi.fn(() => ({
    activePage: PROFILE_PAGE_TYPES.NOTIFICATIONS,
    filterBarActivePage: PROFILE_PAGE_TYPES.NOTIFICATIONS,
    navigateToPage: mockNavigateToPage,
  })),
  useFollowUser: vi.fn(() => ({
    toggleFollow: vi.fn(),
    isLoading: false,
    error: null,
  })),
  useIsFollowing: vi.fn(() => ({
    isFollowing: false,
    isLoading: false,
  })),
}));

// Mock Molecules for ProfileNotFound
vi.mock('@/molecules', () => ({
  MobileHeader: ({ showLeftButton, showRightButton }: { showLeftButton: boolean; showRightButton: boolean }) => (
    <div data-testid="mobile-header" data-left={showLeftButton} data-right={showRightButton} />
  ),
  ProfilePageLayoutWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="profile-page-layout-wrapper">{children}</div>
  ),
  ProfileNotFound: () => <div data-testid="profile-not-found">User not found</div>,
  MobileFooter: () => <div data-testid="mobile-footer" />,
}));

// Mock Organisms - ProfilePageLayout
vi.mock('@/organisms', () => ({
  ProfilePageLayout: ({
    children,
    profile,
    stats,
    actions,
    activePage,
    filterBarActivePage,
    isLoading,
  }: {
    children: React.ReactNode;
    profile: Record<string, unknown>;
    stats: Record<string, unknown>;
    actions: Record<string, unknown>;
    activePage: string;
    filterBarActivePage: string;
    navigateToPage: (page: string) => void;
    isLoading: boolean;
  }) => (
    <div
      data-testid="profile-page-layout"
      data-profile={JSON.stringify(profile)}
      data-stats={JSON.stringify(stats)}
      data-actions-count={Object.keys(actions).length}
      data-active-page={activePage}
      data-filter-bar-page={filterBarActivePage}
      data-is-loading={isLoading}
    >
      {children}
    </div>
  ),
}));

describe('ProfilePageContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserNotFound = false;
  });

  it('renders without errors', () => {
    render(
      <ProfilePageContainer>
        <div>Test Content</div>
      </ProfilePageContainer>,
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders ProfilePageLayout', () => {
    render(
      <ProfilePageContainer>
        <div>Test</div>
      </ProfilePageContainer>,
    );
    expect(screen.getByTestId('profile-page-layout')).toBeInTheDocument();
  });

  it('passes profile data from useProfileHeader to layout', () => {
    render(
      <ProfilePageContainer>
        <div>Test</div>
      </ProfilePageContainer>,
    );
    const layout = screen.getByTestId('profile-page-layout');
    const profileData = JSON.parse(layout.getAttribute('data-profile') || '{}');
    expect(profileData).toEqual(mockProfile);
  });

  it('passes stats from useProfileHeader to layout', () => {
    render(
      <ProfilePageContainer>
        <div>Test</div>
      </ProfilePageContainer>,
    );
    const layout = screen.getByTestId('profile-page-layout');
    const statsData = JSON.parse(layout.getAttribute('data-stats') || '{}');
    expect(statsData).toEqual(mockStats);
  });

  it('passes actions from useProfileHeader to layout', () => {
    render(
      <ProfilePageContainer>
        <div>Test</div>
      </ProfilePageContainer>,
    );
    const layout = screen.getByTestId('profile-page-layout');
    const actionsCount = parseInt(layout.getAttribute('data-actions-count') || '0');
    // 5 from useProfileHeader + 3 from useFollowUser/useIsFollowing (onFollowToggle, isFollowLoading, isFollowing)
    expect(actionsCount).toBe(8);
  });

  it('passes activePage from useProfileNavigation to layout', () => {
    render(
      <ProfilePageContainer>
        <div>Test</div>
      </ProfilePageContainer>,
    );
    const layout = screen.getByTestId('profile-page-layout');
    expect(layout).toHaveAttribute('data-active-page', PROFILE_PAGE_TYPES.NOTIFICATIONS);
  });

  it('passes filterBarActivePage from useProfileNavigation to layout', () => {
    render(
      <ProfilePageContainer>
        <div>Test</div>
      </ProfilePageContainer>,
    );
    const layout = screen.getByTestId('profile-page-layout');
    expect(layout).toHaveAttribute('data-filter-bar-page', PROFILE_PAGE_TYPES.NOTIFICATIONS);
  });

  it('passes isLoading from useProfileHeader to layout', () => {
    render(
      <ProfilePageContainer>
        <div>Test</div>
      </ProfilePageContainer>,
    );
    const layout = screen.getByTestId('profile-page-layout');
    expect(layout).toHaveAttribute('data-is-loading', 'false');
  });

  it('passes children to layout', () => {
    render(
      <ProfilePageContainer>
        <div data-testid="custom-child">Custom Content</div>
      </ProfilePageContainer>,
    );
    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <ProfilePageContainer>
        <div>Test Content</div>
      </ProfilePageContainer>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('ProfilePageContainer - Props passed to layout', () => {
  it('passes all required props to ProfilePageLayout', () => {
    render(
      <ProfilePageContainer>
        <div>Test</div>
      </ProfilePageContainer>,
    );

    const layout = screen.getByTestId('profile-page-layout');

    // Verify all props are passed
    expect(layout).toHaveAttribute('data-profile');
    expect(layout).toHaveAttribute('data-stats');
    expect(layout).toHaveAttribute('data-actions-count');
    expect(layout).toHaveAttribute('data-active-page');
    expect(layout).toHaveAttribute('data-filter-bar-page');
    expect(layout).toHaveAttribute('data-is-loading');
  });
});

describe('ProfilePageContainer - User not found', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders ProfileNotFound when user does not exist', async () => {
    // Mock the hooks module to return userNotFound: true
    const { useProfileHeader } = await import('@/hooks');
    vi.mocked(useProfileHeader).mockReturnValue({
      profile: {
        name: '',
        bio: '',
        publicKey: '',
        emoji: '🌴',
        status: '',
        avatarUrl: undefined,
        link: '',
      },
      stats: {
        notifications: 0,
        posts: 0,
        replies: 0,
        followers: 0,
        following: 0,
        friends: 0,
        uniqueTags: 0,
      },
      actions: {
        onEdit: vi.fn(),
        onCopyPublicKey: vi.fn(),
        onCopyLink: vi.fn(),
        onSignOut: vi.fn(),
        onStatusChange: vi.fn(),
        isLoggingOut: false,
      },
      isLoading: false,
      userNotFound: true,
    });

    render(
      <ProfilePageContainer>
        <div>Test Content</div>
      </ProfilePageContainer>,
    );

    expect(screen.getByTestId('profile-not-found')).toBeInTheDocument();
    expect(screen.queryByTestId('profile-page-layout')).not.toBeInTheDocument();
  });

  it('does not render ProfileNotFound when user exists', async () => {
    const { useProfileHeader } = await import('@/hooks');
    vi.mocked(useProfileHeader).mockReturnValue({
      profile: mockProfile,
      stats: mockStats,
      actions: mockActions,
      isLoading: false,
      userNotFound: false,
    });

    render(
      <ProfilePageContainer>
        <div>Test Content</div>
      </ProfilePageContainer>,
    );

    expect(screen.queryByTestId('profile-not-found')).not.toBeInTheDocument();
    expect(screen.getByTestId('profile-page-layout')).toBeInTheDocument();
  });
});
