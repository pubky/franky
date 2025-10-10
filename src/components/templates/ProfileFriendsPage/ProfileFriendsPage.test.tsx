import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileFriendsPage } from './ProfileFriendsPage';

vi.mock('@/molecules', () => ({
  EmptyState: ({ title }: { title: string }) => <div data-testid="empty-state">{title}</div>,
}));

describe('ProfileFriendsPage', () => {
  it('renders empty state', () => {
    render(<ProfileFriendsPage />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('displays correct title', () => {
    render(<ProfileFriendsPage />);
    expect(screen.getByText('No friends yet')).toBeInTheDocument();
  });
});
