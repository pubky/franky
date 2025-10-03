import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Feed } from './Feed';
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

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(() => null),
}));

// Mock the Core module
vi.mock('@/core', () => ({
  AuthController: {
    logout: vi.fn(),
  },
  useAuthStore: vi.fn(() => ({
    currentUserPubky: null,
  })),
  useOnboardingStore: vi.fn(() => ({
    secretKey: '',
  })),
  PostController: {
    fetch: vi.fn(() => Promise.resolve([])),
  },
  db: {
    user_details: {
      get: vi.fn(() => Promise.resolve(null)),
    },
  },
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
  DialogWelcome: () => <div data-testid="dialog-welcome">Mocked DialogWelcome</div>,
  AlertBackup: () => <div data-testid="alert-backup">Mocked AlertBackup</div>,
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  Post: () => <div data-testid="post">Mocked Post</div>,
  ContentLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="content-layout">{children}</div>,
}));

// Mock hooks
vi.mock('@/hooks', () => ({
  useInfiniteScroll: vi.fn(() => ({
    sentinelRef: { current: null },
  })),
}));

describe('Feed', () => {
  let mockLogout: jest.MockedFunction<() => void>;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Get the mocked AuthController
    const { AuthController } = await import('@/core');
    mockLogout = AuthController.logout as jest.MockedFunction<() => void>;
  });

  it('renders without errors', () => {
    render(<Feed />);
    expect(screen.getByText('Feed')).toBeInTheDocument();
  });

  it('displays the Feed heading correctly', () => {
    render(<Feed />);
    const heading = screen.getByText('Feed');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute('data-level', '1');
    expect(heading).toHaveAttribute('data-size', 'xl');
    expect(heading).toHaveClass('text-2xl');
  });

  it('displays welcome message', () => {
    render(<Feed />);
    expect(
      screen.getByText("Welcome to your feed. This is where you'll see posts from people you follow."),
    ).toBeInTheDocument();
  });

  it('renders logout button with correct props', () => {
    render(<Feed />);
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveAttribute('data-variant', 'secondary');
    expect(logoutButton).toHaveAttribute('data-size', 'lg');
    expect(logoutButton).toHaveAttribute('id', 'feed-logout-btn');
    expect(logoutButton).toHaveClass('mt-6');
  });

  it('navigates to logout page when logout button is clicked', async () => {
    const { useRouter } = await import('next/navigation');
    const mockPush = vi.fn();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });

    render(<Feed />);
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockPush).toHaveBeenCalledWith(App.AUTH_ROUTES.LOGOUT);
    expect(mockLogout).not.toHaveBeenCalled(); // Should not logout immediately
  });

  it('renders container structure correctly', () => {
    render(<Feed />);
    expect(screen.getByTestId('content-layout')).toBeInTheDocument();
  });

  it('renders 5 placeholder cards', () => {
    render(<Feed />);
    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(5);
  });

  it('applies correct styling to cards', () => {
    render(<Feed />);
    const cards = screen.getAllByTestId('card');
    cards.forEach((card) => {
      expect(card).toHaveClass('p-6');
    });
  });
});
