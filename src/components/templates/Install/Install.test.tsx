import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Install } from './Install';

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
  PageContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="page-container">{children}</div>,
  InstallHeader: () => <div data-testid="install-header">Install Header</div>,
  InstallCard: () => <div data-testid="install-card">Install Card</div>,
  InstallFooter: () => <div data-testid="install-footer">Install Footer</div>,
  InstallNavigation: () => <div data-testid="install-navigation">Install Navigation</div>,
}));

describe('Install', () => {
  it('renders all main components', () => {
    render(<Install />);

    expect(screen.getByTestId('container')).toBeInTheDocument();
    expect(screen.getByTestId('install-header')).toBeInTheDocument();
    expect(screen.getByTestId('install-card')).toBeInTheDocument();
    expect(screen.getByTestId('install-footer')).toBeInTheDocument();
    expect(screen.getByTestId('install-navigation')).toBeInTheDocument();
  });

  it('renders components in correct order within page container', () => {
    render(<Install />);

    const pageContainer = screen.getByTestId('container');
    const children = Array.from(pageContainer.children);

    expect(children).toHaveLength(4);
    expect(children[0]).toHaveAttribute('data-testid', 'install-header');
    expect(children[1]).toHaveAttribute('data-testid', 'install-card');
    expect(children[2]).toHaveAttribute('data-testid', 'install-footer');
    expect(children[3]).toHaveAttribute('data-testid', 'install-navigation');
  });

  it('wraps all content in page container', () => {
    render(<Install />);

    const pageContainer = screen.getByTestId('container');

    // All main components should be children of PageContainer
    expect(pageContainer).toContainElement(screen.getByTestId('install-header'));
    expect(pageContainer).toContainElement(screen.getByTestId('install-card'));
    expect(pageContainer).toContainElement(screen.getByTestId('install-footer'));
    expect(pageContainer).toContainElement(screen.getByTestId('install-navigation'));
  });

  it('renders without crashing', () => {
    const { container } = render(<Install />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has correct component hierarchy', () => {
    render(<Install />);

    // Verify the main container exists
    const pageContainer = screen.getByTestId('container');
    expect(pageContainer).toBeInTheDocument();

    // Verify all expected child components exist
    const expectedComponents = ['install-header', 'install-card', 'install-footer', 'install-navigation'];

    expectedComponents.forEach((componentTestId) => {
      expect(screen.getByTestId(componentTestId)).toBeInTheDocument();
    });
  });
});
