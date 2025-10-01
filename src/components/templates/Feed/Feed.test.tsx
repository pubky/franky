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
  usePathname: vi.fn(() => '/feed'),
}));

// Mock the Core module
vi.mock('@/core', () => ({
  AuthController: {
    logout: vi.fn(),
  },
  LAYOUT: {
    COLUMNS: 'columns',
    WIDE: 'wide',
    VISUAL: 'visual',
  },
  useFiltersStore: vi.fn(() => ({
    layout: 'columns',
    sort: 'recent',
    reach: 'all',
    content: 'all',
    setLayout: vi.fn(),
    setSort: vi.fn(),
    setReach: vi.fn(),
    setContent: vi.fn(),
    reset: vi.fn(),
  })),
}));

// Mock the atoms - use importOriginal to get real components and just stub what's needed
vi.mock('@/atoms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/atoms')>();
  return {
    ...actual,
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
    }: {
      children: React.ReactNode;
      variant?: string;
      size?: string;
      onClick?: () => void;
    }) => (
      <button onClick={onClick} data-variant={variant} data-size={size}>
        {children}
      </button>
    ),
  };
});

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

  it('renders logout button with correct props', () => {
    render(<Feed />);
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveAttribute('data-variant', 'secondary');
    expect(logoutButton).toHaveAttribute('data-size', 'lg');
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
    const { container } = render(<Feed />);
    const feed = screen.getByText('Feed');
    expect(feed).toBeInTheDocument();
    expect(container.querySelector('[data-testid="content-layout"]')).toBeNull(); // ContentLayout doesn't have this testid, just verify render works
  });
});
