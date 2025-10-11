import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileTaggedPage } from './ProfileTaggedPage';

vi.mock('@/molecules', () => ({
  EmptyState: ({ title }: { title: string }) => <div data-testid="empty-state">{title}</div>,
}));

describe('ProfileTaggedPage', () => {
  it('renders empty state', () => {
    render(<ProfileTaggedPage />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('displays correct title', () => {
    render(<ProfileTaggedPage />);
    expect(screen.getByText('No tags yet')).toBeInTheDocument();
  });
});
