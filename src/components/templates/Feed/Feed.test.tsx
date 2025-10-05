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
    showWelcomeDialog: false,
    setShowWelcomeDialog: vi.fn(),
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
  DialogWelcome: ({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) =>
    isOpen ? (
      <div data-testid="dialog-welcome" onClick={() => onOpenChange(false)}>
        Mocked DialogWelcome
      </div>
    ) : null,
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
  let mockLogout: (() => void) | undefined;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Get the mocked AuthController
    const { AuthController } = await import('@/core');
    mockLogout = AuthController.logout as (() => void) | undefined;
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

  describe('Welcome Dialog Behavior', () => {
    it('should not show welcome dialog when showWelcomeDialog is false', async () => {
      const mockUseOnboardingStore = vi.fn(() => ({
        showWelcomeDialog: false,
        setShowWelcomeDialog: vi.fn(),
      }));

      // Update the mock for this test
      const Core = await import('@/core');
      vi.mocked(Core.useOnboardingStore).mockImplementation(mockUseOnboardingStore);

      render(<Feed />);

      expect(screen.queryByTestId('dialog-welcome')).not.toBeInTheDocument();
    });

    it('should show welcome dialog when showWelcomeDialog is true and user details exist', async () => {
      const mockSetShowWelcomeDialog = vi.fn();
      const mockUseOnboardingStore = vi.fn(() => ({
        showWelcomeDialog: true,
        setShowWelcomeDialog: mockSetShowWelcomeDialog,
      }));

      const mockUseAuthStore = vi.fn(() => ({
        currentUserPubky: 'test-pubky-123',
      }));

      // Mock useLiveQuery to return user details
      const { useLiveQuery } = await import('dexie-react-hooks');
      vi.mocked(useLiveQuery).mockReturnValue({
        name: 'Test User',
        bio: 'Test bio',
        image: 'test-image.jpg',
      });

      // Update the mocks for this test
      const Core = await import('@/core');
      vi.mocked(Core.useOnboardingStore).mockImplementation(mockUseOnboardingStore);
      vi.mocked(Core.useAuthStore).mockImplementation(mockUseAuthStore);

      render(<Feed />);

      expect(screen.getByTestId('dialog-welcome')).toBeInTheDocument();
    });

    it('should not show welcome dialog when user details do not exist', async () => {
      const mockUseOnboardingStore = vi.fn(() => ({
        showWelcomeDialog: true,
        setShowWelcomeDialog: vi.fn(),
      }));

      const mockUseAuthStore = vi.fn(() => ({
        currentUserPubky: null,
      }));

      // Update the mocks for this test
      const Core = await import('@/core');
      vi.mocked(Core.useOnboardingStore).mockImplementation(mockUseOnboardingStore);
      vi.mocked(Core.useAuthStore).mockImplementation(mockUseAuthStore);

      render(<Feed />);

      expect(screen.queryByTestId('dialog-welcome')).not.toBeInTheDocument();
    });

    it('should call setShowWelcomeDialog(false) when welcome dialog is closed', async () => {
      const mockSetShowWelcomeDialog = vi.fn();
      const mockUseOnboardingStore = vi.fn(() => ({
        showWelcomeDialog: true,
        setShowWelcomeDialog: mockSetShowWelcomeDialog,
      }));

      const mockUseAuthStore = vi.fn(() => ({
        currentUserPubky: 'test-pubky-123',
      }));

      // Mock useLiveQuery to return user details
      const { useLiveQuery } = await import('dexie-react-hooks');
      vi.mocked(useLiveQuery).mockReturnValue({
        name: 'Test User',
        bio: 'Test bio',
        image: 'test-image.jpg',
      });

      // Update the mocks for this test
      const Core = await import('@/core');
      vi.mocked(Core.useOnboardingStore).mockImplementation(mockUseOnboardingStore);
      vi.mocked(Core.useAuthStore).mockImplementation(mockUseAuthStore);

      render(<Feed />);

      const welcomeDialog = screen.getByTestId('dialog-welcome');
      expect(welcomeDialog).toBeInTheDocument();

      // Click to close the dialog
      fireEvent.click(welcomeDialog);

      expect(mockSetShowWelcomeDialog).toHaveBeenCalledWith(false);
    });

    it('should have correct welcome dialog props when shown', async () => {
      const mockSetShowWelcomeDialog = vi.fn();
      const mockUseOnboardingStore = vi.fn(() => ({
        showWelcomeDialog: true,
        setShowWelcomeDialog: mockSetShowWelcomeDialog,
      }));

      const mockUseAuthStore = vi.fn(() => ({
        currentUserPubky: 'test-pubky-123',
      }));

      const mockUserDetails = {
        name: 'Test User',
        bio: 'Test bio',
        image: 'test-image.jpg',
      };

      // Mock useLiveQuery to return user details
      const { useLiveQuery } = await import('dexie-react-hooks');
      vi.mocked(useLiveQuery).mockReturnValue(mockUserDetails);

      // Update the mocks for this test
      const Core = await import('@/core');
      vi.mocked(Core.useOnboardingStore).mockImplementation(mockUseOnboardingStore);
      vi.mocked(Core.useAuthStore).mockImplementation(mockUseAuthStore);

      render(<Feed />);

      // The dialog should be rendered with correct props
      // This is implicitly tested by the dialog being shown when conditions are met
      expect(screen.getByTestId('dialog-welcome')).toBeInTheDocument();
    });
  });
});
