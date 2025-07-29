import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PageHeader } from './PageHeader';

// Mock the atomic components
vi.mock('@/components/ui', () => ({
  PageTitle: ({ children, size }: { children: React.ReactNode; size?: string }) => (
    <h1 data-testid="page-title" data-size={size}>
      {children}
    </h1>
  ),
  PageSubtitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="page-subtitle">{children}</h2>,
}));

describe('PageHeader', () => {
  it('renders title only when no subtitle provided', () => {
    render(<PageHeader title="Test Title" />);

    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getByTestId('page-title')).toHaveTextContent('Test Title');
    expect(screen.queryByTestId('page-subtitle')).not.toBeInTheDocument();
  });

  it('renders both title and subtitle when provided', () => {
    render(<PageHeader title="Test Title" subtitle="Test Subtitle" />);

    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getByTestId('page-subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('page-title')).toHaveTextContent('Test Title');
    expect(screen.getByTestId('page-subtitle')).toHaveTextContent('Test Subtitle');
  });

  it('applies default title size', () => {
    render(<PageHeader title="Test Title" />);

    const title = screen.getByTestId('page-title');
    expect(title).toHaveAttribute('data-size', 'large');
  });

  it('applies custom title size', () => {
    render(<PageHeader title="Test Title" titleSize="medium" />);

    const title = screen.getByTestId('page-title');
    expect(title).toHaveAttribute('data-size', 'medium');
  });

  it('applies custom className', () => {
    const { container } = render(<PageHeader title="Test Title" className="custom-class" />);

    const headerDiv = container.firstChild as HTMLElement;
    expect(headerDiv).toHaveClass('custom-class');
  });

  it('applies default flex classes', () => {
    const { container } = render(<PageHeader title="Test Title" />);

    const headerDiv = container.firstChild as HTMLElement;
    expect(headerDiv).toHaveClass('flex', 'flex-col', 'gap-3');
  });

  it('renders complex title and subtitle', () => {
    render(
      <PageHeader
        title={
          <>
            Complex <span>Title</span>
          </>
        }
        subtitle={
          <>
            Complex <em>Subtitle</em>
          </>
        }
      />,
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });
});
