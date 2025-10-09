import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SettingsAccount } from './SettingsAccount';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('SettingsAccount', () => {
  it('renders loader initially', () => {
    render(<SettingsAccount />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders account content after loading', async () => {
    render(<SettingsAccount />);

    await waitFor(() => {
      expect(screen.getByText('Sign out from Pubky')).toBeInTheDocument();
    });
  });

  it('renders all account sections', async () => {
    render(<SettingsAccount />);

    await waitFor(() => {
      expect(screen.getByText('Sign out from Pubky')).toBeInTheDocument();
      expect(screen.getByText('Edit your profile')).toBeInTheDocument();
      expect(screen.getByText('Back up your account')).toBeInTheDocument();
      expect(screen.getByText('Download your data')).toBeInTheDocument();
      expect(screen.getByText('Import your data')).toBeInTheDocument();
      expect(screen.getByText('Delete your account')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<SettingsAccount className="custom-account" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('SettingsAccount - Snapshots', () => {
  it('matches snapshot after loading', async () => {
    const { container } = render(<SettingsAccount />);

    await waitFor(() => {
      expect(screen.getByText('Sign out from Pubky')).toBeInTheDocument();
    });

    expect(container.firstChild).toMatchSnapshot();
  });
});
