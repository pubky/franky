import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomeActions, HomeFooter, HomeSectionTitle, HomePageHeading } from './Home';
import * as App from '@/app';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

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
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  DialogTerms: () => <button data-testid="dialog-terms">Terms of Service</button>,
  DialogPrivacy: () => <button data-testid="dialog-privacy">Privacy Policy</button>,
  DialogAge: () => <button data-testid="dialog-age">over 18 years old.</button>,
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

    expect(mockPush).toHaveBeenCalledWith(App.ONBOARDING_ROUTES.HUMAN);
  });

  it('handles sign in button click', () => {
    render(<HomeActions />);

    const signInButton = screen.getByTestId('sign-in-button');
    fireEvent.click(signInButton);

    expect(mockPush).toHaveBeenCalledWith(App.AUTH_ROUTES.SIGN_IN);
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
    expect(screen.getByText(/Synonym Software Ltd. ©2025/)).toBeInTheDocument();
  });
});

describe('HomeSectionTitle', () => {
  it('renders section title with typography', () => {
    render(<HomeSectionTitle />);

    expect(screen.getByTestId('container')).toBeInTheDocument();
    expect(screen.getByTestId('typography')).toBeInTheDocument();
  });
});

describe('HomePageHeading', () => {
  it('renders heading with correct text', () => {
    render(<HomePageHeading />);

    expect(screen.getByTestId('heading-1')).toBeInTheDocument();
  });
});

describe('Home - Snapshots', () => {
  it('matches snapshot for HomeActions with default props', () => {
    const { container } = render(<HomeActions />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for HomeFooter with default props', () => {
    const { container } = render(<HomeFooter />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for HomeSectionTitle with default props', () => {
    const { container } = render(<HomeSectionTitle />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for HomePageHeading with default props', () => {
    const { container } = render(<HomePageHeading />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
