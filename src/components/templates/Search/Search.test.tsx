import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Search } from './Search';
import * as App from '@/app';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
}));

// Mock the atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className, size }: { children: React.ReactNode; className?: string; size?: string }) => (
    <div className={className} data-size={size}>
      {children}
    </div>
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

// Mock the molecules
vi.mock('@/molecules', () => ({
  DialogWelcome: ({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) =>
    isOpen ? (
      <div data-testid="dialog-welcome" onClick={() => onOpenChange(false)}>
        Mocked DialogWelcome
      </div>
    ) : null,
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  ContentLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="content-layout">{children}</div>,
}));

describe('Search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    render(<Search />);
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('displays the Search heading correctly', () => {
    render(<Search />);
    const heading = screen.getByText('Search');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute('data-level', '1');
    expect(heading).toHaveAttribute('data-size', 'xl');
    expect(heading).toHaveClass('text-2xl');
  });

  it('displays welcome message', () => {
    render(<Search />);
    expect(screen.getByText('Welcome to the Search page. Search for posts, users, and tags.')).toBeInTheDocument();
  });

  it('renders logout button with correct props', () => {
    render(<Search />);
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveAttribute('data-variant', 'secondary');
    expect(logoutButton).toHaveAttribute('data-size', 'default');
    expect(logoutButton).toHaveAttribute('id', 'search-logout-btn');
  });

  it('navigates to logout page when logout button is clicked', async () => {
    const { useRouter } = await import('next/navigation');
    const mockPush = vi.fn();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });

    render(<Search />);
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockPush).toHaveBeenCalledWith(App.AUTH_ROUTES.LOGOUT);
  });

  it('renders container structure correctly', () => {
    render(<Search />);
    expect(screen.getByTestId('content-layout')).toBeInTheDocument();
  });

  it('renders 3 placeholder cards', () => {
    render(<Search />);
    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(3);
  });

  it('applies correct styling to cards', () => {
    render(<Search />);
    const cards = screen.getAllByTestId('card');
    cards.forEach((card) => {
      expect(card).toHaveClass('p-6');
    });
  });
});
