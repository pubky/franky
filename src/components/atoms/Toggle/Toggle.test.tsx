import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('renders with default props', () => {
    render(<Toggle>Toggle</Toggle>);

    const toggle = screen.getByRole('button');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveTextContent('Toggle');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Toggle onClick={handleClick}>Toggle</Toggle>);

    const toggle = screen.getByRole('button');
    fireEvent.click(toggle);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Toggle variant="default">Default</Toggle>);
    let toggle = screen.getByRole('button');
    expect(toggle).toHaveClass('bg-transparent');

    rerender(<Toggle variant="outline">Outline</Toggle>);
    toggle = screen.getByRole('button');
    expect(toggle).toHaveClass('border', 'border-input', 'bg-transparent');
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<Toggle size="sm">Small</Toggle>);
    let toggle = screen.getByRole('button');
    expect(toggle).toHaveClass('h-8', 'px-1.5', 'min-w-8');

    rerender(<Toggle size="lg">Large</Toggle>);
    toggle = screen.getByRole('button');
    expect(toggle).toHaveClass('h-10', 'px-2.5', 'min-w-10');
  });

  it('can be disabled', () => {
    render(<Toggle disabled>Disabled</Toggle>);

    const toggle = screen.getByRole('button');
    expect(toggle).toBeDisabled();
    expect(toggle).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Toggle ref={ref}>Toggle</Toggle>);

    expect(ref).toHaveBeenCalled();
  });

  it('accepts custom className', () => {
    render(<Toggle className="custom-class">Toggle</Toggle>);

    const toggle = screen.getByRole('button');
    expect(toggle).toHaveClass('custom-class');
  });

  it('renders with pressed state', () => {
    render(<Toggle pressed>Pressed</Toggle>);

    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAttribute('data-state', 'on');
  });
});
