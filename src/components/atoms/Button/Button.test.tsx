import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-brand/20', 'text-brand');
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');

    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('border', 'bg-background');

    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-accent');

    rerender(<Button variant="brand">Brand</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-brand', 'text-background');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('h-8', 'gap-1.5', 'px-3');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('h-10', 'px-8');

    rerender(<Button size="icon">Icon</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('size-9');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none');
  });

  it('renders as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});

describe('Button - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<Button>Default Button</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for all variants', () => {
    const { container: defaultContainer } = render(<Button>Default</Button>);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: secondaryContainer } = render(<Button variant="secondary">Secondary</Button>);
    expect(secondaryContainer.firstChild).toMatchSnapshot();

    const { container: outlineContainer } = render(<Button variant="outline">Outline</Button>);
    expect(outlineContainer.firstChild).toMatchSnapshot();

    const { container: ghostContainer } = render(<Button variant="ghost">Ghost</Button>);
    expect(ghostContainer.firstChild).toMatchSnapshot();

    const { container: brandContainer } = render(<Button variant="brand">Brand</Button>);
    expect(brandContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for all sizes', () => {
    const { container: smallContainer } = render(<Button size="sm">Small</Button>);
    expect(smallContainer.firstChild).toMatchSnapshot();

    const { container: defaultContainer } = render(<Button>Default Size</Button>);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: largeContainer } = render(<Button size="lg">Large</Button>);
    expect(largeContainer.firstChild).toMatchSnapshot();

    const { container: iconContainer } = render(<Button size="icon">🔍</Button>);
    expect(iconContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different states', () => {
    const { container: disabledContainer } = render(<Button disabled>Disabled</Button>);
    expect(disabledContainer.firstChild).toMatchSnapshot();

    const { container: customContainer } = render(<Button className="custom-class">Custom</Button>);
    expect(customContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for asChild prop', () => {
    const { container } = render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
