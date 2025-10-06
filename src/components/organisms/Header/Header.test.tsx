import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import * as App from '@/app';

// Mock Next.js navigation
const mockUsePathname = vi.fn();
const mockUseRouter = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => mockUseRouter(),
}));

// Mock Core
const mockUseProfileStore = vi.fn();
// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(() => ({ name: 'Test User', image: 'test-image.jpg' })),
}));

// Mock atoms, libs, config, and app
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  Button: ({ children, onClick, variant }: { children: React.ReactNode; onClick?: () => void; variant?: string }) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
  Link: ({ children, href }: { children: React.ReactNode; href?: string }) => <a href={href}>{children}</a>,
  Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AvatarImage: ({ src }: { src?: string }) => <img src={src} alt="avatar" />,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Badge: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Typography: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('@/libs', () => ({
  LogIn: () => <div>LogIn</div>,
  extractInitials: ({ name }: { name?: string }) => (name ? name.charAt(0).toUpperCase() : 'U'),
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  Home: () => <div>Home</div>,
  Search: () => <div>Search</div>,
  Bookmark: () => <div>Bookmark</div>,
  Settings: () => <div>Settings</div>,
}));

vi.mock('@/config', () => ({
  GITHUB_URL: 'https://github.com',
  TWITTER_GETPUBKY_URL: 'https://twitter.com',
  TELEGRAM_URL: 'https://telegram.com',
}));

vi.mock('@/app', () => ({
  AUTH_ROUTES: { SIGN_IN: '/sign-in', LOGOUT: '/logout' },
  HOME_ROUTES: { HOME: '/home' },
  ROOT_ROUTES: '/',
  ONBOARDING_ROUTES: {
    INSTALL: '/onboarding/install',
    SCAN: '/onboarding/scan',
    PUBKY: '/onboarding/pubky',
    BACKUP: '/onboarding/backup',
    HOMESERVER: '/onboarding/homeserver',
    PROFILE: '/onboarding/profile',
  },
}));

