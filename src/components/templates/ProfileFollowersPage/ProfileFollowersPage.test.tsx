import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileFollowersPage } from './ProfileFollowersPage';

vi.mock('@/molecules', () => ({
  EmptyState: ({ title }: { title: string }) => <div data-testid="empty-state">{title}</div>,
}));

describe('ProfileFollowersPage', () => {
  it('renders empty state', () => {
    render(<ProfileFollowersPage />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('displays correct title', () => {
    render(<ProfileFollowersPage />);
    expect(screen.getByText('No followers yet')).toBeInTheDocument();
  });
});
