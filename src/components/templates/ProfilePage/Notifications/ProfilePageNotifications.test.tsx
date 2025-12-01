import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageNotifications } from './ProfilePageNotifications';

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  NotificationsContainer: () => <div data-testid="notifications-container">Notifications Content</div>,
}));

describe('ProfilePageNotifications', () => {
  it('renders container with correct layout', () => {
    render(<ProfilePageNotifications />);
    expect(screen.getByTestId('container')).toBeInTheDocument();
  });

  it('renders NotificationsContainer organism', () => {
    render(<ProfilePageNotifications />);
    expect(screen.getByTestId('notifications-container')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfilePageNotifications />);
    expect(container).toMatchSnapshot();
  });
});
