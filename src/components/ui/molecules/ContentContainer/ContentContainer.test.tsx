import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentContainer } from './ContentContainer';

// Mock UI components
vi.mock('@/components/ui', () => ({
  Container: ({ children, className, size }: { children: React.ReactNode; className?: string; size?: string }) => (
    <div data-testid="container" className={className} data-size={size}>
      {children}
    </div>
  ),
}));

describe('ContentContainer', () => {
  it('renders with default props', () => {
    render(<ContentContainer>Test content</ContentContainer>);

    const container = screen.getByTestId('container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('flex', 'flex-col', 'mx-auto', 'max-w-[1200px]', 'gap-6');
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ContentContainer className="custom-content">Content</ContentContainer>);

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('custom-content');
  });

  it('applies different max widths', () => {
    const { rerender } = render(<ContentContainer maxWidth="sm">Small content</ContentContainer>);

    let container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-[588px]');

    rerender(<ContentContainer maxWidth="md">Medium content</ContentContainer>);
    container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-[800px]');

    rerender(<ContentContainer maxWidth="xl">Extra large content</ContentContainer>);
    container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-[1400px]');
  });

  it('applies different gaps', () => {
    const { rerender } = render(<ContentContainer gap="sm">Small gap content</ContentContainer>);

    let container = screen.getByTestId('container');
    expect(container).toHaveClass('gap-3');

    rerender(<ContentContainer gap="lg">Large gap content</ContentContainer>);
    container = screen.getByTestId('container');
    expect(container).toHaveClass('gap-8');
  });

  it('renders complex children correctly', () => {
    render(
      <ContentContainer>
        <div>
          <h1>Main Content</h1>
          <p>Paragraph content</p>
        </div>
      </ContentContainer>,
    );

    expect(screen.getByText('Main Content')).toBeInTheDocument();
    expect(screen.getByText('Paragraph content')).toBeInTheDocument();
  });
});
