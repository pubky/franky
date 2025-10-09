import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Scan } from './Scan';

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
  PageWrapper: ({ children }: { children: React.ReactNode }) => <div data-testid="page-wrapper">{children}</div>,
  ScanContent: () => <div data-testid="scan-content">Scan Content</div>,
  ScanFooter: () => <div data-testid="scan-footer">Scan Footer</div>,
  ScanNavigation: () => <div data-testid="scan-navigation">Scan Navigation</div>,
  PageContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="page-container">{children}</div>,
}));

describe('Scan', () => {
  it('renders all main components', () => {
    render(<Scan />);

    expect(screen.getByTestId('container')).toBeInTheDocument();
    expect(screen.getByTestId('scan-content')).toBeInTheDocument();
    expect(screen.getByTestId('scan-footer')).toBeInTheDocument();
    expect(screen.getByTestId('scan-navigation')).toBeInTheDocument();
  });

  it('renders components in correct order within page wrapper', () => {
    render(<Scan />);

    const pageWrapper = screen.getByTestId('container');
    const children = Array.from(pageWrapper.children) as HTMLElement[];

    expect(children).toHaveLength(2);
    const [contentWrapper, navigationWrapper] = children;

    expect(contentWrapper).toHaveAttribute('data-testid', 'scan-page-content');
    const contentChildren = Array.from(contentWrapper.children);
    expect(contentChildren[0]).toHaveAttribute('data-testid', 'scan-content');
    expect(contentChildren[1]).toHaveAttribute('data-testid', 'scan-footer');
    expect(contentWrapper).toHaveClass('flex-1');
    expect(contentWrapper).toHaveClass('lg:flex-none');
    expect(navigationWrapper).toHaveClass('mt-auto');
    expect(navigationWrapper).toHaveClass('lg:mt-0');
    expect(navigationWrapper.firstChild).toHaveAttribute('data-testid', 'scan-navigation');
  });

  it('wraps all content in page wrapper', () => {
    render(<Scan />);

    const pageWrapper = screen.getByTestId('container');

    // All main components should be children of PageWrapper
    expect(pageWrapper).toContainElement(screen.getByTestId('scan-content'));
    expect(pageWrapper).toContainElement(screen.getByTestId('scan-footer'));
    expect(pageWrapper).toContainElement(screen.getByTestId('scan-navigation'));
  });

  it('applies onboarding layout classes to the container', () => {
    render(<Scan />);

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('min-h-dvh');
    expect(container).toHaveClass('gap-6');
    expect(container).toHaveClass('pb-6');
    expect(container).toHaveClass('pt-4');
    expect(container).toHaveClass('lg:min-h-0');
  });

  it('renders without crashing', () => {
    const { container } = render(<Scan />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has correct component hierarchy', () => {
    render(<Scan />);

    // Verify the main wrapper exists
    const pageWrapper = screen.getByTestId('container');
    expect(pageWrapper).toBeInTheDocument();

    // Verify the content wrapper contains the main pieces
    const contentWrapper = screen.getByTestId('scan-page-content');
    expect(contentWrapper).toContainElement(screen.getByTestId('scan-content'));
    expect(contentWrapper).toContainElement(screen.getByTestId('scan-footer'));
  });

  it('renders scan content before navigation', () => {
    render(<Scan />);

    const pageWrapper = screen.getByTestId('container');
    const children = Array.from(pageWrapper.children);

    expect(children[0]).toHaveAttribute('data-testid', 'scan-page-content');
    expect(children[1].firstChild).toHaveAttribute('data-testid', 'scan-navigation');
  });
});
