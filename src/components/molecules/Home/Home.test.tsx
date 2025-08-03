import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomeActions, HomeFooter, HomeSectionTitle, HomePageHeading } from './Home';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock console.log
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

// Mock molecules
vi.mock('@/molecules', () => ({
  ActionButtons: ({ onSignIn, onCreateAccount }: { onSignIn: () => void; onCreateAccount: () => void }) => (
    <div data-testid="action-buttons">
      <button data-testid="sign-in-button" onClick={onSignIn}>
        Sign In
      </button>
      <button data-testid="create-account-button" onClick={onCreateAccount}>
        Create Account
      </button>
    </div>
  ),
  DialogTerms: ({ linkText }: { linkText: string }) => <button data-testid="dialog-terms">{linkText}</button>,
  DialogPrivacy: ({ linkText }: { linkText: string }) => <button data-testid="dialog-privacy">{linkText}</button>,
  DialogAge: ({ linkText }: { linkText: string }) => <button data-testid="dialog-age">{linkText}</button>,
  PopoverInvite: () => <div data-testid="popover-invite">Invite Popover</div>,
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  FooterLinks: ({ children }: { children: React.ReactNode }) => <div data-testid="footer-links">{children}</div>,
  Link: ({ children, href, target }: { children: React.ReactNode; href: string; target?: string }) => (
    <a data-testid="link" href={href} target={target}>
      {children}
    </a>
  ),
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Typography: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <p data-testid="typography" data-size={size} className={className}>
      {children}
    </p>
  ),
  Heading: ({ children, level, size }: { children: React.ReactNode; level: number; size?: string }) => (
    <div data-testid={`heading-${level}`} data-size={size}>
      {children}
    </div>
  ),
}));

describe('HomeActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders action buttons', () => {
    render(<HomeActions />);

    expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
    expect(screen.getByTestId('create-account-button')).toBeInTheDocument();
  });

  it('handles create account button click', () => {
    render(<HomeActions />);

    const createAccountButton = screen.getByTestId('create-account-button');
    fireEvent.click(createAccountButton);

    expect(mockPush).toHaveBeenCalledWith('/onboarding/install');
  });

  it('handles sign in button click', () => {
    render(<HomeActions />);

    const signInButton = screen.getByTestId('sign-in-button');
    fireEvent.click(signInButton);

    expect(mockConsoleLog).toHaveBeenCalledWith('Sign in clicked');
  });
});

describe('HomeFooter', () => {
  it('renders footer with all components', () => {
    render(<HomeFooter />);

    expect(screen.getByTestId('footer-links')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-terms')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-privacy')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-age')).toBeInTheDocument();
    expect(screen.getByTestId('link')).toBeInTheDocument();
  });

  it('renders dialog components with correct link text', () => {
    render(<HomeFooter />);

    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('over 18 years old.')).toBeInTheDocument();
  });

  it('renders Pubky Core link with correct attributes', () => {
    render(<HomeFooter />);

    const link = screen.getByTestId('link');
    expect(link).toHaveAttribute('href', 'https://pubky.org/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveTextContent('Pubky Core');
  });

  it('contains copyright text', () => {
    render(<HomeFooter />);

    expect(screen.getByText(/Synonym Software Ltd. ©2025/)).toBeInTheDocument();
  });
});

describe('HomeSectionTitle', () => {
  it('renders section title with typography and popover', () => {
    render(<HomeSectionTitle />);

    expect(screen.getByTestId('container')).toBeInTheDocument();
    expect(screen.getByTestId('typography')).toBeInTheDocument();
    expect(screen.getByTestId('popover-invite')).toBeInTheDocument();
  });

  it('displays correct title text', () => {
    render(<HomeSectionTitle />);

    expect(screen.getByText('Pubky requires an invite code')).toBeInTheDocument();
  });

  it('has correct typography size and styling', () => {
    render(<HomeSectionTitle />);

    const typography = screen.getByTestId('typography');
    expect(typography).toHaveAttribute('data-size', 'lg');
    expect(typography.className).toContain('text-brand font-light');
  });

  it('has correct container layout', () => {
    render(<HomeSectionTitle />);

    const container = screen.getByTestId('container');
    expect(container.className).toContain('flex-row items-start gap-2');
  });
});

describe('HomePageHeading', () => {
  it('renders heading with correct text', () => {
    render(<HomePageHeading />);

    expect(screen.getByTestId('heading-1')).toBeInTheDocument();
    expect(screen.getByTestId('heading-1')).toHaveTextContent('Unlock the web.');
  });

  it('has correct heading level and size', () => {
    render(<HomePageHeading />);

    const heading = screen.getByTestId('heading-1');
    expect(heading).toHaveAttribute('data-size', '2xl');
  });

  it('renders consistently', () => {
    const { rerender } = render(<HomePageHeading />);
    expect(screen.getByTestId('heading-1')).toHaveTextContent('Unlock the web.');

    rerender(<HomePageHeading />);
    expect(screen.getByTestId('heading-1')).toHaveTextContent('Unlock the web.');
  });
});