vi.mock('@/core', () => ({
  useAuthStore: () => mockUseProfileStore(),
  db: {
    user_details: {
      get: vi.fn(() => Promise.resolve({ name: 'Test User', image: 'test-image.jpg' })),
    },
  },
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  HeaderContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="header-container">{children}</div>
  ),
  Logo: ({ noLink }: { noLink?: boolean }) => (
    <div data-testid="logo" data-no-link={noLink}>
      Logo
    </div>
  ),
  HeaderTitle: ({ currentTitle }: { currentTitle: string }) => <div data-testid="header-title">{currentTitle}</div>,
  HeaderOnboarding: ({ currentStep }: { currentStep: number }) => (
    <div data-testid="onboarding-header" data-step={currentStep}>
      Onboarding Step {currentStep}
    </div>
  ),
  HeaderSocialLinks: () => <div data-testid="header-social-links">Social Links</div>,
  HeaderNavigationButtons: ({ avatarImage, avatarInitial }: { avatarImage?: string; avatarInitial?: string }) => (
    <div data-testid="header-navigation-buttons" data-avatar-image={avatarImage} data-avatar-initial={avatarInitial}>
      Navigation Buttons
    </div>
  ),
  SearchInput: () => <div data-testid="search-input">Search Input</div>,
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock return values
    mockUseProfileStore.mockReturnValue({ isAuthenticated: false });
    mockUsePathname.mockReturnValue(App.ROOT_ROUTES);
    mockUseRouter.mockReturnValue({ push: vi.fn() });
  });

  it('renders header container with logo and home header', () => {
    mockUsePathname.mockReturnValue(App.ROOT_ROUTES);

    render(<Header />);

    expect(screen.getByTestId('header-container')).toBeInTheDocument();
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    // HeaderHome renders social links and sign in button
    expect(screen.getByTestId('header-social-links')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows home header for non-onboarding paths', () => {
    mockUsePathname.mockReturnValue(App.ROOT_ROUTES);

    render(<Header />);

    // HeaderHome renders social links and sign in button
    expect(screen.getByTestId('header-social-links')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByTestId('onboarding-header')).not.toBeInTheDocument();
  });

  it('shows onboarding header for onboarding paths', () => {
    mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.INSTALL);

    render(<Header />);

    expect(screen.getByTestId('onboarding-header')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();
  });

  it('displays correct step for install path', () => {
    mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.INSTALL);

    render(<Header />);

    const onboardingHeader = screen.getByTestId('onboarding-header');
    expect(onboardingHeader).toHaveAttribute('data-step', '1');
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('displays correct step for scan path', () => {
    mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.SCAN);

    render(<Header />);

    const onboardingHeader = screen.getByTestId('onboarding-header');
    expect(onboardingHeader).toHaveAttribute('data-step', '2');
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('displays correct step for pubky path', () => {
    mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.PUBKY);

    render(<Header />);

    const onboardingHeader = screen.getByTestId('onboarding-header');
    expect(onboardingHeader).toHaveAttribute('data-step', '2');
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('displays correct step for backup path', () => {
    mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.BACKUP);

    render(<Header />);

    const onboardingHeader = screen.getByTestId('onboarding-header');
    expect(onboardingHeader).toHaveAttribute('data-step', '3');
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('handles unknown paths with default values', () => {
    mockUsePathname.mockReturnValue('/unknown-path');

    render(<Header />);

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('updates when pathname changes', () => {
    mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.INSTALL);

    const { rerender } = render(<Header />);

    expect(screen.getByTestId('onboarding-header')).toBeInTheDocument();
    const onboardingHeader = screen.getByTestId('onboarding-header');
    expect(onboardingHeader).toHaveAttribute('data-step', '1');

    // Change pathname
    mockUsePathname.mockReturnValue(App.ROOT_ROUTES);
    rerender(<Header />);

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByTestId('onboarding-header')).not.toBeInTheDocument();
  });

  it('correctly identifies onboarding paths', () => {
    const onboardingPaths = [
      App.ONBOARDING_ROUTES.INSTALL,
      App.ONBOARDING_ROUTES.SCAN,
      App.ONBOARDING_ROUTES.PUBKY,
      App.ONBOARDING_ROUTES.BACKUP,
    ];

    onboardingPaths.forEach((path) => {
      mockUsePathname.mockReturnValue(path);

      const { rerender } = render(<Header />);

      expect(screen.getByTestId('onboarding-header')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();

      rerender(<></>); // Clear for next iteration
    });
  });

  it('correctly identifies non-onboarding paths', () => {
    // TODO: Is it in purpose sigin? or it should be sign-in?
    const nonOnboardingPaths = [App.ROOT_ROUTES, '/about', '/contact', '/signin'];

    nonOnboardingPaths.forEach((path) => {
      mockUsePathname.mockReturnValue(path);

      const { rerender } = render(<Header />);

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.queryByTestId('onboarding-header')).not.toBeInTheDocument();

      rerender(<></>); // Clear for next iteration
    });
  });

  describe('Authentication Logic', () => {
    it('renders SignInHeader when user is authenticated', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: true });
      mockUsePathname.mockReturnValue(App.ROOT_ROUTES);

      render(<Header />);

      // HeaderSignIn renders search input and navigation buttons
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('header-navigation-buttons')).toBeInTheDocument();
      expect(screen.queryByTestId('onboarding-header')).not.toBeInTheDocument();
    });

    it('renders HomeHeader when user is not authenticated', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: false });
      mockUsePathname.mockReturnValue(App.ROOT_ROUTES);

      render(<Header />);

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
      expect(screen.queryByTestId('onboarding-header')).not.toBeInTheDocument();
    });

    it('does not render HeaderTitle when user is authenticated', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: true });
      mockUsePathname.mockReturnValue(App.ROOT_ROUTES);

      render(<Header />);

      expect(screen.queryByTestId('header-title')).not.toBeInTheDocument();
    });

    it('renders HomeHeader when user is not authenticated', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: false });
      mockUsePathname.mockReturnValue(App.ROOT_ROUTES);

      render(<Header />);

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
    });

    it('prioritizes onboarding header over authentication state', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: true });
      mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.INSTALL);

      render(<Header />);

      expect(screen.getByTestId('onboarding-header')).toBeInTheDocument();
      expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();
    });
  });

  describe('Logo Configuration', () => {
    it('renders logo with noLink=true when on profile step (step 5)', () => {
      mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.PROFILE);

      render(<Header />);

      const logo = screen.getByTestId('logo');
      expect(logo).toHaveAttribute('data-no-link', 'true');
    });

    it('renders logo with noLink=false when not on profile step', () => {
      mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.INSTALL);

      render(<Header />);

      const logo = screen.getByTestId('logo');
      expect(logo).toHaveAttribute('data-no-link', 'false');
    });
  });

  describe('Logout Path Configuration', () => {
    it('handles logout path correctly', () => {
      mockUsePathname.mockReturnValue(App.AUTH_ROUTES.LOGOUT);

      render(<Header />);

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByTestId('logo')).toBeInTheDocument();
      expect(screen.queryByTestId('onboarding-header')).not.toBeInTheDocument();
    });

    it('sets correct step for logout path', () => {
      mockUsePathname.mockReturnValue(App.AUTH_ROUTES.LOGOUT);

      render(<Header />);

      // Since logout is not an onboarding path, it should show HomeHeader
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.queryByTestId('onboarding-header')).not.toBeInTheDocument();
    });
  });

  describe('Path Configuration', () => {
    it('displays correct step for homeserver path', () => {
      mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.HOMESERVER);

      render(<Header />);

      const onboardingHeader = screen.getByTestId('onboarding-header');
      expect(onboardingHeader).toHaveAttribute('data-step', '4');
      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });

    it('displays correct step for profile path', () => {
      mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.PROFILE);

      render(<Header />);

      const onboardingHeader = screen.getByTestId('onboarding-header');
      expect(onboardingHeader).toHaveAttribute('data-step', '5');
      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });
  });

  describe('HeaderTitle Display Logic', () => {
    it('renders HeaderTitle when user is not signed in', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: false });
      mockUsePathname.mockReturnValue(App.ROOT_ROUTES);

      render(<Header />);

      expect(screen.getByTestId('header-title')).toBeInTheDocument();
      expect(screen.getByTestId('header-title')).toHaveTextContent('Sign in');
    });

    it('renders HeaderTitle when on step 5 (profile) even if signed in', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: true });
      mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.PROFILE);

      render(<Header />);

      expect(screen.getByTestId('header-title')).toBeInTheDocument();
      expect(screen.getByTestId('header-title')).toHaveTextContent('Profile');
    });

    it('does not render HeaderTitle when signed in and not on step 5', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: true });
      mockUsePathname.mockReturnValue(App.ROOT_ROUTES);

      render(<Header />);

      expect(screen.queryByTestId('header-title')).not.toBeInTheDocument();
    });

    it('renders HeaderTitle with correct title for each onboarding step', () => {
      const testCases = [
        { path: App.ONBOARDING_ROUTES.INSTALL, expectedTitle: 'Identity keys' },
        { path: App.ONBOARDING_ROUTES.SCAN, expectedTitle: 'Use Pubky Ring' },
        { path: App.ONBOARDING_ROUTES.PUBKY, expectedTitle: 'Your pubky' },
        { path: App.ONBOARDING_ROUTES.BACKUP, expectedTitle: 'Backup' },
        { path: App.ONBOARDING_ROUTES.HOMESERVER, expectedTitle: 'Homeserver' },
        { path: App.ONBOARDING_ROUTES.PROFILE, expectedTitle: 'Profile' },
        { path: App.AUTH_ROUTES.LOGOUT, expectedTitle: 'Signed out' },
      ];

      testCases.forEach(({ path, expectedTitle }) => {
        mockUsePathname.mockReturnValue(path);
        mockUseProfileStore.mockReturnValue({ isAuthenticated: false });

        const { rerender } = render(<Header />);

        expect(screen.getByTestId('header-title')).toHaveTextContent(expectedTitle);

        rerender(<></>); // Clear for next iteration
      });
    });
  });

  describe('Step 5 (Profile) Specific Logic', () => {
    it('renders logo with noLink=true only on step 5 (profile)', () => {
      mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.PROFILE);

      render(<Header />);

      const logo = screen.getByTestId('logo');
      expect(logo).toHaveAttribute('data-no-link', 'true');
    });

    it('renders logo with noLink=false on all other steps', () => {
      const nonProfilePaths = [
        App.ONBOARDING_ROUTES.INSTALL,
        App.ONBOARDING_ROUTES.SCAN,
        App.ONBOARDING_ROUTES.PUBKY,
        App.ONBOARDING_ROUTES.BACKUP,
        App.ONBOARDING_ROUTES.HOMESERVER,
        App.ROOT_ROUTES,
        App.AUTH_ROUTES.LOGOUT,
      ];

      nonProfilePaths.forEach((path) => {
        mockUsePathname.mockReturnValue(path);

        const { rerender } = render(<Header />);

        const logo = screen.getByTestId('logo');
        expect(logo).toHaveAttribute('data-no-link', 'false');

        rerender(<></>); // Clear for next iteration
      });
    });

    it('shows HeaderTitle on step 5 regardless of authentication state', () => {
      // Test with authenticated user
      mockUseProfileStore.mockReturnValue({ isAuthenticated: true });
      mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.PROFILE);

      const { rerender } = render(<Header />);

      expect(screen.getByTestId('header-title')).toBeInTheDocument();
      expect(screen.getByTestId('header-title')).toHaveTextContent('Profile');

      // Test with unauthenticated user
      mockUseProfileStore.mockReturnValue({ isAuthenticated: false });
      rerender(<Header />);

      expect(screen.getByTestId('header-title')).toBeInTheDocument();
      expect(screen.getByTestId('header-title')).toHaveTextContent('Profile');
    });
  });

  describe('State Updates', () => {
    it('updates authentication state when isAuthenticated changes', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: false });
      mockUsePathname.mockReturnValue(App.ROOT_ROUTES);

      const { rerender } = render(<Header />);

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();

      // Change authentication state
      mockUseProfileStore.mockReturnValue({ isAuthenticated: true });
      rerender(<Header />);

      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();
    });

    it('updates path configuration when pathname changes', () => {
      mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.INSTALL);

      const { rerender } = render(<Header />);

      let onboardingHeader = screen.getByTestId('onboarding-header');
      expect(onboardingHeader).toHaveAttribute('data-step', '1');

      // Change pathname
      mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.BACKUP);
      rerender(<Header />);

      onboardingHeader = screen.getByTestId('onboarding-header');
      expect(onboardingHeader).toHaveAttribute('data-step', '3');
    });

    it('updates HeaderTitle visibility when authentication state changes', () => {
      mockUsePathname.mockReturnValue(App.ROOT_ROUTES);
      mockUseProfileStore.mockReturnValue({ isAuthenticated: false });

      const { rerender } = render(<Header />);

      // Should show HeaderTitle when not authenticated
      expect(screen.getByTestId('header-title')).toBeInTheDocument();

      // Change to authenticated
      mockUseProfileStore.mockReturnValue({ isAuthenticated: true });
      rerender(<Header />);

      // Should hide HeaderTitle when authenticated (not on step 5)
      expect(screen.queryByTestId('header-title')).not.toBeInTheDocument();
    });

    it('updates HeaderTitle visibility when moving to/from step 5', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: true });
      mockUsePathname.mockReturnValue(App.ROOT_ROUTES);

      const { rerender } = render(<Header />);

      // Should not show HeaderTitle when authenticated and not on step 5
      expect(screen.queryByTestId('header-title')).not.toBeInTheDocument();

      // Move to step 5 (profile)
      mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.PROFILE);
      rerender(<Header />);

      // Should show HeaderTitle when on step 5, even if authenticated
      expect(screen.getByTestId('header-title')).toBeInTheDocument();
      expect(screen.getByTestId('header-title')).toHaveTextContent('Profile');
    });
  });
});
