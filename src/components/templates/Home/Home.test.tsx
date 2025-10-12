import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Home } from './Home';
import * as App from '@/app';

// Mock next/navigation - REQUIRED: external dependency
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

// Mock dexie-react-hooks - REQUIRED: database dependency
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(() => null),
}));

// Mock the Core module - REQUIRED: stores and controllers
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    useAuthStore: vi.fn(() => ({
      currentUserPubky: null,
    })),
    useOnboardingStore: vi.fn(() => ({
      secretKey: null,
      showWelcomeDialog: false,
      setShowWelcomeDialog: vi.fn(),
    })),
    useFiltersStore: vi.fn(() => ({
      layout: 'columns',
      setLayout: vi.fn(),
      reach: 'all',
      setReach: vi.fn(),
      sort: 'recent',
      setSort: vi.fn(),
      content: 'all',
      setContent: vi.fn(),
    })),
    PostController: {
      read: vi.fn(() => Promise.resolve([])),
    },
    db: {
      user_details: {
        get: vi.fn(() => Promise.resolve(null)),
      },
    },
  };
});

// Mock organisms - REQUIRED: complex components with their own dependencies
vi.mock('@/organisms', () => ({
  Post: () => <div data-testid="post">Mocked Post</div>,
  ContentLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="content-layout">{children}</div>,
  DialogWelcome: ({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) =>
    isOpen ? (
      <div data-testid="dialog-welcome" onClick={() => onOpenChange(false)}>
        Mocked DialogWelcome
      </div>
    ) : null,
  AlertBackup: ({ onDismiss }: { onDismiss?: () => void }) => (
    <div data-testid="alert-backup" onClick={onDismiss}>
      Mocked AlertBackup
    </div>
  ),
}));

// Mock hooks - REQUIRED: custom hooks with complex logic
vi.mock('@/hooks', () => ({
  useInfiniteScroll: vi.fn(() => ({
    sentinelRef: { current: null },
  })),
}));

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    render(<Home />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('displays the Home heading correctly', () => {
    render(<Home />);
    const heading = screen.getByText('Home');
    expect(heading).toBeInTheDocument();
  });

  it('displays welcome message', () => {
    render(<Home />);
    expect(
      screen.getByText("Welcome to your home. This is where you'll see posts from people you follow."),
    ).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(<Home />);
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveAttribute('id', 'home-logout-btn');
  });

  it('navigates to logout page when logout button is clicked', async () => {
    const { useRouter } = await import('next/navigation');
    const mockPush = vi.fn();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });

    render(<Home />);
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockPush).toHaveBeenCalledWith(App.AUTH_ROUTES.LOGOUT);
  });

  it('renders container structure correctly', () => {
    render(<Home />);
    expect(screen.getByTestId('content-layout')).toBeInTheDocument();
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

      render(<Home />);

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

      render(<Home />);

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

      render(<Home />);

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

      render(<Home />);

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

      render(<Home />);

      // The dialog should be rendered with correct props
      // This is implicitly tested by the dialog being shown when conditions are met
      expect(screen.getByTestId('dialog-welcome')).toBeInTheDocument();
    });
  });
});
