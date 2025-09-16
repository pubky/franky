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
});

describe('ContentImage', () => {
  it('renders with required props', () => {
    render(<ContentImage src="/test.jpg" alt="Test" width={100} height={100} />);

    const img = screen.getByTestId('content-image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test.jpg');
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
});

describe('Content - Snapshots', () => {
  it('matches snapshot for ContentCard with default props', () => {
    const { container } = render(
      <ContentCard>
        <div>Test content</div>
      </ContentCard>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for ContentCard with different configurations', () => {
    const { container: defaultContainer } = render(
      <ContentCard>
        <div>Default content</div>
      </ContentCard>,
    );
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: customClassContainer } = render(
      <ContentCard className="custom-card">
        <div>Custom content</div>
      </ContentCard>,
    );
    expect(customClassContainer.firstChild).toMatchSnapshot();

    const { container: columnLayoutContainer } = render(
      <ContentCard layout="column">
        <div>Column layout content</div>
      </ContentCard>,
    );
    expect(columnLayoutContainer.firstChild).toMatchSnapshot();

    const image = {
      src: '/test.jpg',
      alt: 'Test image',
      width: 200,
      height: 200,
    };
    const { container: withImageContainer } = render(
      <ContentCard image={image}>
        <div>Content with image</div>
      </ContentCard>,
    );
    expect(withImageContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for ContentContainer with different configurations', () => {
    const { container: defaultContainer } = render(
      <ContentContainer>
        <div>Default container</div>
      </ContentContainer>,
    );
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: customMaxWidthContainer } = render(
      <ContentContainer maxWidth="sm">
        <div>Small max width</div>
      </ContentContainer>,
    );
    expect(customMaxWidthContainer.firstChild).toMatchSnapshot();

    const { container: customGapContainer } = render(
      <ContentContainer gap="lg">
        <div>Large gap</div>
      </ContentContainer>,
    );
    expect(customGapContainer.firstChild).toMatchSnapshot();

    const { container: customClassContainer } = render(
      <ContentContainer className="custom-container">
        <div>Custom class</div>
      </ContentContainer>,
    );
    expect(customClassContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for ContentImage with different configurations', () => {
    const { container: defaultContainer } = render(
      <ContentImage src="/test.jpg" alt="Test" width={100} height={100} />,
    );
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: visibleOnMobileContainer } = render(
      <ContentImage src="/test.jpg" alt="Test" width={100} height={100} hiddenOnMobile={false} />,
    );
    expect(visibleOnMobileContainer.firstChild).toMatchSnapshot();

    const { container: customClassContainer } = render(
      <ContentImage src="/test.jpg" alt="Test" width={100} height={100} className="custom-image" />,
    );
    expect(customClassContainer.firstChild).toMatchSnapshot();

    const { container: customContainerClassContainer } = render(
      <ContentImage src="/test.jpg" alt="Test" width={100} height={100} containerClassName="custom-container" />,
    );
    expect(customContainerClassContainer.firstChild).toMatchSnapshot();
  });
});
