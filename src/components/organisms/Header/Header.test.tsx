import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import * as App from '@/app';

// Mock Next.js navigation
const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock Core
const mockUseProfileStore = vi.fn();
vi.mock('@/core', () => ({
  useAuthStore: () => mockUseProfileStore(),
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
  HeaderHome: () => <div data-testid="home-header">Home Header</div>,
  HeaderSignIn: () => <div data-testid="sign-in-header">Sign In Header</div>,
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock return values
    mockUseProfileStore.mockReturnValue({ isAuthenticated: false });
    mockUsePathname.mockReturnValue(App.ROOT_ROUTES);
  });

  it('renders header container with logo and home header', () => {
    mockUsePathname.mockReturnValue(App.ROOT_ROUTES);

    render(<Header />);

    expect(screen.getByTestId('header-container')).toBeInTheDocument();
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByTestId('home-header')).toBeInTheDocument();
  });

  it('shows home header for non-onboarding paths', () => {
    mockUsePathname.mockReturnValue(App.ROOT_ROUTES);

    render(<Header />);

    expect(screen.getByTestId('home-header')).toBeInTheDocument();
    expect(screen.queryByTestId('onboarding-header')).not.toBeInTheDocument();
  });

  it('shows onboarding header for onboarding paths', () => {
    mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.INSTALL);

    render(<Header />);

    expect(screen.getByTestId('onboarding-header')).toBeInTheDocument();
    expect(screen.queryByTestId('home-header')).not.toBeInTheDocument();
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

    expect(screen.getByTestId('home-header')).toBeInTheDocument();
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

    expect(screen.getByTestId('home-header')).toBeInTheDocument();
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
      expect(screen.queryByTestId('home-header')).not.toBeInTheDocument();

      rerender(<></>); // Clear for next iteration
    });
  });

  it('correctly identifies non-onboarding paths', () => {
    // TODO: Is it in purpose sigin? or it should be sign-in?
    const nonOnboardingPaths = [App.ROOT_ROUTES, '/about', '/contact', '/signin'];

    nonOnboardingPaths.forEach((path) => {
      mockUsePathname.mockReturnValue(path);

      const { rerender } = render(<Header />);

      expect(screen.getByTestId('home-header')).toBeInTheDocument();
      expect(screen.queryByTestId('onboarding-header')).not.toBeInTheDocument();

      rerender(<></>); // Clear for next iteration
    });
  });

  describe('Authentication Logic', () => {
    it('renders SignInHeader when user is authenticated', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: true });
      mockUsePathname.mockReturnValue(App.ROOT_ROUTES);

      render(<Header />);

      expect(screen.getByTestId('sign-in-header')).toBeInTheDocument();
      expect(screen.queryByTestId('home-header')).not.toBeInTheDocument();
      expect(screen.queryByTestId('onboarding-header')).not.toBeInTheDocument();
    });

    it('renders HomeHeader when user is not authenticated', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: false });
      mockUsePathname.mockReturnValue(App.ROOT_ROUTES);

      render(<Header />);

      expect(screen.getByTestId('home-header')).toBeInTheDocument();
      expect(screen.queryByTestId('sign-in-header')).not.toBeInTheDocument();
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

      expect(screen.getByTestId('home-header')).toBeInTheDocument();
      expect(screen.queryByTestId('sign-in-header')).not.toBeInTheDocument();
    });

    it('prioritizes onboarding header over authentication state', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: true });
      mockUsePathname.mockReturnValue(App.ONBOARDING_ROUTES.INSTALL);

      render(<Header />);

      expect(screen.getByTestId('onboarding-header')).toBeInTheDocument();
      expect(screen.queryByTestId('sign-in-header')).not.toBeInTheDocument();
      expect(screen.queryByTestId('home-header')).not.toBeInTheDocument();
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

      expect(screen.getByTestId('home-header')).toBeInTheDocument();
      expect(screen.getByTestId('logo')).toBeInTheDocument();
      expect(screen.queryByTestId('onboarding-header')).not.toBeInTheDocument();
    });

    it('sets correct step for logout path', () => {
      mockUsePathname.mockReturnValue(App.AUTH_ROUTES.LOGOUT);

      render(<Header />);

      // Since logout is not an onboarding path, it should show HomeHeader
      expect(screen.getByTestId('home-header')).toBeInTheDocument();
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

      expect(screen.getByTestId('home-header')).toBeInTheDocument();

      // Change authentication state
      mockUseProfileStore.mockReturnValue({ isAuthenticated: true });
      rerender(<Header />);

      expect(screen.getByTestId('sign-in-header')).toBeInTheDocument();
      expect(screen.queryByTestId('home-header')).not.toBeInTheDocument();
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
