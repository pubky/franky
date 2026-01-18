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
  publicKey: 'pk:user123',
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

vi.mock('@/hooks', () => ({
  useProfileHeader: vi.fn(() => ({
    profile: mockProfile,
    stats: mockStats,
    actions: mockActions,
    isLoading: false,
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
  useMuteUser: vi.fn(() => ({
    toggleMute: vi.fn(),
    isLoading: false,
    isUserLoading: vi.fn(() => false),
    error: null,
  })),
  useMutedUsers: vi.fn(() => ({
    mutedUserIds: [],
    mutedUserIdSet: new Set(),
    isMuted: vi.fn(() => false),
    isLoading: false,
  })),
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
    // 5 from useProfileHeader + 3 from follow + 3 from mute
    expect(actionsCount).toBe(11);
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
