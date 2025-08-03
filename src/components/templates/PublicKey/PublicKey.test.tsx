import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicKey } from './PublicKey';

// Mock molecules
vi.mock('@/molecules', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <div data-testid="page-wrapper">{children}</div>,
  PublicKeyHeader: () => <div data-testid="public-key-header">Public Key Header</div>,
  PublicKeyNavigation: () => <div data-testid="public-key-navigation">Public Key Navigation</div>,
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  PublicKeyCard: () => <div data-testid="public-key-card">Public Key Card</div>,
}));

describe('PublicKey', () => {
  it('renders all main components', () => {
    render(<PublicKey />);

    expect(screen.getByTestId('page-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('public-key-header')).toBeInTheDocument();
    expect(screen.getByTestId('public-key-card')).toBeInTheDocument();
    expect(screen.getByTestId('public-key-navigation')).toBeInTheDocument();
  });

  it('renders components in correct order within page wrapper', () => {
    render(<PublicKey />);

    const pageWrapper = screen.getByTestId('page-wrapper');
    const children = Array.from(pageWrapper.children);

    expect(children).toHaveLength(3);
    expect(children[0]).toHaveAttribute('data-testid', 'public-key-header');
    expect(children[1]).toHaveAttribute('data-testid', 'public-key-card');
    expect(children[2]).toHaveAttribute('data-testid', 'public-key-navigation');
  });

  it('wraps all content in page wrapper', () => {
    render(<PublicKey />);

    const pageWrapper = screen.getByTestId('page-wrapper');

    // All main components should be children of PageWrapper
    expect(pageWrapper).toContainElement(screen.getByTestId('public-key-header'));
    expect(pageWrapper).toContainElement(screen.getByTestId('public-key-card'));
    expect(pageWrapper).toContainElement(screen.getByTestId('public-key-navigation'));
  });

  it('renders without crashing', () => {
    const { container } = render(<PublicKey />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
