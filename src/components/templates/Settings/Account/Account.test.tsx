import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Account } from './Account';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('Account', () => {
  it('renders account content', () => {
    render(<Account />);
    expect(screen.getByText('Edit your profile')).toBeInTheDocument();
  });

  it('renders all account sections', () => {
    render(<Account />);
    expect(screen.getByText('Edit your profile')).toBeInTheDocument();
    expect(screen.getByText('Back up your account')).toBeInTheDocument();
    expect(screen.getByText('Download your data')).toBeInTheDocument();
    expect(screen.getByText('Delete your account')).toBeInTheDocument();
  });
});

describe('Account - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<Account />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
