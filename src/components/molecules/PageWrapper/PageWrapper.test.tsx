import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageWrapper } from './PageWrapper';

// Mock UI components
vi.mock('@/components/ui/molecules', () => ({
  PageContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="page-container">{children}</div>,
  Container: ({ children }: { children: React.ReactNode }) => <div data-testid="container">{children}</div>,
}));

describe('PageWrapper', () => {
  it('renders children within the correct structure', () => {
    const testContent = 'Test content';
    render(<PageWrapper>{testContent}</PageWrapper>);

    expect(screen.getByTestId('page-container')).toBeInTheDocument();
    expect(screen.getByTestId('container')).toBeInTheDocument();
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('nests Container inside PageContainer', () => {
    render(<PageWrapper>content</PageWrapper>);

    const pageContainer = screen.getByTestId('page-container');
    const container = screen.getByTestId('container');

    expect(pageContainer).toContainElement(container);
  });

  it('passes children to the inner Container', () => {
    const children = <span data-testid="child-element">Child content</span>;
    render(<PageWrapper>{children}</PageWrapper>);

    const container = screen.getByTestId('container');
    const childElement = screen.getByTestId('child-element');

    expect(container).toContainElement(childElement);
  });
});
