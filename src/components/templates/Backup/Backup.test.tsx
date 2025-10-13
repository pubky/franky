import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Backup } from './Backup';

// Mock molecules
vi.mock('@/molecules', async () => {
  const actual = await vi.importActual('@/molecules');
  return {
    ...actual,
    BackupPageHeader: () => <div data-testid="backup-page-header">Backup Page Header</div>,
    BackupNavigation: () => <div data-testid="backup-navigation">Backup Navigation</div>,
  };
});

// Mock organisms
vi.mock('@/organisms', async () => {
  const actual = await vi.importActual('@/organisms');
  return {
    ...actual,
    BackupMethodCard: () => <div data-testid="backup-method-card">Backup Method Card</div>,
  };
});

describe('Backup Template', () => {
  it('renders all main components', () => {
    render(<Backup />);

    expect(screen.getByTestId('backup-page-header')).toBeInTheDocument();
    expect(screen.getByTestId('backup-method-card')).toBeInTheDocument();
    expect(screen.getByTestId('backup-navigation')).toBeInTheDocument();
  });

  it('renders content with correct testId', () => {
    render(<Backup />);

    expect(screen.getByTestId('backup-content')).toBeInTheDocument();
  });

  it('renders navigation in correct container', () => {
    const { container } = render(<Backup />);

    const navContainer = container.querySelector('.onboarding-nav');
    expect(navContainer).toBeInTheDocument();
    expect(navContainer).toContainElement(screen.getByTestId('backup-navigation'));
  });
});

describe('Backup Template - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<Backup />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
