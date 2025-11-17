import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  ProfilePageMobileMenu: ({ activePage }: { activePage: string; onPageChangeAction: (page: string) => void }) => (
    <div data-testid="profile-mobile-menu" data-active={activePage}>
      Mobile Menu
    </div>
  ),
  ProfilePageFilterBar: ({ activePage }: { activePage: string; onPageChangeAction: (page: string) => void }) => (
    <div data-testid="profile-filter-bar" data-active={activePage}>
      Filter Bar
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
    mockPathname.mockReturnValue('/unknown');
    render(
      <ProfileLayout>
        <div>Test</div>
      </ProfileLayout>,
    );
    const menu = screen.getByTestId('profile-mobile-menu');
    expect(menu).toHaveAttribute('data-active', 'notifications');
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
