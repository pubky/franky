import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FilterDrawer } from './FilterDrawer';

// Mock the libs
vi.mock('@/libs', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('FilterDrawer', () => {
  const mockOnOpenChangeAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset document.body.style.overflow
    document.body.style.overflow = '';
  });

  afterEach(() => {
    // Clean up any timers
    vi.clearAllTimers();
  });

  it('renders when open is true', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <FilterDrawer open={false} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
  });

  it('renders with left position by default', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    const drawer = screen.getByText('Test Content').closest('[data-testid="filter-drawer-left"]');
    expect(drawer).toBeInTheDocument();
  });

  it('renders with left position when position is left', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction} position="left">
        <div>Test Content</div>
      </FilterDrawer>,
    );

    const drawer = screen.getByText('Test Content').closest('[data-testid="filter-drawer-left"]');
    expect(drawer).toBeInTheDocument();
  });

  it('renders with right position when position is right', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction} position="right">
        <div>Test Content</div>
      </FilterDrawer>,
    );

    const drawer = screen.getByText('Test Content').closest('[data-testid="filter-drawer-right"]');
    expect(drawer).toBeInTheDocument();
  });

  it('calls onOpenChangeAction when close button is clicked', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockOnOpenChangeAction).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChangeAction when backdrop is clicked', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    const backdrop = screen.getByText('Test Content').closest('div')?.previousElementSibling;
    fireEvent.click(backdrop!);

    expect(mockOnOpenChangeAction).toHaveBeenCalledWith(false);
  });

  it('applies correct classes for left position', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction} position="left">
        <div>Test Content</div>
      </FilterDrawer>,
    );

    const drawer = screen.getByText('Test Content').closest('div');
    expect(drawer).toHaveClass('left-0', 'border-r', 'border-white');
  });

  it('applies correct classes for right position', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction} position="right">
        <div>Test Content</div>
      </FilterDrawer>,
    );

    const drawer = screen.getByText('Test Content').closest('div');
    expect(drawer).toHaveClass('right-0', 'border-l', 'border-white');
  });

  it('applies correct width classes for left position', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction} position="left">
        <div>Test Content</div>
      </FilterDrawer>,
    );

    const drawer = screen.getByText('Test Content').closest('div');
    expect(drawer).toHaveClass('w-[228px]', 'sm:w-[228px]', 'md:w-[385px]');
  });

  it('applies correct width classes for right position', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction} position="right">
        <div>Test Content</div>
      </FilterDrawer>,
    );

    const drawer = screen.getByText('Test Content').closest('div');
    expect(drawer).toHaveClass('w-[280px]', 'sm:w-[280px]', 'md:w-[385px]');
  });

  it('applies correct base classes', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    const drawer = screen.getByText('Test Content').closest('div');
    expect(drawer).toHaveClass(
      'fixed',
      'top-0',
      'h-full',
      'z-50',
      'bg-background',
      'p-4',
      'sm:p-4',
      'md:p-12',
      'shadow-xl',
      'transition-transform',
      'duration-300',
      'ease-in-out',
    );
  });

  it('applies correct backdrop classes', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    const backdrop = screen.getByText('Test Content').closest('div')?.previousElementSibling;
    expect(backdrop).toHaveClass(
      'absolute',
      'inset-0',
      'bg-black',
      'transition-opacity',
      'duration-300',
      'bg-opacity-50',
    );
  });

  it('applies correct container classes', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    const container = screen.getByText('Test Content').closest('div');
    expect(container).toHaveClass('h-full', 'overflow-y-auto');
  });

  it('handles animation states correctly', async () => {
    vi.useFakeTimers();

    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    // Initially should be visible
    expect(screen.getByText('Test Content')).toBeInTheDocument();

    // Fast forward to trigger animation
    vi.advanceTimersByTime(10);
    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('sets body overflow hidden when open', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when closed', () => {
    const { rerender } = render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <FilterDrawer open={false} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );

    expect(document.body.style.overflow).toBe('');
  });

  it('renders children correctly', () => {
    render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </FilterDrawer>,
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });
});

describe('FilterDrawer - Snapshots', () => {
  const mockOnOpenChangeAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot with left position', () => {
    const { container } = render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction} position="left">
        <div>Test Content</div>
      </FilterDrawer>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with right position', () => {
    const { container } = render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction} position="right">
        <div>Test Content</div>
      </FilterDrawer>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when closed', () => {
    const { container } = render(
      <FilterDrawer open={false} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>Test Content</div>
      </FilterDrawer>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with complex children', () => {
    const { container } = render(
      <FilterDrawer open={true} onOpenChangeAction={mockOnOpenChangeAction}>
        <div>
          <h2>Filter Options</h2>
          <div>
            <button>Option 1</button>
            <button>Option 2</button>
          </div>
        </div>
      </FilterDrawer>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
