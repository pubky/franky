import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ButtonSignIn } from './ButtonSignIn';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
  Button: ({ children, variant, onClick }: { children: React.ReactNode; variant?: string; onClick?: () => void }) => (
    <button data-testid={`button-${variant || 'default'}`} onClick={onClick}>
      {children}
    </button>
  ),
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  LogIn: ({ className }: { className?: string }) => (
    <div data-testid="login-icon" className={className}>
      LogIn
    </div>
  ),
}));

describe('ButtonSignIn', () => {
  it('renders with default props', () => {
    render(<ButtonSignIn />);

    const button = screen.getByTestId('button-secondary');
    const icon = screen.getByTestId('login-icon');

    expect(button).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('handles click events', () => {
    render(<ButtonSignIn />);

    const button = screen.getByTestId('button-secondary');

    // Just verify the button is clickable and doesn't throw errors
    expect(() => fireEvent.click(button)).not.toThrow();
    expect(button).toBeInTheDocument();
  });

  it('renders button with correct variant', () => {
    render(<ButtonSignIn />);

    const button = screen.getByTestId('button-secondary');
    expect(button).toBeInTheDocument();
  });

  it('renders icon with correct classes', () => {
    render(<ButtonSignIn />);

    const icon = screen.getByTestId('login-icon');
    expect(icon).toHaveClass('mr-2', 'h-4', 'w-4');
  });

  it('maintains proper structure', () => {
    render(<ButtonSignIn />);

    const button = screen.getByTestId('button-secondary');
    const icon = screen.getByTestId('login-icon');
    const text = screen.getByText('Sign in');

    expect(button).toContainElement(icon);
    expect(button).toContainElement(text);
  });
});
