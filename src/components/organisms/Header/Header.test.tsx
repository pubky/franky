import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

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
    mockUsePathname.mockReturnValue('/');
  });

  it('renders header container with logo and home header', () => {
    mockUsePathname.mockReturnValue('/');

    render(<Header />);

    expect(screen.getByTestId('header-container')).toBeInTheDocument();
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByTestId('home-header')).toBeInTheDocument();
  });

  it('shows home header for non-onboarding paths', () => {
    mockUsePathname.mockReturnValue('/');

    render(<Header />);

    expect(screen.getByTestId('home-header')).toBeInTheDocument();
    expect(screen.queryByTestId('onboarding-header')).not.toBeInTheDocument();
  });

  it('shows onboarding header for onboarding paths', () => {
    mockUsePathname.mockReturnValue('/onboarding/install');

    render(<Header />);

    expect(screen.getByTestId('onboarding-header')).toBeInTheDocument();
    expect(screen.queryByTestId('home-header')).not.toBeInTheDocument();
  });

  it('displays correct step for install path', () => {
    mockUsePathname.mockReturnValue('/onboarding/install');

    render(<Header />);

    const onboardingHeader = screen.getByTestId('onboarding-header');
    expect(onboardingHeader).toHaveAttribute('data-step', '1');
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('displays correct step for scan path', () => {
    mockUsePathname.mockReturnValue('/onboarding/scan');

    render(<Header />);

    const onboardingHeader = screen.getByTestId('onboarding-header');
    expect(onboardingHeader).toHaveAttribute('data-step', '2');
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('displays correct step for pubky path', () => {
    mockUsePathname.mockReturnValue('/onboarding/pubky');

    render(<Header />);

    const onboardingHeader = screen.getByTestId('onboarding-header');
    expect(onboardingHeader).toHaveAttribute('data-step', '2');
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('displays correct step for backup path', () => {
    mockUsePathname.mockReturnValue('/onboarding/backup');

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
    mockUsePathname.mockReturnValue('/onboarding/install');

    const { rerender } = render(<Header />);

    expect(screen.getByTestId('onboarding-header')).toBeInTheDocument();
    const onboardingHeader = screen.getByTestId('onboarding-header');
    expect(onboardingHeader).toHaveAttribute('data-step', '1');

    // Change pathname
    mockUsePathname.mockReturnValue('/');
    rerender(<Header />);

    expect(screen.getByTestId('home-header')).toBeInTheDocument();
    expect(screen.queryByTestId('onboarding-header')).not.toBeInTheDocument();
  });

  it('correctly identifies onboarding paths', () => {
    const onboardingPaths = ['/onboarding/install', '/onboarding/scan', '/onboarding/pubky', '/onboarding/backup'];

    onboardingPaths.forEach((path) => {
      mockUsePathname.mockReturnValue(path);

      const { rerender } = render(<Header />);

      expect(screen.getByTestId('onboarding-header')).toBeInTheDocument();
      expect(screen.queryByTestId('home-header')).not.toBeInTheDocument();

      rerender(<></>); // Clear for next iteration
    });
  });

  it('correctly identifies non-onboarding paths', () => {
    const nonOnboardingPaths = ['/', '/about', '/contact', '/signin'];

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
      mockUsePathname.mockReturnValue('/');

      render(<Header />);

      expect(screen.getByTestId('sign-in-header')).toBeInTheDocument();
      expect(screen.queryByTestId('home-header')).not.toBeInTheDocument();
      expect(screen.queryByTestId('onboarding-header')).not.toBeInTheDocument();
    });

    it('renders HomeHeader when user is not authenticated', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: false });
      mockUsePathname.mockReturnValue('/');

      render(<Header />);

      expect(screen.getByTestId('home-header')).toBeInTheDocument();
      expect(screen.queryByTestId('sign-in-header')).not.toBeInTheDocument();
      expect(screen.queryByTestId('onboarding-header')).not.toBeInTheDocument();
    });

    it('does not render HeaderTitle when user is authenticated', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: true });
      mockUsePathname.mockReturnValue('/');

      render(<Header />);

      expect(screen.queryByTestId('header-title')).not.toBeInTheDocument();
    });

    it('renders HomeHeader when user is not authenticated', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: false });
      mockUsePathname.mockReturnValue('/');

      render(<Header />);

      expect(screen.getByTestId('home-header')).toBeInTheDocument();
      expect(screen.queryByTestId('sign-in-header')).not.toBeInTheDocument();
    });

    it('prioritizes onboarding header over authentication state', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: true });
      mockUsePathname.mockReturnValue('/onboarding/install');

      render(<Header />);

      expect(screen.getByTestId('onboarding-header')).toBeInTheDocument();
      expect(screen.queryByTestId('sign-in-header')).not.toBeInTheDocument();
      expect(screen.queryByTestId('home-header')).not.toBeInTheDocument();
    });
  });

  describe('Logo Configuration', () => {
    it('renders logo with noLink=true when on profile step (step 5)', () => {
      mockUsePathname.mockReturnValue('/onboarding/profile');

      render(<Header />);

      const logo = screen.getByTestId('logo');
      expect(logo).toHaveAttribute('data-no-link', 'true');
    });

    it('renders logo with noLink=false when not on profile step', () => {
      mockUsePathname.mockReturnValue('/onboarding/install');

      render(<Header />);

      const logo = screen.getByTestId('logo');
      expect(logo).toHaveAttribute('data-no-link', 'false');
    });
  });

  describe('Logout Path Configuration', () => {
    it('handles logout path correctly', () => {
      mockUsePathname.mockReturnValue('/logout');

      render(<Header />);

      expect(screen.getByTestId('home-header')).toBeInTheDocument();
      expect(screen.getByTestId('logo')).toBeInTheDocument();
      expect(screen.queryByTestId('onboarding-header')).not.toBeInTheDocument();
    });

    it('sets correct step for logout path', () => {
      mockUsePathname.mockReturnValue('/logout');

      render(<Header />);

      // Since logout is not an onboarding path, it should show HomeHeader
      expect(screen.getByTestId('home-header')).toBeInTheDocument();
      expect(screen.queryByTestId('onboarding-header')).not.toBeInTheDocument();
    });
  });

  describe('Path Configuration', () => {
    it('displays correct step for homeserver path', () => {
      mockUsePathname.mockReturnValue('/onboarding/homeserver');

      render(<Header />);

      const onboardingHeader = screen.getByTestId('onboarding-header');
      expect(onboardingHeader).toHaveAttribute('data-step', '4');
      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });

    it('displays correct step for profile path', () => {
      mockUsePathname.mockReturnValue('/onboarding/profile');

      render(<Header />);

      const onboardingHeader = screen.getByTestId('onboarding-header');
      expect(onboardingHeader).toHaveAttribute('data-step', '5');
      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });
  });

  describe('HeaderTitle Display Logic', () => {
    it('renders HeaderTitle when user is not signed in', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: false });
      mockUsePathname.mockReturnValue('/');

      render(<Header />);

      expect(screen.getByTestId('header-title')).toBeInTheDocument();
      expect(screen.getByTestId('header-title')).toHaveTextContent('Sign in');
    });

    it('renders HeaderTitle when on step 5 (profile) even if signed in', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: true });
      mockUsePathname.mockReturnValue('/onboarding/profile');

      render(<Header />);

      expect(screen.getByTestId('header-title')).toBeInTheDocument();
      expect(screen.getByTestId('header-title')).toHaveTextContent('Profile');
    });

    it('does not render HeaderTitle when signed in and not on step 5', () => {
      mockUseProfileStore.mockReturnValue({ isAuthenticated: true });
      mockUsePathname.mockReturnValue('/');

      render(<Header />);

      expect(screen.queryByTestId('header-title')).not.toBeInTheDocument();
    });

    it('renders HeaderTitle with correct title for each onboarding step', () => {
      const testCases = [
        { path: '/onboarding/install', expectedTitle: 'Identity keys' },
        { path: '/onboarding/scan', expectedTitle: 'Use Pubky Ring' },
        { path: '/onboarding/pubky', expectedTitle: 'Your pubky' },
        { path: '/onboarding/backup', expectedTitle: 'Backup' },
        { path: '/onboarding/homeserver', expectedTitle: 'Homeserver' },
        { path: '/onboarding/profile', expectedTitle: 'Profile' },
        { path: '/logout', expectedTitle: 'Signed out' },
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
      mockUsePathname.mockReturnValue('/onboarding/profile');

      render(<Header />);

      const logo = screen.getByTestId('logo');
      expect(logo).toHaveAttribute('data-no-link', 'true');
    });

    it('renders logo with noLink=false on all other steps', () => {
      const nonProfilePaths = [
        '/onboarding/install',
        '/onboarding/scan',
        '/onboarding/pubky',
        '/onboarding/backup',
        '/onboarding/homeserver',
        '/',
        '/logout',
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
      mockUsePathname.mockReturnValue('/onboarding/profile');

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
      mockUsePathname.mockReturnValue('/');

      const { rerender } = render(<Header />);

      expect(screen.getByTestId('home-header')).toBeInTheDocument();

      // Change authentication state
      mockUseProfileStore.mockReturnValue({ isAuthenticated: true });
      rerender(<Header />);

      expect(screen.getByTestId('sign-in-header')).toBeInTheDocument();
      expect(screen.queryByTestId('home-header')).not.toBeInTheDocument();
    });

    it('updates path configuration when pathname changes', () => {
      mockUsePathname.mockReturnValue('/onboarding/install');

      const { rerender } = render(<Header />);

      let onboardingHeader = screen.getByTestId('onboarding-header');
      expect(onboardingHeader).toHaveAttribute('data-step', '1');

      // Change pathname
      mockUsePathname.mockReturnValue('/onboarding/backup');
      rerender(<Header />);

      onboardingHeader = screen.getByTestId('onboarding-header');
      expect(onboardingHeader).toHaveAttribute('data-step', '3');
    });

    it('updates HeaderTitle visibility when authentication state changes', () => {
      mockUsePathname.mockReturnValue('/');
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
      mockUsePathname.mockReturnValue('/');

      const { rerender } = render(<Header />);

      // Should not show HeaderTitle when authenticated and not on step 5
      expect(screen.queryByTestId('header-title')).not.toBeInTheDocument();

      // Move to step 5 (profile)
      mockUsePathname.mockReturnValue('/onboarding/profile');
      rerender(<Header />);

      // Should show HeaderTitle when on step 5, even if authenticated
      expect(screen.getByTestId('header-title')).toBeInTheDocument();
      expect(screen.getByTestId('header-title')).toHaveTextContent('Profile');
    });
  });
});
