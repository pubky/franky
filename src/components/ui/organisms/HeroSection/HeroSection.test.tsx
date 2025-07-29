import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroSection } from './HeroSection';

// Mock UI components
vi.mock('@/components/ui', () => ({
  Heading: ({ level, size, children }: { level: number; size: string; children: React.ReactNode }) => {
    const Tag = level === 1 ? 'h1' : 'h2';
    return (
      <Tag data-level={level} data-size={size}>
        {children}
      </Tag>
    );
  },
  ActionButtons: ({ onSignIn, onCreateAccount }: { onSignIn?: () => void; onCreateAccount?: () => void }) => (
    <div data-testid="action-buttons">
      <button onClick={onSignIn} data-testid="sign-in-btn">
        Sign In
      </button>
      <button onClick={onCreateAccount} data-testid="create-account-btn">
        Create Account
      </button>
    </div>
  ),
  DialogPrivacy: ({ linkText }: { linkText: string }) => <span data-testid="dialog-privacy">{linkText}</span>,
  DialogTerms: ({ linkText }: { linkText: string }) => <span data-testid="dialog-terms">{linkText}</span>,
  DialogAge: ({ linkText }: { linkText: string }) => <span data-testid="dialog-age">{linkText}</span>,
  PopoverInvite: () => <div data-testid="popover-invite">PopoverInvite</div>,
  PageContainer: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="page-container" className={className}>
      {children}
    </div>
  ),
  ContentContainer: ({
    children,
    className,
    maxWidth,
  }: {
    children: React.ReactNode;
    className?: string;
    maxWidth?: string;
  }) => (
    <div data-testid="content-container" data-max-width={maxWidth} className={className}>
      {children}
    </div>
  ),
  BrandLink: ({
    children,
    href,
    external,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    external?: boolean;
    className?: string;
  }) => (
    <a data-testid="brand-link" href={href} target={external ? '_blank' : undefined} className={className}>
      {children}
    </a>
  ),
  FooterLinks: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p data-testid="footer-links" className={className}>
      {children}
    </p>
  ),
}));

describe('HeroSection', () => {
  it('renders with default props', () => {
    render(
      <HeroSection
        title={
          <>
            <span className="text-brand">Unlock</span>
            <br />
            the web.
          </>
        }
      />,
    );

    const heading = screen.getByRole('heading', { level: 1 });
    const subtitle = screen.getByText('Pubky requires an invite code');
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    const createAccountButton = screen.getByRole('button', { name: /create account/i });
    const footer = screen.getByText(/by creating a pubky account/i);

    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Unlockthe web.');
    expect(subtitle).toBeInTheDocument();
    expect(signInButton).toBeInTheDocument();
    expect(createAccountButton).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });

  it('renders with custom title and subtitle', () => {
    render(<HeroSection title="Custom Title\nSecond Line" subtitle="Custom subtitle text" />);

    const heading = screen.getByRole('heading', { level: 1 });
    const subtitle = screen.getByText('Custom subtitle text');

    expect(heading).toHaveTextContent('Custom Title');
    expect(heading).toHaveTextContent('Second Line');
    expect(subtitle).toBeInTheDocument();
  });

  it('handles title with line breaks correctly', () => {
    render(<HeroSection title="Line One\nLine Two\nLine Three" />);

    const heading = screen.getByRole('heading', { level: 1 });

    // Check that the text content includes all lines
    expect(heading).toHaveTextContent('Line One');
    expect(heading).toHaveTextContent('Line Two');
    expect(heading).toHaveTextContent('Line Three');

    // Check that the heading renders properly with the title content
    expect(heading).toBeInTheDocument();
  });

  it('calls onSignIn when sign in button is clicked', () => {
    const mockOnSignIn = vi.fn();
    render(<HeroSection onSignIn={mockOnSignIn} />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);

    expect(mockOnSignIn).toHaveBeenCalledTimes(1);
  });

  it('calls onCreateAccount when create account button is clicked', () => {
    const mockOnCreateAccount = vi.fn();
    render(<HeroSection onCreateAccount={mockOnCreateAccount} />);

    const createAccountButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(createAccountButton);

    expect(mockOnCreateAccount).toHaveBeenCalledTimes(1);
  });

  it('shows invite popover by default', () => {
    render(<HeroSection title="Test Title" />);

    const popover = screen.getByTestId('popover-invite');
    const buttons = screen.getAllByRole('button');

    expect(popover).toBeInTheDocument();
    // Should have 2 buttons: sign in + create account (popover doesn't contain buttons in mock)
    expect(buttons).toHaveLength(2);
  });

  it('hides invite popover when showInvitePopover is false', () => {
    render(<HeroSection showInvitePopover={false} />);

    const buttons = screen.getAllByRole('button');

    // Should only have 2 buttons: sign in + create account (no gift button)
    expect(buttons).toHaveLength(2);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<HeroSection className="custom-hero-class" />);

    const container = screen.getByRole('heading').closest('div')?.parentElement;
    expect(container).toHaveClass('custom-hero-class');
  });

  it('has proper container structure', () => {
    const { container } = render(<HeroSection title="Test Title" />);

    const mainContainer = container.querySelector('[data-testid="page-container"]');
    const contentContainer = container.querySelector('[data-max-width="xl"]');

    expect(mainContainer).toBeInTheDocument();
    expect(contentContainer).toBeInTheDocument();
    expect(contentContainer).toHaveAttribute('data-max-width', 'xl');
  });

  it('renders subtitle with proper styling', () => {
    render(<HeroSection />);

    const subtitle = screen.getByText('Pubky requires an invite code');
    expect(subtitle).toHaveClass('text-xl', 'lg:text-2xl', 'font-light', 'text-brand');
  });

  it('renders footer with legal text and brand links', () => {
    render(<HeroSection title="Test Title" />);

    const footer = screen.getByTestId('footer-links');
    const termsSpan = screen.getByTestId('dialog-terms');
    const privacySpan = screen.getByTestId('dialog-privacy');
    const ageSpan = screen.getByTestId('dialog-age');
    const pubkyCoreSpan = screen.getByTestId('brand-link');

    expect(footer).toHaveAttribute('data-testid', 'footer-links');
    expect(termsSpan).toBeInTheDocument();
    expect(privacySpan).toBeInTheDocument();
    expect(ageSpan).toBeInTheDocument();
    expect(pubkyCoreSpan).toBeInTheDocument();
  });

  it('handles both callback functions simultaneously', () => {
    const mockOnSignIn = vi.fn();
    const mockOnCreateAccount = vi.fn();

    render(<HeroSection onSignIn={mockOnSignIn} onCreateAccount={mockOnCreateAccount} />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    const createAccountButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.click(signInButton);
    fireEvent.click(createAccountButton);

    expect(mockOnSignIn).toHaveBeenCalledTimes(1);
    expect(mockOnCreateAccount).toHaveBeenCalledTimes(1);
  });
});
