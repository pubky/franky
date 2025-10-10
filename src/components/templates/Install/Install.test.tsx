import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Install } from './Install';

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
    const children = Array.from(pageContainer.children) as HTMLElement[];

    expect(children).toHaveLength(2);
    const [contentWrapper, navigationWrapper] = children;

    expect(contentWrapper).toHaveAttribute('data-testid', 'install-content');
    const contentChildren = Array.from(contentWrapper.children);
    expect(contentChildren[0]).toHaveAttribute('data-testid', 'install-header');
    expect(contentChildren[1]).toHaveAttribute('data-testid', 'install-card');
    expect(contentChildren[2]).toHaveAttribute('data-testid', 'install-footer');
    expect(contentWrapper).toHaveClass('flex-1');
    expect(contentWrapper).toHaveClass('lg:flex-none');
    expect(navigationWrapper).toHaveClass('mt-auto');
    expect(navigationWrapper).toHaveClass('onboarding-nav');
    expect(navigationWrapper).toHaveClass('lg:mt-0');
    expect(navigationWrapper.firstChild).toHaveAttribute('data-testid', 'install-navigation');
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

  it('applies onboarding layout classes to the container', () => {
    render(<Install />);

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('min-h-dvh');
    expect(container).toHaveClass('gap-6');
    expect(container).toHaveClass('pb-0');
    expect(container).toHaveClass('lg:pb-6');
    expect(container).toHaveClass('pt-4');
    expect(container).toHaveClass('lg:min-h-0');
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

    // Verify the onboarding content wrapper exists and contains the main pieces
    const contentWrapper = screen.getByTestId('install-content');
    expect(contentWrapper).toContainElement(screen.getByTestId('install-header'));
    expect(contentWrapper).toContainElement(screen.getByTestId('install-card'));
    expect(contentWrapper).toContainElement(screen.getByTestId('install-footer'));
  });
});
