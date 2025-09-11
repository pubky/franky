import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicKey } from './PublicKey';

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, size }: { children: React.ReactNode; size?: string }) => (
    <div data-testid="container" className={`container ${size || ''}`}>
      {children}
    </div>
  ),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <div data-testid="page-wrapper">{children}</div>,
  PublicKeyHeader: () => <div data-testid="public-key-header">Public Key Header</div>,
  PublicKeyNavigation: () => <div data-testid="public-key-navigation">Public Key Navigation</div>,
  PageContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="page-container">{children}</div>,
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  PublicKeyCard: () => <div data-testid="public-key-card">Public Key Card</div>,
}));

describe('PublicKey', () => {
  it('renders all main components', () => {
    render(<PublicKey />);

    expect(screen.getByTestId('container')).toBeInTheDocument();
    expect(screen.getByTestId('public-key-header')).toBeInTheDocument();
    expect(screen.getByTestId('public-key-card')).toBeInTheDocument();
    expect(screen.getByTestId('public-key-navigation')).toBeInTheDocument();
  });

  it('renders components in correct order within page wrapper', () => {
    render(<PublicKey />);

    const pageWrapper = screen.getByTestId('container');
    const children = Array.from(pageWrapper.children);

    expect(children).toHaveLength(3);
    expect(children[0]).toHaveAttribute('data-testid', 'public-key-header');
    expect(children[1]).toHaveAttribute('data-testid', 'public-key-card');
    expect(children[2]).toHaveAttribute('data-testid', 'public-key-navigation');
  });

  it('wraps all content in page wrapper', () => {
    render(<PublicKey />);

    const pageWrapper = screen.getByTestId('container');

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

describe('PublicKey - Snapshots', () => {
  it('matches snapshot for default PublicKey', () => {
    const { container } = render(<PublicKey />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
