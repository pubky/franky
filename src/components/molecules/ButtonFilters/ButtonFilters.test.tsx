import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ButtonFilters } from './ButtonFilters';

// Mock the atoms
vi.mock('@/atoms', () => ({
  Button: ({
    children,
    onClick,
    className,
    variant,
    size,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: string;
    size?: string;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} className={className} data-variant={variant} data-size={size} {...props}>
      {children}
    </button>
  ),
}));

// Mock the libs
vi.mock('@/libs', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  Settings2: ({ className }: { className?: string }) => (
    <div data-testid="settings2-icon" className={className}>
      Settings2
    </div>
  ),
  Lightbulb: ({ className }: { className?: string }) => (
    <div data-testid="lightbulb-icon" className={className}>
      Lightbulb
    </div>
  ),
}));

describe('ButtonFilters', () => {
  it('renders with default props', () => {
    render(<ButtonFilters />);

    expect(screen.getByTestId('settings2-icon')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<ButtonFilters className="custom-button" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-button');
  });

  it('renders with left position by default', () => {
    render(<ButtonFilters />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-l-none', 'rounded-r-full');
  });

  it('renders with left position when position is left', () => {
    render(<ButtonFilters position="left" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-l-none', 'rounded-r-full');
  });

  it('renders with right position when position is right', () => {
    render(<ButtonFilters position="right" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-r-none', 'rounded-l-full');
  });

  it('shows correct icon for left position', () => {
    render(<ButtonFilters position="left" />);

    expect(screen.getByTestId('settings2-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('lightbulb-icon')).not.toBeInTheDocument();
  });

  it('shows correct icon for right position', () => {
    render(<ButtonFilters position="right" />);

    expect(screen.getByTestId('lightbulb-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('settings2-icon')).not.toBeInTheDocument();
  });

  it('handles click events', () => {
    const mockOnClick = vi.fn();
    render(<ButtonFilters onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct positioning classes for left position', () => {
    render(<ButtonFilters position="left" />);

    const button = screen.getByRole('button');
    const container = button.closest('div');
    expect(container).toHaveClass('z-10', 'fixed', 'top-[150px]', 'left-0');
  });

  it('applies correct positioning classes for right position', () => {
    render(<ButtonFilters position="right" />);

    const button = screen.getByRole('button');
    const container = button.closest('div');
    expect(container).toHaveClass('z-10', 'fixed', 'top-[150px]', 'right-0');
  });

  it('applies correct button classes', () => {
    render(<ButtonFilters />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'hidden',
      'lg:inline-flex',
      'px-4',
      'py-3',
      'bg-secondary',
      'shadow-xl',
      'hover:bg-secondary/90',
    );
  });

  it('applies correct responsive classes', () => {
    render(<ButtonFilters />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('hidden', 'lg:inline-flex');
  });

  it('applies correct icon classes', () => {
    render(<ButtonFilters />);

    const icon = screen.getByTestId('settings2-icon');
    expect(icon).toHaveClass('h-6', 'w-6');
  });

  it('renders with correct button attributes', () => {
    render(<ButtonFilters />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'secondary');
    expect(button).toHaveAttribute('data-size', 'icon');
  });

  it('handles multiple clicks correctly', () => {
    const mockOnClick = vi.fn();
    render(<ButtonFilters onClick={mockOnClick} />);

    const button = screen.getByRole('button');

    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(3);
  });

  it('renders with different positions correctly', () => {
    const { rerender } = render(<ButtonFilters position="left" />);

    expect(screen.getByTestId('settings2-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('lightbulb-icon')).not.toBeInTheDocument();

    rerender(<ButtonFilters position="right" />);

    expect(screen.getByTestId('lightbulb-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('settings2-icon')).not.toBeInTheDocument();
  });
});

describe('ButtonFilters - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<ButtonFilters />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with left position', () => {
    const { container } = render(<ButtonFilters position="left" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with right position', () => {
    const { container } = render(<ButtonFilters position="right" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<ButtonFilters className="custom-filters" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for button element', () => {
    render(<ButtonFilters />);
    const button = screen.getByRole('button');
    expect(button).toMatchSnapshot();
  });
});
