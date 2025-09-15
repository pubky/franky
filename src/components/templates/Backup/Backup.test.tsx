import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Backup } from './Backup';

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <div data-testid="container" data-size={size} className={className}>
      {children}
    </div>
  ),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  BackupPageHeader: () => <div data-testid="backup-page-header">Backup Page Header</div>,
  BackupNavigation: () => <div data-testid="backup-navigation">Backup Navigation</div>,
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  BackupMethodCard: () => <div data-testid="backup-method-card">Backup Method Card</div>,
}));

describe('Backup Template', () => {
  it('renders all main components', () => {
    render(<Backup />);

    expect(screen.getByTestId('backup-page-header')).toBeInTheDocument();
    expect(screen.getByTestId('backup-method-card')).toBeInTheDocument();
    expect(screen.getByTestId('backup-navigation')).toBeInTheDocument();
  });

  it('renders container with correct props', () => {
    render(<Backup />);

    const container = screen.getByTestId('container');
    expect(container).toHaveAttribute('data-size', 'container');
    expect(container).toHaveClass('px-6');
  });

  it('maintains correct component hierarchy', () => {
    render(<Backup />);

    const container = screen.getByTestId('container');
    const header = screen.getByTestId('backup-page-header');
    const methodCard = screen.getByTestId('backup-method-card');
    const navigation = screen.getByTestId('backup-navigation');

    // All components should be children of the container
    expect(container).toContainElement(header);
    expect(container).toContainElement(methodCard);
    expect(container).toContainElement(navigation);
  });

  it('renders components in correct order', () => {
    render(<Backup />);

    const container = screen.getByTestId('container');
    const children = Array.from(container.children);

    expect(children[0]).toHaveAttribute('data-testid', 'backup-page-header');
    expect(children[1]).toHaveAttribute('data-testid', 'backup-method-card');
    expect(children[2]).toHaveAttribute('data-testid', 'backup-navigation');
  });

  it('follows atomic design structure correctly', () => {
    render(<Backup />);

    // Template should use:
    // - Atoms (Container)
    // - Molecules (BackupPageHeader, BackupNavigation)
    // - Organisms (BackupMethodCard)
    expect(screen.getByTestId('container')).toBeInTheDocument(); // Atom
    expect(screen.getByTestId('backup-page-header')).toBeInTheDocument(); // Molecule
    expect(screen.getByTestId('backup-navigation')).toBeInTheDocument(); // Molecule
    expect(screen.getByTestId('backup-method-card')).toBeInTheDocument(); // Organism
  });

  it('renders without any errors', () => {
    expect(() => render(<Backup />)).not.toThrow();
  });

  it('has proper semantic structure', () => {
    render(<Backup />);

    // Should have a main container
    const container = screen.getByTestId('container');
    expect(container).toBeInTheDocument();

    // Should contain exactly 3 child components
    expect(container.children).toHaveLength(3);
  });
});
