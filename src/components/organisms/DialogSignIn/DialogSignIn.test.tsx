import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DialogSignIn } from './DialogSignIn';

const mockShowSignInDialog = vi.hoisted(() => ({ value: false }));
const mockSetShowSignInDialog = vi.hoisted(() => vi.fn());

// Mock @/core
vi.mock('@/core', () => ({
  useAuthStore: (
    selector: (state: { showSignInDialog: boolean; setShowSignInDialog: typeof mockSetShowSignInDialog }) => unknown,
  ) => selector({ showSignInDialog: mockShowSignInDialog.value, setShowSignInDialog: mockSetShowSignInDialog }),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, onClick }: { children: React.ReactNode; href: string; onClick?: () => void }) => (
    <a data-testid={`link-${href.replace(/\//g, '-')}`} href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

// Mock icons
vi.mock('@/libs/icons', () => ({
  UserPlus: ({ className }: { className?: string }) => <span data-testid="user-plus-icon" className={className} />,
  KeyRound: ({ className }: { className?: string }) => <span data-testid="key-round-icon" className={className} />,
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Dialog: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div data-testid="dialog" data-open={open} onClick={() => onOpenChange?.(false)}>
      {open ? children : null}
    </div>
  ),
  DialogContent: ({
    children,
    className,
    hiddenTitle,
  }: {
    children: React.ReactNode;
    className?: string;
    hiddenTitle?: string;
  }) => (
    <div data-testid="dialog-content" className={className} data-hidden-title={hiddenTitle}>
      {children}
    </div>
  ),
  DialogHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-header" className={className}>
      {children}
    </div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="dialog-description">{children}</p>
  ),
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Typography: ({
    children,
    className,
    as: Tag = 'p',
    size,
  }: {
    children: React.ReactNode;
    as?: React.ElementType;
    className?: string;
    size?: string;
  }) => (
    <Tag data-testid="typography" data-size={size} className={className}>
      {children}
    </Tag>
  ),
  Button: ({
    children,
    variant,
    className,
    asChild,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
    asChild?: boolean;
  }) =>
    asChild ? (
      <>{children}</>
    ) : (
      <button data-testid={`button-${variant || 'default'}`} data-variant={variant} className={className}>
        {children}
      </button>
    ),
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));

describe('DialogSignIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockShowSignInDialog.value = false;
  });

  describe('rendering', () => {
    it('renders nothing when store has showSignInDialog=false', () => {
      mockShowSignInDialog.value = false;
      render(<DialogSignIn />);

      expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument();
    });

    it('renders dialog content when store has showSignInDialog=true', () => {
      mockShowSignInDialog.value = true;
      render(<DialogSignIn />);

      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Join Pubky');
      expect(screen.getByTestId('dialog-description')).toHaveTextContent(
        'Sign in or create an account to interact with posts and profiles.',
      );
    });

    it('renders two cards for join and sign in options', () => {
      mockShowSignInDialog.value = true;
      render(<DialogSignIn />);

      const cards = screen.getAllByTestId('card');
      expect(cards).toHaveLength(2);
    });

    it('renders Join Pubky link pointing to root', () => {
      mockShowSignInDialog.value = true;
      render(<DialogSignIn />);

      const joinLink = screen.getByTestId('link--');
      expect(joinLink).toHaveAttribute('href', '/');
      expect(joinLink).toHaveTextContent('Join Pubky');
    });

    it('renders Sign In link pointing to /sign-in', () => {
      mockShowSignInDialog.value = true;
      render(<DialogSignIn />);

      const signInLink = screen.getByTestId('link--sign-in');
      expect(signInLink).toHaveAttribute('href', '/sign-in');
      expect(signInLink).toHaveTextContent('Sign In');
    });

    it('renders UserPlus and KeyRound icons', () => {
      mockShowSignInDialog.value = true;
      render(<DialogSignIn />);

      expect(screen.getAllByTestId('user-plus-icon')).toHaveLength(2); // One in text, one in button
      expect(screen.getAllByTestId('key-round-icon')).toHaveLength(2); // One in text, one in button
    });
  });

  describe('interactions', () => {
    it('calls setShowSignInDialog(false) when Join Pubky link is clicked', () => {
      mockShowSignInDialog.value = true;
      render(<DialogSignIn />);

      const joinLink = screen.getByTestId('link--');
      fireEvent.click(joinLink);

      expect(mockSetShowSignInDialog).toHaveBeenCalledWith(false);
    });

    it('calls setShowSignInDialog(false) when Sign In link is clicked', () => {
      mockShowSignInDialog.value = true;
      render(<DialogSignIn />);

      const signInLink = screen.getByTestId('link--sign-in');
      fireEvent.click(signInLink);

      expect(mockSetShowSignInDialog).toHaveBeenCalledWith(false);
    });
  });

  describe('accessibility', () => {
    it('has a visible title for screen readers', () => {
      mockShowSignInDialog.value = true;
      render(<DialogSignIn />);

      // The DialogTitle provides accessibility for screen readers
      const dialogTitle = screen.getByTestId('dialog-title');
      expect(dialogTitle).toBeInTheDocument();
      expect(dialogTitle).toHaveTextContent('Join Pubky');
    });
  });
});

describe('DialogSignIn - Snapshots', () => {
  it('matches snapshot when open', () => {
    mockShowSignInDialog.value = true;
    const { container } = render(<DialogSignIn />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when closed', () => {
    mockShowSignInDialog.value = false;
    const { container } = render(<DialogSignIn />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
