import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Scan } from './Scan';

// Mock molecules
vi.mock('@/molecules', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <div data-testid="page-wrapper">{children}</div>,
  ScanContent: () => <div data-testid="scan-content">Scan Content</div>,
  ScanNavigation: () => <div data-testid="scan-navigation">Scan Navigation</div>,
  PageContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="page-container">{children}</div>,
}));

describe('Scan', () => {
  it('renders all main components', () => {
    render(<Scan />);

    expect(screen.getByTestId('page-container')).toBeInTheDocument();
    expect(screen.getByTestId('scan-content')).toBeInTheDocument();
    expect(screen.getByTestId('scan-navigation')).toBeInTheDocument();
  });

  it('renders components in correct order within page wrapper', () => {
    render(<Scan />);

    const pageWrapper = screen.getByTestId('page-container');
    const children = Array.from(pageWrapper.children);

    expect(children).toHaveLength(2);
    expect(children[0]).toHaveAttribute('data-testid', 'scan-content');
    expect(children[1]).toHaveAttribute('data-testid', 'scan-navigation');
  });

  it('wraps all content in page wrapper', () => {
    render(<Scan />);

    const pageWrapper = screen.getByTestId('page-container');

    // All main components should be children of PageWrapper
    expect(pageWrapper).toContainElement(screen.getByTestId('scan-content'));
    expect(pageWrapper).toContainElement(screen.getByTestId('scan-navigation'));
  });

  it('renders without crashing', () => {
    const { container } = render(<Scan />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has correct component hierarchy', () => {
    render(<Scan />);

    // Verify the main wrapper exists
    const pageWrapper = screen.getByTestId('page-container');
    expect(pageWrapper).toBeInTheDocument();

    // Verify all expected child components exist
    const expectedComponents = ['scan-content', 'scan-navigation'];

    expectedComponents.forEach((componentTestId) => {
      expect(screen.getByTestId(componentTestId)).toBeInTheDocument();
    });
  });

  it('renders scan content before navigation', () => {
    render(<Scan />);

    const pageWrapper = screen.getByTestId('page-container');
    const scanContent = screen.getByTestId('scan-content');
    const scanNavigation = screen.getByTestId('scan-navigation');

    const children = Array.from(pageWrapper.children);
    const contentIndex = children.indexOf(scanContent);
    const navigationIndex = children.indexOf(scanNavigation);

    expect(contentIndex).toBeLessThan(navigationIndex);
  });
});
