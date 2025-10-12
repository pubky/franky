import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicKey } from './PublicKey';

// Mock molecules
vi.mock('@/molecules', async () => {
  const actual = await vi.importActual('@/molecules');
  return {
    ...actual,
    PublicKeyHeader: () => <div data-testid="public-key-header">Public Key Header</div>,
    PublicKeyNavigation: () => <div data-testid="public-key-navigation">Public Key Navigation</div>,
  };
});

// Mock organisms
vi.mock('@/organisms', async () => {
  const actual = await vi.importActual('@/organisms');
  return {
    ...actual,
    PublicKeyCard: () => <div data-testid="public-key-card">Public Key Card</div>,
  };
});

describe('PublicKey', () => {
  it('renders all main components', () => {
    render(<PublicKey />);

    expect(screen.getByTestId('public-key-header')).toBeInTheDocument();
    expect(screen.getByTestId('public-key-card')).toBeInTheDocument();
    expect(screen.getByTestId('public-key-navigation')).toBeInTheDocument();
  });

  it('renders content with correct testId', () => {
    render(<PublicKey />);

    expect(screen.getByTestId('public-key-content')).toBeInTheDocument();
  });

  it('renders navigation in correct container', () => {
    const { container } = render(<PublicKey />);

    const navContainer = container.querySelector('.onboarding-nav');
    expect(navContainer).toBeInTheDocument();
    expect(navContainer).toContainElement(screen.getByTestId('public-key-navigation'));
  });
});

describe('PublicKey - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<PublicKey />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
