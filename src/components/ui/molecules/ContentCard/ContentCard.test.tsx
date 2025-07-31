import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentCard } from './ContentCard';

// Mock UI components
vi.mock('@/components/ui', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  ContentImage: ({
    src,
    alt,
    width,
    height,
    size,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    size?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img data-testid="content-image" src={src} alt={alt} width={width} height={height} data-size={size} />
  ),
}));

describe('ContentCard', () => {
  it('renders with default props', () => {
    render(<ContentCard>Test content</ContentCard>);

    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('p-6', 'lg:p-12');
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom className to card', () => {
    render(<ContentCard className="custom-card">Content</ContentCard>);

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-card');
  });

  it('renders with image', () => {
    const image = {
      src: '/test-image.jpg',
      alt: 'Test image',
      width: 400,
      height: 300,
      size: 'medium' as const,
    };

    render(<ContentCard image={image}>Content with image</ContentCard>);

    const contentImage = screen.getByTestId('content-image');
    expect(contentImage).toBeInTheDocument();
    expect(contentImage).toHaveAttribute('src', '/test-image.jpg');
    expect(contentImage).toHaveAttribute('alt', 'Test image');
    expect(contentImage).toHaveAttribute('width', '400');
    expect(contentImage).toHaveAttribute('height', '300');
    expect(contentImage).toHaveAttribute('data-size', 'medium');
  });

  it('renders with row layout by default', () => {
    render(<ContentCard>Content</ContentCard>);

    const containers = screen.getAllByTestId('container');
    const layoutContainer = containers[0];
    expect(layoutContainer).toHaveClass('gap-12', 'flex-col', 'lg:flex-row');
  });

  it('renders with column layout', () => {
    render(<ContentCard layout="column">Content</ContentCard>);

    const containers = screen.getAllByTestId('container');
    const layoutContainer = containers[0];
    expect(layoutContainer).toHaveClass('gap-12', 'flex-col');
  });

  it('renders complex children correctly', () => {
    render(
      <ContentCard>
        <h2>Card Title</h2>
        <p>
          Card description with <strong>bold text</strong>
        </p>
      </ContentCard>,
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card description with')).toBeInTheDocument();
    expect(screen.getByText('bold text')).toBeInTheDocument();
  });
});
