import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileLayout from './layout';
import { PROFILE_ROUTES } from '@/app';

// Mock next/navigation
const mockPush = vi.fn();
const mockPathname = vi.fn(() => PROFILE_ROUTES.PROFILE);

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useProfileHeader hook
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useProfileHeader: vi.fn(() => ({
      profileData: {
        name: 'Satoshi Nakamoto',
        bio: 'Authored the Bitcoin white paper, developed Bitcoin, mined first block, disappeared.',
        publicKey: '1QX7GKW3abcdef1234567890',
        emoji: '🌴',
        status: 'Vacationing',
        avatarUrl: undefined,
        link: undefined,
      },
      handlers: {
        onEdit: vi.fn(),
        onCopyPublicKey: vi.fn(),
        onSignOut: vi.fn(),
        onStatusClick: vi.fn(),
      },
      isLoading: false,
    })),
  };
});

// Mock molecules
vi.mock('@/components/molecules', () => ({
  MobileHeader: ({ showLeftButton, showRightButton }: { showLeftButton?: boolean; showRightButton?: boolean }) => (
    <div data-testid="mobile-header" data-left={showLeftButton} data-right={showRightButton}>
      Mobile Header
    </div>
  ),
  ProfilePageMobileMenu: ({
    activePage,
    onPageChangeAction,
  }: {
    activePage: string;
    onPageChangeAction: (page: string) => void;
  }) => (
    <div data-testid="profile-mobile-menu" data-active={activePage}>
      <button aria-label="Posts" onClick={() => onPageChangeAction('posts')}>
        Posts
      </button>
      <button aria-label="Replies" onClick={() => onPageChangeAction('replies')}>
        Replies
      </button>
      <button aria-label="Notifications" onClick={() => onPageChangeAction('notifications')}>
        Notifications
      </button>
    </div>
  ),
  ProfilePageFilterBar: ({
    activePage,
    onPageChangeAction,
  }: {
    activePage: string;
    onPageChangeAction: (page: string) => void;
  }) => (
    <div data-testid="profile-filter-bar" data-active={activePage}>
      <button aria-label="Posts" onClick={() => onPageChangeAction('posts')}>
        Posts
      </button>
      <button aria-label="Followers" onClick={() => onPageChangeAction('followers')}>
        Followers
      </button>
      <button aria-label="Following" onClick={() => onPageChangeAction('following')}>
        Following
      </button>
    </div>
  ),
  ProfilePageSidebar: () => <div data-testid="profile-sidebar">Sidebar</div>,
  ProfilePageLayoutWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="profile-page-layout-wrapper">{children}</div>
  ),
  MobileFooter: () => <div data-testid="mobile-footer">Footer</div>,
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  ProfilePageHeader: ({
    name,
    bio,
    publicKey,
    emoji,
    status,
    onSignOut,
  }: {
    name: string;
    bio?: string;
    publicKey: string;
    emoji?: string;
    status: string;
    onSignOut?: () => void;
  }) => (
    <div data-testid="profile-page-header">
      <div>{name}</div>
      {bio && <div>{bio}</div>}
      <div>{publicKey}</div>
      {emoji && <div>{emoji}</div>}
      <div>{status}</div>
      {onSignOut && <button onClick={onSignOut}>Sign out</button>}
    </div>
  ),
}));

