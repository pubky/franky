import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageNotifications } from './ProfilePageNotifications';
import * as Hooks from '@/hooks';

// Mock useNotifications hook
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useNotifications: vi.fn(() => ({
      notifications: [
        {
          type: 'follow' as const,
          timestamp: Date.now() - 1000 * 60 * 30,
          followed_by: 'user1',
        },
      ],
      count: 27,
      isLoading: false,
    })),
  };
});

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Heading: ({ children, level, className }: { children: React.ReactNode; level?: number; className?: string }) => {
    const Tag = `h${level || 1}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    return (
      <Tag data-testid={`heading-${level || 1}`} className={className}>
        {children}
      </Tag>
    );
  },
  Spinner: ({ size }: { size?: string }) => <div data-testid="spinner" data-size={size} />,
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  NotificationsList: ({ notifications }: { notifications: unknown[] }) => (
    <div data-testid="notifications-list">{notifications.length} notifications</div>
  ),
  NotificationsEmpty: () => <div data-testid="notifications-empty">Nothing to see here yet</div>,
}));

describe('ProfilePageNotifications', () => {
  it('renders without errors', () => {
    render(<ProfilePageNotifications />);
    expect(screen.getByTestId('heading-5')).toBeInTheDocument();
  });

  it('displays the correct heading with count', () => {
    render(<ProfilePageNotifications />);
    const heading = screen.getByTestId('heading-5');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/Notifications.*\(27\)/);
  });

  it('displays notifications list when notifications exist', () => {
    render(<ProfilePageNotifications />);
    // The component should render NotificationsList
    expect(screen.getByTestId('heading-5')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.mocked(Hooks.useNotifications).mockReturnValueOnce({
      notifications: [],
      count: 0,
      isLoading: true,
    });
    render(<ProfilePageNotifications />);
    // Should show spinner
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', () => {
    vi.mocked(Hooks.useNotifications).mockReturnValueOnce({
      notifications: [],
      count: 0,
      isLoading: false,
    });
    render(<ProfilePageNotifications />);
    expect(screen.getByText(/Nothing to see here yet/i)).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfilePageNotifications />);
    expect(container).toMatchSnapshot();
  });
});
