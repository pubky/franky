import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-brand/20', 'text-brand');
    expect(button).toHaveAttribute('data-slot', 'button');
    // data-variant is only set when variant prop is explicitly provided
    expect(button).not.toHaveAttribute('data-variant');
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');

    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-background');

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
    expect(button).toHaveClass('bg-transparent');
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
    expect(link).toHaveAttribute('data-slot', 'button');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Button</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('forwards ref correctly with asChild', () => {
    const ref = React.createRef<HTMLAnchorElement>();
    render(
      <Button asChild>
        <a ref={ref} href="/test">
          Link Button
        </a>
      </Button>,
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
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

  it('supports accessibility attributes', () => {
    render(
      <Button aria-label="Close dialog" role="button">
        ×
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Close dialog');
  });

  it('handles focus states correctly', () => {
    render(<Button tabIndex={0}>Focusable Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('tabIndex', '0');
    expect(button).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-ring/50');
  });

  it('handles hover states correctly', () => {
    render(<Button variant="default">Hover Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:!bg-brand/30');
  });

  it('handles invalid states correctly', () => {
    render(<Button aria-invalid="true">Invalid Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-invalid', 'true');
    expect(button).toHaveClass('aria-invalid:ring-destructive/20', 'aria-invalid:border-destructive');
  });

  it('renders with icons correctly', () => {
    render(
      <Button>
        <span>🎉</span>
        <span>New Feature</span>
      </Button>,
    );
    expect(screen.getByText('🎉')).toBeInTheDocument();
    expect(screen.getByText('New Feature')).toBeInTheDocument();
  });

  it('applies all base classes correctly', () => {
    render(<Button>Base Classes Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'whitespace-nowrap',
      'text-sm',
      'transition-all',
      'disabled:pointer-events-none',
      'disabled:opacity-50',
      'shrink-0',
      'outline-none',
      'font-semibold',
      'cursor-pointer',
      'rounded-full',
      'border',
      'shadow-xs',
    );
  });

  it('forwards additional props', () => {
    render(
      <Button data-testid="button" data-custom="test">
        Test
      </Button>,
    );
    const button = screen.getByTestId('button');
    expect(button).toHaveAttribute('data-custom', 'test');
  });
});
