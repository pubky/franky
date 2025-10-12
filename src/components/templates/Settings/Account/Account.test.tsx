import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Account } from './Account';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Account', () => {
  it('renders account content', () => {
    render(<Account />);
    expect(screen.getByText('Sign out from Pubky')).toBeInTheDocument();
  });

  it('renders all account sections', () => {
    render(<Account />);
    expect(screen.getByText('Sign out from Pubky')).toBeInTheDocument();
    expect(screen.getByText('Edit your profile')).toBeInTheDocument();
    expect(screen.getByText('Back up your account')).toBeInTheDocument();
    expect(screen.getByText('Download your data')).toBeInTheDocument();
    expect(screen.getByText('Delete your account')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Account className="custom-account" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('Account - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<Account />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
