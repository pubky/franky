import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePostsPage } from './ProfilePostsPage';

vi.mock('@/molecules', () => ({
  EmptyState: ({ title }: { title: string }) => <div data-testid="empty-state">{title}</div>,
}));

describe('ProfilePostsPage', () => {
  it('renders empty state', () => {
    render(<ProfilePostsPage />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('displays correct title', () => {
    render(<ProfilePostsPage />);
    expect(screen.getByText('No posts yet')).toBeInTheDocument();
  });
});
