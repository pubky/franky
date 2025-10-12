import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Install } from './Install';

// Mock molecules
vi.mock('@/molecules', async () => {
  const actual = await vi.importActual('@/molecules');
  return {
    ...actual,
    InstallHeader: () => <div data-testid="install-header">Install Header</div>,
    InstallCard: () => <div data-testid="install-card">Install Card</div>,
    InstallFooter: () => <div data-testid="install-footer">Install Footer</div>,
    InstallNavigation: () => <div data-testid="install-navigation">Install Navigation</div>,
  };
});

describe('Install', () => {
  it('renders all main components', () => {
    render(<Install />);

    expect(screen.getByTestId('install-header')).toBeInTheDocument();
    expect(screen.getByTestId('install-card')).toBeInTheDocument();
    expect(screen.getByTestId('install-footer')).toBeInTheDocument();
    expect(screen.getByTestId('install-navigation')).toBeInTheDocument();
  });

  it('renders content with correct testId', () => {
    render(<Install />);

    expect(screen.getByTestId('install-content')).toBeInTheDocument();
  });

  it('renders navigation in correct container', () => {
    const { container } = render(<Install />);

    const navContainer = container.querySelector('.onboarding-nav');
    expect(navContainer).toBeInTheDocument();
    expect(navContainer).toContainElement(screen.getByTestId('install-navigation'));
  });
});

describe('Install - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<Install />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
