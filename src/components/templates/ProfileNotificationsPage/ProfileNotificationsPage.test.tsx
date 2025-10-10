import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileNotificationsPage } from './ProfileNotificationsPage';

vi.mock('@/molecules', () => ({
  EmptyState: ({ title }: { title: string }) => <div data-testid="empty-state">{title}</div>,
}));

describe('ProfileNotificationsPage', () => {
  it('renders empty state', () => {
    render(<ProfileNotificationsPage />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('displays correct title', () => {
    render(<ProfileNotificationsPage />);
    expect(screen.getByText('No notifications yet')).toBeInTheDocument();
  });
});
