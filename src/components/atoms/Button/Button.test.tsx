import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByRole('button');
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

    rerender(<Button variant="destructive">Destructive</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive', 'text-white');

    rerender(<Button variant="link">Link</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('text-primary', 'underline-offset-4');

    rerender(<Button variant="dark">Dark</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-neutral-900', 'text-white');

    rerender(<Button variant="dark-outline">Dark Outline</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('border', 'bg-transparent');
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
});

describe('Button - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<Button>Default Button</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for default variant', () => {
    const { container } = render(<Button>Default</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for secondary variant', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for outline variant', () => {
    const { container } = render(<Button variant="outline">Outline</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for ghost variant', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for brand variant', () => {
    const { container } = render(<Button variant="brand">Brand</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for small size', () => {
    const { container } = render(<Button size="sm">Small</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for default size', () => {
    const { container } = render(<Button>Default Size</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for large size', () => {
    const { container } = render(<Button size="lg">Large</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for icon size', () => {
    const { container } = render(<Button size="icon">🔍</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for disabled state', () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<Button className="custom-class">Custom</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for asChild prop', () => {
    const { container } = render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('has correct test id for different variants', () => {
    const { rerender } = render(<Button variant="ghost">Ghost</Button>);
    let button = screen.getByTestId('button-ghost');
    expect(button).toBeInTheDocument();

    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByTestId('button-outline');
    expect(button).toBeInTheDocument();

    rerender(<Button variant="dark">Dark</Button>);
    button = screen.getByTestId('button-dark');
    expect(button).toBeInTheDocument();

    rerender(<Button variant="dark-outline">Dark Outline</Button>);
    button = screen.getByTestId('button-dark-outline');
    expect(button).toBeInTheDocument();

    rerender(
      <Button variant="ghost" size="icon">
        Ghost Icon
      </Button>,
    );
    button = screen.getByTestId('popover-button');
    expect(button).toBeInTheDocument();
  });

  it('has correct data attributes', () => {
    render(
      <Button variant="secondary" size="lg">
        Test
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-slot', 'button');
    expect(button).toHaveAttribute('data-variant', 'secondary');
    expect(button).toHaveAttribute('data-size', 'lg');
  });
});
