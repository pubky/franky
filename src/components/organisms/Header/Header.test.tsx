import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

// Mock Next.js navigation
const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  HeaderContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="header-container">{children}</div>
  ),
  Logo: () => <div data-testid="logo">Logo</div>,
  HeaderTitle: ({ currentTitle }: { currentTitle: string }) => <div data-testid="header-title">{currentTitle}</div>,
  OnboardingHeader: ({ currentStep }: { currentStep: number }) => (
    <div data-testid="onboarding-header" data-step={currentStep}>
      Onboarding Step {currentStep}
    </div>
  ),
  HomeHeader: () => <div data-testid="home-header">Home Header</div>,
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header container with logo and title', () => {
    mockUsePathname.mockReturnValue('/');

    render(<Header />);

    expect(screen.getByTestId('header-container')).toBeInTheDocument();
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByTestId('header-title')).toBeInTheDocument();
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

  it('displays correct title for install step', () => {
    mockUsePathname.mockReturnValue('/onboarding/install');

    render(<Header />);

    expect(screen.getByText('Identity keys')).toBeInTheDocument();

    const onboardingHeader = screen.getByTestId('onboarding-header');
    expect(onboardingHeader).toHaveAttribute('data-step', '1');
  });

  it('displays correct title for scan step', () => {
    mockUsePathname.mockReturnValue('/onboarding/scan');

    render(<Header />);

    expect(screen.getByText('Use Pubky Ring')).toBeInTheDocument();

    const onboardingHeader = screen.getByTestId('onboarding-header');
    expect(onboardingHeader).toHaveAttribute('data-step', '2');
  });

  it('displays correct title for pubky step', () => {
    mockUsePathname.mockReturnValue('/onboarding/pubky');

    render(<Header />);

    expect(screen.getByText('Your pubky')).toBeInTheDocument();

    const onboardingHeader = screen.getByTestId('onboarding-header');
    expect(onboardingHeader).toHaveAttribute('data-step', '2');
  });

  it('displays correct title for backup step', () => {
    mockUsePathname.mockReturnValue('/onboarding/backup');

    render(<Header />);

    expect(screen.getByText('Backup')).toBeInTheDocument();

    const onboardingHeader = screen.getByTestId('onboarding-header');
    expect(onboardingHeader).toHaveAttribute('data-step', '3');
  });

  it('handles unknown paths with default values', () => {
    mockUsePathname.mockReturnValue('/unknown-path');

    render(<Header />);

    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByTestId('home-header')).toBeInTheDocument();
  });

  it('updates when pathname changes', () => {
    mockUsePathname.mockReturnValue('/onboarding/install');

    const { rerender } = render(<Header />);

    expect(screen.getByText('Identity keys')).toBeInTheDocument();
    expect(screen.getByTestId('onboarding-header')).toBeInTheDocument();

    // Change pathname
    mockUsePathname.mockReturnValue('/');
    rerender(<Header />);

    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByTestId('home-header')).toBeInTheDocument();
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
});
