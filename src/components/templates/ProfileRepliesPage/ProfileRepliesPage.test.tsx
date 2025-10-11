import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileRepliesPage } from './ProfileRepliesPage';

vi.mock('@/molecules', () => ({
  EmptyState: ({ title }: { title: string }) => <div data-testid="empty-state">{title}</div>,
}));

describe('ProfileRepliesPage', () => {
  it('renders empty state', () => {
    render(<ProfileRepliesPage />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('displays correct title', () => {
    render(<ProfileRepliesPage />);
    expect(screen.getByText('No replies yet')).toBeInTheDocument();
  });
});
