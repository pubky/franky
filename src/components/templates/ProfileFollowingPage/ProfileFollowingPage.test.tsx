import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileFollowingPage } from './ProfileFollowingPage';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

vi.mock('@/molecules', () => ({
  EmptyState: ({ title }: { title: string }) => <div data-testid="empty-state">{title}</div>,
}));

describe('ProfileFollowingPage', () => {
  it('renders empty state', () => {
    render(<ProfileFollowingPage />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('displays correct title', () => {
    render(<ProfileFollowingPage />);
    expect(screen.getByText('Not following anyone yet')).toBeInTheDocument();
  });
});
