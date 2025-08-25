/* eslint-disable @next/next/no-img-element */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentCard, ContentContainer, ContentImage } from './Content';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    ...props
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    [key: string]: unknown;
  }) => <img data-testid="next-image" src={src} alt={alt} width={width} height={height} {...props} />,
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));

describe('ContentCard', () => {
  it('renders with default props', () => {
    render(
      <ContentCard>
        <div>Test content</div>
      </ContentCard>,
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies default classes to card', () => {
    render(
      <ContentCard>
        <div>Content</div>
      </ContentCard>,
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('p-6', 'md:p-12');
  });

  it('applies custom className to card', () => {
    render(
      <ContentCard className="custom-card">
        <div>Content</div>
      </ContentCard>,
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-card');
  });

  it('renders with image', () => {
    const image = {
      src: '/test.jpg',
      alt: 'Test image',
      width: 200,
      height: 200,
    };

    render(
      <ContentCard image={image}>
        <div>Content with image</div>
      </ContentCard>,
    );

    const img = screen.getByTestId('content-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test.jpg');
    expect(img).toHaveAttribute('alt', 'Test image');
    expect(screen.getByText('Content with image')).toBeInTheDocument();
  });

  it('applies row layout by default', () => {
    render(
      <ContentCard>
        <div>Content</div>
      </ContentCard>,
    );

    const container = screen.getAllByTestId('container')[0];
    expect(container).toHaveClass('flex-col', 'lg:flex-row');
  });

  it('applies column layout when specified', () => {
    render(
      <ContentCard layout="column">
        <div>Content</div>
      </ContentCard>,
    );

    const container = screen.getAllByTestId('container')[0];
    expect(container).toHaveClass('flex-col');
    expect(container).not.toHaveClass('lg:flex-row');
  });
});

describe('ContentContainer', () => {
  it('renders with default props', () => {
    render(
      <ContentContainer>
        <div>Container content</div>
      </ContentContainer>,
    );

    expect(screen.getByTestId('container')).toBeInTheDocument();
    expect(screen.getByText('Container content')).toBeInTheDocument();
  });

  it('applies default max-width and gap', () => {
    render(
      <ContentContainer>
        <div>Content</div>
      </ContentContainer>,
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-[1200px]', 'gap-6');
  });

  it('applies custom max-width', () => {
    render(
      <ContentContainer maxWidth="sm">
        <div>Content</div>
      </ContentContainer>,
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-[588px]');
  });

  it('applies custom gap', () => {
    render(
      <ContentContainer gap="lg">
        <div>Content</div>
      </ContentContainer>,
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('gap-8');
  });

  it('applies custom className', () => {
    render(
      <ContentContainer className="custom-container">
        <div>Content</div>
      </ContentContainer>,
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('custom-container');
  });
});

describe('ContentImage', () => {
  it('renders with required props', () => {
    render(<ContentImage src="/test.jpg" alt="Test" width={100} height={100} />);

    const img = screen.getByTestId('content-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test.jpg');
    expect(img).toHaveAttribute('alt', 'Test');
    expect(img).toHaveAttribute('width', '100');
    expect(img).toHaveAttribute('height', '100');
  });

  it('hides on mobile by default', () => {
    const { container } = render(<ContentImage src="/test.jpg" alt="Test" width={100} height={100} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('hidden', 'lg:flex');
  });

  it('shows on mobile when hiddenOnMobile is false', () => {
    const { container } = render(
      <ContentImage src="/test.jpg" alt="Test" width={100} height={100} hiddenOnMobile={false} />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).not.toHaveClass('hidden');
  });

  it('applies custom className to image', () => {
    render(<ContentImage src="/test.jpg" alt="Test" width={100} height={100} className="custom-image" />);

    const img = screen.getByTestId('content-image');
    expect(img).toHaveClass('custom-image');
  });

  it('applies container styling', () => {
    const { container } = render(
      <ContentImage src="/test.jpg" alt="Test" width={100} height={100} containerClassName="custom-container" />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-container');
    expect(wrapper.style.width).toBe('100px');
    expect(wrapper.style.height).toBe('100px');
  });
});
