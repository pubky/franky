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

  it('renders with custom button text', () => {
    render(<ActionButtons signInText="Log In" createAccountText="Register" />);

    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
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
    expect(createAccountButton).toHaveAttribute('data-testid', 'button-default');

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
