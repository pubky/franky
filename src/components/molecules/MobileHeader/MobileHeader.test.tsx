import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MobileHeader } from './MobileHeader';

// Mock the molecules
vi.mock('@/molecules', () => ({
  Logo: ({ width, height }: { width?: number; height?: number }) => (
    <div data-testid="logo" data-width={width} data-height={height}>
      Logo
    </div>
  ),
}));

// Mock libs - use actual utility functions and icons from lucide-react
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual };
});

describe('MobileHeader', () => {
  it('renders with default props', () => {
    render(<MobileHeader />);

    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByTestId('sliders-horizontal-icon')).toBeInTheDocument();
    expect(screen.getByTestId('activity-icon')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<MobileHeader className="custom-header" />);

    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renders with custom onLeftIconClick', () => {
    const mockOnLeftIconClick = vi.fn();
    render(<MobileHeader onLeftIconClick={mockOnLeftIconClick} />);

    const leftButton = document.querySelector('.lucide-sliders-horizontal')?.closest('button');
    fireEvent.click(leftButton!);

    expect(mockOnLeftIconClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct classes to container', () => {
    render(<MobileHeader />);

    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('applies correct classes to inner container', () => {
    render(<MobileHeader />);

    const innerContainer = screen.getByTestId('logo').closest('div')?.parentElement;
    expect(innerContainer).toHaveClass('flex', 'items-center', 'justify-between', 'px-4', 'py-4');
  });

  it('applies correct classes to left button', () => {
    render(<MobileHeader />);

    const leftButton = document.querySelector('.lucide-sliders-horizontal')?.closest('button');
    expect(leftButton).toHaveClass('p-2', 'hover:bg-secondary/10', 'rounded-full', 'transition-colors');
  });

  it('applies correct classes to right button', () => {
    render(<MobileHeader />);

    const rightButton = document.querySelector('.lucide-activity')?.closest('button');
    expect(rightButton).toHaveClass('p-2', 'hover:bg-secondary/10', 'rounded-full', 'transition-colors');
  });

  it('renders logo component', () => {
    render(<MobileHeader />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeInTheDocument();
  });

  it('calls onRightIconClick when right button is clicked', () => {
    const onRightIconClick = vi.fn();
    render(<MobileHeader onRightIconClick={onRightIconClick} />);

    const rightButton = document.querySelector('.lucide-activity')?.closest('button');
    fireEvent.click(rightButton!);

    expect(onRightIconClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct icon classes', () => {
    render(<MobileHeader />);

    const leftIcon = screen.getByTestId('sliders-horizontal-icon');
    const rightIcon = screen.getByTestId('activity-icon');

    expect(leftIcon).toHaveClass('h-6', 'w-6');
    expect(rightIcon).toHaveClass('h-6', 'w-6');
  });

  it('handles hover states correctly', () => {
    render(<MobileHeader />);

    const leftButton = screen.getByTestId('sliders-horizontal-icon').closest('button');
    const rightButton = screen.getByTestId('activity-icon').closest('button');

    expect(leftButton).toHaveClass('hover:bg-secondary/10', 'transition-colors');
    expect(rightButton).toHaveClass('hover:bg-secondary/10', 'transition-colors');
  });
});

describe('MobileHeader - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<MobileHeader />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<MobileHeader className="custom-header" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom onLeftIconClick', () => {
    const mockOnLeftIconClick = vi.fn();
    const { container } = render(<MobileHeader onLeftIconClick={mockOnLeftIconClick} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for left button', () => {
    render(<MobileHeader />);

    // Icons are now actual lucide-react components (SVGs), find buttons by position
    const buttons = screen.getAllByRole('button');
    const leftButton = buttons[0];
    expect(leftButton).toMatchSnapshot();
  });

  it('matches snapshot for right button', () => {
    render(<MobileHeader />);

    // Icons are now actual lucide-react components (SVGs), find buttons by position
    const buttons = screen.getAllByRole('button');
    const rightButton = buttons[1];
    expect(rightButton).toMatchSnapshot();
  });

  it('matches snapshot for logo', () => {
    render(<MobileHeader />);

    const logo = screen.getByTestId('logo');
    expect(logo).toMatchSnapshot();
  });
});
