import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders correctly', () => {
    render(<Skeleton data-testid="test-skeleton" />);
    const skeleton = screen.getByTestId('test-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(<Skeleton data-testid="default-skeleton" />);
    const skeleton = screen.getByTestId('default-skeleton');
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-accent');
  });

  it('applies custom className', () => {
    render(<Skeleton className="custom-class" data-testid="custom-skeleton" />);
    const skeleton = screen.getByTestId('custom-skeleton');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('merges custom className with default classes', () => {
    render(<Skeleton className="h-10 w-full" data-testid="merged-skeleton" />);
    const skeleton = screen.getByTestId('merged-skeleton');
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-accent', 'h-10', 'w-full');
  });

  it('has data-slot attribute', () => {
    render(<Skeleton data-testid="slot-skeleton" />);
    const skeleton = screen.getByTestId('slot-skeleton');
    expect(skeleton).toHaveAttribute('data-slot', 'skeleton');
  });

  it('accepts additional HTML div attributes', () => {
    render(<Skeleton id="custom-id" role="status" aria-label="Loading content" data-testid="attrs-skeleton" />);
    const skeleton = screen.getByTestId('attrs-skeleton');
    expect(skeleton).toHaveAttribute('id', 'custom-id');
    expect(skeleton).toHaveAttribute('role', 'status');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
  });

  it('renders as a div element', () => {
    render(<Skeleton data-testid="div-skeleton" />);
    const skeleton = screen.getByTestId('div-skeleton');
    expect(skeleton.tagName).toBe('DIV');
  });
});

describe('Skeleton - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<Skeleton className="h-4 w-full" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with circular shape', () => {
    const { container } = render(<Skeleton className="h-12 w-12 rounded-full" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with rectangle shape', () => {
    const { container } = render(<Skeleton className="h-24 w-full rounded-lg" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with text line dimensions', () => {
    const { container } = render(<Skeleton className="h-4 w-[250px]" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom background', () => {
    const { container } = render(<Skeleton className="bg-muted" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with id prop', () => {
    const { container } = render(<Skeleton id="skeleton-loader" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with data-testid prop', () => {
    const { container } = render(<Skeleton data-testid="custom-test-id" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with role attribute', () => {
    const { container } = render(<Skeleton role="status" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with aria-label', () => {
    const { container } = render(<Skeleton aria-label="Loading..." />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with multiple custom attributes', () => {
    const { container } = render(
      <Skeleton
        className="h-20 w-20 rounded-full"
        id="avatar-skeleton"
        role="status"
        aria-label="Loading user avatar"
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with card skeleton layout', () => {
    const { container } = render(<Skeleton className="h-[200px] w-full rounded-xl" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
