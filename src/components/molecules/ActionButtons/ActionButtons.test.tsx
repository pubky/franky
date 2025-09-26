import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionButtons } from './ActionButtons';

// Mock @/libs to intercept Libs.LogIn and Libs.UserRoundPlus
vi.mock('@/libs', () => ({
  LogIn: ({ className }: { className?: string }) => (
    <div data-testid="login-icon" className={className}>
      LogIn
    </div>
  ),
  UserRoundPlus: ({ className }: { className?: string }) => (
    <div data-testid="user-plus-icon" className={className}>
      UserRoundPlus
    </div>
  ),
  Radio: ({ className }: { className?: string }) => (
    <div data-testid="radio-icon" className={className}>
      Radio
    </div>
  ),
  UsersRound2: ({ className }: { className?: string }) => (
    <div data-testid="users-round2-icon" className={className}>
      UsersRound2
    </div>
  ),
  HeartHandshake: ({ className }: { className?: string }) => (
    <div data-testid="heart-handshake-icon" className={className}>
      HeartHandshake
    </div>
  ),
  UserRound: ({ className }: { className?: string }) => (
    <div data-testid="user-round-icon" className={className}>
      UserRound
    </div>
  ),
  SquareAsterisk: ({ className }: { className?: string }) => (
    <div data-testid="square-asterisk-icon" className={className}>
      SquareAsterisk
    </div>
  ),
  Flame: ({ className }: { className?: string }) => (
    <div data-testid="flame-icon" className={className}>
      Flame
    </div>
  ),
  Columns3: ({ className }: { className?: string }) => (
    <div data-testid="columns3-icon" className={className}>
      Columns3
    </div>
  ),
  Menu: ({ className }: { className?: string }) => (
    <div data-testid="menu-icon" className={className}>
      Menu
    </div>
  ),
  LayoutGrid: ({ className }: { className?: string }) => (
    <div data-testid="layout-grid-icon" className={className}>
      LayoutGrid
    </div>
  ),
  Layers: ({ className }: { className?: string }) => (
    <div data-testid="layers-icon" className={className}>
      Layers
    </div>
  ),
  StickyNote: ({ className }: { className?: string }) => (
    <div data-testid="sticky-note-icon" className={className}>
      StickyNote
    </div>
  ),
  Newspaper: ({ className }: { className?: string }) => (
    <div data-testid="newspaper-icon" className={className}>
      Newspaper
    </div>
  ),
  Image: ({ className }: { className?: string }) => (
    <div data-testid="image-icon" className={className}>
      Image
    </div>
  ),
  CirclePlay: ({ className }: { className?: string }) => (
    <div data-testid="circle-play-icon" className={className}>
      CirclePlay
    </div>
  ),
  Link: ({ className }: { className?: string }) => (
    <div data-testid="link-icon" className={className}>
      Link
    </div>
  ),
  Download: ({ className }: { className?: string }) => (
    <div data-testid="download-icon" className={className}>
      Download
    </div>
  ),
  cn: (...inputs: (string | undefined | null | false)[]) => inputs.filter(Boolean).join(' '),
}));

describe('ActionButtons', () => {
  it('renders both buttons with default text', () => {
    render(<ActionButtons />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    const createAccountButton = screen.getByRole('button', { name: /create account/i });

    expect(signInButton).toBeInTheDocument();
    expect(createAccountButton).toBeInTheDocument();

    // Check icons are present
    expect(screen.getByTestId('login-icon')).toBeInTheDocument();
    expect(screen.getByTestId('user-plus-icon')).toBeInTheDocument();
  });

  it('calls onSignIn when sign in button is clicked', () => {
    const mockOnSignIn = vi.fn();
    render(<ActionButtons onSignIn={mockOnSignIn} />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);

    expect(mockOnSignIn).toHaveBeenCalledTimes(1);
  });

  it('calls onCreateAccount when create account button is clicked', () => {
    const mockOnCreateAccount = vi.fn();
    render(<ActionButtons onCreateAccount={mockOnCreateAccount} />);

    const createAccountButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(createAccountButton);

    expect(mockOnCreateAccount).toHaveBeenCalledTimes(1);
  });

  it('applies default className structure', () => {
    render(<ActionButtons />);

    const container = screen.getByRole('button', { name: /sign in/i }).parentElement;
    expect(container).toHaveClass('mx-auto', 'w-full', 'flex', 'gap-3', 'flex-row', 'sm:items-center');
  });

  it('applies custom className', () => {
    render(<ActionButtons className="custom-action-buttons" />);

    const container = screen.getByRole('button', { name: /sign in/i }).parentElement;
    expect(container).toHaveClass('custom-action-buttons');
  });

  it('has proper button variants and sizes', () => {
    render(<ActionButtons />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    const createAccountButton = screen.getByRole('button', { name: /create account/i });

    // Sign in button should be secondary variant
    expect(signInButton).toHaveAttribute('data-variant', 'secondary');

    // Create account button should be primary (default) variant - no explicit variant means default
    expect(createAccountButton).not.toHaveAttribute('data-variant');

    // Both buttons should have proper size classes
    expect(signInButton).toHaveClass('h-10');
    expect(createAccountButton).toHaveClass('h-10');
  });

  it('renders icons with proper classes', () => {
    render(<ActionButtons />);

    const loginIcon = screen.getByTestId('login-icon');
    const userPlusIcon = screen.getByTestId('user-plus-icon');

    expect(loginIcon).toHaveClass('mr-2', 'h-4', 'w-4');
    expect(userPlusIcon).toHaveClass('mr-2', 'h-4', 'w-4');
  });

  it('handles both callbacks simultaneously', () => {
    const mockOnSignIn = vi.fn();
    const mockOnCreateAccount = vi.fn();

    render(<ActionButtons onSignIn={mockOnSignIn} onCreateAccount={mockOnCreateAccount} />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    const createAccountButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.click(signInButton);
    fireEvent.click(createAccountButton);

    expect(mockOnSignIn).toHaveBeenCalledTimes(1);
    expect(mockOnCreateAccount).toHaveBeenCalledTimes(1);
  });
});

describe('ActionButtons - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<ActionButtons />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom text', () => {
    const { container } = render(<ActionButtons signInText="Log In" createAccountText="Register" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<ActionButtons className="custom-action-buttons" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with both callbacks', () => {
    const mockOnSignIn = vi.fn();
    const mockOnCreateAccount = vi.fn();

    const { container } = render(<ActionButtons onSignIn={mockOnSignIn} onCreateAccount={mockOnCreateAccount} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with sign in callback only', () => {
    const mockOnSignIn = vi.fn();

    const { container } = render(<ActionButtons onSignIn={mockOnSignIn} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with create account callback only', () => {
    const mockOnCreateAccount = vi.fn();

    const { container } = render(<ActionButtons onCreateAccount={mockOnCreateAccount} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
