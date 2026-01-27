import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsMobileMenu } from './SettingsMobileMenu';

import { SETTINGS_ROUTES } from '@/app';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => SETTINGS_ROUTES.ACCOUNT,
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('SettingsMobileMenu', () => {
  it('renders all menu buttons', () => {
    render(<SettingsMobileMenu />);
    expect(screen.getByLabelText('Account')).toBeInTheDocument();
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Privacy & Safety')).toBeInTheDocument();
    expect(screen.getByLabelText('Muted users')).toBeInTheDocument();
    expect(screen.getByLabelText('Language')).toBeInTheDocument();
    expect(screen.getByLabelText('Help')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SettingsMobileMenu className="custom-menu" />);
    expect(container.firstChild).toHaveClass('custom-menu');
  });
});

describe('SettingsMobileMenu - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<SettingsMobileMenu />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<SettingsMobileMenu className="custom-menu" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
