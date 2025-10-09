import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Settings } from './Settings';
import * as App from '@/app';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Mock the atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  Heading: ({
    children,
    level,
    size,
    className,
  }: {
    children: React.ReactNode;
    level?: number;
    size?: string;
    className?: string;
  }) => (
    <h1 data-level={level} data-size={size} className={className}>
      {children}
    </h1>
  ),
  Button: ({
    children,
    variant,
    size,
    onClick,
    id,
    className,
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
    onClick?: () => void;
    id?: string;
    className?: string;
  }) => (
    <button onClick={onClick} data-variant={variant} data-size={size} id={id} className={className}>
      {children}
    </button>
  ),
  Typography: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <span data-size={size} className={className}>
      {children}
    </span>
  ),
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  ContentLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="content-layout">{children}</div>,
}));

describe('Settings', () => {
  it('renders without errors', () => {
    render(<Settings />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('displays the Settings heading correctly', () => {
    render(<Settings />);
    const heading = screen.getByText('Settings');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute('data-level', '1');
    expect(heading).toHaveAttribute('data-size', 'xl');
    expect(heading).toHaveClass('text-2xl');
  });

  it('displays description message', () => {
    render(<Settings />);
    expect(screen.getByText('Manage your account preferences and application settings.')).toBeInTheDocument();
  });

  it('renders logout button with correct props', () => {
    render(<Settings />);
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveAttribute('data-variant', 'secondary');
    expect(logoutButton).toHaveAttribute('data-size', 'default');
    expect(logoutButton).toHaveAttribute('id', 'settings-logout-btn');
  });

  it('navigates to logout page when logout button is clicked', async () => {
    const { useRouter } = await import('next/navigation');
    const mockPush = vi.fn();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });

    render(<Settings />);
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockPush).toHaveBeenCalledWith(App.AUTH_ROUTES.LOGOUT);
  });

  it('renders container structure correctly', () => {
    render(<Settings />);
    expect(screen.getByTestId('content-layout')).toBeInTheDocument();
  });

  it('renders 3 content cards', () => {
    render(<Settings />);
    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(3);
  });
});
