import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Scan } from './Scan';

// Mock molecules
vi.mock('@/molecules', async () => {
  const actual = await vi.importActual('@/molecules');
  return {
    ...actual,
    ScanContent: () => <div data-testid="scan-content">Scan Content</div>,
    ScanFooter: () => <div data-testid="scan-footer">Scan Footer</div>,
    ScanNavigation: () => <div data-testid="scan-navigation">Scan Navigation</div>,
  };
});

describe('Scan', () => {
  it('renders all main components', () => {
    render(<Scan />);

    expect(screen.getByTestId('scan-content')).toBeInTheDocument();
    expect(screen.getByTestId('scan-footer')).toBeInTheDocument();
    expect(screen.getByTestId('scan-navigation')).toBeInTheDocument();
  });

  it('renders content with correct testId', () => {
    render(<Scan />);

    expect(screen.getByTestId('scan-page-content')).toBeInTheDocument();
  });

  it('renders navigation in correct container', () => {
    const { container } = render(<Scan />);

    const navContainer = container.querySelector('.onboarding-nav');
    expect(navContainer).toBeInTheDocument();
    expect(navContainer).toContainElement(screen.getByTestId('scan-navigation'));
  });
});

describe('Scan - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<Scan />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