describe('ProfileLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue(PROFILE_ROUTES.PROFILE);
  });

  it('renders without errors', () => {
    render(
      <ProfileLayout>
        <div>Test Content</div>
      </ProfileLayout>,
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders MobileHeader with correct props', () => {
    render(
      <ProfileLayout>
        <div>Test</div>
      </ProfileLayout>,
    );
    const header = screen.getByTestId('mobile-header');
    expect(header).toHaveAttribute('data-left', 'false');
    expect(header).toHaveAttribute('data-right', 'false');
  });

  it('renders ProfilePageMobileMenu', () => {
    render(
      <ProfileLayout>
        <div>Test</div>
      </ProfileLayout>,
    );
    expect(screen.getByTestId('profile-mobile-menu')).toBeInTheDocument();
  });

  it('renders ProfilePageHeader on desktop', () => {
    render(
      <ProfileLayout>
        <div>Test</div>
      </ProfileLayout>,
    );
    expect(screen.getByTestId('profile-page-header')).toBeInTheDocument();
  });

  it('renders ProfilePageFilterBar', () => {
    render(
      <ProfileLayout>
        <div>Test</div>
      </ProfileLayout>,
    );
    expect(screen.getByTestId('profile-filter-bar')).toBeInTheDocument();
  });

  it('renders ProfilePageSidebar', () => {
    render(
      <ProfileLayout>
        <div>Test</div>
      </ProfileLayout>,
    );
    expect(screen.getByTestId('profile-sidebar')).toBeInTheDocument();
  });

  it('renders MobileFooter', () => {
    render(
      <ProfileLayout>
        <div>Test</div>
      </ProfileLayout>,
    );
    expect(screen.getByTestId('mobile-footer')).toBeInTheDocument();
  });

  it('sets correct active page from pathname', () => {
    mockPathname.mockReturnValue(PROFILE_ROUTES.POSTS);
    render(
      <ProfileLayout>
        <div>Test</div>
      </ProfileLayout>,
    );
    const menu = screen.getByTestId('profile-mobile-menu');
    expect(menu).toHaveAttribute('data-active', 'posts');
  });

  it('defaults to notifications when pathname is not in map', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPathname.mockReturnValue('/unknown' as any);
    render(
      <ProfileLayout>
        <div>Test</div>
      </ProfileLayout>,
    );
    const menu = screen.getByTestId('profile-mobile-menu');
    expect(menu).toHaveAttribute('data-active', 'notifications');
  });

  describe('Navigation behavior', () => {
    it('navigates to correct route when clicking Posts in mobile menu', () => {
      render(
        <ProfileLayout>
          <div>Test</div>
        </ProfileLayout>,
      );

      const postsButton = screen.getAllByLabelText('Posts')[0]; // Get first Posts button (mobile menu)
      fireEvent.click(postsButton);

      expect(mockPush).toHaveBeenCalledWith(PROFILE_ROUTES.POSTS);
    });

    it('navigates to correct route when clicking Replies in mobile menu', () => {
      render(
        <ProfileLayout>
          <div>Test</div>
        </ProfileLayout>,
      );

      const repliesButton = screen.getByLabelText('Replies');
      fireEvent.click(repliesButton);

      expect(mockPush).toHaveBeenCalledWith(PROFILE_ROUTES.REPLIES);
    });

    it('navigates to correct route when clicking Notifications in mobile menu', () => {
      render(
        <ProfileLayout>
          <div>Test</div>
        </ProfileLayout>,
      );

      const notificationsButton = screen.getByLabelText('Notifications');
      fireEvent.click(notificationsButton);

      expect(mockPush).toHaveBeenCalledWith(PROFILE_ROUTES.PROFILE);
    });

    it('navigates to correct route when clicking Followers in filter bar', () => {
      render(
        <ProfileLayout>
          <div>Test</div>
        </ProfileLayout>,
      );

      const followersButton = screen.getByLabelText('Followers');
      fireEvent.click(followersButton);

      expect(mockPush).toHaveBeenCalledWith(PROFILE_ROUTES.FOLLOWERS);
    });

    it('navigates to correct route when clicking Following in filter bar', () => {
      render(
        <ProfileLayout>
          <div>Test</div>
        </ProfileLayout>,
      );

      const followingButton = screen.getByLabelText('Following');
      fireEvent.click(followingButton);

      expect(mockPush).toHaveBeenCalledWith(PROFILE_ROUTES.FOLLOWING);
    });

    it('updates active page after navigation', () => {
      mockPathname.mockReturnValue(PROFILE_ROUTES.PROFILE);

      const { rerender } = render(
        <ProfileLayout>
          <div>Test</div>
        </ProfileLayout>,
      );

      let menu = screen.getByTestId('profile-mobile-menu');
      expect(menu).toHaveAttribute('data-active', 'notifications');

      // Simulate route change to posts
      mockPathname.mockReturnValue(PROFILE_ROUTES.POSTS);

      rerender(
        <ProfileLayout>
          <div>Test</div>
        </ProfileLayout>,
      );

      menu = screen.getByTestId('profile-mobile-menu');
      expect(menu).toHaveAttribute('data-active', 'posts');
    });

    it('calls router.push with correct route for all page types', () => {
      render(
        <ProfileLayout>
          <div>Test</div>
        </ProfileLayout>,
      );

      // Test Posts navigation
      fireEvent.click(screen.getAllByLabelText('Posts')[0]);
      expect(mockPush).toHaveBeenCalledWith(PROFILE_ROUTES.POSTS);

      // Test Replies navigation
      fireEvent.click(screen.getByLabelText('Replies'));
      expect(mockPush).toHaveBeenCalledWith(PROFILE_ROUTES.REPLIES);

      // Test Followers navigation
      fireEvent.click(screen.getByLabelText('Followers'));
      expect(mockPush).toHaveBeenCalledWith(PROFILE_ROUTES.FOLLOWERS);

      // Test Following navigation
      fireEvent.click(screen.getByLabelText('Following'));
      expect(mockPush).toHaveBeenCalledWith(PROFILE_ROUTES.FOLLOWING);

      expect(mockPush).toHaveBeenCalledTimes(4);
    });
  });

  it('matches snapshot', () => {
    const { container } = render(
      <ProfileLayout>
        <div>Test Content</div>
      </ProfileLayout>,
    );
    expect(container).toMatchSnapshot();
  });
});
