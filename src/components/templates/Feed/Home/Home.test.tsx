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
    useHomeStore: vi.fn(() => ({
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
  DialogWelcome: () => <div data-testid="dialog-welcome-component">Mocked DialogWelcome Component</div>,
  AlertBackup: ({ onDismiss }: { onDismiss?: () => void }) => (
    <div data-testid="alert-backup" onClick={onDismiss}>
      Mocked AlertBackup
    </div>
  ),
  TimelinePosts: () => <div data-testid="timeline-posts">Mocked TimelinePosts</div>,
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
    it('should render DialogWelcome component', () => {
      render(<Home />);

      // The DialogWelcome component is rendered (its internal logic determines visibility)
      expect(screen.getByTestId('dialog-welcome-component')).toBeInTheDocument();
    });
  });
});
